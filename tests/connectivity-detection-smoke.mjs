import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile(
  new URL("../assets/js/connectivity.js", import.meta.url),
  "utf8"
);

function runCase({ mobile, online = true, type = "", effectiveType = "4g" }) {
  const ids = [
    "ww-ethernet-indicator",
    "ww-wifi-indicator",
    "ww-cellular-indicator",
    "network-status",
    "network-summary",
    "network-type",
    "network-generation",
    "network-quality",
    "network-latency",
    "network-save-data",
    "network-device"
  ];
  const elements = Object.fromEntries(ids.map((id) => [
    id,
    {
      hidden: id.startsWith("ww-"),
      dataset: {},
      textContent: "",
      title: "",
      addEventListener() {},
      setAttribute() {}
    }
  ]));
  const connection = {
    type,
    effectiveType,
    downlink: 32,
    rtt: 40,
    saveData: false,
    addEventListener() {}
  };
  const context = {
    console,
    navigator: {
      onLine: online,
      connection,
      userAgent: mobile ? "Mozilla/5.0 (Linux; Android 15) Mobile" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      userAgentData: { mobile },
      platform: mobile ? "Linux armv8l" : "Win32",
      maxTouchPoints: mobile ? 5 : 0
    },
    document: {
      getElementById(id) {
        return elements[id] || null;
      },
      addEventListener(name, callback) {
        if (name === "DOMContentLoaded") callback();
      }
    },
    CustomEvent: class {
      constructor(name, options) {
        this.type = name;
        this.detail = options?.detail;
      }
    },
    addEventListener() {},
    dispatchEvent() {},
    openWindow() {}
  };
  const rawState = {
    supported: true,
    online,
    kind: !online ? "offline" : (type === "wimax" ? "cellular" : type || "unknown"),
    effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
    source: "test"
  };
  context.WebWindows = {
    device: {
      system: { getInfo: () => ({ mobile }) },
      network: { getState: () => rawState, refresh: () => rawState }
    }
  };
  context.window = context;
  vm.runInNewContext(source, context);
  return {
    state: context.WebWindows.connectivity.getState(),
    elements
  };
}

const ethernet = runCase({ mobile: false, type: "ethernet" });
assert.equal(ethernet.state.type, "家庭宽带直连（有线）");
assert.equal(ethernet.elements["ww-ethernet-indicator"].hidden, false);
assert.equal(ethernet.elements["ww-wifi-indicator"].hidden, true);
assert.equal(ethernet.elements["ww-cellular-indicator"].hidden, true);

const wifi = runCase({ mobile: true, type: "wifi" });
assert.equal(wifi.state.type, "Wi‑Fi 无线网络");
assert.equal(wifi.elements["ww-ethernet-indicator"].hidden, true);
assert.equal(wifi.elements["ww-wifi-indicator"].hidden, false);
assert.equal(wifi.elements["ww-cellular-indicator"].hidden, true);

const cellular = runCase({ mobile: true, type: "cellular" });
assert.equal(cellular.state.type, "手机移动网络");
assert.match(cellular.state.generation, /4G|5G/);
assert.equal(cellular.elements["ww-ethernet-indicator"].hidden, true);
assert.equal(cellular.elements["ww-wifi-indicator"].hidden, true);
assert.equal(cellular.elements["ww-cellular-indicator"].hidden, false);

const desktopCellular = runCase({ mobile: false, type: "cellular" });
assert.equal(desktopCellular.elements["ww-cellular-indicator"].hidden, true);

const unknown = runCase({ mobile: false });
assert.equal(unknown.state.kind, "unknown");
assert.equal(unknown.elements["ww-ethernet-indicator"].hidden, true);
assert.equal(unknown.elements["ww-wifi-indicator"].hidden, true);
assert.equal(unknown.elements["ww-cellular-indicator"].hidden, true);

const offline = runCase({ mobile: true, online: false, type: "none" });
assert.equal(offline.state.kind, "offline");
assert.equal(offline.elements["ww-ethernet-indicator"].hidden, true);
assert.equal(offline.elements["ww-wifi-indicator"].hidden, true);
assert.equal(offline.elements["ww-cellular-indicator"].hidden, true);

console.log("connectivity detection smoke test passed");
