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
  audioCapability = true,
  getResult = { level: 0.5 },
  getError = null,
  setResult,
  setError = null,
  userAgent = "test"
} = {}) {
  const listeners = new Map();
  const events = [];
  const stored = new Map();
  const setCalls = [];
  const media = { volume: 1 };
  let getCalls = 0;
  let batteryCalls = 0;
  let networkCalls = 0;
  let displayCalls = 0;
  const document = {
    readyState: "complete",
    documentElement: { style: { setProperty() {} } },
    body: {
      classList: { add() {} },
      style: { removeProperty() {} },
      querySelectorAll: (selector) => selector === "audio,video" ? [media] : []
    },
    querySelectorAll: (selector) => selector === "audio,video" ? [media] : []
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
    Promise, Object, Array, Number, String, Boolean, Math, Set, Map, JSON, console
  };
  context.window = context;
  context.self = context;
  context.top = context;
  if (native) {
    context.WebWindowsNative = {
      getRuntimeInfo: async () => ({
        ...runtimeTemplate,
        capabilities: { ...runtimeTemplate.capabilities, audio: audioCapability }
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
        displayCalls += 1;
        return { level: 0.7, systemDefault: false };
      },
      setScreenBrightness: async (level) => ({ level, systemDefault: false }),
      getMediaVolume: async () => {
        getCalls += 1;
        if (getError) throw getError;
        return getResult;
      },
      setMediaVolume: async (level) => {
        setCalls.push(level);
        if (setError) throw setError;
        return setResult === undefined ? { level } : setResult;
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
    media,
    setCalls,
    get getCalls() { return getCalls; },
    get batteryCalls() { return batteryCalls; },
    get networkCalls() { return networkCalls; },
    get displayCalls() { return displayCalls; }
  };
}

const browser = await runCase();
assert.equal(browser.device.getAdapter(), "browser");
assert.equal(browser.device.audio.getCapabilities().volume.scope, "page");
assert.deepEqual(
  Object.fromEntries(Object.entries(await browser.device.audio.setVolume(0.4)).filter(([key]) =>
    ["supported", "value", "scope", "source"].includes(key))),
  { supported: true, value: 0.4, scope: "page", source: "webwindows" }
);
assert.equal(browser.media.volume, 0.4);
assert.equal((await browser.device.audio.setVolume(2)).value, 1);
assert.equal((await browser.device.audio.setVolume("0.25")).value, 0.25,
  "Browser page-volume compatibility continues to coerce and clamp public values");

for (const level of [0, 0.5, 1]) {
  const native = await runCase({ native: true, getResult: { level } });
  assert.equal(native.device.getAdapter(), "android");
  assert.equal(native.device.runtime.getInfo().runtimeName, "Dreama Runtime");
  assert.equal(native.device.audio.getCapabilities().volume.scope, "native");
  assert.equal(native.device.audio.getVolume().value, level);
  const state = await native.device.audio.setVolume(level);
  assert.equal(native.setCalls.at(-1), level);
  assert.equal(state.value, level);
  assert.equal(native.device.audio.getVolume().value, level, "successful set updates public cache");
  assert.equal(native.media.volume, level, "Native media volume remains synchronized with page media");
  assert.ok(native.events.some((event) => event.type === "webwindows:volume-change" && event.detail?.value === level));
}

for (const getResult of [
  { level: "0.5" },
  { level: Number.NaN },
  { level: Number.POSITIVE_INFINITY },
  { level: -0.1 },
  { level: 1.1 },
  {},
  [],
  null
]) {
  const malformed = await runCase({ native: true, getResult });
  assert.equal(malformed.device.audio.getVolume().supported, false);
  assert.equal(malformed.device.audio.getVolume().reason, "invalid-response");
}

const legacyIntegers = await runCase({ native: true, getResult: { level: 0.5, current: 5, maximum: 10 } });
assert.equal(Object.hasOwn(legacyIntegers.device.audio.getVolume(), "current"), false);
assert.equal(Object.hasOwn(legacyIntegers.device.audio.getVolume(), "maximum"), false);

const unavailableGet = await runCase({
  native: true,
  getError: Object.assign(new Error("timeout"), { code: "timeout" })
});
assert.equal(unavailableGet.device.audio.getVolume().reason, "unavailable");
assert.equal(unavailableGet.device.getAdapter(), "android");
assert.equal(unavailableGet.device.battery.getState().level, 0.5);
assert.equal(unavailableGet.device.network.getState().transport, "wifi");
assert.equal((await unavailableGet.device.display.getBrightness()).value, 0.7);
assert.ok(unavailableGet.batteryCalls > 0);
assert.ok(unavailableGet.networkCalls > 0);
assert.ok(unavailableGet.displayCalls > 0);

const setFailure = await runCase({
  native: true,
  setError: Object.assign(new Error("unsupported"), { code: "unsupported-method" })
});
const beforeFailure = setFailure.device.audio.getVolume();
await assert.rejects(setFailure.device.audio.setVolume(0.8), (error) => error?.code === "unsupported-method");
assert.deepEqual(setFailure.device.audio.getVolume(), beforeFailure, "failed set does not corrupt public cache");
assert.equal(setFailure.device.getAdapter(), "android");

const malformedSet = await runCase({ native: true, setResult: { level: "0.8" } });
const beforeMalformedSet = malformedSet.device.audio.getVolume();
await assert.rejects(malformedSet.device.audio.setVolume(0.8), (error) => error?.code === "invalid-response");
assert.deepEqual(malformedSet.device.audio.getVolume(), beforeMalformedSet);

const noCapability = await runCase({ native: true, audioCapability: false });
assert.equal(noCapability.getCalls, 0);
assert.equal(noCapability.device.audio.getCapabilities().volume.scope, "page");
assert.equal((await noCapability.device.audio.setVolume(0.6)).scope, "page");

const compatibilityClamp = await runCase({ native: true });
for (const [input, expected] of [[-1, 0], [2, 1], [Number.NaN, 0], [Number.POSITIVE_INFINITY, 0], ["0.75", 0.75]]) {
  await compatibilityClamp.device.audio.setVolume(input);
  assert.equal(compatibilityClamp.setCalls.at(-1), expected);
}

const fakeUa = await runCase({ userAgent: "test WebWindowsMobile/1.0" });
assert.equal(fakeUa.device.getAdapter(), "browser");
const unannouncedBridge = await runCase({ native: true, announce: false });
assert.equal(unannouncedBridge.device.getAdapter(), "browser");
assert.equal(unannouncedBridge.getCalls, 0);

console.log("native bridge audio smoke test passed");
