(function () {
  "use strict";

  const REGISTRY_URL = "data/apps/system-apps.json";
  const DATABASE_NAME = "webwindows-apps";
  const DATABASE_VERSION = 1;
  const INSTALL_STORE = "installations";
  const FALLBACK_KEY = "webwindows.apps.installations";
  const appById = new Map();
  const appIdByLegacyId = new Map();
  let repository = null;
  let registryPromise = null;
  let capturedWindowOpener = null;

  function normalizeExtension(value) {
    const text = String(value || "").trim().toLowerCase();
    if (!text) return "";
    return text.startsWith(".") ? text : `.${text}`;
  }

  function extensionOf(name) {
    const value = String(name || "");
    const dot = value.lastIndexOf(".");
    return dot >= 0 ? normalizeExtension(value.slice(dot + 1)) : "";
  }

  function validateApp(app) {
    if (!app || typeof app !== "object") throw new Error("应用定义必须是对象。");
    if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)+$/.test(app.id || "")) {
      throw new Error(`应用 ID 无效：${app.id || "(empty)"}`);
    }
    if (!app.name || typeof app.entry !== "string" || !app.window?.mode) {
      throw new Error(`应用 ${app.id} 缺少 name、entry 或 window.mode。`);
    }
    return app;
  }

  async function loadRegistry() {
    if (registryPromise) return registryPromise;
    registryPromise = fetch(REGISTRY_URL, {
      credentials: "same-origin",
      cache: "no-store"
    })
      .then((response) => {
        if (!response.ok) throw new Error(`应用注册表读取失败（${response.status}）。`);
        return response.json();
      })
      .then((document) => {
        if (document?.schemaVersion !== 1 || !Array.isArray(document.apps)) {
          throw new Error("不支持的应用注册表格式。");
        }
        repository = document.repository || null;
        document.apps.forEach((definition) => {
          const app = validateApp(definition);
          if (appById.has(app.id)) throw new Error(`应用 ID 重复：${app.id}`);
          appById.set(app.id, Object.freeze(app));
          (app.legacyIds || []).forEach((legacyId) => {
            if (appIdByLegacyId.has(legacyId)) {
              throw new Error(`旧应用 ID 重复：${legacyId}`);
            }
            appIdByLegacyId.set(legacyId, app.id);
          });
        });
        window.dispatchEvent(new CustomEvent("webwindows:apps-ready", {
          detail: { appCount: appById.size, repository }
        }));
        return api;
      })
      .catch((error) => {
        registryPromise = null;
        console.error("[AppRegistry]", error);
        throw error;
      });
    return registryPromise;
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        resolve(null);
        return;
      }
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(INSTALL_STORE)) {
          database.createObjectStore(INSTALL_STORE, { keyPath: "appId" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function fallbackInstallations() {
    try {
      const value = JSON.parse(localStorage.getItem(FALLBACK_KEY) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch (_) {
      return {};
    }
  }

  async function readInstallation(appId) {
    try {
      const database = await openDatabase();
      if (!database) return fallbackInstallations()[appId] || null;
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction(INSTALL_STORE, "readonly");
        const request = transaction.objectStore(INSTALL_STORE).get(appId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn("[AppRegistry] IndexedDB 不可用，改用 localStorage。", error);
      return fallbackInstallations()[appId] || null;
    }
  }

  async function writeInstallation(record) {
    try {
      const database = await openDatabase();
      if (!database) throw new Error("IndexedDB unavailable");
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(INSTALL_STORE, "readwrite");
        transaction.objectStore(INSTALL_STORE).put(record);
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (_) {
      const installations = fallbackInstallations();
      installations[record.appId] = record;
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(installations));
    }
    window.dispatchEvent(new CustomEvent("webwindows:installation-changed", {
      detail: record
    }));
    return record;
  }

  async function get(appId) {
    await loadRegistry();
    return appById.get(appId) || null;
  }

  async function isInstalled(appOrId) {
    const app = typeof appOrId === "string" ? await get(appOrId) : appOrId;
    if (!app) return false;
    if (app.type === "system") return true;
    const record = await readInstallation(app.id);
    if (record) return record.state === "installed";
    return app.install?.defaultState === "installed";
  }

  async function install(appId, options) {
    const app = await get(appId);
    if (!app) throw new Error(`找不到应用：${appId}`);
    return writeInstallation({
      appId,
      repositoryId: repository?.id || "local",
      state: "installed",
      source: options?.source || app.install?.source || "local",
      installedAt: new Date().toISOString()
    });
  }

  async function uninstall(appId) {
    const app = await get(appId);
    if (!app) throw new Error(`找不到应用：${appId}`);
    if (app.type === "system" || app.install?.uninstallable === false) {
      throw new Error(`${app.name} 是受保护的系统应用，不能卸载。`);
    }
    return writeInstallation({
      appId,
      repositoryId: repository?.id || "local",
      state: "uninstalled",
      changedAt: new Date().toISOString()
    });
  }

  async function listInstalled() {
    await loadRegistry();
    const result = [];
    for (const app of appById.values()) {
      if (await isInstalled(app)) result.push(app);
    }
    return result;
  }

  async function resolveResource(resource) {
    await loadRegistry();
    const extension = extensionOf(resource?.name);
    const mimeType = String(resource?.mimeType || resource?.type || "").toLowerCase();
    const candidates = [];
    for (const app of appById.values()) {
      if (!(await isInstalled(app))) continue;
      (app.fileHandlers || []).forEach((handler) => {
        const extensions = (handler.extensions || []).map(normalizeExtension);
        const mimeTypes = (handler.mimeTypes || []).map((value) => String(value).toLowerCase());
        if ((extension && extensions.includes(extension)) || (mimeType && mimeTypes.includes(mimeType))) {
          candidates.push({ app, handler });
        }
      });
    }
    candidates.sort((left, right) => (right.handler.priority || 0) - (left.handler.priority || 0));
    return candidates[0] || null;
  }

  function legacyIdFor(app) {
    return app.legacyIds?.[0] || app.id.replace(/[^a-z0-9_-]/gi, "-");
  }

  async function launch(appId, context) {
    const app = await get(appId);
    if (!app) throw new Error(`找不到应用：${appId}`);
    if (!(await isInstalled(app))) throw new Error(`${app.name} 尚未安装。`);

    const launchAdapter = app.launch?.adapter || "window";
    if (launchAdapter === "desktalk-mailbox") {
      if (typeof window.openDeskTalkMailbox !== "function") {
        throw new Error("讯筒功能尚未就绪。");
      }
      return window.openDeskTalkMailbox();
    }
    if (launchAdapter === "about-panel") {
      if (typeof window.openAbout !== "function") {
        throw new Error("认识我功能尚未就绪。");
      }
      return window.openAbout();
    }
    if (launchAdapter !== "window") {
      throw new Error(`不支持的启动适配器：${launchAdapter}`);
    }

    if (typeof capturedWindowOpener !== "function") {
      throw new Error("窗口管理器尚未就绪。");
    }

    const launchContext = context || {};
    const instanceId = launchContext.instanceId || legacyIdFor(app);
    const title = launchContext.title || app.name;
    const url = launchContext.url || app.entry;
    const windowOptions = app.window || {};

    return capturedWindowOpener(
      instanceId,
      title,
      url,
      app.icon,
      windowOptions.mode === "iframe",
      windowOptions.className || "",
      windowOptions.width || "900px",
      windowOptions.height || "640px"
    );
  }

  async function launchLegacy(legacyId, context) {
    await loadRegistry();
    const appId = appIdByLegacyId.get(legacyId);
    if (!appId) return null;
    return launch(appId, context);
  }

  const api = {
    ready: loadRegistry,
    get,
    listInstalled,
    isInstalled,
    install,
    uninstall,
    resolveResource,
    launch,
    launchLegacy
  };

  window.WebWindows = window.WebWindows || {};
  window.WebWindows.apps = api;

  function installLegacyBridge() {
    if (typeof window.openWindow !== "function" || window.openWindow.__webWindowsAppBridge) return;
    capturedWindowOpener = window.openWindow.bind(window);
    const bridge = function (id, title, url, iconUrl, useIframe, type, width, height) {
      const appId = appIdByLegacyId.get(id);
      if (!appId) {
        return capturedWindowOpener(id, title, url, iconUrl, useIframe, type, width, height);
      }
      return launch(appId, {
        instanceId: id,
        title,
        url
      }).catch((error) => {
        console.error("[AppLauncher]", error);
        window.alert(error.message);
      });
    };
    bridge.__webWindowsAppBridge = true;
    window.openWindow = bridge;
  }

  loadRegistry()
    .then(installLegacyBridge)
    .catch((error) => {
      console.error("[AppRegistry] 初始化失败。旧窗口入口保持可用。", error);
    });
  window.addEventListener("ww-wm-ready", installLegacyBridge);
  window.addEventListener("load", installLegacyBridge);
})();
