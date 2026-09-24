import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");

const startupSource = await read("assets/js/startup-manager.js");
const registrySource = await read("assets/js/app-registry.js");
const manifest = JSON.parse(await read("data/apps/system-apps.json"));
const settingsSource = await read("settings.html");
const settingsScript = await read("assets/js/settings.js");
const mainSource = await read("assets/js/main.js");
const indexSource = await read("index.html");

const plain = (value) => JSON.parse(JSON.stringify(value));

/* ------------------------------------------------------------------ *
 * 沙箱 A：StartupManager（配置、隔离、调度、幂等、卸载联动）
 * ------------------------------------------------------------------ */
const storage = new Map();
const session = new Map();
const listeners = new Map();
const launchCalls = [];
let failingAppIds = new Set();

const startupWindow = {
  WebWindows: {},
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); }
  },
  sessionStorage: {
    getItem(key) { return session.has(key) ? session.get(key) : null; },
    setItem(key, value) { session.set(key, String(value)); },
    removeItem(key) { session.delete(key); }
  },
  addEventListener(type, handler) {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(handler);
  },
  dispatchEvent(event) {
    for (const handler of listeners.get(event.type) || []) handler(event);
  }
};

// 复用现有 AppManager 的角色替身：只记录 launch(appId, options) 调用。
startupWindow.WebWindows.apps = {
  associations: {
    currentSubjectId() {
      try {
        const user = JSON.parse(session.get("webwindows_user") || "null");
        const identifier = user?.id || user?.userId || user?.username;
        return identifier ? `user:${String(identifier)}` : "local";
      } catch (_) {
        return "local";
      }
    }
  },
  async ready() {},
  async launch(appId, options) {
    launchCalls.push({ appId, options, at: Date.now() });
    if (failingAppIds.has(appId)) throw new Error(`找不到应用：${appId}`);
  }
};

class CustomEvent {
  constructor(type, init) {
    this.type = type;
    this.detail = init?.detail;
  }
}

const contextA = vm.createContext({
  window: startupWindow,
  console,
  CustomEvent,
  Map,
  Object,
  Array,
  String,
  Number,
  Date,
  Promise,
  Error,
  RegExp,
  JSON,
  Math,
  setTimeout,
  clearTimeout
});

vm.runInContext(startupSource, contextA, { filename: "startup-manager.js" });
const startup = startupWindow.WebWindows.startup;

assert.ok(startup, "StartupManager 必须挂载到 WebWindows.startup");
assert.equal(typeof startup.run, "function");
assert.deepEqual(plain(startup.modes), ["background", "minimized", "normal"]);

// 1) 数据结构以 appId 为核心；无效 appId 被拒绝。
assert.throws(() => startup.add({}), /appId/);
assert.throws(() => startup.add({ appId: "singleword" }), /appId/);
const savedAlpha = startup.add({ appId: "com.example.alpha" });
assert.deepEqual(plain(savedAlpha), {
  appId: "com.example.alpha",
  enabled: false,
  trigger: "session-ready",
  mode: "background",
  delay: 0
});
assert.throws(() => startup.add({ appId: "com.example.gamma", mode: "stealth" }), /启动模式/);

// 2) 修改 API + 延迟夹取。
startup.setEnabled("com.example.alpha", true);
startup.setMode("com.example.alpha", "minimized");
startup.setDelay("com.example.alpha", 1500);
assert.deepEqual(plain(startup.get("com.example.alpha")), {
  appId: "com.example.alpha",
  enabled: true,
  trigger: "session-ready",
  mode: "minimized",
  delay: 1500
});
assert.equal(startup.setDelay("com.example.alpha", -50).delay, 0);
assert.equal(startup.setDelay("com.example.alpha", 999999).delay, 60000);
assert.equal(startup.setDelay("com.example.alpha", 800).delay, 800);

// 3) 用户级配置隔离：不同 subject 使用互不干扰的存储域。
session.set("webwindows_user", JSON.stringify({ id: "alice" }));
assert.deepEqual(plain(startup.list()), []);
startup.add({ appId: "com.example.beta", enabled: true, mode: "normal", delay: 50 });
session.delete("webwindows_user");
assert.deepEqual(plain(startup.list()).map((item) => item.appId), ["com.example.alpha"]);
session.set("webwindows_user", JSON.stringify({ id: "alice" }));
assert.deepEqual(plain(startup.list()).map((item) => item.appId), ["com.example.beta"]);
session.delete("webwindows_user");

// 4) 存储域命名空间：按 subjectId 隔离保存。
assert.ok(storage.has("webwindows.startup.items.v1::local"));
assert.ok(storage.has("webwindows.startup.items.v1::user:alice"));

// 5) 重复 appId 去重（后写入生效）与损坏数据跳过。
session.set("webwindows_user", JSON.stringify({ id: "carol" }));
storage.set("webwindows.startup.items.v1::user:carol", JSON.stringify([
  { appId: "com.example.dup", enabled: false, mode: "normal", delay: 10 },
  { appId: "com.example.dup", enabled: true, mode: "background", delay: 20 },
  { appId: "bad id", enabled: true },
  "not-an-object"
]));
const carolItems = plain(startup.list());
assert.deepEqual(carolItems, [{
  appId: "com.example.dup",
  enabled: true,
  trigger: "session-ready",
  mode: "background",
  delay: 20
}]);
session.delete("webwindows_user");

// 6) 损坏的 JSON 不影响桌面：按空列表处理。
storage.set(
  "webwindows.startup.items.v1::user:broken",
  "{oops"
);
session.set("webwindows_user", JSON.stringify({ id: "broken" }));
assert.deepEqual(plain(startup.list()), []);
session.delete("webwindows_user");

// 7) session-ready 调度：按 delay 排序、模式透传、失败独立、未知 trigger 与禁用项跳过。
storage.set("webwindows.startup.items.v1::local", JSON.stringify([
  { appId: "com.demo.c", enabled: true, trigger: "session-ready", mode: "normal", delay: 60 },
  { appId: "com.demo.a", enabled: true, trigger: "session-ready", mode: "background", delay: 20 },
  { appId: "com.demo.b", enabled: true, trigger: "session-ready", mode: "minimized", delay: 40 },
  { appId: "com.demo.disabled", enabled: false, delay: 0 },
  { appId: "com.demo.timer", enabled: true, trigger: "timer", delay: 0 },
  { appId: "com.demo.missing", enabled: true, delay: 0 },
  { appId: "com.demo.dupe-zero", enabled: true, delay: 0 }
]));
failingAppIds = new Set(["com.demo.missing", "com.demo.dupe-zero"]);

startupWindow.dispatchEvent(new CustomEvent("webwindows:session-ready"));
const summary = await startup.run();

assert.deepEqual(plain(summary), {
  scheduled: 5,
  launched: 3,
  failed: 2,
  skipped: 0,
  reason: null
});
assert.deepEqual(
  plain(launchCalls.map((call) => call.appId)),
  [
    "com.demo.missing",
    "com.demo.a",
    "com.demo.b",
    "com.demo.c",
    "com.demo.dupe-zero"
  ],
  "启动项必须按 delay 排序调度；同 delay 项错开执行且失败互不阻塞"
);
// 同 delay 启动项错开（避免启动风暴）。
const missingCall = launchCalls.find((call) => call.appId === "com.demo.missing");
const zeroTwoCall = launchCalls.find((call) => call.appId === "com.demo.dupe-zero");
assert.ok(zeroTwoCall.at - missingCall.at >= 150, "同 delay 启动项必须错开执行");

// 模式必须以 options 交给 AppManager，且不携带任何 URL。
for (const call of launchCalls) {
  assert.deepEqual(Object.keys(call.options).sort(), ["initialState"]);
}
assert.equal(
  launchCalls.find((call) => call.appId === "com.demo.a").options.initialState,
  "background"
);
assert.equal(
  launchCalls.find((call) => call.appId === "com.demo.b").options.initialState,
  "minimized"
);
assert.equal(
  launchCalls.find((call) => call.appId === "com.demo.c").options.initialState,
  "normal"
);
// 禁用项与未来 trigger（非 session-ready）不得被调度。
assert.equal(launchCalls.some((call) => call.appId === "com.demo.disabled"), false);
assert.equal(launchCalls.some((call) => call.appId === "com.demo.timer"), false);
// 未知 trigger 的配置必须原样保留，不能被改写成 session-ready。
assert.equal(startup.get("com.demo.timer").trigger, "timer");

// 8) 幂等：同一会话重复 run() 不会再次启动任何应用。
const before = launchCalls.length;
const secondSummary = await startup.run();
assert.equal(launchCalls.length, before);
assert.equal(secondSummary, summary);

// 9) 卸载联动：卸载即删除对应启动项，其他 subject 的配置不受影响。
startupWindow.dispatchEvent(new CustomEvent("webwindows:installation-changed", {
  detail: { appId: "com.demo.a", subjectId: "local", state: "uninstalled" }
}));
assert.equal(startup.get("com.demo.a"), null);
assert.ok(startup.get("com.demo.b"));

// 非卸载事件不得清理。
startupWindow.dispatchEvent(new CustomEvent("webwindows:installation-changed", {
  detail: { appId: "com.demo.b", subjectId: "local", state: "installed" }
}));
assert.ok(startup.get("com.demo.b"));

// 关联移除通道（removed:true）同样清理。
startupWindow.dispatchEvent(new CustomEvent("webwindows:installation-changed", {
  detail: { appId: "com.demo.b", subjectId: "local", removed: true }
}));
assert.equal(startup.get("com.demo.b"), null);

// 跨 subject 卸载只清理目标 subject 的配置。
session.set("webwindows_user", JSON.stringify({ id: "alice" }));
assert.ok(startup.get("com.example.beta"));
session.delete("webwindows_user");
startupWindow.dispatchEvent(new CustomEvent("webwindows:installation-changed", {
  detail: { appId: "com.example.beta", subjectId: "user:alice", state: "uninstalled" }
}));
session.set("webwindows_user", JSON.stringify({ id: "alice" }));
assert.equal(startup.get("com.example.beta"), null);
session.delete("webwindows_user");

// 10) StartupManager 自身不打开窗口 / URL / 页面路径。
assert.doesNotMatch(
  startupSource,
  /openWindow|createElement\(["']iframe|location\.href|\.entry\b/,
  "StartupManager 不允许绕过 AppManager 打开应用"
);
assert.match(startupSource, /webwindows\.startup\.items\.v1::/);

/* ------------------------------------------------------------------ *
 * 沙箱 B：AppManager 的 initialState（启动模式）兼容
 * ------------------------------------------------------------------ */
const registryManifest = manifest;
const openedWindows = [];
const minimizedCalls = [];
const fakeWindowElement = {
  style: { display: "" },
  classList: {
    active: true,
    contains(name) { return name === "active" && this.active; },
    remove(name) { if (name === "active") this.active = false; }
  }
};
const registryStorage = new Map();
const registryWindow = {
  indexedDB: null,
  WebWindows: {},
  location: { origin: "https://webwindows.test" },
  document: {
    getElementById(id) {
      return id === "win-settings" ? fakeWindowElement : null;
    }
  },
  addEventListener() {},
  dispatchEvent() {},
  alert(message) { throw new Error(`Unexpected alert: ${message}`); },
  openWindow(...args) { openedWindows.push(args); return args[0]; },
  openDeskTalkMailbox() {},
  openAbout() {},
  minimizeTargetWindow(id) {
    minimizedCalls.push(id);
    fakeWindowElement.style.display = "none";
  }
};

const contextB = vm.createContext({
  window: registryWindow,
  console,
  CustomEvent: class {
    constructor(type, init) { this.type = type; this.detail = init?.detail; }
  },
  fetch: async () => ({
    ok: true,
    status: 200,
    async json() { return registryManifest; }
  }),
  localStorage: {
    getItem(key) { return registryStorage.has(key) ? registryStorage.get(key) : null; },
    setItem(key, value) { registryStorage.set(key, String(value)); }
  },
  sessionStorage: {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  },
  Map,
  Object,
  Array,
  String,
  Number,
  Date,
  Promise,
  Error,
  RegExp,
  JSON,
  Math,
  URLSearchParams,
  setTimeout,
  clearTimeout
});

vm.runInContext(registrySource, contextB, { filename: "app-registry.js" });
const registryApps = registryWindow.WebWindows.apps;
await registryApps.ready();
await new Promise((resolve) => setTimeout(resolve, 0));

// 默认启动（无 initialState）行为不变：不触发最小化。
await registryApps.launch("webwindows.system.settings");
assert.equal(minimizedCalls.length, 0);
assert.equal(openedWindows.at(-1)[0], "settings");

// minimized：窗口创建后同步最小化。
await registryApps.launch("webwindows.system.settings", { initialState: "minimized" });
assert.deepEqual(minimizedCalls, ["settings"]);
assert.equal(fakeWindowElement.style.display, "none");

// background：最小化且清除活动状态。
fakeWindowElement.style.display = "";
fakeWindowElement.classList.active = true;
await registryApps.launch("webwindows.system.settings", { initialState: "background" });
assert.deepEqual(minimizedCalls, ["settings", "settings"]);
assert.equal(fakeWindowElement.classList.active, false);

// 未知模式退回 normal，不影响窗口。
fakeWindowElement.style.display = "";
await registryApps.launch("webwindows.system.settings", { initialState: "stealth" });
assert.equal(minimizedCalls.length, 2);
assert.equal(fakeWindowElement.style.display, "");

/* ------------------------------------------------------------------ *
 * 沙箱 C：StartupManager × AppManager × WindowManager 全链路集成
 * （真实的 startup-manager.js + 真实的 app-registry.js + 模拟窗口管理器）
 * ------------------------------------------------------------------ */
const integratedStorage = new Map();
const constIntegratedSession = new Map();
const integratedListeners = new Map();
const integratedOpened = [];
const integratedMinimized = [];
const integratedElements = new Map([
  ["win-guide", {
    style: { display: "" },
    classList: { contains() { return true; }, remove() {} }
  }]
]);

const integratedWindow = {
  indexedDB: null,
  WebWindows: {},
  location: { origin: "https://webwindows.test" },
  localStorage: {
    getItem(key) { return integratedStorage.has(key) ? integratedStorage.get(key) : null; },
    setItem(key, value) { integratedStorage.set(key, String(value)); }
  },
  sessionStorage: {
    getItem(key) { return constIntegratedSession.has(key) ? constIntegratedSession.get(key) : null; },
    setItem(key, value) { constIntegratedSession.set(key, String(value)); },
    removeItem(key) { constIntegratedSession.delete(key); }
  },
  document: {
    getElementById(id) { return integratedElements.get(id) || null; }
  },
  addEventListener(type, handler) {
    if (!integratedListeners.has(type)) integratedListeners.set(type, []);
    integratedListeners.get(type).push(handler);
  },
  dispatchEvent(event) {
    for (const handler of integratedListeners.get(event.type) || []) handler(event);
  },
  alert(message) { throw new Error(`Unexpected alert: ${message}`); },
  openWindow(...args) { integratedOpened.push(args); return args[0]; },
  openDeskTalkMailbox() {},
  openAbout() {},
  minimizeTargetWindow(id) {
    integratedMinimized.push(id);
    const element = integratedElements.get(`win-${id}`);
    if (element) element.style.display = "none";
  }
};

const contextC = vm.createContext({
  window: integratedWindow,
  console,
  CustomEvent: class {
    constructor(type, init) { this.type = type; this.detail = init?.detail; }
  },
  fetch: async () => ({
    ok: true,
    status: 200,
    async json() { return manifest; }
  }),
  Map,
  Object,
  Array,
  String,
  Number,
  Date,
  Promise,
  Error,
  RegExp,
  JSON,
  Math,
  URLSearchParams,
  setTimeout,
  clearTimeout
});

vm.runInContext(registrySource, contextC, { filename: "app-registry.js" });
vm.runInContext(startupSource, contextC, { filename: "startup-manager.js" });
assert.ok(integratedWindow.WebWindows.startup, "集成环境下 StartupManager 必须挂载");

// 配置一个 minimized 启动项（用户配置域）。
integratedStorage.set("webwindows.startup.items.v1::local", JSON.stringify([
  { appId: "webwindows.system.guide", enabled: true, trigger: "session-ready", mode: "minimized", delay: 10 }
]));

// session-ready → StartupManager → AppManager.launch → 窗口最小化。
integratedWindow.dispatchEvent(new CustomEvent("webwindows:session-ready"));
const integratedSummary = await integratedWindow.WebWindows.startup.run();
assert.equal(integratedSummary.launched, 1, `集成链路启动失败：${JSON.stringify(plain(integratedSummary))}`);
assert.equal(integratedOpened.at(-1)[0], "guide");
assert.deepEqual(integratedMinimized, ["guide"]);
assert.equal(integratedElements.get("win-guide").style.display, "none",
  "minimized 启动项必须以最小化状态呈现");

// 重复 session-ready 不会重复拉起。
integratedWindow.dispatchEvent(new CustomEvent("webwindows:session-ready"));
await integratedWindow.WebWindows.startup.run();
assert.equal(integratedOpened.length, 1, "同一会话内禁止重复启动同一应用");

/* ------------------------------------------------------------------ *
 * 源码契约：挂载点、设置页、缓存版本、部署入口依赖
 * ------------------------------------------------------------------ */
assert.match(indexSource, /assets\/js\/startup-manager\.js/);
assert.match(mainSource, /webwindows:session-ready/);
assert.ok(
  (mainSource.match(/announceWebWindowsSessionReady\(\)/g) || []).length >= 3,
  "开机快路径与开机动画结束都必须派发 session-ready"
);
assert.match(settingsSource, /data-settings-tab="appsTab"/);
assert.match(settingsSource, /id="startupList"/);
assert.match(settingsSource, />应用</);
assert.match(settingsSource, />启动项</);
assert.match(settingsSource, /renderStartupSettings/);
assert.doesNotMatch(settingsSource, /<span class="settings-nav-icon">/);
assert.match(settingsScript, /WebWindows\?\.startup/);
assert.match(settingsScript, /window\.renderStartupSettings\s*=/);
assert.match(settingsScript, /startup\.add\(/);
assert.match(registrySource, /applyLaunchState/);
assert.match(registrySource, /LAUNCH_INITIAL_STATES/);
assert.match(
  JSON.parse(await read("data/apps/system-apps.json")).apps
    .find((app) => app.id === "webwindows.system.settings").entry,
  /^settings\.html\?v=/
);

console.log("startup manager smoke test passed");
