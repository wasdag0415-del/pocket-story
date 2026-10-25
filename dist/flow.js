/* Pocket Story · 主动推送流程引擎
 * 模型：推送 → 打开对应软件 → 动作（回复/查看）→ 反馈 → 下一条推送
 * 一次只推一条主通知；不使用大段弹窗，不做独立「剧情回忆」。
 */
(function (root) {
  'use strict';
  const KEY = 'pocket-flow-v1';

  // 开场：锁屏 → KKT 两轮 → 日历推送 → 信息推送 → 确认主人
  const STEPS = [
    {
      id: 'kkt1',
      view: 'ktstory',
      them: ['去按了吗？'],
      await: 'reply',
      hint: '回复她'
    },
    {
      id: 'kkt2',
      them: ['先休息一下。', '按完好点了吗？'],
      await: 'reply',
      hint: '回复她'
    },
    {
      id: 'kkt3',
      them: ['好。', '明天十点半彩排，别睡太晚。'],
      await: 'none',
      push: { app: '日历', title: '明日 10:30 · 福冈场彩排', text: '出发时间已更新', view: 'calendar' }
    },
    {
      id: 'calendar',
      await: 'open:calendar',
      pushAfter: { app: '信息', title: '日本运营', text: '涩琪老师，更新后的车辆时间已经发送。', view: 'sms' }
    },
    {
      id: 'sms',
      await: 'open:sms',
      ownerConfirmed: true,
      pushAfter: { app: 'KakaoTalk', title: '系统', text: '聊天记录同步完成', view: 'ktstory' }
    }
  ];

  const fresh = () => ({ version: 1, i: 0, replies: [], synced: false });
  function normalize(v) {
    const n = fresh();
    if (!v || v.version !== 1) return n;
    n.i = Number.isInteger(v.i) ? Math.max(0, Math.min(STEPS.length - 1, v.i)) : 0;
    n.replies = Array.isArray(v.replies) ? v.replies.filter((x) => typeof x === 'string').slice(-20) : [];
    n.synced = v.synced === true;
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

  function current() { return at(); }
  function progress() {
    return { i: state.i, step: at().id, synced: state.synced, total: STEPS.length };
  }
  function reset() { state = fresh(); save(); }
  function getState() { return JSON.parse(JSON.stringify(state)); }

  root.PocketFlow = {
    KEY, STEPS, chatLines, reply, openApp, current, progress, reset, getState, normalize
  };
  if (typeof module !== 'undefined') module.exports = root.PocketFlow;
})(typeof window === 'undefined' ? globalThis : window);
