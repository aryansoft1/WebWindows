import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const syncSource = await fs.readFile(
  new URL("../assets/js/function-sync.js", import.meta.url),
  "utf8"
);

const session = new Map([
  ["webwindows_user", JSON.stringify({ id: 7, username: "alice" })]
]);
const events = new Map();
const localRecords = new Map();
const remoteByUser = new Map();
const apps = new Map([
  ["webwindows.system.settings", {
    id: "webwindows.system.settings",
    type: "system",
    install: { uninstallable: false }
  }],
  ["com.aryansoft.webwindows.sheet", {
    id: "com.aryansoft.webwindows.sheet",
    type: "application",
    install: { uninstallable: true }
  }],
  ["com.aryansoft.webwindows.dreama", {
    id: "com.aryansoft.webwindows.dreama",
    type: "application",
    install: { uninstallable: true }
  }]
]);

localRecords.set("local::com.aryansoft.webwindows.sheet", {
  appId: "com.aryansoft.webwindows.sheet",
  subjectId: "local",
  state: "uninstalled",
  desktopVisible: false,
  retainData: true,
  source: "repository",
  changedAt: "2026-07-29T00:00:00.000Z"
});

function currentUserId() {
  return JSON.parse(session.get("webwindows_user") || "null")?.id;
}

function remoteStore() {
  const userId = currentUserId();
  if (!remoteByUser.has(userId)) remoteByUser.set(userId, new Map());
  return remoteByUser.get(userId);
}

const windowObject = {
  WebWindows: {
    apps: {
      ready: async () => {},
      get: async (appId) => apps.get(appId) || null,
      associations: {
        async list(subjectId) {
          return Array.from(localRecords.values())
            .filter((record) => record.subjectId === subjectId);
        },
        async put(record) {
          const saved = {
            ...record,
            key: `${record.subjectId}::${record.appId}`
          };
          localRecords.set(saved.key, saved);
          return saved;
        },
        async remove(appId, subjectId) {
          localRecords.delete(`${subjectId}::${appId}`);
        }
      }
    }
  },
  addEventListener(type, handler) {
    if (!events.has(type)) events.set(type, []);
    events.get(type).push(handler);
  },
  dispatchEvent(event) {
    for (const handler of events.get(event.type) || []) handler(event);
  }
};

const context = vm.createContext({
  window: windowObject,
  console,
  CustomEvent: class {
    constructor(type, init) {
      this.type = type;
      this.detail = init?.detail;
    }
  },
  sessionStorage: {
    getItem(key) {
      return session.get(key) || null;
    }
  },
  navigator: { onLine: true },
  URLSearchParams,
  Date,
  Promise,
  Error,
  JSON,
  String,
  Boolean,
  Array,
  Set,
  Map,
  setTimeout,
  clearTimeout,
  fetch: async (_url, options) => {
    const store = remoteStore();
    if (options.method === "GET") {
      return {
        ok: true,
        status: 200,
        async json() {
          return { ok: true, associations: Array.from(store.values()) };
        }
      };
    }
    const form = new URLSearchParams(options.body);
    const record = {
      appId: form.get("appId"),
      state: form.get("state"),
      desktopVisible: form.get("desktopVisible") === "1",
      retainData: form.get("retainData") !== "0",
      source: form.get("source"),
      changedAt: form.get("changedAt")
    };
    store.set(record.appId, record);
    return {
      ok: true,
      status: 200,
      async json() {
        return { ok: true, association: record };
      }
    };
  }
});

vm.runInContext(syncSource, context, { filename: "function-sync.js" });
await windowObject.WebWindows.functionSync.syncNow();

const aliceRemote = remoteByUser.get(7);
assert.equal(
  aliceRemote.get("com.aryansoft.webwindows.sheet").state,
  "uninstalled",
  "首次登录应将匿名状态迁移到 Alice 账户"
);
assert.equal(
  localRecords.get("user:7::com.aryansoft.webwindows.sheet").syncPending,
  false
);

const dreamaChange = {
  appId: "com.aryansoft.webwindows.dreama",
  subjectId: "user:7",
  state: "uninstalled",
  desktopVisible: false,
  retainData: true,
  source: "repository",
  changedAt: "2026-07-29T01:00:00.000Z"
};
await windowObject.WebWindows.apps.associations.put(dreamaChange);
windowObject.dispatchEvent(new CustomEvent("webwindows:installation-changed", {
  detail: dreamaChange
}));
await new Promise((resolve) => setTimeout(resolve, 10));
assert.equal(
  aliceRemote.get("com.aryansoft.webwindows.dreama").state,
  "uninstalled",
  "登录状态的变更应自动上传"
);

localRecords.delete("user:7::com.aryansoft.webwindows.sheet");
localRecords.delete("user:7::com.aryansoft.webwindows.dreama");
await windowObject.WebWindows.functionSync.syncNow();
assert.equal(
  localRecords.get("user:7::com.aryansoft.webwindows.sheet").state,
  "uninstalled",
  "新设备应从服务器恢复 Alice 的功能状态"
);

remoteByUser.set(8, new Map([[
  "com.aryansoft.webwindows.dreama",
  {
    appId: "com.aryansoft.webwindows.dreama",
    state: "installed",
    desktopVisible: true,
    retainData: true,
    source: "repository",
    changedAt: "2026-07-29T02:00:00.000Z"
  }
]]));
session.set("webwindows_user", JSON.stringify({ id: 8, username: "bob" }));
windowObject.dispatchEvent(new CustomEvent("webwindows:login", {
  detail: { id: 8, username: "bob" }
}));
await windowObject.WebWindows.functionSync.syncNow();
assert.equal(
  localRecords.get("user:8::com.aryansoft.webwindows.dreama").state,
  "installed"
);
assert.equal(
  localRecords.has("user:8::com.aryansoft.webwindows.sheet"),
  false,
  "不同账户的服务器状态不能相互泄漏"
);

assert.equal(
  windowObject.WebWindows.functionSync.getState().status,
  "synced"
);

console.log("function-sync smoke test passed");
