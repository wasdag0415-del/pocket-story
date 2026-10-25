/* Pocket Story · 主动推送流程引擎
 * 模型：推送 → 打开对应软件 → 动作（回复/查看）→ 反馈 → 下一条推送
 * 一次只推一条主通知；不使用大段弹窗，不做独立「剧情回忆」。
 */
(function (root) {
  'use strict';
  const KEY = 'pocket-flow-v1';

  // 开场：锁屏 → KKT 两轮 → 日历推送 → 信息推送 → 确认主人
  const STEPS = [
    { id:'N02_KKT_OPENED', await:'reply', them:['去按了吗？'],
      pick:['finished','going','not_done','avoid'],
      jump:{ finished:2 },
      resp:{
        finished:[],
        going:['嗯，结束了告诉我。'],
        not_done:['不是说结束以后就去吗？','别又拖着。'],
        avoid:['问你去按了吗。'],
        '*':['？','去按摩了吗？']
      } },
    { id:'N04_WAIT_MASSAGE_FINISH', await:'none', them:[] },
    { id:'N05_AFTER_MASSAGE', await:'none', them:[] }
  ];




  const fresh = () => ({ version: 1, i: 0, replies: [], synced: false, seenIndex: -1, dyn: {} });
  function normalize(v) {
    const n = fresh();
    if (!v || v.version !== 1) return n;
    n.i = Number.isInteger(v.i) ? Math.max(0, Math.min(STEPS.length - 1, v.i)) : 0;
    n.replies = Array.isArray(v.replies) ? v.replies.filter((x) => typeof x === 'string').slice(-20) : [];
    n.synced = v.synced === true;
    n.seenIndex = Number.isInteger(v.seenIndex) ? v.seenIndex : -1;
    n.dyn = v.dyn && typeof v.dyn === 'object' ? v.dyn : {};
    return n;
  }

  let state;
  try { state = normalize(JSON.parse(root.localStorage.getItem(KEY))); } catch { state = fresh(); }
  function save() { try { root.localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }

  const at = () => STEPS[state.i] || STEPS[STEPS.length - 1];

  // 当前应显示的对话（她们的话 + 玩家已回复）
  function chatLines() {
    const out = [];
    for (let k = 0; k <= state.i && k < STEPS.length; k += 1) {
      const s = STEPS[k];
      if (k === 0 && s.pre) {
        s.pre.forEach((m) => {
          if (!m.who) return; // 时间标记不当作聊天气泡
          out.push({ role: m.who === 's' ? 'me' : 'them', text: m.t });
        });
      }
      (state.dyn[k] || s.them || []).forEach((t) => out.push({ role: 'them', text: t }));
      if (k < state.i && state.replies[k]) out.push({ role: 'me', text: state.replies[k] });
    }
    return out;
  }

  function reply(text) {
    const s = at();
    if (s.await !== 'reply') return false;
    const clean = String(text || '').trim().slice(0, 200);
    state.replies[state.i] = clean;
    let intent = '*';
    const C = root.PocketIntent;
    if (C && s.pick && s.resp) {
      const tags = C.classify(clean).tags || [];
      intent = s.pick.find((k) => tags.includes(k)) || '*';
      const lines = s.resp[intent] || s.resp['*'];
      if (lines) state.dyn[state.i + 1] = lines;
    }
    state.lastIntent = intent;
    if (s.push) state.pendingPush = s.push;
    const nxt = STEPS[state.i];
    if (nxt && nxt.push) state.pendingPush = nxt.push;
    const _jump = s.jump && s.jump[intent];
    state.i = Number.isInteger(_jump) ? _jump : Math.min(STEPS.length - 1, state.i + 1);
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
