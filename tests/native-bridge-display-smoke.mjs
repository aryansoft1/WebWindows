import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile(new URL("../assets/js/device-api.js", import.meta.url), "utf8");

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
    battery: true, network: true, display: true, audio: true,
    storage: true, power: false, updater: true
  }
};

async function runCase({
  native = false,
  announce = native,
  displayCapability = true,
  getResult = { level: 0.5, systemDefault: false },
  getError = null,
  setResult,
  setError = null,
  userAgent = "test"
} = {}) {
  const listeners = new Map();
  const events = [];
  const stored = new Map();
  const setCalls = [];
  let getCalls = 0;
  let batteryCalls = 0;
  let networkCalls = 0;
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
    localStorage: {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value)
    },
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
      events.push(event);
      (listeners.get(event.type) || []).forEach((callback) => callback(event));
      return true;
    },
    Promise, Object, Number, String, Boolean, Math, Set, Map, JSON, console
  };
  context.window = context;
  context.self = context;
  context.top = context;
  if (native) {
    context.WebWindowsNative = {
      getRuntimeInfo: async () => ({
        ...runtimeTemplate,
        capabilities: { ...runtimeTemplate.capabilities, display: displayCapability }
      }),
      getBatteryStatus: async () => {
        batteryCalls += 1;
        return { present: true, connected: false, charging: false, level: 0.5 };
      },
      getNetworkStatus: async () => {
        networkCalls += 1;
        return { connected: true, internetAvailable: true, transport: "wifi" };
      },
      getScreenBrightness: async () => {
        getCalls += 1;
        if (getError) throw getError;
        return getResult;
      },
      setScreenBrightness: async (level) => {
        setCalls.push(level);
        if (setError) throw setError;
        return setResult === undefined ? { level, systemDefault: false } : setResult;
      }
    };
  }

  vm.runInNewContext(source, context, { filename: "device-api.js" });
  await context.WebWindows.device.ready();
  if (announce) {
    const ready = new Promise((resolve) => context.addEventListener("webwindows:device-ready", (event) => {
      if (event.detail?.adapter === "android") resolve();
    }));
    context.dispatchEvent(new context.CustomEvent("webwindowsnativeavailable"));
    await ready;
  }
  return {
    device: context.WebWindows.device,
    events,
    stored,
    setCalls,
    get getCalls() { return getCalls; },
    get batteryCalls() { return batteryCalls; },
    get networkCalls() { return networkCalls; }
  };
}

const browser = await runCase();
assert.equal(browser.device.getAdapter(), "browser");
assert.equal(browser.device.display.getCapabilities().brightness.scope, "visual");
assert.deepEqual(
  Object.fromEntries(Object.entries(await browser.device.display.setBrightness(0.4)).filter(([key]) =>
    ["supported", "value", "scope", "source"].includes(key))),
  { supported: true, value: 0.4, scope: "visual", source: "webwindows" }
);
assert.equal((await browser.device.display.setBrightness(2)).value, 1);
assert.equal((await browser.device.display.setBrightness("0.25")).value, 0.25,
  "Browser visual-brightness compatibility continues to coerce and clamp public values");

for (const level of [0, 0.5, 1]) {
  const native = await runCase({ native: true, getResult: { level, systemDefault: level === 0.5 } });
  assert.equal(native.device.getAdapter(), "android");
  assert.equal(native.device.display.getCapabilities().brightness.scope, "native");
  assert.equal((await native.device.display.getBrightness()).value, level);
  assert.equal((await native.device.display.getBrightness()).systemDefault, level === 0.5);
  const state = await native.device.display.setBrightness(level);
  assert.equal(native.setCalls.at(-1), level);
  assert.equal(state.value, level);
  assert.equal((await native.device.display.getBrightness()).value, level, "successful set updates public cache");
  assert.ok(native.events.some((event) => event.type === "webwindows:display-change" && event.detail?.value === level));
}

const malformedGet = await runCase({ native: true, getResult: { level: "0.5", systemDefault: false } });
assert.equal((await malformedGet.device.display.getBrightness()).supported, false);
assert.equal((await malformedGet.device.display.getBrightness()).reason, "invalid-response");
assert.equal(malformedGet.device.battery.getState().level, 0.5);
assert.equal(malformedGet.device.network.getState().transport, "wifi");

for (const getResult of [
  { level: -1, systemDefault: true },
  { level: Number.NaN, systemDefault: false },
  { level: Number.POSITIVE_INFINITY, systemDefault: false },
  { level: 1.1, systemDefault: false },
  { level: 0.5 },
  null
]) {
  const malformed = await runCase({ native: true, getResult });
  assert.equal((await malformed.device.display.getBrightness()).supported, false);
}

const unavailableGet = await runCase({ native: true, getError: Object.assign(new Error("timeout"), { code: "timeout" }) });
assert.equal((await unavailableGet.device.display.getBrightness()).reason, "unavailable");
assert.equal(unavailableGet.device.getAdapter(), "android");

const setFailure = await runCase({ native: true, setError: Object.assign(new Error("unsupported"), { code: "unsupported-method" }) });
const beforeFailure = await setFailure.device.display.getBrightness();
await assert.rejects(setFailure.device.display.setBrightness(0.8), (error) => error?.code === "unsupported-method");
assert.deepEqual(await setFailure.device.display.getBrightness(), beforeFailure, "failed set does not corrupt public cache");
assert.ok(setFailure.batteryCalls > 0);
assert.ok(setFailure.networkCalls > 0);

const malformedSet = await runCase({ native: true, setResult: { level: "0.8", systemDefault: false } });
const beforeMalformedSet = await malformedSet.device.display.getBrightness();
await assert.rejects(malformedSet.device.display.setBrightness(0.8), (error) => error?.code === "invalid-response");
assert.deepEqual(await malformedSet.device.display.getBrightness(), beforeMalformedSet);

const noCapability = await runCase({ native: true, displayCapability: false });
assert.equal(noCapability.getCalls, 0);
assert.equal(noCapability.device.display.getCapabilities().brightness.scope, "visual");
assert.equal((await noCapability.device.display.setBrightness(0.6)).scope, "visual");

const compatibilityClamp = await runCase({ native: true });
for (const [input, expected] of [[-1, 0], [2, 1], [Number.NaN, 0], [Number.POSITIVE_INFINITY, 0], ["0.75", 0.75]]) {
  await compatibilityClamp.device.display.setBrightness(input);
  assert.equal(compatibilityClamp.setCalls.at(-1), expected);
}

const fakeUa = await runCase({ userAgent: "test WebWindowsMobile/1.0" });
assert.equal(fakeUa.device.getAdapter(), "browser");
const unannouncedBridge = await runCase({ native: true, announce: false });
assert.equal(unannouncedBridge.device.getAdapter(), "browser");
assert.equal(unannouncedBridge.getCalls, 0);

console.log("native bridge display smoke test passed");
