import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../assets/js/auth-session.js", import.meta.url), "utf8");
const values = new Map([
  ["webwindows_user", JSON.stringify({ username: "stale-user", nickname: "旧状态" })],
  ["webwindows_user_nickname", "旧状态"]
]);
const nodes = {
  "login-username": { textContent: "", style: {} },
  "user-popup-name": { textContent: "", style: {} },
  "login-avatar": { src: "", style: {} },
  "login-status": { title: "", style: {} },
  "user-popup": { style: {} },
  logout: { hidden: false }
};
const windowListeners = new Map();
const documentListeners = new Map();
let serverState = { authenticated: false, user: null };

function addListener(store, name, callback) {
  const list = store.get(name) || [];
  list.push(callback);
  store.set(name, list);
}

const windowObject = {
  addEventListener(name, callback) { addListener(windowListeners, name, callback); },
  dispatchEvent(event) {
    for (const callback of windowListeners.get(event.type) || []) callback(event);
  },
  setInterval() { return 1; }
};
const documentObject = {
  visibilityState: "visible",
  documentElement: { setAttribute() {} },
  getElementById(id) { return nodes[id] || null; },
  querySelector(selector) { return selector.includes("logout") ? nodes.logout : null; },
  addEventListener(name, callback) { addListener(documentListeners, name, callback); }
};

const context = vm.createContext({
  window: windowObject,
  document: documentObject,
  sessionStorage: {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  },
  fetch: async (url) => ({
    ok: true,
    json: async () => url.startsWith("/api/session.asp") ? serverState : { success: true }
  }),
  CustomEvent: class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } },
  Date,
  JSON,
  Object,
  Promise
});
vm.runInContext(source, context, { filename: "auth-session.js" });
await windowObject.WebWindowsAuth.refresh({ force: true });

assert.equal(windowObject.WebWindowsAuth.getState(), "unauthenticated");
assert.equal(values.has("webwindows_user"), false, "stale browser identity must be cleared");
assert.equal(nodes["login-username"].textContent, "未登录");

serverState = {
  authenticated: true,
  user: { id: 7, username: "verified-user", nickname: "已验证用户" }
};
await windowObject.WebWindowsAuth.refresh({ force: true });
assert.equal(windowObject.WebWindowsAuth.getState(), "authenticated");
assert.equal(JSON.parse(values.get("webwindows_user")).username, "verified-user");
assert.equal(nodes["login-username"].textContent, "已验证用户");

await windowObject.logout();
assert.equal(windowObject.WebWindowsAuth.getState(), "unauthenticated");
assert.equal(values.has("webwindows_user"), false);
assert.equal(nodes.logout.hidden, true);

console.log("Auth session smoke tests passed");
