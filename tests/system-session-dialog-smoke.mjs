import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../assets/js/system-session.js", import.meta.url), "utf8");
const dialogSource = fs.readFileSync(new URL("../assets/js/webwindows-message.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const dialogScript = index.indexOf("assets/js/webwindows-message.js?v=20261007-webwindows-logo-1");
const powerScript = index.indexOf("assets/js/system-session.js?v=20261007-session-brand-icons-1");
assert.ok(dialogScript >= 0 && powerScript > dialogScript, "WebWindows dialog API must load before the power menu flow");
assert.match(dialogSource, /<img class="ww-system-dialog__mark" src="\/assets\/icons\/logo\.png"/);
assert.equal(fs.existsSync(new URL("../assets/icons/logo.png", import.meta.url)), true, "the WebWindows dialog logo asset must exist");
assert.match(source, /<img class="webwindows-session-cover__logo" src="\/assets\/icons\/logo\.png"/);
assert.match(index, /context_menu\.css\?v=20261007-power-menu-brand-icons-1/);
assert.equal((index.match(/<svg class="emoji power-item__icon"/g) || []).length, 4, "all power-menu icons must be vector assets, not missing-font glyphs");
assert.doesNotMatch(index, /data-device-operation="(?:lock|sleep|shutdown|restart)">\s*<span class="emoji">/);
assert.doesNotMatch(source, /\bwindow\.confirm\s*\(/, "power actions must not use the browser-origin confirmation dialog");

function createRuntime({ native = false, confirmResult = true, language = "zh" } = {}) {
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
    WebWindowsI18n: { getLanguage: () => language, translate: (text) => text },
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

const localizedCases = [
  { language: "en", title: "Confirm WebWindows action", sessionMessage: "Reload WebWindows? The host device will not restart.", deviceTitle: "Confirm device action", deviceMessage: "Restart the host device? Other work on the device will be interrupted." },
  { language: "tw", title: "確認 WebWindows 操作", sessionMessage: "要重新載入 WebWindows 嗎？主機裝置不會重新啟動。", deviceTitle: "確認裝置操作", deviceMessage: "要重新啟動主機裝置嗎？裝置上的其他工作也會中斷。" },
  { language: "jp", title: "WebWindows 操作の確認", sessionMessage: "WebWindows を再読み込みしますか？ホストデバイスは再起動されません。", deviceTitle: "デバイス操作の確認", deviceMessage: "ホストデバイスを再起動しますか？デバイス上の他の作業も中断されます。" }
];
for (const item of localizedCases) {
  const sessionRuntime = createRuntime({ language: item.language });
  await sessionRuntime.api.restart();
  assert.equal(sessionRuntime.calls.confirmations[0].options.title, item.title, `${item.language} session title`);
  assert.equal(sessionRuntime.calls.confirmations[0].message, item.sessionMessage, `${item.language} session message`);

  const deviceRuntime = createRuntime({ native: true, language: item.language });
  await deviceRuntime.api.restart();
  assert.equal(deviceRuntime.calls.confirmations[0].options.title, item.deviceTitle, `${item.language} device title`);
  assert.equal(deviceRuntime.calls.confirmations[0].message, item.deviceMessage, `${item.language} device message`);
}

console.log("system session WebWindows dialog smoke test passed");
