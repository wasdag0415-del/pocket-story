/* Pocket Story · 主线证据引擎（第一开发段）
 * 三层状态：note()=发现 → corroborate()=关联 → gate 通过=理解
 * 节点 N0–N5 按 evidence 组合判定推进；timeCursor 承载「日历时间截面」。
 */
(function (root) {
  'use strict';

  const DATA = root.MainlineData;
  const KEY = 'pocket-mainline-v1';

  // 里程碑阶梯：N0 是锁屏地板，N1–N5 是剧情推进节点。
  const LADDER = ['N0', 'N1', 'N2', 'N3', 'N4', 'N5'];
  const NODE_ORDER = ['N1', 'N2', 'N3', 'N4', 'N5'];

  const EVIDENCE = {
    'cal:tour': { label: '日历里的日本巡演安排', node: 'N1' },
    'sms:staff': { label: 'manager / 日本运营的工作短信', node: 'N1' },
    'photos:backstage': { label: '后台通行证 / 舞台工作照', node: 'N1' },
    'kkt:members': { label: '成员群与「组长老师」', node: 'N1' },
    'ig:profile': { label: 'Instagram 账号资料页', node: 'N1' },
    'kkt:aug-daily': { label: '八月 KKT 无意义日常', node: 'N2' },
    'photos:together': { label: '一起吃饭/电影/陶杯的照片痕迹', node: 'N2' },
    'pub:aug-interaction': { label: '八月公开互动（YouTube / Instagram）', node: 'N2' },
    'call:missed-0910': { label: '9月10日未接来电', node: 'N3' },
    'call:missed-0912': { label: '9月12日未接来电', node: 'N3' },
    'memo:unsent-0912': { label: '9月12日未发送备忘录', node: 'N3' },
    'kkt:sept-gap': { label: '9月13—16日邀请被改写成工作与休息', node: 'N3' },
    'cal:fukuoka': { label: '9月19日福冈行程', node: 'N4' },
    'kkt:fukuoka': { label: '演出前后的 KKT', node: 'N4' },
    'photos:fukuoka': { label: '福冈官方舞台 / 后台图', node: 'N4' },
    'pann:fukuoka': { label: 'Pann 对舞台气氛的争论', node: 'N4' },
    'kkt:hyogo-rain': { label: '9月21日雨后问候', node: 'N5' },
    'photos:hyogo-water': { label: '9月22日工作结束后的水与药', node: 'N5' },
    'map:hyogo-osaka': { label: '地图里兵库到大阪的移动安排', node: 'N5' },
    'call:replay-B': { label: '第二段互动电话', node: 'N5' }
  };

  const fresh = () => ({
    version: 1,
    node: 'N0',
    unlocked: false,
    ownerConfirmed: false,
    found: {},
    linked: {},          // 关联对：`${a}|${b}` → true
    understood: {},      // 已通过的节点：nodeId → true
    timeCursor: '9月22日',
    ended: false
  });

  function normalize(value) {
    const next = fresh();
    if (!value || value.version !== 1) return next;
    next.unlocked = value.unlocked === true;
    next.ownerConfirmed = value.ownerConfirmed === true;
    next.ended = value.ended === true;
    next.node = NODE_ORDER.includes(value.node) ? value.node : (next.unlocked ? 'N1' : 'N0');
    next.found = value.found && typeof value.found === 'object' ? Object.fromEntries(Object.entries(value.found).filter(([, v]) => v === true)) : {};
    next.linked = value.linked && typeof value.linked === 'object' ? Object.fromEntries(Object.entries(value.linked).filter(([, v]) => v === true)) : {};
    next.understood = value.understood && typeof value.understood === 'object' ? Object.fromEntries(Object.entries(value.understood).filter(([, v]) => v === true)) : {};
    next.timeCursor = typeof value.timeCursor === 'string' ? value.timeCursor : '9月22日';
    return next;
  }

  let state;
  try { state = normalize(JSON.parse(root.localStorage.getItem(KEY))); } catch { state = fresh(); }

  function save() {
    try { root.localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch { return false; }
  }

  function note(id) {
    if (!EVIDENCE[id]) return false;
    if (state.found[id]) return false;
    state.found[id] = true;
    save();
    return true;
  }

  function corroborate(a, b) {
    if (!EVIDENCE[a] || !EVIDENCE[b]) return false;
    const key = [a, b].sort().join('|');
    if (state.linked[key]) return false;
    state.linked[key] = true;
    save();
    return true;
  }

  function nodeGate(nodeId) {
    const def = DATA.nodes[nodeId];
    if (!def) return false;
    if (!def.needs && !def.groups) return state.unlocked; // N0：解锁即通过
    let passed = 0;
    if (def.needs) {
      passed = def.needs.filter((id) => state.found[id]).length;
      return passed >= def.min;
    }
    if (def.groups) {
      const satisfied = def.groups.filter((group) => group.some((id) => state.found[id])).length;
      return satisfied >= def.min;
    }
    return false;
  }

  function advance() {
    if (nodeGate('N1')) state.ownerConfirmed = true;
    let highest = 'N0';
    for (const id of NODE_ORDER) {
      if (nodeGate(id)) highest = id;
      else break;
    }
    if (LADDER.indexOf(highest) > LADDER.indexOf(state.node)) {
      state.node = highest;
      state.understood[highest] = true;
    }
    if (highest === 'N5') { state.ended = true; state.understood.N5 = true; }
    save();
    return state.node;
  }

  function unlock() {
    if (state.unlocked) return false;
    state.unlocked = true;
    save();
    return true;
  }

  function hint() {
    const idx = LADDER.indexOf(state.node);
    if (idx < 0 || idx >= LADDER.length - 1) return null;
    const nextNode = LADDER[idx + 1];
    const def = DATA.nodes[nextNode];
    if (!def) return null;
    const ids = def.needs || def.groups.flat();
    const missing = ids.find((id) => !state.found[id]);
    if (!missing) return null;
    return { nextNode, missing, label: EVIDENCE[missing]?.label || missing };
  }

  function progress() {
    const idx = LADDER.indexOf(state.node);
    return {
      node: state.node,
      unlocked: state.unlocked,
      ownerConfirmed: state.ownerConfirmed,
      ended: state.ended,
      found: Object.keys(state.found).filter((id) => state.found[id]),
      timeCursor: state.timeCursor,
      next: idx < 0 || idx >= LADDER.length - 1 ? null : LADDER[idx + 1]
    };
  }

  // 结局判定属于完整主线，第一开发段停在大阪前夜，尚无结局。
  function resolveEnding() { return null; }

  root.PocketMainline = {
    KEY, EVIDENCE, NODE_ORDER, DATA,
    unlock, note, corroborate, nodeGate, advance, hint, progress, resolveEnding,
    isFound: (id) => state.found[id] === true,
    getState: () => JSON.parse(JSON.stringify(state)),
    setTimeCursor: (d) => { state.timeCursor = String(d); save(); },
    normalize, fresh
  };

  if (typeof module !== 'undefined') module.exports = root.PocketMainline;
})(typeof window === 'undefined' ? globalThis : window);
