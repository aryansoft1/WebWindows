import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile(new URL("../assets/js/device-api.js", import.meta.url), "utf8");

const validRuntime = {
  runtimeName: "Dreama Runtime",
  runtimeVersion: "1.0.0",
  bridgeVersion: "1.0",
  platform: "android",
  platformVersion: "15",
  engine: "android-webview",
  engineVersion: null,
  deviceClass: "phone",
  native: true,
  trusted: true,
  capabilities: {
    battery: true,
    network: true,
    display: true,
    audio: true,
    storage: true,
    power: false,
    updater: true
  }
};

function nativeBridge(getRuntimeInfo) {
  return {
    getRuntimeInfo,
    getBatteryStatus: async () => ({ present: true, connected: true, charging: false, level: 50 }),
    getScreenBrightness: async () => ({ level: 0.5, systemDefault: false }),
    setScreenBrightness: async (level) => ({ level }),
    getMediaVolume: async () => ({ current: 5, maximum: 10, level: 0.5 }),
    setMediaVolume: async (level) => ({ current: level * 10, maximum: 10, level }),
    storageListVolumes: async () => [],
    storagePickDirectory: async () => ({ id: "saf-test" }),
    storageListDirectory: async () => [],
    storageOpenFile: async () => ({ metadata: {}, data: "" }),
    storageGetMetadata: async () => ({})
  };
}

async function runCase(bridge, userAgent = "test") {
  const listeners = new Map();
  let listenerRegistrations = 0;
  const document = {
    readyState: "complete",
    documentElement: { style: { setProperty() {} } },
    body: { classList: { add() {} }, style: { removeProperty() {} }, querySelectorAll: () => [] },
    querySelectorAll: () => []
  };
  const context = {
    document,
    location: { protocol: "https:", hostname: "www.y0.hk" },
    navigator: {
      onLine: true,
      platform: "test",
      userAgent,
      storage: { estimate: async () => ({ usage: 1, quota: 10 }) }
    },
    localStorage: { getItem: () => null, setItem() {} },
    screen: { width: 1280, height: 720 },
    devicePixelRatio: 1,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
    Node: { ELEMENT_NODE: 1 },
    MutationObserver: class { observe() {} },
    setTimeout,
    clearTimeout,
    addEventListener(name, callback) {
      listenerRegistrations += 1;
      const callbacks = listeners.get(name) || [];
      callbacks.push(callback);
      listeners.set(name, callbacks);
    },
    dispatchEvent(event) {
      (listeners.get(event.type) || []).forEach((callback) => callback(event));
      return true;
    },
    Promise,
    Object,
    Number,
    String,
    Boolean,
    Math,
    Set,
    Map,
    JSON,
    console
  };
  context.window = context;
  context.self = context;
  context.top = context;
  if (bridge) context.WebWindowsNative = bridge;
  vm.runInNewContext(source, context, { filename: "device-api.js" });
  await context.WebWindows.device.ready();
  return { context, get listenerRegistrations() { return listenerRegistrations; } };
}

const browser = await runCase(null);
assert.equal(browser.context.WebWindows.device.getAdapter(), "browser");
assert.equal(browser.context.WebWindows.device.runtime.getInfo().platform, "browser");
assert.equal(browser.context.WebWindows.device.runtime.getInfo().native, false);

const uaOnly = await runCase(null, "test WebWindowsMobile/1.0");
assert.equal(uaOnly.context.WebWindows.device.getAdapter(), "browser");
assert.equal(uaOnly.context.WebWindows.device.runtime.getInfo().trusted, false);

const android = await runCase(nativeBridge(async () => validRuntime));
assert.equal(android.context.WebWindows.device.getAdapter(), "android");
assert.equal(android.context.WebWindows.device.runtime.getInfo().platform, "android");
assert.equal(android.context.WebWindows.device.runtime.getInfo().native, true);
assert.equal(android.context.WebWindows.device.runtime.getInfo().trusted, true);
assert.equal((await android.context.WebWindows.device.display.setBrightness(0.7)).scope, "native");
assert.equal((await android.context.WebWindows.device.audio.setVolume(0.4)).scope, "native");

const timeoutStart = Date.now();
const timeout = await runCase(nativeBridge(() => new Promise(() => {})));
assert.equal(timeout.context.WebWindows.device.getAdapter(), "browser");
assert.equal(timeout.context.WebWindows.device.runtime.getLastError().code, "timeout");
assert.ok(Date.now() - timeoutStart < 2000, "runtime timeout must safely release initialization");

const invalid = await runCase(nativeBridge(async () => ({ runtimeName: "Dreama Runtime", native: true })));
assert.equal(invalid.context.WebWindows.device.getAdapter(), "browser");
assert.equal(invalid.context.WebWindows.device.runtime.getLastError().code, "invalid-response");

const originalDevice = android.context.WebWindows.device;
const listenerCount = android.listenerRegistrations;
vm.runInNewContext(source, android.context, { filename: "device-api-repeat.js" });
assert.equal(android.context.WebWindows.device, originalDevice);
assert.equal(android.listenerRegistrations, listenerCount);

console.log("native bridge runtime smoke test passed");
