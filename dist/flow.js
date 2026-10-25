/* Pocket Story · 主动推送流程引擎
 * 模型：推送 → 打开对应软件 → 动作（回复/查看）→ 反馈 → 下一条推送
 * 一次只推一条主通知；不使用大段弹窗，不做独立「剧情回忆」。
 */
(function (root) {
  'use strict';
  const KEY = 'pocket-flow-v2';

  // 开场：锁屏 → KKT 两轮 → 日历推送 → 信息推送 → 确认主人
  const STEPS = [
    { id:'N02_KKT_OPENED', await:'reply', maxChats:3, them:['去按了吗？'],
      pick:['finished','going','not_done','avoid'],
      exit:{ finished:1 },
      resp:{ finished:[], going:['嗯，结束了告诉我。'], not_done:['不是说结束以后就去吗？','别又拖着。'], avoid:['问你去按了吗。'], '*':['？','去按摩了吗？'] } },
    { id:'N05_AFTER_MASSAGE', await:'none', them:[] }
  ];




  const fresh = () => ({ version: 1, i: 0, replies: [], log: [], synced: false, seenIndex: -1, dyn: {} });
  function normalize(v) {
    const n = fresh();
    if (!v || v.version !== 1) return n;
    n.i = Number.isInteger(v.i) ? Math.max(0, Math.min(STEPS.length - 1, v.i)) : 0;
    n.replies = Array.isArray(v.replies) ? v.replies.filter((x) => typeof x === 'string').slice(-20) : [];
    n.synced = v.synced === true;
    n.seenIndex = Number.isInteger(v.seenIndex) ? v.seenIndex : -1;
    n.dyn = v.dyn && typeof v.dyn === 'object' ? v.dyn : {};
    n.log = Array.isArray(v.log) ? v.log.filter((m) => m && typeof m.text === 'string').slice(-80) : [];
    return n;
  }

  let state;
  try { state = normalize(JSON.parse(root.localStorage.getItem(KEY))); } catch { state = fresh(); }
  function save() { try { root.localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }

  const at = () => STEPS[state.i] || STEPS[STEPS.length - 1];

  // 当前应显示的对话（她们的话 + 玩家已回复）
  function chatLines() {
    const out = [];
    for (let k = 0; k < STEPS.length && k <= state.i; k += 1) {
      (STEPS[k].them || []).forEach((t) => out.push({ role: 'them', text: t }));
    }
    (state.log || []).forEach((m) => out.push({ role: m.role === 'me' ? 'me' : 'them', text: m.text }));
    return out;
  }

  function reply(text) {
    const s = at();
    if (s.await !== 'reply') return false;
    const clean = String(text || '').trim().slice(0, 200);
    if (!clean) return false;
    let intent = '*';
    const C = root.PocketIntent;
    if (C && s.pick && s.resp) {
      const tags = C.classify(clean).tags || [];
      intent = s.pick.find((k) => tags.includes(k)) || '*';
    }
    state.log = state.log || [];
    const _mine = state.log.filter((m) => m.role === 'me').length;
    const _max = s.maxChats || 99;
    state.log.push({ role: 'me', text: clean });
    if (_mine >= _max) { state.replies[state.i] = clean; save(); return true; }
    const lines = s.resp ? (s.resp[intent] || s.resp['*'] || []) : [];
    lines.forEach((t) => state.log.push({ role: 'them', text: t }));
    state.replies[state.i] = clean;
    state.lastIntent = intent;
    if (s.push) state.pendingPush = s.push;
    const target = s.exit && s.exit[intent];
    if (Number.isInteger(target)) state.i = Math.min(STEPS.length - 1, target);
    save();
    return true;
  }

  function openApp(view) {
    const s = at();
    if (s.await !== 'open:' + view) return false;
    // 打开目标软件即通过该步
    state.i = Math.min(STEPS.length - 1, state.i + 1);
    if (STEPS[state.i] && STEPS[state.i].ownerConfirmed) state.synced = true;
    save();
    return true;
  }

  function targetView() {
    const s = at();
    if (!s) return null;
    if (s.push && s.push.view) return s.push.view;
    const m = String(s.await || '').match(/^open:(.+)$/);
    if (m) return m[1];
    if (s.await === 'reply') return 'ktstory';
    return null;
  }
  function markSeen(view) { if (targetView() === view) { state.seenIndex = state.i; save(); } }
  function badgeFor(view) { return targetView() === view && state.seenIndex !== state.i; }
  function pendingPush() { return state.pendingPush || null; }
  function clearPending() { state.pendingPush = null; save(); }
  function current() { return at(); }
  function progress() {
    return { i: state.i, step: at().id, synced: state.synced, total: STEPS.length };
  }
  function reset() { state = fresh(); save(); }
  function getState() { return JSON.parse(JSON.stringify(state)); }

  root.PocketFlow = {
    KEY, STEPS, chatLines, reply, openApp, markSeen, badgeFor, current, pendingPush, clearPending, targetView, progress, reset, getState, normalize
  };
  if (typeof module !== 'undefined') module.exports = root.PocketFlow;
})(typeof window === 'undefined' ? globalThis : window);
