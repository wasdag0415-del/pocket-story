/* 主线数据 + 证据引擎测试（第一开发段） */
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const DIST = path.join(__dirname, '..', 'dist');

function makeStore() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    _dump: () => Object.fromEntries(map)
  };
}

function boot(seed = {}) {
  const store = makeStore();
  for (const [k, v] of Object.entries(seed)) store.setItem(k, v);
  const root = { localStorage: store, console };
  root.globalThis = root;
  root.window = root;
  const ctx = vm.createContext(root);
  vm.runInContext(fs.readFileSync(path.join(DIST, 'mainline-data.js'), 'utf8'), ctx, { filename: 'mainline-data.js' });
  vm.runInContext(fs.readFileSync(path.join(DIST, 'mainline.js'), 'utf8'), ctx, { filename: 'mainline.js' });
  return { store, M: root.PocketMainline, D: root.MainlineData };
}

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failures.push({ name, e }); console.log(`FAIL  ${name}\n      ${e.message.split('\n')[0]}`); }
}

test('数据完整性：每个节点的证据 id 都在 EVIDENCE 目录中', () => {
  const { M, D } = boot();
  const allIds = new Set(Object.keys(M.EVIDENCE));
  for (const [nodeId, def] of Object.entries(D.nodes)) {
    const ids = def.needs || (def.groups ? def.groups.flat() : []);
    for (const id of ids) assert.ok(allIds.has(id), `${nodeId} 引用了未定义证据 ${id}`);
  }
});

test('数据完整性：内容数量与文案包一致', () => {
  const { D } = boot();
  assert.equal(Object.keys(D.kkt).length, 11);
  assert.equal(D.calls.length, 12);
  assert.equal(D.sms.manager.length, 5);
  assert.equal(D.sms.jpops.length, 4);
  assert.equal(D.calendar.length, 17);
  assert.equal(D.map.favorites.length, 7);
  assert.equal(D.photos.length, 12);
  assert.equal(D.memos.length, 6);
  assert.equal(D.safari.recent.length, 10);
  assert.equal(D.pann.length, 4);
  assert.equal(D.youtube.length, 4);
});

test('锁屏 / 桌面 / 结尾数据齐备且与文案包一致', () => {
  const { D } = boot();
  assert.equal(D.lock.time, '23:06');
  assert.equal(D.lock.notif1.text, '回酒店了吗？');
  assert.equal(D.desktop.badges.kkt, 1);
  assert.equal(D.desktop.weatherWidget.head, '神户 23°');
  assert.equal(D.ending.kktPreview, '明天结束以后，有时间吗？');
  assert.equal(D.ending.lockedText.includes('门没锁'), false, '第一段不得出现「门没锁」');
});

test('数据完整性：两段回放电话存在且标注正确', () => {
  const { D } = boot();
  assert.equal(D.callReplays.A.title.includes('8月17日'), true);
  assert.equal(D.callReplays.B.title.includes('9月22日'), true);
  const replayCalls = D.calls.filter((c) => c.replay);
  assert.equal(replayCalls.length, 2);
  assert.equal(JSON.stringify(replayCalls.map((c) => c.replay).sort()), JSON.stringify(['A', 'B']));
});

test('初始状态：N0、未解锁、时间游标为 9月22日', () => {
  const { M } = boot();
  const p = M.progress();
  assert.equal(p.node, 'N0');
  assert.equal(p.unlocked, false);
  assert.equal(p.timeCursor, '9月22日');
  assert.equal(M.resolveEnding(), null);
});

test('解锁后目标仍是 N1，但只找到一条身份锚点不能确认身份', () => {
  const { M } = boot();
  assert.equal(M.unlock(), true);
  const p = M.progress();
  assert.equal(p.unlocked, true);
  assert.equal(p.node, 'N0');
  M.note('cal:tour');
  assert.equal(M.nodeGate('N1'), false);
  assert.equal(M.progress().ownerConfirmed, false);
});

test('找到两条身份锚点 → N1 通过、owner_confirmed 生效', () => {
  const { M } = boot();
  M.unlock();
  M.note('cal:tour');
  M.note('sms:staff');
  assert.equal(M.nodeGate('N1'), true);
  M.advance();
  assert.equal(M.progress().ownerConfirmed, true);
});

test('N2 需要三类中的两类（组合判定）', () => {
  const { M } = boot();
  M.unlock(); M.note('cal:tour'); M.note('sms:staff'); M.advance();
  M.note('kkt:aug-daily');
  assert.equal(M.nodeGate('N2'), false, '只找到一类不能通过');
  M.note('photos:together');
  assert.equal(M.nodeGate('N2'), true, '两类即可通过');
  M.advance();
  assert.equal(M.progress().node, 'N2');
});

test('N3 需要三项中的两项；N4 需要四项全齐', () => {
  const { M } = boot();
  M.unlock(); M.note('cal:tour'); M.note('sms:staff'); M.advance();
  M.note('kkt:aug-daily'); M.note('photos:together'); M.advance();
  M.note('call:missed-0910'); M.note('call:missed-0912');
  assert.equal(M.nodeGate('N3'), true);
  M.advance();
  assert.equal(M.progress().node, 'N3');
  assert.equal(M.nodeGate('N4'), false, '缺福冈证据不能过 N4');
  M.note('cal:fukuoka'); M.note('kkt:fukuoka'); M.note('photos:fukuoka'); M.note('pann:fukuoka');
  assert.equal(M.nodeGate('N4'), true);
});

test('N5 需要三项中的两项，达到后 first segment 结束', () => {
  const { M } = boot();
  M.unlock(); M.note('cal:tour'); M.note('sms:staff'); M.advance();
  M.note('kkt:aug-daily'); M.note('photos:together'); M.advance();
  M.note('call:missed-0910'); M.note('call:missed-0912'); M.advance();
  M.note('cal:fukuoka'); M.note('kkt:fukuoka'); M.note('photos:fukuoka'); M.note('pann:fukuoka'); M.advance();
  M.note('photos:hyogo-water'); M.note('call:replay-B');
  assert.equal(M.nodeGate('N5'), true);
  M.advance();
  assert.equal(M.progress().node, 'N5');
  assert.equal(M.progress().ended, true);
  assert.equal(M.progress().next, null);
});

test('软提示：返回下一节点缺的一条证据', () => {
  const { M } = boot();
  M.unlock();
  const h = M.hint();
  assert.equal(h.nextNode, 'N1');
  assert.ok(['cal:tour', 'sms:staff', 'photos:backstage', 'kkt:members', 'ig:profile'].includes(h.missing));
  assert.equal(typeof h.label, 'string');
});

test('存档：进度跨会话保留（含 found / 时间游标）', () => {
  const a = boot();
  a.M.unlock(); a.M.note('cal:tour'); a.M.note('sms:staff'); a.M.advance();
  a.M.setTimeCursor('9月19日');
  const saved = a.store.getItem('pocket-mainline-v1');

  const b = boot({ 'pocket-mainline-v1': saved });
  const p = b.M.progress();
  assert.equal(p.ownerConfirmed, true);
  assert.equal(p.timeCursor, '9月19日');
  assert.equal(JSON.stringify(p.found.sort()), JSON.stringify(['cal:tour', 'sms:staff']));
});

test('normalize 拒绝损坏或旧版本存档，回退到新档', () => {
  const { M } = boot();
  assert.equal(M.normalize(null).node, 'N0');
  assert.equal(M.normalize({ version: 99 }).node, 'N0');
  assert.equal(M.normalize({ version: 1, node: 'N9' }).unlocked, false);
});

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { for (const f of failures) console.log(`\n- ${f.name}\n  ${f.e.stack.split('\n').slice(0, 4).join('\n  ')}`); process.exitCode = 1; }
