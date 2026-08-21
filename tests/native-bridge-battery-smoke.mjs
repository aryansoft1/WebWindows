import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const deviceSource = await fs.readFile(new URL("../assets/js/device-api.js", import.meta.url), "utf8");
const controlsSource = await fs.readFile(new URL("../assets/js/device-controls.js", import.meta.url), "utf8");

const runtimeTemplate = {
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

async function runCase({ nativeBattery, batteryCapability = true, browserBattery } = {}) {
  const listeners = new Map();
  const emitted = [];
  const classes = new Set();
  const styles = new Map();
  const tip = { textContent: "" };
  const indicator = {
    hidden: true,
    title: "",
    classList: {
      toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); }
    },
    style: { setProperty(name, value) { styles.set(name, value); } },
    setAttribute(name, value) { this[name] = value; },
    querySelector(selector) { return selector === ".battery-indicator__tip" ? tip : null; }
  };
  const document = {
    readyState: "complete",
    documentElement: { style: { setProperty() {} } },
    body: { classList: { add() {} }, style: { removeProperty() {} }, querySelectorAll: () => [] },
    querySelectorAll: () => [],
    getElementById(id) { return id === "ww-battery-indicator" ? indicator : null; }
  };
  let nativeCalls = 0;
  let browserListenerCount = 0;
  const context = {
    document,
    location: { protocol: "https:", hostname: "www.y0.hk", origin: "https://www.y0.hk" },
    navigator: {
      onLine: true,
      platform: "test",
      userAgent: "test",
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
      const callbacks = listeners.get(name) || [];
      callbacks.push(callback);
      listeners.set(name, callbacks);
    },
    dispatchEvent(event) {
      emitted.push(event);
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
  if (browserBattery) {
    context.navigator.getBattery = async () => ({
      ...browserBattery,
      addEventListener() { browserListenerCount += 1; }
    });
  }
  if (nativeBattery !== undefined) {
    context.WebWindowsNative = {
      getRuntimeInfo: async () => ({
        ...runtimeTemplate,
        capabilities: { ...runtimeTemplate.capabilities, battery: batteryCapability }
      }),
      getBatteryStatus: async () => {
        nativeCalls += 1;
        if (nativeBattery instanceof Error) throw nativeBattery;
        return nativeBattery;
      }
    };
  }

  vm.runInNewContext(deviceSource, context, { filename: "device-api.js" });
  vm.runInNewContext(controlsSource, context, { filename: "device-controls.js" });
  await context.WebWindows.device.ready();
  if (nativeBattery !== undefined) {
    const nativeReady = new Promise((resolve) => context.addEventListener("webwindows:device-ready", resolve));
    context.dispatchEvent(new context.CustomEvent("webwindowsnativeavailable"));
    await nativeReady;
  }
  await Promise.resolve();
  return {
    device: context.WebWindows.device,
    indicator,
    tip,
    classes,
    styles,
    emitted,
    nativeCalls,
    browserListenerCount
  };
}

const unsupportedBrowser = await runCase();
assert.equal(unsupportedBrowser.device.battery.isSupported(), false);
assert.equal(unsupportedBrowser.device.battery.getState().level, null);
assert.equal(unsupportedBrowser.indicator.hidden, true);

const browser = await runCase({ browserBattery: { level: 0.61, charging: false } });
assert.equal(browser.device.battery.getState().source, "battery-status-api");
assert.equal(browser.device.battery.getState().level, 0.61);
assert.equal(browser.styles.get("--battery-level"), "61%");
assert.equal(browser.indicator.hidden, false);
await browser.device.battery.refresh();
assert.equal(browser.browserListenerCount, 2, "browser battery listeners are registered only once");

const native = await runCase({
  nativeBattery: { present: true, connected: false, charging: false, level: 0.72 }
});
assert.equal(native.device.battery.getState().source, "android-native");
assert.equal(native.device.battery.getState().level, 0.72);
assert.equal(native.styles.get("--battery-level"), "72%");
assert.equal(native.indicator.hidden, false);
assert.equal(native.device.runtime.getInfo().capabilities.battery, true);
assert.ok(native.emitted.some((event) => event.type === "webwindows:battery-change"));

const legacyPercent = await runCase({
  nativeBattery: { present: true, connected: true, charging: true, level: 72 }
});
assert.equal(legacyPercent.device.battery.getState().level, 0.72);
assert.equal(legacyPercent.classes.has("is-charging"), true);

const malformed = await runCase({ nativeBattery: { present: true, charging: false, level: 0.5 } });
assert.equal(malformed.device.battery.isSupported(), true);
assert.equal(malformed.device.battery.getState().supported, false);
assert.equal(malformed.indicator.hidden, true);

const numericString = await runCase({
  nativeBattery: { present: true, connected: false, charging: false, level: "0.5" }
});
assert.equal(numericString.device.battery.getState().supported, false,
  "Native Battery results must not coerce numeric strings");
assert.equal(numericString.device.battery.getState().source, "unsupported");

const unavailable = await runCase({ nativeBattery: new Error("unavailable") });
assert.equal(unavailable.device.getAdapter(), "android");
assert.equal(unavailable.device.battery.isSupported(), true);
assert.equal(unavailable.device.battery.getState().supported, false);
assert.equal(unavailable.indicator.hidden, true);

const notAdvertised = await runCase({
  nativeBattery: { present: true, connected: true, charging: true, level: 0.5 },
  batteryCapability: false
});
assert.equal(notAdvertised.device.runtime.getInfo().capabilities.battery, false);
assert.equal(notAdvertised.device.battery.isSupported(), false);
assert.equal(notAdvertised.nativeCalls, 0);

console.log("native bridge battery smoke test passed");
