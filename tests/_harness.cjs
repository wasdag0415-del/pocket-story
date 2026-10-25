/*
 * LinkeDOM harness: loads dist/index.html and executes its scripts in order,
 * with just enough browser API stubs to run in plain Node.
 * Not a test itself - shared by the test files.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parseHTML } = require('linkedom');

const DIST = process.env.POCKET_DIST
  ? path.resolve(process.env.POCKET_DIST)
  : path.join(__dirname, '..', 'dist');

function read(name) {
  return fs.readFileSync(path.join(DIST, name), 'utf8');
}

function scriptList(html) {
  const out = [];
  const re = /<script[^>]*\ssrc="([^"]+)"[^>]*><\/script>/g;
  let m;
  while ((m = re.exec(html))) out.push(m[1].split('?')[0]);
  return out;
}

function makeStorage() {
  const map = new Map();
  return {
    get length() { return map.size; },
    key(i) { return [...map.keys()][i] ?? null; },
    getItem(k) { return map.has(String(k)) ? map.get(String(k)) : null; },
    setItem(k, v) { map.set(String(k), String(v)); },
    removeItem(k) { map.delete(String(k)); },
    clear() { map.clear(); },
    _dump() { return Object.fromEntries(map); },
    _seed(obj) { for (const [k, v] of Object.entries(obj)) map.set(k, v); }
  };
}

function makeIndexedDB() {
  // Minimal no-op IndexedDB: enough that feature detection and audio store setup
  // do not throw. Recorded-audio behaviour is intentionally out of scope here.
  const req = () => {
    const r = { result: undefined, error: null, onsuccess: null, onerror: null, onupgradeneeded: null };
    setTimeout(() => { r.onsuccess?.({ target: r }); }, 0);
    return r;
  };
  const db = {
    objectStoreNames: { contains: () => true },
    createObjectStore: () => ({ createIndex() {}, put() {}, get() { return req(); }, getAll() { return req(); } }),
    transaction: () => ({
      objectStore: () => ({
        put() { return req(); },
        get() { return req(); },
        getAll() { return req(); },
        delete() { return req(); }
      }),
      oncomplete: null
    }),
    close() {}
  };
  return {
    open() {
      const r = { result: db, error: null, onsuccess: null, onerror: null, onupgradeneeded: null, onblocked: null };
      setTimeout(() => { r.onupgradeneeded?.({ target: r }); r.onsuccess?.({ target: r }); }, 0);
      return r;
    }
  };
}

function makeSandbox() {
  const { window, document } = parseHTML(fs.readFileSync(path.join(DIST, 'index.html'), 'utf8'));
  const storage = makeStorage();
  const errors = [];

  const noop = () => {};
  const sandbox = {
    console,
    document,
    localStorage: storage,
    sessionStorage: makeStorage(),
    indexedDB: makeIndexedDB(),
    navigator: { userAgent: 'node', language: 'zh-CN', languages: ['zh-CN'], mediaDevices: {}, clipboard: { writeText: async () => {} } },
    location: { href: 'http://127.0.0.1:8088/dist/index.html', search: '', hash: '', origin: 'http://127.0.0.1:8088', pathname: '/dist/index.html', reload: noop, assign: noop },
    history: { pushState: noop, replaceState: noop },
    innerWidth: 430,
    innerHeight: 932,
    devicePixelRatio: 2,
    matchMedia: (q) => ({ matches: false, media: q, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop, onchange: null }),
    requestAnimationFrame: (fn) => setTimeout(() => fn(Date.now()), 0),
    cancelAnimationFrame: noop,
    setTimeout: (fn, ms) => setTimeout(fn, Math.min(ms ?? 0, 5)),
    clearTimeout,
    setInterval: () => 0,
    clearInterval: noop,
    getComputedStyle: () => ({ getPropertyValue: () => '', transitionDuration: '', animationDuration: '' }),
    alert: noop,
    confirm: () => true,
    prompt: () => '',
    speechSynthesis: { speak: noop, cancel: noop, getVoices: () => [] },
    SpeechSynthesisUtterance: function () {},
    Audio: function () { return { play: () => Promise.resolve(), pause: noop, addEventListener: noop, load: noop, currentTime: 0, duration: 0, paused: true }; },
    AudioContext: function () { return { createMediaStreamSource: () => ({ connect: noop }), createAnalyser: () => ({ connect: noop, fftSize: 0, frequencyBinCount: 0 }), createMediaStreamDestination: () => ({ stream: {} }), close: noop, state: 'running' }; },
    MediaRecorder: function () { return { start: noop, stop: noop, addEventListener: noop, state: 'inactive' }; },
    Blob,
    File,
    FormData,
    URL: Object.assign(URL, { createObjectURL: () => 'blob:stub', revokeObjectURL: noop }),
    Image: function () { return { set src(v) {}, addEventListener: noop }; },
    IntersectionObserver: function () { return { observe: noop, unobserve: noop, disconnect: noop }; },
    ResizeObserver: function () { return { observe: noop, unobserve: noop, disconnect: noop }; },
    MutationObserver: function () { return { observe: noop, disconnect: noop }; },
    HTMLDialogElement: function () {},
    Event: window.Event,
    CustomEvent: window.CustomEvent,
    Node: window.Node,
    HTMLElement: window.HTMLElement,
    Element: window.Element,
    errors
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  // Delegate window-level events to LinkeDOM's real window so addEventListener works.
  for (const fn of ['addEventListener', 'removeEventListener', 'dispatchEvent']) {
    sandbox[fn] = window[fn].bind(window);
  }

  // LinkeDOM lacks a few APIs the app may touch; keep failures loud in `errors`.
  const modal = document.querySelector('#modal');
  if (modal) {
    const proto = Object.getPrototypeOf(modal);
    if (!proto.showModal) proto.showModal = function () { this.open = true; };
    if (!proto.close) proto.close = function () { this.open = false; };
  }
  const dialog = document.createElement('dialog');
  if (!dialog.showModal) dialog.showModal = function () { this.open = true; };
  if (!dialog.close) dialog.close = function () { this.open = false; };

  // Layout metrics are absent in LinkeDOM; the lock-screen swipe needs a height.
  const htmlProto = Object.getPrototypeOf(document.documentElement);
  if (!('offsetHeight' in document.documentElement)) {
    Object.defineProperty(htmlProto, 'offsetHeight', { configurable: true, get() { return 600; } });
  }
  if (!htmlProto.scrollIntoView) htmlProto.scrollIntoView = function () {};

  const context = vm.createContext(sandbox);
  return { context, sandbox, document, storage, errors };
}

function boot(options = {}) {
  const env = makeSandbox();
  // Seed before any script runs, so we test real "returning visitor" behaviour.
  if (options.seed) env.storage._seed(options.seed);
  const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const scripts = scriptList(html);
  env.scripts = scripts;
  env.loadErrors = [];
  for (const file of scripts) {
    const code = read(file);
    try {
      new vm.Script(code, { filename: file }).runInContext(env.context);
    } catch (err) {
      env.loadErrors.push({ file, error: err });
    }
  }
  env.fire = (el, type = 'click') => {
    const ev = new env.sandbox.window.Event(type, { bubbles: true, cancelable: true });
    el.dispatchEvent(ev);
    return ev;
  };
  env.text = (selector) => {
    const el = env.document.querySelector(selector);
    return el ? el.textContent : null;
  };
  env.byText = (selector, text) => {
    return [...env.document.querySelectorAll(selector)].find((el) => (el.textContent || '').includes(text)) || null;
  };
  return env;
}

module.exports = { boot, makeStorage, scriptList, DIST };
