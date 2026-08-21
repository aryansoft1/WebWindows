import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "assets/js/system-session.js"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const contract = fs.readFileSync(path.join(root, "docs/DEVICE_OPERATIONS.md"), "utf8");

assert.match(index, /data-device-operation="shutdown"/);
assert.match(index, /关闭 WebWindows 会话/);
assert.doesNotMatch(index, /shutdownSystem\(\)/);
assert.doesNotMatch(index, /sessionStorage\.removeItem\('booted'\); location\.reload\(\)/);
assert.match(contract, /Never accept shell command text/);
assert.match(contract, /top-level trusted document/);

function createContext({ native = false, topLevel = true, protocol = "https:", hostname = "example.test" } = {}) {
  const listeners = new Map();
  const documentListeners = new Map();
  const elements = new Map();
  function makeElement() {
    const attributes = new Map();
    const children = {
      ".webwindows-session-cover__icon": { textContent: "" },
      "h1": { textContent: "" },
      "p": { textContent: "" },
      "button": { textContent: "", onclick: null, focus() {} }
    };
    return {
      id: "",
      className: "",
      hidden: false,
      innerHTML: "",
      style: {},
      setAttribute(name, value) { attributes.set(name, value); },
      getAttribute(name) { return attributes.get(name) ?? null; },
      querySelector(selector) { return children[selector] ?? null; },
      _children: children
    };
  }
  const window = {
    confirm: () => false,
    alert: () => {},
    addEventListener: (name, handler) => listeners.set(name, handler),
    dispatchEvent: () => true,
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } }
  };
  window.self = window;
  window.top = topLevel ? window : {};
  if (native) {
    window.WebWindowsNativeDeviceOperations = {
      version: 1,
      getCapabilities: () => JSON.stringify({ shutdown: true, restart: true, sleep: false, lock: true }),
      requestOperation: () => JSON.stringify({ status: "accepted" })
    };
  }
  const document = {
    addEventListener: (name, handler) => documentListeners.set(name, handler),
    readyState: "complete",
    getElementById: (id) => elements.get(id) ?? null,
    querySelectorAll: () => [],
    body: {
      appendChild(element) { if (element.id) elements.set(element.id, element); },
      setAttribute(name, value) { this[name] = value; },
      removeAttribute(name) { delete this[name]; }
    },
    createElement: makeElement
  };
  const context = {
    window,
    document,
    location: { protocol, hostname, reload() {} },
    navigator: { userActivation: { isActive: true } },
    sessionStorage: { removeItem() {} },
    CustomEvent: window.CustomEvent,
    console,
    Object,
    Promise,
    TypeError,
    Date,
    JSON
  };
  vm.runInNewContext(source, context, { filename: "device-operations.js" });
  return { api: window.WebWindowsDeviceOperations, document, capabilities: window.WebWindowsDeviceOperations.getCapabilities() };
}

const browser = createContext();
assert.equal(browser.capabilities.shutdown.level, "session");
assert.equal(browser.capabilities.restart.label, "重新启动 WebWindows");
assert.equal(browser.capabilities.reloadSession.level, "session");

await browser.api.lock();
const cover = browser.document.getElementById("webwindows-session-cover");
assert.equal(cover.hidden, false);
assert.equal(cover.querySelector("h1").textContent, "WebWindows 已锁定");
assert.match(cover.querySelector("p").textContent, /并非宿主设备锁屏/);
cover.querySelector("button").onclick();
assert.equal(cover.hidden, true);

const androidShell = createContext({ native: true });
assert.equal(androidShell.capabilities.shutdown.level, "native");
assert.equal(androidShell.capabilities.sleep.level, "session");
assert.equal(androidShell.capabilities.lock.label, "锁定设备");

const iframe = createContext({ native: true, topLevel: false });
assert.equal(iframe.capabilities.shutdown.level, "session");

const insecureOrigin = createContext({ native: true, protocol: "http:", hostname: "device.local" });
assert.equal(insecureOrigin.capabilities.shutdown.level, "session");

console.log("device operations smoke tests passed");
