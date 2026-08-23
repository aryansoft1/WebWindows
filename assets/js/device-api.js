(function installWebWindowsDeviceApi(global) {
  "use strict";

  const STORAGE_VOLUME = "webwindows.pageVolume";
  const STORAGE_BRIGHTNESS = "webwindows.visualBrightness";
  const TRUSTED_HOSTS = new Set(["www.y0.hk", "y0.hk", "localhost", "127.0.0.1"]);
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  const listeners = new Map();
  const mediaElements = new Set();
  let batteryManager = null;
  let batteryListenersBound = false;
  let adapter = null;
  let storageProvider = null;
  let initialized = false;
  let volume = clamp(readNumber(STORAGE_VOLUME, 0.5), 0, 1);
  let brightness = clamp(readNumber(STORAGE_BRIGHTNESS, 1), 0, 1);
  let batteryState = unsupportedBattery();
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
      acConnected: null,
      connected: null,
      source: "unsupported"
    };
  }

  function isTrustedTopLevel() {
    return global.top === global.self && TRUSTED_HOSTS.has(location.hostname) &&
      (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1");
  }

  function androidBridge() {
    const bridge = global.WebWindowsNative;
    if (!isTrustedTopLevel() || !bridge) return null;
    return typeof bridge.getBatteryStatus === "function" &&
      typeof bridge.getScreenBrightness === "function" &&
      typeof bridge.setScreenBrightness === "function" ? bridge : null;
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
    const acConnected = typeof raw.acConnected === "boolean" ? raw.acConnected :
      (typeof raw.connected === "boolean" ? raw.connected :
        (typeof raw.charging === "boolean" ? raw.charging : null));
    return {
      supported: true,
      present,
      level: present && level !== null ? clamp(level, 0, 1) : null,
      charging: present && typeof raw.charging === "boolean" ? raw.charging : null,
      acConnected,
      // `connected` means that battery telemetry is available. Native hosts
      // historically used this field for AC connection; preserve that value
      // separately as `acConnected` so unplugging cannot erase the level bar.
      connected: present,
      source
    };
  }

  function networkKind() {
    if (navigator.onLine === false) return "offline";
    const type = String(connection?.type || "").toLowerCase();
    if (type === "ethernet" || type === "wifi" || type === "cellular") return type;
    if (type === "wimax") return "cellular";
    return "unknown";
  }

  function networkSnapshot() {
    return {
      supported: true,
      online: navigator.onLine !== false,
      kind: networkKind(),
      effectiveType: connection?.effectiveType || null,
      downlink: Number.isFinite(connection?.downlink) ? connection.downlink : null,
      rtt: Number.isFinite(connection?.rtt) ? connection.rtt : null,
      saveData: connection?.saveData === true,
      source: connection ? "network-information-api" : "browser-online-api"
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
          acConnected: batteryManager.charging
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

  class AndroidAdapter extends BrowserAdapter {
    constructor(bridge) {
      super();
      this.id = "android";
      this.bridge = bridge;
    }

    async getBatteryStatus() {
      try { return normalizeBattery(await this.bridge.getBatteryStatus(), "android-native"); }
      catch (_) { return super.getBatteryStatus(); }
    }

    async getBrightness() {
      try {
        const state = await this.bridge.getScreenBrightness();
        return {
          supported: true,
          value: Number.isFinite(Number(state?.level)) ? clamp(Number(state.level), 0, 1) : null,
          systemDefault: state?.systemDefault === true,
          scope: "native",
          source: "android-native"
        };
      } catch (_) {
        return { supported: false, value: null, scope: "native", source: "android-native", reason: "unavailable" };
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
        source: "android-native"
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
          source: "android-native"
        };
      } catch (_) {
        return { supported: false, value: null, scope: "native", source: "android-native", reason: "unavailable" };
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
        source: "android-native"
      };
    }
  }

  function selectAdapter() {
    const bridge = androidBridge();
    adapter = bridge ? new AndroidAdapter(bridge) : new BrowserAdapter();
    storageProvider = global.WebWindowsStorageProvider?.create?.({ bridge, emit }) || null;
    return adapter;
  }

  selectAdapter();

  function batteryCapabilities() {
    const native = adapter?.id === "android";
    return {
      status: capability(native || typeof navigator.getBattery === "function", native ? "android-native" :
        (typeof navigator.getBattery === "function" ? "battery-status-api" : "unsupported"))
    };
  }

  function powerSnapshot() {
    if (!batteryState.supported) {
      return { supported: false, source: "unknown", acConnected: null, batteryPresent: null };
    }
    const acConnected = adapter?.id === "android"
      ? batteryState.acConnected
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

  const network = Object.freeze({
    isSupported: () => true,
    getCapabilities: () => ({
      status: capability(true, "browser-online-api"),
      details: capability(Boolean(connection), connection ? "network-information-api" : "unsupported")
    }),
    getState: networkSnapshot,
    refresh: () => {
      const state = networkSnapshot();
      emit("webwindows:network-change", state);
      return state;
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
      brightness: capability(true, adapter?.id === "android" ? "android-native" : "webwindows-visual", {
        scope: adapter?.id === "android" ? "native" : "visual"
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
    getCapabilities: () => ({ volume: capability(true, adapter?.id === "android" && typeof adapter.bridge?.getMediaVolume === "function" ? "android-native" : "webwindows-page", {
      scope: adapter?.id === "android" && typeof adapter.bridge?.getMediaVolume === "function" ? "native" : "page"
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
    selectAdapter();
    applyMediaVolume(document);
    applyVisualBrightness();
    await Promise.all([refreshBattery(), refreshStorage(), refreshBrightness(), refreshVolume()]);
    network.refresh();
    if (!initialized) {
      initialized = true;
      readyResolve(device);
    }
    emit("webwindows:device-ready", { adapter: adapter.id, capabilities: getCapabilities() });
  }

  global.WebWindows = global.WebWindows || {};
  global.WebWindows.device = device;

  global.addEventListener("online", network.refresh);
  global.addEventListener("offline", network.refresh);
  connection?.addEventListener?.("change", network.refresh);
  global.addEventListener("webwindowsnativeavailable", () => initialize().catch((error) => console.warn("[DeviceAPI]", error)));

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
