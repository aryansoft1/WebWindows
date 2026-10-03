/* WebWindows "打开方式" (Open With) UI helper v1 — host-agnostic, framework-free.
 * Runs inside cloud browser iframes (or any file list page). Data comes from
 *   parent.WebWindows.fileTypes   (File Type Registry, never reimplemented here)
 *   parent.WebWindows.apps        (display names + installed state, best effort)
 * File routing stays with the host's existing opener (e.g. parent.openResource);
 * this module only decides *whether* to open, *with which handler*, and shows
 * the unknown-type / choose-app dialogs. It never invents handlers or results.
 */
(function () {
  "use strict";

  var STR = {
    openWith: { zh: "打开方式", tw: "開啟方式", jp: "プログラムから開く", en: "Open with" },
    chooseOther: { zh: "选择其他应用…", tw: "選擇其他應用程式…", jp: "別のアプリを選択…", en: "Choose another app…" },
    alwaysUse: { zh: "始终使用此应用打开 {ext} 文件", tw: "一律使用此應用程式開啟 {ext} 檔案", jp: "このアプリで {ext} を常に開く", en: "Always use this app to open {ext} files" },
    unknownTitle: { zh: "无法打开此文件", tw: "無法開啟此檔案", jp: "このファイルを開けません", en: "Can't open this file" },
    unknownBody: { zh: "WebWindows 当前没有可以打开此类型文件的应用。\n\n文件：{name}\n类型：{ext}", tw: "WebWindows 目前沒有可以開啟此類型檔案的應用程式。\n\n檔案：{name}\n類型：{ext}", jp: "この種類のファイルを開けるアプリがありません。\n\nファイル：{name}\n種類：{ext}", en: "No installed app can open this file type.\n\nFile: {name}\nType: {ext}" },
    chooseApp: { zh: "选择应用", tw: "選擇應用程式", jp: "アプリを選択", en: "Choose app" },
    findInStore: { zh: "在应用商店中查找", tw: "在應用程式商店中尋找", jp: "ストアで探す", en: "Find in app store" },
    cancel: { zh: "取消", tw: "取消", jp: "キャンセル", en: "Cancel" },
    chooseTitle: { zh: "选择用于打开 {ext} 文件的应用", tw: "選擇用於開啟 {ext} 檔案的應用程式", jp: "{ext} を開くアプリの選択", en: "Choose an app to open {ext} files" },
    confirm: { zh: "确定", tw: "確定", jp: "OK", en: "OK" },
    notInstalled: { zh: "尚未安装", tw: "尚未安裝", jp: "未インストール", en: "Not installed" },
    defaultMark: { zh: "（默认）", tw: "（預設）", jp: "（既定）", en: " (default)" },
    storeUnavailable: { zh: "应用商店暂时不可用", tw: "應用程式商店暫時無法使用", jp: "ストアを利用できません", en: "The app store is unavailable" }
  };

  var FRIENDLY = {
    "webwindows.photos": { zh: "照片", tw: "相片", jp: "フォト", en: "Photos" },
    "webwindows.paint": { zh: "画图", tw: "小畫家", jp: "ペイント", en: "Paint" },
    "webwindows.media-player": { zh: "媒体播放器", tw: "媒體播放器", jp: "メディアプレーヤー", en: "Media Player" },
    "webwindows.system.file-preview": { zh: "文件预览", tw: "檔案預覽", jp: "ファイルプレビュー", en: "File Preview" },
    "webwindows.system.app-installer": { zh: "应用安装器", tw: "應用程式安裝器", jp: "アプリインストーラー", en: "App Installer" },
    "webwindows.system.theme-installer": { zh: "主题安装器", tw: "佈景主題安裝器", jp: "テーマインストーラー", en: "Theme Installer" },
    "webwindows.system.package-installer": { zh: "系统包安装器", tw: "系統套件安裝器", jp: "システムパッケージインストーラー", en: "System Package Installer" },
    "com.aryansoft.webwindows.write": { zh: "Write Editor", tw: "Write Editor", jp: "Write Editor", en: "Write Editor" },
    "com.aryansoft.webwindows.sheet": { zh: "Sheet Editor", tw: "Sheet Editor", jp: "Sheet Editor", en: "Sheet Editor" },
    "com.aryansoft.webwindows.slide": { zh: "Slide Editor", tw: "Slide Editor", jp: "Slide Editor", en: "Slide Editor" },
    "com.aryansoft.webwindows.dreama": { zh: "Dreama", tw: "Dreama", jp: "Dreama", en: "Dreama" }
  };

  function lang() {
    var raw = "";
    try {
      raw = String((typeof document !== "undefined" && document.body && document.body.dataset.language) ||
        (typeof localStorage !== "undefined" && localStorage.getItem("lang")) || "zh");
    } catch (_) { raw = "zh"; }
    raw = raw.toLowerCase();
    if (raw === "jp" || raw.indexOf("ja") === 0) return "jp";
    if (raw === "tw" || raw.indexOf("zh-tw") === 0 || raw.indexOf("zh-hk") === 0 || raw.indexOf("hant") >= 0) return "tw";
    if (raw.indexOf("en") === 0) return "en";
    return "zh";
  }

  function t(key, values) {
    var entry = STR[key] || {};
    var template = entry[lang()] || entry.zh || key;
    return String(template).replace(/\{([^}]+)\}/g, function (m, name) {
      return values && values[name] != null ? String(values[name]) : m;
    });
  }

  function hostWindow() {
    try {
      if (typeof window !== "undefined" && window.parent && window.parent !== window) return window.parent;
    } catch (_) {}
    try {
      if (typeof window !== "undefined") return window;
    } catch (_) {}
    return (typeof globalThis !== "undefined" && globalThis) || {};
  }

  function fileTypes() {
    var host = hostWindow();
    try {
      if (host && host.WebWindows && host.WebWindows.fileTypes) return host.WebWindows.fileTypes;
    } catch (_) {}
    try {
      if (typeof window !== "undefined" && window.WebWindows && window.WebWindows.fileTypes) return window.WebWindows.fileTypes;
    } catch (_) {}
    return null;
  }

  function appsApi() {
    var host = hostWindow();
    try {
      if (host && host.WebWindows && host.WebWindows.apps) return host.WebWindows.apps;
    } catch (_) {}
    return null;
  }

  function describe(input) {
    if (!input) return { name: "", mimeType: "" };
    if (typeof input === "string") return { name: input, mimeType: "" };
    if (input.dataset) {
      return { name: String(input.dataset.name || ""), mimeType: String(input.dataset.mimeType || "") };
    }
    return { name: String(input.name || ""), mimeType: String(input.mimeType || input.type || "") };
  }

  function prettyId(id) {
    var tail = String(id || "").split(".").pop().split("-").join(" ");
    return tail ? tail.charAt(0).toUpperCase() + tail.slice(1) : String(id || "");
  }

  async function displayName(appId) {
    if (FRIENDLY[appId]) return FRIENDLY[appId][lang()] || FRIENDLY[appId].en;
    var api = appsApi();
    if (api && typeof api.get === "function") {
      try {
        var app = await api.get(appId);
        if (app && app.name) return app.name;
      } catch (_) {}
    }
    return prettyId(appId);
  }

  async function installedState(appId) {
    var api = appsApi();
    if (!api || typeof api.isInstalled !== "function") return null; // unknown host: don't block
    try {
      return (await api.isInstalled(appId)) ? true : false;
    } catch (_) {
      return false; // unknown to catalog => cannot launch
    }
  }

  // Pure data for an "打开方式" submenu. Hosts render it natively.
  async function menuData(input, deps) {
    var ft = (deps && deps.fileTypes) || fileTypes();
    var desc = describe(input);
    if (!ft) return { available: false, fileName: desc.name, handlers: [] };
    var menu = ft.getOpenWithMenu({ name: desc.name, mimeType: desc.mimeType });
    var entries = [];
    for (var i = 0; i < menu.handlers.length; i += 1) {
      var id = menu.handlers[i];
      var installed = (deps && deps.installed) ? await deps.installed(id) : await installedState(id);
      entries.push({
        id: id,
        name: (deps && deps.nameOf) ? await deps.nameOf(id) : await displayName(id),
        installed: installed,
        isDefault: menu.defaultHandler === id
      });
    }
    return {
      available: true,
      fileName: menu.fileName,
      typeId: menu.typeId,
      extension: menu.extension || "",
      extLabel: menu.extension || "",
      unknown: menu.unknown,
      defaultHandler: menu.defaultHandler,
      handlers: entries
    };
  }

  async function openable(input, deps) {
    var data = await menuData(input, deps);
    if (!data.available || data.unknown) return { open: false, reason: "unknown", data: data };
    var usable = data.handlers.filter(function (h) { return h.installed !== false; });
    if (!usable.length) return { open: false, reason: "no-installed-handler", data: data };
    return { open: true, data: data };
  }

  // Unified double-click / "打开" entry. Returns a status string; shows the
  // unknown dialog instead of failing silently. Legacy opener untouched.
  async function openDefault(input, openFn, deps) {
    var desc = describe(input);
    var ft = (deps && deps.fileTypes) || fileTypes();
    if (!ft || typeof openFn !== "function") {
      if (typeof openFn === "function") await openFn();
      return "legacy";
    }
    var check = await openable(desc, deps);
    if (!check.open) {
      showUnknownDialog({
        fileName: desc.name,
        extension: check.data.extLabel || "",
        typeId: check.data.typeId,
        openFn: openFn,
        deps: deps,
        onError: deps && deps.onError,
        onStoreMissing: deps && deps.onStoreMissing,
        onChooseApp: deps && deps.onChooseApp
      });
      return check.reason;
    }
    await openFn();
    return "opened";
  }

  // One-time open with an explicit handler WITHOUT changing the user's
  // default: briefly point the default at the handler (the cloud pipeline
  // resolves through it), open, then restore the previous override.
  async function openWithOneTime(typeId, handlerId, openFn, deps) {
    var ft = (deps && deps.fileTypes) || fileTypes();
    if (!ft) throw new Error("fileTypes unavailable");
    var prev = null;
    var hadPrev = false;
    try {
      hadPrev = ft.getUserOverride(typeId) != null;
      prev = ft.getUserOverride(typeId);
      ft.setDefaultHandler(typeId, handlerId, { allowUnknown: true });
      await openFn();
    } finally {
      try {
        if (hadPrev) ft.setDefaultHandler(typeId, prev, { allowUnknown: true });
        else ft.clearDefaultHandler(typeId);
      } catch (_) {}
    }
    return "opened";
  }

  async function setDefaultAndOpen(typeId, handlerId, openFn, deps) {
    var ft = (deps && deps.fileTypes) || fileTypes();
    if (!ft) throw new Error("fileTypes unavailable");
    ft.setDefaultHandler(typeId, handlerId, { allowUnknown: true });
    await openFn();
    return "opened";
  }

  function openStore() {
    var host = hostWindow();
    try {
      var api = host && host.WebWindows && host.WebWindows.apps;
      if (api && typeof api.launch === "function") {
        api.launch("webwindows.system.function-center").catch(function () {});
        return true;
      }
    } catch (_) {}
    try {
      if (host && typeof host.openWindow === "function") {
        host.openWindow("function-center", "功能中心", "function-center.html", "", true, "", "980px", "700px");
        return true;
      }
    } catch (_) {}
    return false;
  }

  // ------------------------------------------------------------ dialogs
  var styleInjected = false;
  function ensureStyle() {
    if (styleInjected || typeof document === "undefined") return;
    styleInjected = true;
    var css = ".ww-ow-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999}" +
      ".ww-ow-card{background:#fff;color:#222;border-radius:10px;min-width:320px;max-width:min(440px,92vw);padding:20px 20px 16px;box-shadow:0 12px 40px rgba(0,0,0,.35);font-size:14px}" +
      ".ww-ow-card h3{margin:0 0 10px;font-size:16px}" +
      ".ww-ow-card p{margin:0 0 14px;white-space:pre-line;line-height:1.6}" +
      ".ww-ow-list{display:flex;flex-direction:column;gap:6px;margin:0 0 12px;max-height:40vh;overflow:auto}" +
      ".ww-ow-list button{text-align:left;padding:8px 10px;border:1px solid #ddd;border-radius:6px;background:#f7f7f7;cursor:pointer;font-size:14px}" +
      ".ww-ow-list button:hover:not(:disabled){background:#eef4ff;border-color:#9ec1ff}" +
      ".ww-ow-list button:disabled{opacity:.55;cursor:not-allowed}" +
      ".ww-ow-row{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}" +
      ".ww-ow-row button{padding:7px 14px;border-radius:6px;border:1px solid #ccc;background:#f5f5f5;cursor:pointer}" +
      ".ww-ow-row button.primary{background:#1668dc;border-color:#1668dc;color:#fff}" +
      ".ww-ow-check{display:flex;gap:8px;align-items:center;margin:0 0 12px;font-size:13px;color:#444}";
    var el = document.createElement("style");
    el.setAttribute("data-ww-open-with", "1");
    el.textContent = css;
    document.head.appendChild(el);
  }

  function overlay() {
    ensureStyle();
    var back = document.createElement("div");
    back.className = "ww-ow-overlay";
    var card = document.createElement("div");
    card.className = "ww-ow-card";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    back.appendChild(card);
    back.addEventListener("click", function (e) { if (e.target === back) close(back); });
    document.body.appendChild(back);
    return { back: back, card: card };
  }

  function close(back) {
    if (back && back.remove) back.remove();
    else if (back && back.parentNode) back.parentNode.removeChild(back);
  }

  function button(label, primary, onClick) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    if (primary) b.className = "primary";
    b.addEventListener("click", onClick);
    return b;
  }

  function showUnknownDialog(options) {
    var opts = options && typeof options === "object" ? options : {};
    if (typeof document === "undefined") return null;
    var ext = opts.extension ? String(opts.extension) : "";
    var ui = overlay();
    var h = document.createElement("h3");
    h.textContent = t("unknownTitle");
    var p = document.createElement("p");
    p.textContent = t("unknownBody", { name: String(opts.fileName || ""), ext: ext || "?" });
    var row = document.createElement("div");
    row.className = "ww-ow-row";
    row.appendChild(button(t("chooseApp"), true, function () {
      close(ui.back);
      if (typeof opts.onChooseApp === "function") opts.onChooseApp();
      else showChooseDialog({ fileName: opts.fileName, extension: ext, typeId: opts.typeId, openFn: opts.openFn, deps: opts.deps, onError: opts.onError });
    }));
    row.appendChild(button(t("findInStore"), false, function () {
      // Entry point only: opens the app store without fabricating results.
      if (!openStore() && typeof opts.onStoreMissing === "function") opts.onStoreMissing();
      close(ui.back);
    }));
    row.appendChild(button(t("cancel"), false, function () { close(ui.back); }));
    ui.card.appendChild(h);
    ui.card.appendChild(p);
    ui.card.appendChild(row);
    return ui.back;
  }

  // entries: [{id,name,installed}] or null to load from installed apps.
  async function showChooseDialog(options) {
    var opts = options && typeof options === "object" ? options : {};
    if (typeof document === "undefined") return null;
    var ext = opts.extension ? String(opts.extension) : "";
    var entries = Array.isArray(opts.entries) ? opts.entries : await installedAppEntries(opts.deps);
    var ui = overlay();
    var h = document.createElement("h3");
    h.textContent = t("chooseTitle", { ext: ext || "?" });
    var list = document.createElement("div");
    list.className = "ww-ow-list";
    entries.forEach(function (entry) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = entry.name + (entry.installed === false ? "（" + t("notInstalled") + "）" : "");
      if (entry.installed === false) b.disabled = true;
      b.addEventListener("click", async function () {
        var always = check && check.checked;
        close(ui.back);
        if (typeof opts.onPick === "function") { opts.onPick(entry.id, always); return; }
        try {
          if (always && opts.typeId) await setDefaultAndOpen(opts.typeId, entry.id, opts.openFn, opts.deps);
          else if (opts.typeId) await openWithOneTime(opts.typeId, entry.id, opts.openFn, opts.deps);
          else if (typeof opts.openFn === "function") await opts.openFn();
        } catch (e) {
          if (typeof opts.onError === "function") opts.onError(e);
        }
      });
      list.appendChild(b);
    });
    var checkWrap = document.createElement("label");
    checkWrap.className = "ww-ow-check";
    var check = null;
    if (opts.typeId) {
      check = document.createElement("input");
      check.type = "checkbox";
      checkWrap.appendChild(check);
      checkWrap.appendChild(document.createTextNode(t("alwaysUse", { ext: ext || "?" })));
    }
    var row = document.createElement("div");
    row.className = "ww-ow-row";
    row.appendChild(button(t("cancel"), false, function () { close(ui.back); }));
    ui.card.appendChild(h);
    ui.card.appendChild(list);
    if (opts.typeId) ui.card.appendChild(checkWrap);
    ui.card.appendChild(row);
    return ui.back;
  }

  async function installedAppEntries(deps) {
    var api = (deps && deps.apps) || appsApi();
    if (!api || typeof api.listInstalled !== "function") return [];
    try {
      var apps = await api.listInstalled();
      return (Array.isArray(apps) ? apps : []).map(function (a) {
        return { id: a.id, name: a.name || prettyId(a.id), installed: true };
      });
    } catch (_) {
      return [];
    }
  }

  // Render submenu entries (handler buttons + "choose other") into a host-
  // owned container. Behavior stays with the host via delegation on
  // [data-ow-handler] / [data-ow-choose]. Returns the container.
  function renderMenuEntries(listEl, data, texts) {
    if (!listEl || typeof document === "undefined") return listEl;
    while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
    var labels = texts && typeof texts === "object" ? texts : {};
    var defMark = labels.defaultMark != null ? labels.defaultMark : t("defaultMark");
    var notInst = labels.notInstalled != null ? labels.notInstalled : t("notInstalled");
    var chooseLabel = labels.chooseOther != null ? labels.chooseOther : t("chooseOther");
    (data.handlers || []).forEach(function (handler) {
      var entry = document.createElement("button");
      entry.type = "button";
      entry.dataset.owHandler = handler.id;
      entry.setAttribute("role", "menuitem");
      entry.textContent = handler.name + (handler.isDefault ? defMark : "") +
        (handler.installed === false ? "（" + notInst + "）" : "");
      if (handler.isDefault && entry.classList) entry.classList.add("ww-ow-default");
      if (handler.installed === false) {
        entry.disabled = true;
        entry.title = notInst;
      }
      listEl.appendChild(entry);
    });
    var choose = document.createElement("button");
    choose.type = "button";
    choose.dataset.owChoose = "1";
    choose.setAttribute("role", "menuitem");
    choose.textContent = chooseLabel;
    listEl.appendChild(choose);
    return listEl;
  }

  var api = {
    describe: describe,
    menuData: menuData,
    openable: openable,
    openDefault: openDefault,
    openWithOneTime: openWithOneTime,
    setDefaultAndOpen: setDefaultAndOpen,
    showUnknownDialog: showUnknownDialog,
    showChooseDialog: showChooseDialog,
    renderMenuEntries: renderMenuEntries,
    openStore: openStore,
    text: t
  };

  try {
    var scope = (typeof window !== "undefined" && window) || (typeof globalThis !== "undefined" && globalThis);
    scope.WebWindowsOpenWith = api;
  } catch (_) {}
})();
