(function installWebWindowsDeviceApi(global) {
  "use strict";

  if (global.WebWindows?.device?.version === 1 && global.WebWindows.device.runtime?.getInfo) return;

  const STORAGE_VOLUME = "webwindows.pageVolume";
  const STORAGE_BRIGHTNESS = "webwindows.visualBrightness";
  const BRIDGE_VERSION = "1.0";
  const NATIVE_RUNTIME_TIMEOUT_MS = 1000;
  const RUNTIME_CAPABILITIES = ["battery", "network", "display", "audio", "storage", "power", "updater"];
  const TRUSTED_HOSTS = new Set(["www.y0.hk", "y0.hk", "localhost", "127.0.0.1"]);
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  const listeners = new Map();
  const mediaElements = new Set();
  let batteryManager = null;
  let batteryListenersBound = false;
  let adapter = null;
  let storageProvider = null;
  let initialized = false;
  let initializationPromise = null;
  let nativeBridgeAnnounced = false;
  let runtimeInfo = null;
  let runtimeError = null;
  let volume = clamp(readNumber(STORAGE_VOLUME, 0.5), 0, 1);
  let brightness = clamp(readNumber(STORAGE_BRIGHTNESS, 1), 0, 1);
  let batteryState = unsupportedBattery();
  let networkState = null;
  let volumeState = { supported: true, value: volume, scope: "page", source: "webwindows" };
  let brightnessState = { supported: true, value: brightness, scope: "visual", source: "webwindows" };
  let storageState = { supported: false, usage: null, quota: null, source: "unsupported" };

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
  }

  function readNumber(key, fallback) {
    try {
      const raw = global.localStorage?.getItem(key);
      if (raw === null || raw === undefined || raw === "") return fallback;
      const value = Number(raw);
      return Number.isFinite(value) ? value : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function persist(key, value) {
    try { global.localStorage?.setItem(key, String(value)); } catch (_) {}
  }

  function capability(supported, source, extra) {
    return Object.freeze(Object.assign({ supported: Boolean(supported), source }, extra || {}));
  }

  function unsupportedBattery() {
    return {
      supported: false,
      present: null,
      level: null,
      charging: null,
      connected: null,
      source: "unsupported"
    };
  }

  function isTrustedTopLevel() {
    return global.top === global.self && TRUSTED_HOSTS.has(location.hostname) &&
      (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1");
  }

  function nativeBridgeCandidate() {
    const bridge = global.WebWindowsNative;
    if (!nativeBridgeAnnounced || !isTrustedTopLevel() || !bridge) return null;
    return typeof bridge.getRuntimeInfo === "function" ? bridge : null;
  }

  function structuredBridgeError(error, method) {
    const value = error && typeof error === "object" ? error : {};
    return {
      code: typeof value.code === "string" && value.code ? value.code : "native-runtime-unavailable",
      message: typeof value.message === "string" && value.message ? value.message : "Native runtime information is unavailable.",
      platform: typeof value.platform === "string" && value.platform ? value.platform : "unknown",
      method,
      details: value.details ?? null
    };
  }

  function withTimeout(promise, method) {
    return new Promise((resolve, reject) => {
      const timer = global.setTimeout(() => {
        const error = new Error("Native bridge request timed out.");
        error.code = "timeout";
        error.platform = "unknown";
        error.method = method;
        reject(error);
      }, NATIVE_RUNTIME_TIMEOUT_MS);
      Promise.resolve(promise).then(
        (value) => { global.clearTimeout(timer); resolve(value); },
        (error) => { global.clearTimeout(timer); reject(error); }
      );
    });
  }

  function normalizeRuntimeInfo(value) {
    if (!value || typeof value !== "object") return null;
    if (value.runtimeName !== "Dreama Runtime" || typeof value.runtimeVersion !== "string" || !value.runtimeVersion) return null;
    if (typeof value.bridgeVersion !== "string" || value.bridgeVersion.split(".")[0] !== BRIDGE_VERSION.split(".")[0]) return null;
    if (!["android", "windows"].includes(value.platform) || value.native !== true || value.trusted !== true) return null;
    if (!["android-webview", "webview2", "unknown"].includes(value.engine)) return null;
    if (!["phone", "tablet", "desktop", "laptop", "unknown"].includes(value.deviceClass)) return null;
    if (!value.capabilities || RUNTIME_CAPABILITIES.some((name) => typeof value.capabilities[name] !== "boolean")) return null;
    return Object.freeze({
      runtimeName: value.runtimeName,
      runtimeVersion: value.runtimeVersion,
      bridgeVersion: value.bridgeVersion,
      platform: value.platform,
      platformVersion: typeof value.platformVersion === "string" && value.platformVersion ? value.platformVersion : null,
      engine: value.engine,
      engineVersion: typeof value.engineVersion === "string" && value.engineVersion ? value.engineVersion : null,
      deviceClass: value.deviceClass,
      native: true,
      trusted: true,
      capabilities: Object.freeze(Object.fromEntries(RUNTIME_CAPABILITIES.map((name) => [name, value.capabilities[name]])))
    });
  }

  function browserRuntimeInfo() {
    const batterySupported = typeof navigator.getBattery === "function";
    return Object.freeze({
      runtimeName: "Browser Runtime",
      runtimeVersion: null,
      bridgeVersion: null,
      platform: "browser",
      platformVersion: null,
      engine: "browser",
      engineVersion: null,
      deviceClass: "unknown",
      native: false,
      trusted: false,
      capabilities: Object.freeze({
        battery: batterySupported,
        network: true,
        display: true,
        audio: true,
        storage: Boolean(storageProvider) || typeof navigator.storage?.estimate === "function",
        power: batterySupported,
        updater: false
      })
    });
  }

  async function trustedNativeBridge() {
    const bridge = nativeBridgeCandidate();
    if (!bridge) return null;
    try {
      const info = normalizeRuntimeInfo(await withTimeout(bridge.getRuntimeInfo(), "getRuntimeInfo"));
      if (!info) {
        const error = new Error("Native runtime response is incomplete or invalid.");
        error.code = "invalid-response";
        throw error;
      }
      runtimeError = null;
      return { bridge, info };
    } catch (error) {
      runtimeError = structuredBridgeError(error, "getRuntimeInfo");
      emit("webwindows:native-bridge-error", runtimeError);
      return null;
    }
  }

  function emit(type, detail) {
    global.dispatchEvent(new CustomEvent(type, { detail }));
    (listeners.get(type) || []).forEach((callback) => {
      try { callback(detail); } catch (error) { console.error("[DeviceAPI] event listener failed", error); }
    });
  }

  function on(type, callback) {
    if (typeof callback !== "function") return function () {};
    const callbacks = listeners.get(type) || [];
    callbacks.push(callback);
    listeners.set(type, callbacks);
    return function unsubscribe() {
      const current = listeners.get(type) || [];
      listeners.set(type, current.filter((item) => item !== callback));
    };
  }

  function normalizeBattery(raw, source) {
    if (!raw || typeof raw !== "object") return unsupportedBattery();
    const rawLevel = Number(raw.level);
    const level = Number.isFinite(rawLevel) ? (rawLevel > 1 ? rawLevel / 100 : rawLevel) : null;
    const present = typeof raw.present === "boolean" ? raw.present : true;
    return {
      supported: true,
      present,
      level: present && level !== null ? clamp(level, 0, 1) : null,
      charging: present && typeof raw.charging === "boolean" ? raw.charging : null,
      connected: typeof raw.connected === "boolean" ? raw.connected : true,
      source
    };
  }

  function normalizeNativeBattery(raw, source) {
    if (!raw || typeof raw !== "object" || typeof raw.present !== "boolean" || typeof raw.connected !== "boolean") return null;
    if (raw.charging !== null && typeof raw.charging !== "boolean") return null;
    if (raw.level !== null && (!Number.isFinite(Number(raw.level)) || Number(raw.level) < 0 || Number(raw.level) > 100)) return null;
    return normalizeBattery({
      present: raw.present,
      connected: raw.connected,
      charging: raw.present ? raw.charging : null,
      level: raw.present ? raw.level : null
    }, source);
  }

  function networkKind() {
    if (navigator.onLine === false) return "offline";
    const type = String(connection?.type || "").toLowerCase();
    if (type === "ethernet" || type === "wifi" || type === "cellular") return type;
    if (type === "wimax") return "cellular";
    return "unknown";
  }

  function networkSnapshot() {
    const connected = navigator.onLine !== false;
    const kind = networkKind();
    return {
      supported: true,
      online: connected,
      connected,
      internetAvailable: null,
      transport: kind === "offline" ? "none" : kind,
      kind,
      effectiveType: connection?.effectiveType || null,
      downlink: Number.isFinite(connection?.downlink) ? connection.downlink : null,
      rtt: Number.isFinite(connection?.rtt) ? connection.rtt : null,
      saveData: connection?.saveData === true,
      source: connection ? "network-information-api" : "browser-online-api"
    };
  }

  function normalizeNativeNetwork(raw, source) {
    const transports = new Set(["wifi", "cellular", "ethernet", "vpn", "other", "unknown", "none"]);
    if (!raw || typeof raw !== "object" || typeof raw.connected !== "boolean" ||
        (raw.internetAvailable !== null && typeof raw.internetAvailable !== "boolean") ||
        typeof raw.transport !== "string" || !transports.has(raw.transport)) return null;
    if ((!raw.connected && raw.transport !== "none") || (raw.connected && raw.transport === "none")) return null;
    const kind = raw.connected && ["wifi", "cellular", "ethernet"].includes(raw.transport)
      ? raw.transport : (raw.connected ? "unknown" : "offline");
    return {
      supported: true,
      online: raw.connected,
      connected: raw.connected,
      internetAvailable: raw.internetAvailable,
      transport: raw.transport,
      kind,
      effectiveType: null,
      downlink: null,
      rtt: null,
      saveData: null,
      source
    };
  }

  function applyMediaVolume(root) {
    root?.querySelectorAll?.("audio,video").forEach((media) => {
      mediaElements.add(media);
      try { media.volume = volume; } catch (_) {}
    });
    root?.querySelectorAll?.("iframe").forEach((frame) => {
      try { if (frame.contentDocument?.body) applyMediaVolume(frame.contentDocument); } catch (_) {}
    });
  }

  function applyVisualBrightness() {
    document.documentElement?.style?.setProperty("--webwindows-visual-brightness", String(brightness));
    if (!document.body) return;
    document.body.classList?.add("webwindows-visual-brightness");
    document.body.style?.removeProperty("filter");
  }

  class BrowserAdapter {
    constructor() { this.id = "browser"; }

    async getNetworkStatus() {
      return networkSnapshot();
    }

    async getBatteryStatus() {
      if (typeof navigator.getBattery !== "function") return unsupportedBattery();
      try {
        batteryManager = batteryManager || await navigator.getBattery();
        if (!batteryListenersBound) {
          batteryListenersBound = true;
          ["chargingchange", "levelchange"].forEach((name) =>
            batteryManager.addEventListener?.(name, () => refreshBattery()));
        }
        return normalizeBattery({
          present: true,
          level: batteryManager.level,
          charging: batteryManager.charging,
          connected: true
        }, "battery-status-api");
      } catch (_) {
        return unsupportedBattery();
      }
    }

    async getBrightness() {
      return { supported: true, value: brightness, scope: "visual", source: "webwindows" };
    }

    async setBrightness(value) {
      brightness = clamp(Number(value), 0, 1);
      persist(STORAGE_BRIGHTNESS, brightness);
      applyVisualBrightness();
      return { supported: true, value: brightness, scope: "visual", source: "webwindows" };
    }

    async getVolume() {
      return { supported: true, value: volume, scope: "page", source: "webwindows" };
    }

    async setVolume(value) {
      volume = clamp(Number(value), 0, 1);
      persist(STORAGE_VOLUME, volume);
      applyMediaVolume(document);
      return { supported: true, value: volume, scope: "page", source: "webwindows" };
    }
  }

  class NativeAdapter extends BrowserAdapter {
    constructor(bridge, info) {
      super();
      this.id = info.platform;
      this.bridge = bridge;
      this.runtimeInfo = info;
      this.native = true;
      this.source = `${info.platform}-native`;
    }

    async getBatteryStatus() {
      if (this.runtimeInfo.capabilities.battery !== true || typeof this.bridge.getBatteryStatus !== "function") return super.getBatteryStatus();
      try {
        const state = normalizeNativeBattery(await this.bridge.getBatteryStatus(), this.source);
        return state || await super.getBatteryStatus();
      }
      catch (_) { return super.getBatteryStatus(); }
    }

    async getNetworkStatus() {
      if (this.runtimeInfo.capabilities.network !== true || typeof this.bridge.getNetworkStatus !== "function") return super.getNetworkStatus();
      try {
        const state = normalizeNativeNetwork(await this.bridge.getNetworkStatus(), this.source);
        return state || await super.getNetworkStatus();
      } catch (_) {
        return super.getNetworkStatus();
      }
    }

    async getBrightness() {
      try {
        const state = await this.bridge.getScreenBrightness();
        return {
          supported: true,
          value: Number.isFinite(Number(state?.level)) ? clamp(Number(state.level), 0, 1) : null,
          systemDefault: state?.systemDefault === true,
          scope: "native",
          source: this.source
        };
      } catch (_) {
        return { supported: false, value: null, scope: "native", source: this.source, reason: "unavailable" };
      }
    }

    async setBrightness(value) {
      const nativeValue = clamp(Number(value), 0, 1);
      const state = await this.bridge.setScreenBrightness(nativeValue);
      brightness = clamp(Number(value), 0, 1);
      persist(STORAGE_BRIGHTNESS, brightness);
      return {
        supported: true,
        value: Number.isFinite(Number(state?.level)) ? Number(state.level) : nativeValue,
        scope: "native",
        source: this.source
      };
    }

    async getVolume() {
      if (typeof this.bridge.getMediaVolume !== "function") return super.getVolume();
      try {
        const state = await this.bridge.getMediaVolume();
        return {
          supported: true,
          value: Number.isFinite(Number(state?.level)) ? clamp(Number(state.level), 0, 1) : null,
          current: Number.isFinite(Number(state?.current)) ? Number(state.current) : null,
          maximum: Number.isFinite(Number(state?.maximum)) ? Number(state.maximum) : null,
          scope: "native",
          source: this.source
        };
      } catch (_) {
        return { supported: false, value: null, scope: "native", source: this.source, reason: "unavailable" };
      }
    }

    async setVolume(value) {
      if (typeof this.bridge.setMediaVolume !== "function") return super.setVolume(value);
      const nativeValue = clamp(Number(value), 0, 1);
      const state = await this.bridge.setMediaVolume(nativeValue);
      volume = nativeValue;
      persist(STORAGE_VOLUME, volume);
      applyMediaVolume(document);
      return {
        supported: true,
        value: Number.isFinite(Number(state?.level)) ? clamp(Number(state.level), 0, 1) : nativeValue,
        current: Number.isFinite(Number(state?.current)) ? Number(state.current) : null,
        maximum: Number.isFinite(Number(state?.maximum)) ? Number(state.maximum) : null,
        scope: "native",
        source: this.source
      };
    }
  }

  async function selectAdapter() {
    const native = await trustedNativeBridge();
    adapter = native ? new NativeAdapter(native.bridge, native.info) : new BrowserAdapter();
    storageProvider = global.WebWindowsStorageProvider?.create?.({ bridge: native?.bridge || null, emit }) || null;
    runtimeInfo = native?.info || browserRuntimeInfo();
    return adapter;
  }

  adapter = new BrowserAdapter();
  storageProvider = global.WebWindowsStorageProvider?.create?.({ bridge: null, emit }) || null;
  runtimeInfo = browserRuntimeInfo();
  networkState = networkSnapshot();

  function batteryCapabilities() {
    const native = adapter?.native === true && adapter.runtimeInfo?.capabilities?.battery === true &&
      typeof adapter.bridge?.getBatteryStatus === "function";
    const browser = typeof navigator.getBattery === "function";
    return { status: capability(native || browser, native ? adapter.source : (browser ? "battery-status-api" : "unsupported")) };
  }

  function powerSnapshot() {
    if (!batteryState.supported) {
      return { supported: false, source: "unknown", acConnected: null, batteryPresent: null };
    }
    const acConnected = adapter?.native === true
      ? batteryState.connected
      : (batteryState.charging === true ? true : batteryState.charging === false ? false : null);
    return {
      supported: true,
      source: acConnected === true ? "ac" : (acConnected === false && batteryState.present ? "battery" : "unknown"),
      acConnected,
      batteryPresent: batteryState.present
    };
  }

  async function refreshBattery() {
    batteryState = await (adapter || selectAdapter()).getBatteryStatus();
    emit("webwindows:battery-change", batteryState);
    return batteryState;
  }

  async function refreshNetwork() {
    networkState = await (adapter || selectAdapter()).getNetworkStatus();
    emit("webwindows:network-change", networkState);
    return Object.assign({}, networkState);
  }

  async function refreshStorage() {
    if (typeof navigator.storage?.estimate !== "function") {
      storageState = { supported: false, usage: null, quota: null, source: "unsupported" };
    } else {
      try {
        const state = await navigator.storage.estimate();
        storageState = {
          supported: true,
          usage: Number.isFinite(state.usage) ? state.usage : null,
          quota: Number.isFinite(state.quota) ? state.quota : null,
          source: "storage-manager-api"
        };
      } catch (_) {
        storageState = { supported: false, usage: null, quota: null, source: "unsupported" };
      }
    }
    emit("webwindows:storage-change", storageState);
    return storageState;
  }

  async function refreshBrightness() {
    brightnessState = await (adapter || selectAdapter()).getBrightness();
    emit("webwindows:display-change", brightnessState);
    return Object.assign({}, brightnessState);
  }

  async function refreshVolume() {
    volumeState = await (adapter || selectAdapter()).getVolume();
    if (Number.isFinite(volumeState.value)) {
      volume = clamp(Number(volumeState.value), 0, 1);
      applyMediaVolume(document);
    }
    emit("webwindows:volume-change", volumeState);
    return Object.assign({}, volumeState);
  }

  const system = Object.freeze({
    isSupported: () => true,
    getCapabilities: () => ({ info: capability(true, "browser") }),
    getInfo: () => ({
      supported: true,
      host: adapter?.id || "browser",
      platform: navigator.userAgentData?.platform || navigator.platform || "unknown",
      mobile: typeof navigator.userAgentData?.mobile === "boolean" ? navigator.userAgentData.mobile :
        /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent || "")
    })
  });

  const runtime = Object.freeze({
    isSupported: () => true,
    getCapabilities: () => ({ info: capability(true, runtimeInfo?.native ? adapter.source : "browser") }),
    getInfo: () => runtimeInfo,
    getLastError: () => runtimeError ? Object.assign({}, runtimeError) : null,
    refresh: async () => {
      await selectAdapter();
      return runtimeInfo;
    }
  });

  const network = Object.freeze({
    isSupported: () => true,
    getCapabilities: () => {
      const native = adapter?.native === true && adapter.runtimeInfo?.capabilities?.network === true &&
        typeof adapter.bridge?.getNetworkStatus === "function";
      return {
        status: capability(true, native ? adapter.source : "browser-online-api"),
        details: capability(native || Boolean(connection), native ? adapter.source :
          (connection ? "network-information-api" : "unsupported"))
      };
    },
    getState: () => Object.assign({}, networkState),
    refresh: () => {
      if (adapter?.native === true) {
        refreshNetwork().catch((error) => console.warn("[DeviceAPI]", error));
        return Object.assign({}, networkState);
      }
      networkState = networkSnapshot();
      emit("webwindows:network-change", networkState);
      return Object.assign({}, networkState);
    }
  });

  const battery = Object.freeze({
    isSupported: () => batteryCapabilities().status.supported,
    getCapabilities: batteryCapabilities,
    getState: () => Object.assign({}, batteryState),
    refresh: refreshBattery
  });

  const display = Object.freeze({
    isSupported: () => true,
    getCapabilities: () => ({
      brightness: capability(true, adapter?.native === true ? adapter.source : "webwindows-visual", {
        scope: adapter?.native === true ? "native" : "visual"
      }),
      screen: capability(Boolean(global.screen), global.screen ? "screen-api" : "unsupported")
    }),
    getBrightness: () => Promise.resolve(Object.assign({}, brightnessState)),
    refresh: refreshBrightness,
    setBrightness: async (value) => {
      const state = await (adapter || selectAdapter()).setBrightness(value);
      brightnessState = state;
      emit("webwindows:display-change", state);
      return state;
    },
    getInfo: () => global.screen ? {
      supported: true,
      width: global.screen.width,
      height: global.screen.height,
      pixelRatio: global.devicePixelRatio || 1,
      source: "screen-api"
    } : { supported: false, width: null, height: null, pixelRatio: null, source: "unsupported" }
  });

  const audio = Object.freeze({
    isSupported: () => true,
    getCapabilities: () => ({ volume: capability(true, adapter?.native === true && typeof adapter.bridge?.getMediaVolume === "function" ? adapter.source : "webwindows-page", {
      scope: adapter?.native === true && typeof adapter.bridge?.getMediaVolume === "function" ? "native" : "page"
    }) }),
    getVolume: () => Object.assign({}, volumeState),
    refresh: refreshVolume,
    setVolume: async (value) => {
      const state = await (adapter || selectAdapter()).setVolume(value);
      volumeState = state;
      emit("webwindows:volume-change", state);
      return state;
    }
  });

  const storage = Object.freeze({
    isSupported: () => Boolean(storageProvider) || typeof navigator.storage?.estimate === "function",
    getCapabilities: () => storageProvider?.getCapabilities?.() || ({ estimate: capability(typeof navigator.storage?.estimate === "function",
      typeof navigator.storage?.estimate === "function" ? "storage-manager-api" : "unsupported") }),
    getState: () => Object.assign({}, storageState),
    refresh: refreshStorage,
    listVolumes: () => storageProvider?.listVolumes?.() || Promise.resolve([]),
    pickDirectory: (options) => storageProvider?.pickDirectory?.(options) || Promise.resolve({ supported: false, source: "unsupported", reason: "directory-picker-unavailable" }),
    requestPermission: (volumeId, mode) => storageProvider?.requestPermission?.(volumeId, mode) || Promise.resolve({ state: "unsupported", readable: false, writable: false, persisted: false, revoked: false }),
    listDirectory: (volumeId, path) => storageProvider?.listDirectory?.(volumeId, path) || Promise.reject(new Error("storage-unsupported")),
    openFile: (volumeId, path) => storageProvider?.openFile?.(volumeId, path) || Promise.reject(new Error("storage-unsupported")),
    getMetadata: (volumeId, path) => storageProvider?.getMetadata?.(volumeId, path) || Promise.reject(new Error("storage-unsupported"))
  });

  const power = Object.freeze({
    isSupported: () => battery.isSupported(),
    getCapabilities: () => ({ source: capability(battery.isSupported(), battery.isSupported() ? "derived-battery" : "unsupported") }),
    getState: powerSnapshot
  });

  function getCapabilities() {
    return {
      system: system.getCapabilities(),
      runtime: runtime.getCapabilities(),
      network: network.getCapabilities(),
      battery: battery.getCapabilities(),
      display: display.getCapabilities(),
      audio: audio.getCapabilities(),
      storage: storage.getCapabilities(),
      power: power.getCapabilities()
    };
  }

  let readyResolve;
  const readyPromise = new Promise((resolve) => { readyResolve = resolve; });
  const device = Object.freeze({
    version: 1,
    system,
    runtime,
    network,
    battery,
    display,
    audio,
    storage,
    power,
    getAdapter: () => adapter?.id || "browser",
    getCapabilities,
    on,
    ready: () => readyPromise
  });

  async function initialize() {
    if (initializationPromise) return initializationPromise;
    initializationPromise = (async () => {
      await selectAdapter();
      applyMediaVolume(document);
      applyVisualBrightness();
      await Promise.allSettled([refreshNetwork(), refreshBattery(), refreshStorage(), refreshBrightness(), refreshVolume()]);
      if (!initialized) {
        initialized = true;
        readyResolve(device);
      }
      emit("webwindows:device-ready", { adapter: adapter.id, runtime: runtimeInfo, capabilities: getCapabilities() });
      return device;
    })().finally(() => { initializationPromise = null; });
    return initializationPromise;
  }

  global.WebWindows = global.WebWindows || {};
  global.WebWindows.device = device;

  global.addEventListener("online", network.refresh);
  global.addEventListener("offline", network.refresh);
  connection?.addEventListener?.("change", network.refresh);
  global.addEventListener("webwindowsnativeavailable", () => {
    nativeBridgeAnnounced = true;
    Promise.resolve(initializationPromise).then(() => initialize())
      .catch((error) => console.warn("[DeviceAPI]", error));
  });

  if (typeof MutationObserver === "function") {
    const observer = new MutationObserver((mutations) => mutations.forEach((mutation) =>
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === (global.Node?.ELEMENT_NODE || 1)) applyMediaVolume(node);
      })));
    const observe = () => document.body && observer.observe(document.body, { childList: true, subtree: true });
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", observe, { once: true });
    else observe();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initialize().catch((error) => console.warn("[DeviceAPI]", error)), { once: true });
  } else {
    initialize().catch((error) => console.warn("[DeviceAPI]", error));
  }
})(window);
