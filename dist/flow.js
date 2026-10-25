/* Pocket Story · 主动推送流程引擎
 * 模型：推送 → 打开对应软件 → 动作（回复/查看）→ 反馈 → 下一条推送
 * 一次只推一条主通知；不使用大段弹窗，不做独立「剧情回忆」。
 */
(function (root) {
  'use strict';
  const KEY = 'pocket-flow-v1';

  // 开场：锁屏 → KKT 两轮 → 日历推送 → 信息推送 → 确认主人
  const STEPS = [
    { id:'N02', view:'ktstory', await:'reply',
      pre:[{t:'21:18'},{who:'j',t:'身体真的没事吗？'},{who:'s',t:'肩膀有一点紧。'},{who:'j',t:'只是肩膀？'},{who:'s',t:'嗯，今天可能用力太多了。'},{who:'j',t:'先去按一下。'},{who:'j',t:'按完去吃东西？'},{who:'s',t:'可以。'},{t:'22:32'}],
      them:['去按了吗？'] },
    { id:'N03', await:'reply', them:['好一点了吗？'] },
    { id:'N04', await:'reply', them:['还疼吗？'] },
    { id:'N05', await:'reply', them:['那还去吃吗？'] },
    { id:'N06', await:'none', them:['好。','到酒店告诉我。'],
      push:{ app:'Apple 钱包', title:'23:41 · 7-ELEVEN FUKUOKA', text:'¥1,180' } },
    { id:'N07', await:'reply', them:['吃东西了吗？'] },
    { id:'N08', await:'reply', them:['别只吃零食。','到酒店了吗？'] },
    { id:'N09', await:'none', them:['好。','早点睡。'] }
  ];


  const fresh = () => ({ version: 1, i: 0, replies: [], synced: false, seenIndex: -1 });
  function normalize(v) {
    const n = fresh();
    if (!v || v.version !== 1) return n;
    n.i = Number.isInteger(v.i) ? Math.max(0, Math.min(STEPS.length - 1, v.i)) : 0;
    n.replies = Array.isArray(v.replies) ? v.replies.filter((x) => typeof x === 'string').slice(-20) : [];
    n.synced = v.synced === true;
    n.seenIndex = Number.isInteger(v.seenIndex) ? v.seenIndex : -1;
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
          if (m.t) out.push({ role: 'day', text: m.t });
          else out.push({ role: m.who === 's' ? 'me' : 'them', text: m.t });
        });
      }
      (s.them || []).forEach((t) => out.push({ role: 'them', text: t }));
      if (k < state.i && state.replies[k]) out.push({ role: 'me', text: state.replies[k] });
    }
    return out;
  }

  function reply(text) {
    const s = at();
    if (s.await !== 'reply') return false;
    state.replies[state.i] = String(text || '').trim().slice(0, 200);
    state.i = Math.min(STEPS.length - 1, state.i + 1);
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
  function current() { return at(); }
  function progress() {
    return { i: state.i, step: at().id, synced: state.synced, total: STEPS.length };
  }
  function reset() { state = fresh(); save(); }
  function getState() { return JSON.parse(JSON.stringify(state)); }

  root.PocketFlow = {
    KEY, STEPS, chatLines, reply, openApp, markSeen, badgeFor, current, targetView, progress, reset, getState, normalize
  };
  if (typeof module !== 'undefined') module.exports = root.PocketFlow;
})(typeof window === 'undefined' ? globalThis : window);
