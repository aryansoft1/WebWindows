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
    battery: true,
    network: true,
    display: true,
    audio: true,
    storage: true,
    power: false,
    updater: true
  }
};

async function runCase({
  native = false,
  announce = native,
  networkCapability = true,
  networkResult = { connected: true, internetAvailable: true, transport: "wifi" },
  networkError = null,
  online = true,
  connectionType,
  userAgent = "test"
} = {}) {
  const listeners = new Map();
  const emitted = [];
  let networkCalls = 0;
  let batteryCalls = 0;
  const document = {
    readyState: "complete",
    documentElement: { style: { setProperty() {} } },
    body: { classList: { add() {} }, style: { removeProperty() {} }, querySelectorAll: () => [] },
    querySelectorAll: () => []
  };
  const navigator = {
    onLine: online,
    platform: "test",
    userAgent,
    storage: { estimate: async () => ({ usage: 1, quota: 10 }) }
  };
  if (connectionType !== undefined) {
    navigator.connection = {
      type: connectionType,
      effectiveType: "4g",
      downlink: 20,
      rtt: 30,
      saveData: false,
      addEventListener() {}
    };
  }
  const context = {
    document,
    location: { protocol: "https:", hostname: "www.y0.hk" },
    navigator,
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
  if (native) {
    context.WebWindowsNative = {
      getRuntimeInfo: async () => ({
        ...runtimeTemplate,
        capabilities: { ...runtimeTemplate.capabilities, network: networkCapability }
      }),
      getNetworkStatus: async () => {
        networkCalls += 1;
        if (networkError) throw networkError;
        return networkResult;
      },
      getBatteryStatus: async () => {
        batteryCalls += 1;
        return { present: true, connected: false, charging: false, level: 0.5 };
      }
    };
  }

  vm.runInNewContext(source, context, { filename: "device-api.js" });
  await context.WebWindows.device.ready();
  if (announce) {
    const ready = new Promise((resolve) => context.addEventListener("webwindows:device-ready", resolve));
    context.dispatchEvent(new context.CustomEvent("webwindowsnativeavailable"));
    await ready;
  }
  return {
    device: context.WebWindows.device,
    emitted,
    get networkCalls() { return networkCalls; },
    get batteryCalls() { return batteryCalls; }
  };
}

const browser = await runCase({ connectionType: "wifi" });
assert.deepEqual(
  Object.fromEntries(Object.entries(browser.device.network.getState()).filter(([key]) =>
    ["online", "connected", "internetAvailable", "transport", "kind", "source"].includes(key))),
  {
    online: true,
    connected: true,
    internetAvailable: null,
    transport: "wifi",
    kind: "wifi",
    source: "network-information-api"
  }
);

const browserWithoutDetails = await runCase();
assert.equal(browserWithoutDetails.device.network.getState().kind, "unknown");
assert.equal(browserWithoutDetails.device.network.getState().transport, "unknown");
assert.equal(browserWithoutDetails.device.network.getState().internetAvailable, null);

const offlineBrowser = await runCase({ online: false });
assert.equal(offlineBrowser.device.network.getState().online, false);
assert.equal(offlineBrowser.device.network.getState().connected, false);
assert.equal(offlineBrowser.device.network.getState().transport, "none");
assert.equal(offlineBrowser.device.network.getState().kind, "offline");

for (const transport of ["wifi", "cellular", "ethernet"]) {
  const result = await runCase({
    native: true,
    networkResult: { connected: true, internetAvailable: true, transport }
  });
  const state = result.device.network.getState();
  assert.equal(state.transport, transport);
  assert.equal(state.kind, transport);
  assert.equal(state.connected, true);
  assert.equal(state.internetAvailable, true);
  assert.equal(state.source, "android-native");
}

for (const transport of ["vpn", "other", "unknown"]) {
  const result = await runCase({
    native: true,
    networkResult: { connected: true, internetAvailable: false, transport }
  });
  assert.equal(result.device.network.getState().transport, transport);
  assert.equal(result.device.network.getState().kind, "unknown");
  assert.equal(result.device.network.getState().online, true);
  assert.equal(result.device.network.getState().internetAvailable, false);
}

const noActiveNetwork = await runCase({
  native: true,
  networkResult: { connected: false, internetAvailable: false, transport: "none" }
});
assert.equal(noActiveNetwork.device.network.getState().online, false);
assert.equal(noActiveNetwork.device.network.getState().kind, "offline");

const malformed = await runCase({
  native: true,
  connectionType: "ethernet",
  networkResult: { connected: true, internetAvailable: "yes", transport: "wifi" }
});
assert.equal(malformed.device.getAdapter(), "android");
assert.equal(malformed.device.network.getState().source, "network-information-api");
assert.equal(malformed.device.network.getState().transport, "ethernet");
assert.equal(malformed.device.battery.getState().source, "android-native");

const unsupported = await runCase({
  native: true,
  connectionType: "wifi",
  networkError: Object.assign(new Error("unsupported"), { code: "unsupported-method" })
});
assert.equal(unsupported.device.getAdapter(), "android");
assert.equal(unsupported.device.network.getState().source, "network-information-api");
assert.equal(unsupported.device.battery.getState().level, 0.5);

const notAdvertised = await runCase({ native: true, networkCapability: false, connectionType: "wifi" });
assert.equal(notAdvertised.device.runtime.getInfo().capabilities.network, false);
assert.equal(notAdvertised.networkCalls, 0);
assert.equal(notAdvertised.device.network.getState().source, "network-information-api");

const fakeUa = await runCase({ userAgent: "test WebWindowsMobile/1.0", connectionType: "wifi" });
assert.equal(fakeUa.device.getAdapter(), "browser");
assert.equal(fakeUa.device.network.getState().source, "network-information-api");

const fakeBridgeOnly = await runCase({ native: true, announce: false, connectionType: "wifi" });
assert.equal(fakeBridgeOnly.device.getAdapter(), "browser");
assert.equal(fakeBridgeOnly.networkCalls, 0);

assert.ok(noActiveNetwork.emitted.some((event) => event.type === "webwindows:network-change"));
assert.ok(unsupported.batteryCalls > 0, "Network failure must not suppress Battery capability");

console.log("native bridge network smoke test passed");
