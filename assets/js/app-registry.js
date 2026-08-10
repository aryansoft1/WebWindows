(function () {
  "use strict";

  const REGISTRY_API_URL = "api/function-catalog.asp";
  const REGISTRY_FALLBACK_URL = "data/apps/system-apps.json";
  const REGISTRY_CACHE_KEY = "webwindows.functions.catalog-cache.v1";
  const DATABASE_NAME = "webwindows-apps";
  const DATABASE_VERSION = 2;
  const INSTALL_STORE = "function-associations";
  const LEGACY_INSTALL_STORE = "installations";
  const FALLBACK_KEY = "webwindows.functions.associations.v2";
  const LEGACY_FALLBACK_KEY = "webwindows.apps.installations";
  const appById = new Map();
  const appIdByLegacyId = new Map();
  let repository = null;
  let repositoryStatus = {
    source: "initializing",
    cached: false,
    message: "正在连接功能仓库。"
  };
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

  function currentSubjectId() {
    try {
      const user = JSON.parse(sessionStorage.getItem("webwindows_user") || "null");
      const identifier = user?.id || user?.userId || user?.username;
      return identifier ? `user:${String(identifier)}` : "local";
    } catch (_) {
      return "local";
    }
  }

  function associationKey(subjectId, appId) {
    return `${subjectId}::${appId}`;
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

  function validateRegistryDocument(document) {
    if (document?.schemaVersion !== 1 || !Array.isArray(document.apps)) {
      throw new Error("不支持的功能目录格式。");
    }
    return document;
  }

  function cacheRegistryDocument(document) {
    try {
      localStorage.setItem(REGISTRY_CACHE_KEY, JSON.stringify({
        savedAt: new Date().toISOString(),
        document
      }));
    } catch (_) {
      // 无痕模式或存储配额不足时，当前会话仍可继续使用目录。
    }
  }

  function readCachedRegistryDocument() {
    try {
      const cached = JSON.parse(localStorage.getItem(REGISTRY_CACHE_KEY) || "null");
      return cached?.document ? validateRegistryDocument(cached.document) : null;
    } catch (_) {
      return null;
    }
  }

  async function fetchRegistryDocument(url) {
    const response = await fetch(url, {
      credentials: "same-origin",
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`功能目录读取失败（${response.status}）。`);
    return validateRegistryDocument(await response.json());
  }

  function mergeCoreSystemApps(document, builtInDocument) {
    if (!builtInDocument) return document;
    const appIds = new Set(document.apps.map((app) => app?.id).filter(Boolean));
    const missingCoreApps = builtInDocument.apps.filter((app) =>
      !appIds.has(app?.id) &&
      (app?.type === "system" || app?.install?.uninstallable === false)
    );
    if (missingCoreApps.length === 0) return document;
    console.warn(
      "[AppRegistry] 服务器目录缺少内置核心功能，已从本地容灾目录补齐。",
      missingCoreApps.map((app) => app.id)
    );
    return {
      ...document,
      apps: [...document.apps, ...missingCoreApps]
    };
  }

  async function resolveRegistryDocument() {
    try {
      const serverDocument = await fetchRegistryDocument(REGISTRY_API_URL);
      let builtInDocument = null;
      try {
        builtInDocument = await fetchRegistryDocument(REGISTRY_FALLBACK_URL);
      } catch (fallbackError) {
        console.warn("[AppRegistry] 内置容灾目录校验失败。", fallbackError);
      }
      const document = mergeCoreSystemApps(serverDocument, builtInDocument);
      cacheRegistryDocument(document);
      repositoryStatus = {
        source: "server",
        cached: false,
        message: builtInDocument && document.apps.length > serverDocument.apps.length
          ? "已连接服务器功能仓库，并补齐内置核心功能。"
          : "已连接服务器功能仓库。"
      };
      return document;
    } catch (apiError) {
      console.warn("[AppRegistry] 服务器功能仓库暂不可用，尝试本地容灾目录。", apiError);
      try {
        const document = await fetchRegistryDocument(REGISTRY_FALLBACK_URL);
        cacheRegistryDocument(document);
        repositoryStatus = {
          source: "fallback",
          cached: false,
          message: "服务器目录暂不可用，正在使用内置容灾目录。"
        };
        return document;
      } catch (fallbackError) {
        const cached = readCachedRegistryDocument();
        if (!cached) throw fallbackError;
        repositoryStatus = {
          source: "cache",
          cached: true,
          message: "当前离线，正在使用上次同步的功能目录。"
        };
        return cached;
      }
    }
  }

  async function loadRegistry() {
    if (registryPromise) return registryPromise;
    registryPromise = resolveRegistryDocument()
      .then((document) => {
        repository = document.repository || null;
        document.apps
          .filter((definition) => definition?.catalog?.status !== "disabled")
          .forEach((definition) => {
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
          detail: { appCount: appById.size, repository, repositoryStatus }
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

  async function reloadRegistry() {
    registryPromise = null;
    appById.clear();
    appIdByLegacyId.clear();
    repository = null;
    repositoryStatus = {
      source: "initializing",
      cached: false,
      message: "正在刷新功能仓库。"
    };
    return loadRegistry();
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
          database.createObjectStore(INSTALL_STORE, { keyPath: "key" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function fallbackAssociations() {
    try {
      const value = JSON.parse(localStorage.getItem(FALLBACK_KEY) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch (_) {
      return {};
    }
  }

  function legacyFallbackInstallation(appId) {
    try {
      const value = JSON.parse(localStorage.getItem(LEGACY_FALLBACK_KEY) || "{}");
      return value && typeof value === "object" ? value[appId] || null : null;
    } catch (_) {
      return null;
    }
  }

  async function readInstallationForSubject(appId, subjectId) {
    const key = associationKey(subjectId, appId);
    try {
      const database = await openDatabase();
      if (!database) {
        return fallbackAssociations()[key] ||
          (subjectId === "local" ? legacyFallbackInstallation(appId) : null);
      }
      const record = await new Promise((resolve, reject) => {
        const transaction = database.transaction(INSTALL_STORE, "readonly");
        const request = transaction.objectStore(INSTALL_STORE).get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
      if (record || subjectId !== "local" ||
          !database.objectStoreNames.contains(LEGACY_INSTALL_STORE)) {
        return record;
      }
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction(LEGACY_INSTALL_STORE, "readonly");
        const request = transaction.objectStore(LEGACY_INSTALL_STORE).get(appId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn("[AppRegistry] IndexedDB 不可用，改用 localStorage。", error);
      return fallbackAssociations()[key] ||
        (subjectId === "local" ? legacyFallbackInstallation(appId) : null);
    }
  }

  async function readInstallation(appId) {
    return readInstallationForSubject(appId, currentSubjectId());
  }

  async function persistInstallation(record) {
    const subjectId = record.subjectId || currentSubjectId();
    const scopedRecord = {
      ...record,
      subjectId,
      syncPending: record.syncPending ??
        (subjectId.startsWith("user:") ? true : undefined),
      key: associationKey(subjectId, record.appId)
    };
    try {
      const database = await openDatabase();
      if (!database) throw new Error("IndexedDB unavailable");
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(INSTALL_STORE, "readwrite");
        transaction.objectStore(INSTALL_STORE).put(scopedRecord);
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (_) {
      const associations = fallbackAssociations();
      associations[scopedRecord.key] = scopedRecord;
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(associations));
    }
    return scopedRecord;
  }

  async function deleteInstallationForSubject(appId, subjectId) {
    const key = associationKey(subjectId, appId);
    try {
      const database = await openDatabase();
      if (!database) throw new Error("IndexedDB unavailable");
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(INSTALL_STORE, "readwrite");
        transaction.objectStore(INSTALL_STORE).delete(key);
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (_) {
      const associations = fallbackAssociations();
      delete associations[key];
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(associations));
    }
  }

  async function writeInstallation(record) {
    const scopedRecord = await persistInstallation(record);
    window.dispatchEvent(new CustomEvent("webwindows:installation-changed", {
      detail: scopedRecord
    }));
    return scopedRecord;
  }

  async function listExplicitAssociations(subjectId) {
    await loadRegistry();
    const result = [];
    for (const app of appById.values()) {
      const record = await readInstallationForSubject(app.id, subjectId);
      if (record) result.push(record);
    }
    return result;
  }

  async function importAssociation(record, options) {
    if (!record?.appId) throw new Error("同步记录缺少功能 ID。");
    const scopedRecord = await persistInstallation(record);
    if (options?.notify !== false) {
      window.dispatchEvent(new CustomEvent("webwindows:installation-changed", {
        detail: scopedRecord
      }));
    }
    return scopedRecord;
  }

  async function removeAssociation(appId, subjectId, options) {
    await deleteInstallationForSubject(appId, subjectId);
    if (options?.notify !== false) {
      window.dispatchEvent(new CustomEvent("webwindows:installation-changed", {
        detail: { appId, subjectId, removed: true }
      }));
    }
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
    const previous = await readInstallation(appId);
    return writeInstallation({
      ...previous,
      appId,
      repositoryId: repository?.id || "local",
      state: "installed",
      source: options?.source || app.install?.source || "local",
      desktopVisible: options?.desktopVisible ?? previous?.desktopVisible ??
        (app.placement?.desktop === true),
      installedAt: previous?.installedAt || new Date().toISOString(),
      changedAt: new Date().toISOString()
    });
  }

  async function uninstall(appId, options) {
    const app = await get(appId);
    if (!app) throw new Error(`找不到应用：${appId}`);
    if (app.type === "system" || app.install?.uninstallable === false) {
      throw new Error(`${app.name} 是受保护的系统应用，不能卸载。`);
    }
    const previous = await readInstallation(appId);
    return writeInstallation({
      ...previous,
      appId,
      repositoryId: repository?.id || "local",
      state: "uninstalled",
      desktopVisible: false,
      retainData: options?.retainData !== false,
      changedAt: new Date().toISOString()
    });
  }

  async function getInstallation(appOrId) {
    const app = typeof appOrId === "string" ? await get(appOrId) : appOrId;
    if (!app) return null;
    const record = await readInstallation(app.id);
    return {
      appId: app.id,
      subjectId: currentSubjectId(),
      state: app.type === "system" || app.install?.uninstallable === false
        ? "system"
        : (record?.state || app.install?.defaultState || "available"),
      installed: await isInstalled(app),
      source: record?.source || app.install?.source || "repository",
      desktopVisible: app.type === "system" || app.install?.uninstallable === false
        ? app.placement?.desktop === true
        : record?.desktopVisible ?? (app.placement?.desktop === true),
      retainData: record?.retainData !== false,
      syncPending: record?.syncPending === true,
      explicit: Boolean(record)
    };
  }

  async function isDesktopVisible(appOrId) {
    const app = typeof appOrId === "string" ? await get(appOrId) : appOrId;
    if (!app || !(await isInstalled(app))) return false;
    if (app.type === "system" || app.install?.uninstallable === false) {
      return app.placement?.desktop === true;
    }
    const record = await readInstallation(app.id);
    return record?.desktopVisible ?? (app.placement?.desktop === true);
  }

  async function setDesktopVisible(appId, visible) {
    const app = await get(appId);
    if (!app) throw new Error(`找不到功能：${appId}`);
    if (!(await isInstalled(app))) throw new Error(`${app.name} 尚未添加。`);
    const previous = await readInstallation(appId);
    return writeInstallation({
      ...previous,
      appId,
      repositoryId: repository?.id || "local",
      state: "installed",
      source: previous?.source || app.install?.source || "repository",
      desktopVisible: Boolean(visible),
      installedAt: previous?.installedAt || new Date().toISOString(),
      changedAt: new Date().toISOString()
    });
  }

  async function listCatalog() {
    await loadRegistry();
    return Array.from(appById.values());
  }

  function getRepositoryStatus() {
    return {
      repository,
      ...repositoryStatus
    };
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
    reload: reloadRegistry,
    get,
    getInstallation,
    listCatalog,
    getRepositoryStatus,
    listInstalled,
    isInstalled,
    isDesktopVisible,
    setDesktopVisible,
    install,
    uninstall,
    resolveResource,
    launch,
    launchLegacy,
    associations: Object.freeze({
      currentSubjectId,
      list: listExplicitAssociations,
      put: importAssociation,
      remove: removeAssociation
    })
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
