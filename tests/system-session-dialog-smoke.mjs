import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../assets/js/system-session.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const dialogScript = index.indexOf("assets/js/webwindows-message.js");
const powerScript = index.indexOf("assets/js/system-session.js?v=20261007-webwindows-dialog-1");
assert.ok(dialogScript >= 0 && powerScript > dialogScript, "WebWindows dialog API must load before the power menu flow");
assert.doesNotMatch(source, /\bwindow\.confirm\s*\(/, "power actions must not use the browser-origin confirmation dialog");

function createRuntime({ native = false, confirmResult = true } = {}) {
  const calls = { confirmations: [], nativeRequests: [], events: [], reloads: 0, alerts: [] };
  const activation = { isActive: true };
  const dialog = {
    confirm(message, options) {
      calls.confirmations.push({ message, options });
      // A custom modal can outlive transient user activation; the gesture is
      // captured before the confirmation is shown.
      activation.isActive = false;
      return Promise.resolve(confirmResult);
    },
    alert(message, options) {
      calls.alerts.push({ message, options });
      return Promise.resolve();
    }
  };
  const window = {
    WebWindows: { dialog },
    dispatchEvent(event) { calls.events.push(event); },
    confirm() { throw new Error("browser confirm must not be used"); },
    alert(message) { calls.alerts.push({ message }); }
  };
  window.top = window;
  window.self = window;
  if (native) {
    window.WebWindowsNativeDeviceOperations = {
      version: 1,
      getCapabilities: () => ({ restart: true, lock: true }),
      async requestOperation(payload) {
        calls.nativeRequests.push(JSON.parse(payload));
        return { status: "accepted" };
      }
    };
  }
  const document = {
    readyState: "complete",
    body: { setAttribute() {}, removeAttribute() {}, appendChild() {} },
    getElementById() { return null; },
    querySelectorAll() { return []; }
  };
  const location = {
    protocol: "https:", hostname: "www.y0.hk",
    reload() { calls.reloads += 1; }
  };
  const context = {
    window, document, location,
    navigator: { userActivation: activation },
    sessionStorage: { removeItem() {} },
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    console
  };
  vm.runInNewContext(source, context, { filename: "system-session.js" });
  return { api: window.WebWindowsDeviceOperations, calls };
}

const nativeRuntime = createRuntime({ native: true });
const nativeResult = await nativeRuntime.api.restart();
assert.equal(nativeResult.status, "accepted");
assert.equal(nativeRuntime.calls.confirmations.length, 1);
assert.match(nativeRuntime.calls.confirmations[0].message, /重新启动宿主设备/);
assert.doesNotMatch(nativeRuntime.calls.confirmations[0].message, /原生外壳/);
assert.equal(nativeRuntime.calls.confirmations[0].options.title, "确认设备操作");
assert.equal(nativeRuntime.calls.nativeRequests.length, 1, "native restart should run after the WebWindows confirmation");
assert.equal(nativeRuntime.calls.events.at(-1).detail.status, "accepted");

const cancelledRuntime = createRuntime({ native: true, confirmResult: false });
const cancelledResult = await cancelledRuntime.api.restart();
assert.equal(cancelledResult.status, "cancelled");
assert.equal(cancelledRuntime.calls.nativeRequests.length, 0, "cancel must never reach the native bridge");

const browserRuntime = createRuntime();
const browserResult = await browserRuntime.api.restart();
assert.equal(browserResult.status, "accepted");
assert.equal(browserRuntime.calls.confirmations.length, 1);
assert.equal(browserRuntime.calls.confirmations[0].options.title, "确认 WebWindows 操作");
assert.equal(browserRuntime.calls.reloads, 1, "browser restart remains a WebWindows session reload");

console.log("system session WebWindows dialog smoke test passed");
