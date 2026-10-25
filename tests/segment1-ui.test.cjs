/* 第一开发段 UI 冒烟测试：锁屏 / 桌面 / 电话 / 信息 */
'use strict';
const assert = require('node:assert/strict');
const { boot } = require('./_harness.cjs');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (e) { failures.push({ name, e }); console.log(`FAIL  ${name}\n      ${e.message.split('\n')[0]}`); }
}

const click = (env, el) => { assert.ok(el, 'element should exist'); el.dispatchEvent(new env.sandbox.window.Event('click', { bubbles: true, cancelable: true })); };
const clickDate = (env, date) => click(env, [...env.document.querySelectorAll('[data-date]')].find((b) => b.dataset.date === date));

function driveToEnding(env) {
  const d = env.document, w = env.sandbox;
  const home = () => w.render('phonehome');
  // N1：日历 + Instagram
  click(env, d.querySelector('[data-view="calendar"]')); home();
  click(env, d.querySelector('[data-view="instagram"]'));
  // N2：八月 KKT + YouTube
  home(); click(env, d.querySelector('[data-view="kkt"]')); click(env, d.querySelector('[data-kkt="augA"]'));
  home(); click(env, d.querySelector('[data-view="youtube"]'));
  // N3：电话（两条未接来电）
  home(); click(env, d.querySelector('[data-view="phone"]'));
  // N4：日历 9.19 + 福冈 KKT + 福冈照片 + Pann 福冈帖
  home(); click(env, d.querySelector('[data-view="calendar"]')); clickDate(env, '9月19日');
  home(); click(env, d.querySelector('[data-view="kkt"]')); click(env, d.querySelector('[data-kkt="fukuoka"]'));
  home(); click(env, d.querySelector('[data-view="album"]')); click(env, d.querySelector('[data-photo="jp-0919a"]'));
  if (d.querySelector('#modal') && d.querySelector('#modal').open) d.querySelector('#modal').open = false;
  home(); click(env, d.querySelector('[data-view="forum"]')); click(env, d.querySelector('[data-pann="1"]'));
  // N5：兵库 KKT + 地图
  home(); click(env, d.querySelector('[data-view="kkt"]')); click(env, d.querySelector('[data-kkt="hyogo"]'));
  home(); click(env, d.querySelector('[data-view="map"]'));
}

const text = (env) => env.document.querySelector('#screen').textContent.replace(/\s+/g, ' ');
const unlockHome = (env) => {
  env.sandbox.render('passcode');
  for (const n of '910329') click(env, env.document.querySelector(`[data-passcode-digit="${n}"]`));
};

test('锁屏使用第一段文案且不剧透主人', () => {
  const env = boot();
  assert.deepEqual(env.loadErrors.map((e) => e.file), []);
  const t = text(env);
  assert.ok(t.includes('9月22日 星期二'));
  assert.ok(t.includes('23:06'));
  assert.ok(t.includes('回酒店了吗'));
  assert.ok(t.includes('manager'));
  assert.ok(!t.includes('S 的 iPhone'), '锁屏不得出现主人身份');
});

test('解锁进入桌面，不自动进论坛', () => {
  const env = boot();
  unlockHome(env);
  assert.ok(env.document.querySelector('.ios-home'));
  assert.ok(!env.document.querySelector('#nf-feed'));
  assert.ok(text(env).includes('神户 23°'));
  assert.ok(text(env).includes('明天 11:40 大阪集合'));
});

test('电话页显示 12 条通话与未接来电', () => {
  const env = boot();
  unlockHome(env);
  click(env, env.document.querySelector('[data-view="phone"]'));
  assert.equal(env.document.querySelectorAll('[data-call-index]').length, 12);
  const t = text(env);
  assert.ok(t.includes('未接来电'));
  assert.ok(t.includes('组长老师'));
  assert.ok(t.includes('大多数通话没有保存内容'));
});

test('信息页显示 3 个线程，manager 线程含大阪集合 11:40', () => {
  const env = boot();
  unlockHome(env);
  click(env, env.document.querySelector('[data-view="sms"]'));
  assert.equal(env.document.querySelectorAll('[data-sms-thread]').length, 3);
  click(env, env.document.querySelector('[data-sms-thread="manager"]'));
  assert.equal(env.document.querySelectorAll('.nf-sms-bubble').length, 5);
  assert.ok(text(env).includes('11:40'));
});

test('天气页显示神户当前、福冈历史与大阪预报（风力未载入）', () => {
  const env = boot();
  unlockHome(env);
  click(env, env.document.querySelector('[data-view="weather"]'));
  const t = text(env);
  assert.ok(t.includes('神户') && t.includes('23°'));
  assert.ok(t.includes('福冈') && t.includes('小雨'));
  assert.ok(t.includes('海边风力数据尚未载入'));
});

test('日历页列出 17 个日期，9月23日大阪为锁定态', () => {
  const env = boot();
  unlockHome(env);
  click(env, env.document.querySelector('[data-view="calendar"]'));
  assert.equal(env.document.querySelectorAll('[data-date]').length, 17);
  assert.ok(text(env).includes('尚未开放'));
  assert.ok(text(env).includes('9月22日'));
});

test('地图页显示 7 个收藏地点与未到访的大阪路线', () => {
  const env = boot();
  unlockHome(env);
  click(env, env.document.querySelector('[data-view="map"]'));
  const t = text(env);
  assert.ok(t.includes('日本想去的地方'));
  assert.ok(t.includes('橘子街'));
  assert.ok(t.includes('尚无路线记录'));
  assert.ok(t.includes('收藏地点不代表实际到访') || t.includes('不能证明私下同行'));
});

test('KKT 列表含组长老师与四个联系人，当前聊天初始只显示「回酒店了吗」', () => {
  const env = boot();
  unlockHome(env);
  click(env, env.document.querySelector('[data-view="kkt"]'));
  const t = text(env);
  assert.ok(t.includes('组长老师'));
  assert.ok(t.includes('Red Velvet') && t.includes('manager') && t.includes('Wendy') && t.includes('Joy'));
  click(env, env.document.querySelector('[data-kkt="current"]'));
  assert.ok(text(env).includes('回酒店了吗'));
  assert.ok(!text(env).includes('走廊自动贩卖机旁边有水'), '查看 manager 前不应补出送水对话');
});

test('查看 manager 信息后，当前聊天补出送水对话（组合触发）', () => {
  const env = boot();
  unlockHome(env);
  click(env, env.document.querySelector('[data-view="sms"]'));
  click(env, env.document.querySelector('[data-sms-thread="manager"]'));
  env.sandbox.render('phonehome');
  click(env, env.document.querySelector('[data-view="kkt"]'));
  click(env, env.document.querySelector('[data-kkt="current"]'));
  const t = text(env);
  assert.ok(t.includes('走廊自动贩卖机旁边有水'));
  assert.ok(t.includes('你放的？') && t.includes('谢谢'));
});

test('KKT 当前聊天允许输入彩蛋消息（不改变剧情）', () => {
  const env = boot();
  unlockHome(env);
  click(env, env.document.querySelector('[data-view="kkt"]'));
  click(env, env.document.querySelector('[data-kkt="current"]'));
  const input = env.document.querySelector('#kkt-input');
  input.value = '测试彩蛋';
  click(env, env.document.querySelector('#kkt-send'));
  assert.ok(text(env).includes('测试彩蛋'));
  assert.equal(env.sandbox.PocketMainline.progress().node, 'N0', '彩蛋消息不得推进剧情');
});

test('相册页显示八月与日本 12 张照片槽位', () => {
  const env = boot();
  unlockHome(env);
  click(env, env.document.querySelector('[data-view="album"]'));
  assert.equal(env.document.querySelectorAll('.gallery-item').length, 12);
  const t = text(env);
  assert.ok(t.includes('八月') && t.includes('日本'));
  assert.ok(t.includes('两套餐具'));
});

test('Safari 显示 10 条最近搜索与底部免责说明', () => {
  const env = boot();
  unlockHome(env);
  click(env, env.document.querySelector('[data-view="browser"]'));
  assert.equal(env.document.querySelectorAll('[data-search]').length, 10);
  const t = text(env);
  assert.ok(t.includes('明明很累却睡不着'));
  assert.ok(t.includes('不能证明查询原因'));
});

test('Instagram 显示 4 条公开内容与草稿', () => {
  const env = boot();
  unlockHome(env);
  click(env, env.document.querySelector('[data-view="instagram"]'));
  assert.equal(env.document.querySelectorAll('.ig-post').length, 4);
  const t = text(env);
  assert.ok(t.includes('arrived'));
  assert.ok(t.includes('未发布'));
});

test('YouTube 显示 3 个条目与未载入提示', () => {
  const env = boot();
  unlockHome(env);
  click(env, env.document.querySelector('[data-view="youtube"]'));
  assert.equal(env.document.querySelectorAll('.yt-item').length, 3);
  assert.ok(text(env).includes('公开影像资料尚未载入'));
});

test('用户输入文本渲染时做 HTML 转义（联系人昵称）', () => {
  const phone = {
    version: 1,
    nickname: '<script>alert(1)</script>',
    profiles: [{ id: 'starlight', name: '<img src=x onerror=alert(2)>', avatar: '', bio: '', greeting: '' }],
    groups: [], messages: {}, favorites: [], photos: [], notes: []
  };
  const env = boot({ seed: { 'pocket-star-v1': JSON.stringify(phone) } });
  env.sandbox.render('contacts');
  const html = env.document.querySelector('#screen').innerHTML;
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('&lt;img src=x'));
});

test('主线引擎写档不会触碰手机数据（pocket-star-v1）', () => {
  const phone = JSON.stringify({ version: 1, nickname: '你', profiles: [], groups: [], messages: {}, favorites: [], photos: [], notes: [] });
  const env = boot({ seed: { 'pocket-star-v1': phone } });
  env.sandbox.PocketMainline.unlock();
  env.sandbox.PocketMainline.note('cal:tour');
  env.sandbox.PocketMainline.note('sms:staff');
  env.sandbox.PocketMainline.advance();
  assert.equal(env.storage.getItem('pocket-star-v1'), phone);
  assert.ok(env.storage.getItem('pocket-mainline-v1'), '主线存档应已写入独立键');
});

test('打开两个身份锚点应用后确认主人，锁屏标题更新', () => {
  const env = boot();
  unlockHome(env);
  click(env, env.document.querySelector('[data-view="calendar"]'));
  click(env, env.document.querySelector('[data-view="phonehome"]'));
  click(env, env.document.querySelector('[data-view="instagram"]'));
  const p = env.sandbox.PocketMainline.progress();
  assert.equal(p.ownerConfirmed, true);
  assert.equal(p.node, 'N1');
  env.sandbox.render('lock');
  assert.ok(env.document.querySelector('.ios-lost-card').textContent.includes('涩琪的备用 iPhone'));
});

test('只打开一个身份锚点应用不能确认主人', () => {
  const env = boot();
  unlockHome(env);
  click(env, env.document.querySelector('[data-view="calendar"]'));
  assert.equal(env.sandbox.PocketMainline.progress().ownerConfirmed, false);
});

test('全链路：从锁屏一路玩到大阪前夜（N1→N5，ended）', () => {
  const env = boot();
  unlockHome(env);
  driveToEnding(env);
  const p = env.sandbox.PocketMainline.progress();
  assert.equal(p.node, 'N5');
  assert.equal(p.ended, true);
  assert.equal(p.ownerConfirmed, true);
  // 结尾状态：KKT 预览变为大阪前夜邀请
  env.sandbox.render('phonehome');
  click(env, env.document.querySelector('[data-view="kkt"]'));
  assert.ok(text(env).includes('明天结束以后，有时间吗？'));
  // 日历 9.23 仍锁定
  env.sandbox.render('calendar');
  assert.ok(text(env).includes('尚未开放') || text(env).includes('还没有走到海边'));
});

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { for (const f of failures) console.log(`\n- ${f.name}\n  ${f.e.stack.split('\n').slice(0, 4).join('\n  ')}`); process.exitCode = 1; }
