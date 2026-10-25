/* 通知调度器：单队列、间隔、输入时暂停、刷新恢复、红点保留 */
(function (root) {
  'use strict';
  const KEY = 'pocket-notify-v1';
  const GAP_MIN = 8000, GAP_MAX = 15000;

  let queue = [];
  let showing = null;
  let timer = null;

  function load() {
    try { const v = JSON.parse(root.localStorage.getItem(KEY)); if (Array.isArray(v)) queue = v; } catch {}
  }
  function save() {
    try { root.localStorage.setItem(KEY, JSON.stringify(queue)); } catch {}
  }
  function typing() {
    const a = root.document && root.document.activeElement;
    return !!a && /^(INPUT|TEXTAREA)$/.test(a.tagName || '');
  }
  function nextDelay() {
    return GAP_MIN + Math.floor(Math.random() * (GAP_MAX - GAP_MIN));
  }
  function schedule(ms) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(tick, ms);
  }
  function tick() {
    timer = null;
    if (showing) return;
    if (typing()) { schedule(3000); return; }
    if (!queue.length) return;
    const n = queue[0];
    show(n);
  }
  function show(n) {
    const el = root.document && root.document.querySelector('#notification');
    if (!el) { showing = null; return; }
    showing = n;
    const icon = { calendar: '19', sms: '✉', ktstory: 'K', instagram: 'IG', weather: '☀', map: '⌖', forum: '판', youtube: '▶', phone: '✆', reminders: '✓', wallet: '¥' }[n.view] || '•';
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    el.innerHTML = `<button class="native-notice-open" type="button"><span class="native-notice-icon">${esc(icon)}</span><span><small><b>${esc(n.app)}</b><time>现在</time></small><strong>${esc(n.title)}</strong><p>${esc(n.text)}</p></span></button><button class="native-notice-close" type="button" aria-label="关闭">×</button>`;
    el.hidden = false;
    el.style.display = 'block';
    const open = el.querySelector('.native-notice-open');
    const close = el.querySelector('.native-notice-close');
    if (open) open.onclick = () => { dismiss(); };
    if (close) close.onclick = (e) => { e.stopPropagation(); dismiss(); };
  }
  function dismiss() {
    const el = root.document && root.document.querySelector('#notification');
    if (el) { el.hidden = true; el.style.display = 'none'; }
    if (queue.length) { queue.shift(); save(); }
    showing = null;
    schedule(nextDelay());
  }
  function push(n) {
    if (!n) return;
    const dup = queue.some((q) => q.app === n.app && q.title === n.title && q.text === n.text);
    if (dup) return;
    queue.push({ app: n.app, title: n.title, text: n.text, view: n.view || null });
    save();
    if (!timer && !showing) schedule(1200);
  }
  function pending() { return queue.slice(); }
  function clear() { queue = []; save(); if (timer) clearTimeout(timer); timer = null; showing = null; const el = root.document && root.document.querySelector('#notification'); if (el) { el.hidden = true; el.style.display = 'none'; } }

  root.PocketNotify = { load, push, dismiss, pending, clear, tick };
  load();
  if (typeof module !== 'undefined') module.exports = root.PocketNotify;
})(typeof window === 'undefined' ? globalThis : window);
