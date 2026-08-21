import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile(new URL("../assets/js/device-api.js", import.meta.url), "utf8");
const storageSource = await fs.readFile(new URL("../assets/js/device-storage-provider.js", import.meta.url), "utf8");

async function runCase({ native = false, topLevel = true, batteryApi = false } = {}) {
  const listeners = new Map();
  const events = [];
  const stored = new Map();
  const connection = {
    type: "wifi", effectiveType: "4g", downlink: 20, rtt: 35, saveData: false,
    addEventListener() {}
  };
  const document = {
    readyState: "complete",
    documentElement: { style: { setProperty() {} } },
    body: { classList: { add() {} }, style: { removeProperty() {} }, querySelectorAll: () => [] },
    querySelectorAll: () => [],
    addEventListener() {}
  };
  const window = {
    document,
    location: { protocol: "https:", hostname: "www.y0.hk" },
    navigator: {
      onLine: true,
      connection,
      platform: "test",
      userAgent: "test",
      storage: { estimate: async () => ({ usage: 10, quota: 100 }) }
    },
    localStorage: {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value)
    },
    screen: { width: 1280, height: 720 },
    devicePixelRatio: 2,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
    Node: { ELEMENT_NODE: 1 },
    MutationObserver: class { observe() {} },
    setTimeout,
    clearTimeout,
    addEventListener(name, callback) {
      const callbacks = listeners.get(name) || [];
      callbacks.push(callback);
      listeners.set(name, callbacks);
    },
    dispatchEvent(event) {
      events.push(event);
      (listeners.get(event.type) || []).forEach((callback) => callback(event));
      return true;
    }
  };
  window.window = window;
  window.self = window;
  window.top = topLevel ? window : {};
  if (batteryApi) {
    window.navigator.getBattery = async () => ({
      level: 0.6, charging: false, addEventListener() {}
    });
  }
  if (native) {
    window.WebWindowsNative = {
      getRuntimeInfo: async () => ({
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
          battery: true, network: true, display: true, audio: true,
          storage: true, power: false, updater: true
        }
      }),
      getBatteryStatus: async () => ({ present: true, connected: true, charging: true, level: 75 }),
      getScreenBrightness: async () => ({ level: 0.7, systemDefault: false }),
      setScreenBrightness: async ({ value } = {}) => ({ level: value, systemDefault: false }),
      storageListVolumes: async () => [],
      storagePickDirectory: async () => ({ id: "saf-test" }),
      storageListDirectory: async () => [],
      storageOpenFile: async () => ({ metadata: {}, data: "" }),
      storageGetMetadata: async () => ({})
    };
    window.WebWindowsNative.setScreenBrightness = async (value) => ({ level: value, systemDefault: false });
    window.WebWindowsNative.getMediaVolume = async () => ({ level: 0.3 });
    window.WebWindowsNative.setMediaVolume = async (value) => ({ level: value });
  }
  Object.assign(window, {
    Promise, Object, Number, String, Boolean, Math, Set, Map, JSON, console
  });
  vm.runInNewContext(storageSource, window, { filename: "device-storage-provider.js" });
  vm.runInNewContext(source, window, { filename: "device-api.js" });
  await window.WebWindows.device.ready();
  if (native && topLevel) {
    const nativeReady = new Promise((resolve) => window.addEventListener("webwindows:device-ready", (event) => {
      if (event.detail?.adapter === "android") resolve();
    }));
    window.dispatchEvent(new window.CustomEvent("webwindowsnativeavailable"));
    await nativeReady;
  }
  return { window, device: window.WebWindows.device, events };
}

const browser = await runCase();
assert.equal(browser.device.getAdapter(), "browser");
assert.equal(browser.device.runtime.getInfo().platform, "browser");
assert.equal(browser.device.runtime.getInfo().native, false);
assert.equal(browser.device.network.getState().kind, "wifi");
assert.equal(browser.device.battery.isSupported(), false);
assert.deepEqual(
  Object.fromEntries(Object.entries(browser.device.battery.getState()).filter(([key]) => ["supported", "present", "level", "charging"].includes(key))),
  { supported: false, present: null, level: null, charging: null }
);
assert.equal(browser.device.power.getState().source, "unknown");
assert.equal(browser.device.storage.getState().supported, true);
assert.equal(browser.events.some((event) => event.type === "webwindows:device-ready"), true);

const browserBattery = await runCase({ batteryApi: true });
assert.equal(browserBattery.device.battery.getState().present, true);
assert.equal(browserBattery.device.power.getState().source, "battery");
assert.equal(browserBattery.device.power.getState().acConnected, false);

const android = await runCase({ native: true });
assert.equal(android.device.getAdapter(), "android");
assert.equal(android.device.runtime.getInfo().runtimeName, "Dreama Runtime");
assert.equal(android.device.runtime.getInfo().platform, "android");
assert.equal(android.device.runtime.getInfo().native, true);
assert.equal(android.device.battery.getState().level, 0.75);
assert.equal(android.device.power.getState().source, "ac");
assert.equal(android.device.power.getState().acConnected, true);
assert.equal((await android.device.display.setBrightness(0.8)).scope, "native");
assert.equal(android.device.audio.getVolume().value, 0.3);
assert.equal((await android.device.audio.setVolume(0.6)).scope, "native");
assert.deepEqual(await android.device.storage.listVolumes(), []);

const iframe = await runCase({ native: true, topLevel: false });
assert.equal(iframe.device.getAdapter(), "browser");
assert.equal(iframe.device.battery.getState().supported, false);

console.log("device API smoke tests passed");
