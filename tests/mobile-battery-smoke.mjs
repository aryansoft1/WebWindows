import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const [deviceApi, controls, css] = await Promise.all([
  readFile(new URL("../assets/js/device-api.js", import.meta.url), "utf8"),
  readFile(new URL("../assets/js/device-controls.js", import.meta.url), "utf8"),
  readFile(new URL("../assets/css/main.css", import.meta.url), "utf8"),
]);

assert.match(deviceApi, /const acConnected = typeof raw\.acConnected[\s\S]*typeof raw\.connected/,
  "native AC connection must be normalized separately from battery presence");
assert.match(deviceApi, /acConnected,[\s\S]*connected: present/,
  "unplugging AC must not mark an installed battery as disconnected");
assert.match(deviceApi, /adapter\?\.id === "android"[\s\S]*batteryState\.acConnected/,
  "power-source reporting must consume the normalized AC field");
assert.doesNotMatch(controls, /current\.connected === false|is-disconnected/,
  "the taskbar must not erase battery level merely because AC is unplugged");
assert.doesNotMatch(css, /is-disconnected[\s\S]*width:\s*0/,
  "no battery style may force a valid unplugged level to zero");
assert.match(controls, /current\.acConnected === true[\s\S]*已接电源/);

let nativeBattery = { present: true, level: 73, charging: false, connected: false };
const emptyNode = {
  querySelectorAll: () => [],
  classList: { add() {} },
  style: { removeProperty() {} },
};
const window = {
  addEventListener() {},
  dispatchEvent() {},
  localStorage: { getItem: () => null, setItem() {} },
  WebWindowsNative: {
    getBatteryStatus: async () => nativeBattery,
    getScreenBrightness: async () => ({ level: 1 }),
    setScreenBrightness: async (level) => ({ level }),
  },
};
window.top = window;
window.self = window;
const context = {
  window,
  navigator: { onLine: true, platform: "Android", userAgent: "Android Tablet" },
  location: { hostname: "localhost", protocol: "http:" },
  document: {
    readyState: "complete",
    body: emptyNode,
    documentElement: { style: { setProperty() {} } },
    querySelectorAll: () => [],
  },
  screen: { width: 1280, height: 800 },
  CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
  MutationObserver: class MutationObserver { observe() {} },
  Node: { ELEMENT_NODE: 1 },
  console,
  setTimeout,
  clearTimeout,
};
vm.runInNewContext(deviceApi, context, { filename: "assets/js/device-api.js" });
const device = await window.WebWindows.device.ready();
let battery = device.battery.getState();
assert.equal(device.getAdapter(), "android");
assert.equal(battery.level, 0.73);
assert.equal(battery.connected, true, "an unplugged tablet still has an available battery");
assert.equal(battery.acConnected, false);
assert.equal(device.power.getState().source, "battery");

nativeBattery = { present: true, level: 73, charging: true, connected: true };
battery = await device.battery.refresh();
assert.equal(battery.level, 0.73);
assert.equal(battery.acConnected, true);
assert.equal(device.power.getState().source, "ac");

console.log("Mobile battery state smoke tests passed");
