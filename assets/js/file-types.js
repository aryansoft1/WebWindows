/* WebWindows File Types & Associations v1 — system-layer registry.
 * Owns: extension/MIME/metadata -> WebWindows Type ID -> icon/preview/handlers/default.
 * Never touches host OS associations. Additive: existing AppRegistry/fileHandlers keep working.
 * Persistence (localStorage, sync for determinism):
 *   webwindows.filetypes.user-defaults.v1  (user default-handler overrides)
 *   webwindows.filetypes.installed.v1      (third-party associations + owned types)
 * Built-ins are immutable in code; user overrides always win over system defaults.
 */
(function () {
  "use strict";

  var UNKNOWN_ID = "webwindows.file.unknown";
  var USER_DEFAULTS_KEY = "webwindows.filetypes.user-defaults.v1";
  var INSTALLED_KEY = "webwindows.filetypes.installed.v1";
  var ID_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)+$/;
  var EXT_PATTERN = /^\.[a-z0-9][a-z0-9._~-]*$/;

  var CATEGORY_ICONS = {
    image: "system:image",
    audio: "system:audio",
    video: "system:video",
    text: "system:text",
    web: "system:web",
    document: "system:document",
    archive: "system:archive",
    package: "system:package",
    file: "system:file"
  };

  // Exact filenames that are legal without an extension (never treat as invalid).
  var EXACT_FILENAMES = {
    README: "webwindows.text.plain",
    LICENSE: "webwindows.text.plain",
    LICENCE: "webwindows.text.plain",
    NOTICE: "webwindows.text.plain",
    AUTHORS: "webwindows.text.plain",
    CHANGELOG: "webwindows.text.plain",
    DOCKERFILE: "webwindows.text.dockerfile",
    MAKEFILE: "webwindows.text.makefile",
    GEMFILE: "webwindows.text.plain",
    VAGRANTFILE: "webwindows.text.plain"
  };

  // ---------------------------------------------------------------- built-ins
  // handlers reference reserved system handler IDs; where a dedicated app does
  // not ship yet, webwindows.system.file-preview remains the working fallback
  // and stays resolvable through the installed AppRegistry.
  var BUILT_IN_TYPES = [
    { id: "webwindows.text.plain", extensions: [".txt", ".log", ".text"], mimeTypes: ["text/plain"], category: "text", icon: "system:text", handlers: ["webwindows.system.file-preview"], defaultHandler: "webwindows.system.file-preview", previewProvider: "webwindows.system.file-preview" },
    { id: "webwindows.text.markdown", extensions: [".md", ".markdown"], mimeTypes: ["text/markdown", "text/x-markdown"], category: "text", icon: "system:text", handlers: ["webwindows.system.file-preview"], defaultHandler: "webwindows.system.file-preview", previewProvider: "webwindows.system.file-preview" },
    { id: "webwindows.text.json", extensions: [".json", ".jsonc"], mimeTypes: ["application/json"], category: "text", icon: "system:text", handlers: ["webwindows.system.file-preview"], defaultHandler: "webwindows.system.file-preview", previewProvider: "webwindows.system.file-preview" },
    { id: "webwindows.text.xml", extensions: [".xml"], mimeTypes: ["application/xml", "text/xml"], category: "text", icon: "system:text", handlers: ["webwindows.system.file-preview"], defaultHandler: "webwindows.system.file-preview", previewProvider: "webwindows.system.file-preview" },
    { id: "webwindows.text.csv", extensions: [".csv"], mimeTypes: ["text/csv"], category: "text", icon: "system:text", handlers: ["com.aryansoft.webwindows.sheet", "webwindows.system.file-preview"], defaultHandler: "com.aryansoft.webwindows.sheet", previewProvider: "webwindows.system.file-preview" },
    { id: "webwindows.text.dockerfile", extensions: [], mimeTypes: [], category: "text", icon: "system:text", handlers: ["webwindows.system.file-preview"], defaultHandler: "webwindows.system.file-preview", previewProvider: "webwindows.system.file-preview" },
    { id: "webwindows.text.makefile", extensions: [], mimeTypes: [], category: "text", icon: "system:text", handlers: ["webwindows.system.file-preview"], defaultHandler: "webwindows.system.file-preview", previewProvider: "webwindows.system.file-preview" },
    { id: "webwindows.web.html", extensions: [".html", ".htm"], mimeTypes: ["text/html"], category: "web", icon: "system:web", handlers: ["com.aryansoft.webwindows.dreama"], defaultHandler: "com.aryansoft.webwindows.dreama", previewProvider: "com.aryansoft.webwindows.dreama" },
    { id: "webwindows.web.css", extensions: [".css"], mimeTypes: ["text/css"], category: "web", icon: "system:web", handlers: ["webwindows.system.file-preview"], defaultHandler: "webwindows.system.file-preview", previewProvider: "webwindows.system.file-preview" },
    { id: "webwindows.web.javascript", extensions: [".js", ".mjs"], mimeTypes: ["application/javascript", "text/javascript"], category: "web", icon: "system:web", handlers: ["webwindows.system.file-preview"], defaultHandler: "webwindows.system.file-preview", previewProvider: "webwindows.system.file-preview" },
    { id: "webwindows.image.png", extensions: [".png"], mimeTypes: ["image/png"], category: "image", icon: "system:image", handlers: ["webwindows.photos", "webwindows.paint", "webwindows.system.file-preview"], defaultHandler: "webwindows.photos", previewProvider: "webwindows.photos" },
    { id: "webwindows.image.jpeg", extensions: [".jpg", ".jpeg"], mimeTypes: ["image/jpeg"], category: "image", icon: "system:image", handlers: ["webwindows.photos", "webwindows.paint", "webwindows.system.file-preview"], defaultHandler: "webwindows.photos", previewProvider: "webwindows.photos" },
    { id: "webwindows.image.gif", extensions: [".gif"], mimeTypes: ["image/gif"], category: "image", icon: "system:image", handlers: ["webwindows.photos", "webwindows.system.file-preview"], defaultHandler: "webwindows.photos", previewProvider: "webwindows.photos" },
    { id: "webwindows.image.webp", extensions: [".webp"], mimeTypes: ["image/webp"], category: "image", icon: "system:image", handlers: ["webwindows.photos", "webwindows.paint", "webwindows.system.file-preview"], defaultHandler: "webwindows.photos", previewProvider: "webwindows.photos" },
    { id: "webwindows.image.svg", extensions: [".svg"], mimeTypes: ["image/svg+xml"], category: "image", icon: "system:image", handlers: ["webwindows.photos", "webwindows.system.file-preview"], defaultHandler: "webwindows.photos", previewProvider: "webwindows.photos" },
    { id: "webwindows.image.bmp", extensions: [".bmp"], mimeTypes: ["image/bmp"], category: "image", icon: "system:image", handlers: ["webwindows.photos", "webwindows.paint", "webwindows.system.file-preview"], defaultHandler: "webwindows.photos", previewProvider: "webwindows.photos" },
    { id: "webwindows.image.ico", extensions: [".ico"], mimeTypes: ["image/x-icon", "image/vnd.microsoft.icon"], category: "image", icon: "system:image", handlers: ["webwindows.photos", "webwindows.system.file-preview"], defaultHandler: "webwindows.photos", previewProvider: "webwindows.photos" },
    { id: "webwindows.audio.mpeg", extensions: [".mp3"], mimeTypes: ["audio/mpeg"], category: "audio", icon: "system:audio", handlers: ["webwindows.media-player"], defaultHandler: "webwindows.media-player", previewProvider: "webwindows.media-player" },
    { id: "webwindows.audio.wav", extensions: [".wav"], mimeTypes: ["audio/wav", "audio/x-wav"], category: "audio", icon: "system:audio", handlers: ["webwindows.media-player"], defaultHandler: "webwindows.media-player", previewProvider: "webwindows.media-player" },
    { id: "webwindows.audio.ogg", extensions: [".ogg", ".oga"], mimeTypes: ["audio/ogg"], category: "audio", icon: "system:audio", handlers: ["webwindows.media-player"], defaultHandler: "webwindows.media-player", previewProvider: "webwindows.media-player" },
    { id: "webwindows.audio.mp4", extensions: [".m4a"], mimeTypes: ["audio/mp4"], category: "audio", icon: "system:audio", handlers: ["webwindows.media-player"], defaultHandler: "webwindows.media-player", previewProvider: "webwindows.media-player" },
    { id: "webwindows.audio.aac", extensions: [".aac"], mimeTypes: ["audio/aac"], category: "audio", icon: "system:audio", handlers: ["webwindows.media-player"], defaultHandler: "webwindows.media-player", previewProvider: "webwindows.media-player" },
    { id: "webwindows.video.mp4", extensions: [".mp4"], mimeTypes: ["video/mp4"], category: "video", icon: "system:video", handlers: ["webwindows.media-player"], defaultHandler: "webwindows.media-player", previewProvider: "webwindows.media-player" },
    { id: "webwindows.video.webm", extensions: [".webm"], mimeTypes: ["video/webm"], category: "video", icon: "system:video", handlers: ["webwindows.media-player"], defaultHandler: "webwindows.media-player", previewProvider: "webwindows.media-player" },
    { id: "webwindows.video.quicktime", extensions: [".mov"], mimeTypes: ["video/quicktime"], category: "video", icon: "system:video", handlers: ["webwindows.media-player"], defaultHandler: "webwindows.media-player", previewProvider: "webwindows.media-player" },
    { id: "webwindows.video.matroska", extensions: [".mkv"], mimeTypes: ["video/x-matroska"], category: "video", icon: "system:video", handlers: ["webwindows.media-player"], defaultHandler: "webwindows.media-player", previewProvider: "webwindows.media-player" },
    { id: "webwindows.document.pdf", extensions: [".pdf"], mimeTypes: ["application/pdf"], category: "document", icon: "system:document", handlers: ["webwindows.system.file-preview"], defaultHandler: "webwindows.system.file-preview", previewProvider: "webwindows.system.file-preview" },
    { id: "webwindows.document.word", extensions: [".doc", ".docx"], mimeTypes: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"], category: "document", icon: "system:document", handlers: ["com.aryansoft.webwindows.write"], defaultHandler: "com.aryansoft.webwindows.write", previewProvider: "com.aryansoft.webwindows.write" },
    { id: "webwindows.document.spreadsheet", extensions: [".xls", ".xlsx"], mimeTypes: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"], category: "document", icon: "system:document", handlers: ["com.aryansoft.webwindows.sheet"], defaultHandler: "com.aryansoft.webwindows.sheet", previewProvider: "com.aryansoft.webwindows.sheet" },
    { id: "webwindows.document.presentation", extensions: [".ppt", ".pptx"], mimeTypes: ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"], category: "document", icon: "system:document", handlers: ["com.aryansoft.webwindows.slide"], defaultHandler: "com.aryansoft.webwindows.slide", previewProvider: "com.aryansoft.webwindows.slide" },
    { id: "webwindows.archive.zip", extensions: [".zip"], mimeTypes: ["application/zip", "application/x-zip-compressed"], category: "archive", icon: "system:archive", handlers: [], defaultHandler: null, previewProvider: null },
    { id: "webwindows.archive.tar", extensions: [".tar"], mimeTypes: ["application/x-tar"], category: "archive", icon: "system:archive", handlers: [], defaultHandler: null, previewProvider: null },
    { id: "webwindows.archive.gzip", extensions: [".gz", ".tgz"], mimeTypes: ["application/gzip", "application/x-gzip"], category: "archive", icon: "system:archive", handlers: [], defaultHandler: null, previewProvider: null },
    { id: "webwindows.archive.7z", extensions: [".7z"], mimeTypes: ["application/x-7z-compressed"], category: "archive", icon: "system:archive", handlers: [], defaultHandler: null, previewProvider: null },
    { id: "webwindows.package.application", extensions: [".wwapp"], mimeTypes: ["application/vnd.webwindows.app"], category: "package", icon: "system:package", handlers: ["webwindows.system.app-installer"], defaultHandler: "webwindows.system.app-installer", previewProvider: null, packageKind: "app" },
    { id: "webwindows.package.theme", extensions: [".wwtheme"], mimeTypes: ["application/vnd.webwindows.theme"], category: "package", icon: "system:package", handlers: ["webwindows.system.theme-installer"], defaultHandler: "webwindows.system.theme-installer", previewProvider: null, packageKind: "theme" },
    { id: "webwindows.package.system", extensions: [".wwpkg"], mimeTypes: ["application/vnd.webwindows.package"], category: "package", icon: "system:package", handlers: ["webwindows.system.package-installer"], defaultHandler: "webwindows.system.package-installer", previewProvider: null, packageKind: "system" },
    { id: UNKNOWN_ID, extensions: [], mimeTypes: [], category: "file", icon: "system:file", handlers: [], defaultHandler: null, previewProvider: null }
  ];

  // ------------------------------------------------------------ normalization
  function normalizeExtension(value) {
    var text = String(value == null ? "" : value).trim().toLowerCase();
    if (!text) return "";
    if (text.charAt(0) !== ".") text = "." + text;
    if (text === ".") return "";
    return text;
  }

  function normalizeMime(value) {
    var text = String(value == null ? "" : value).trim().toLowerCase();
    if (!text) return "";
    return text.split(";")[0].trim();
  }

  function baseNameOf(name) {
    var text = String(name == null ? "" : name);
    var slash = Math.max(text.lastIndexOf("/"), text.lastIndexOf("\\"));
    return slash >= 0 ? text.slice(slash + 1) : text;
  }

  function extensionOf(name) {
    var base = baseNameOf(name);
    if (!base || base.charAt(0) === "." && base.indexOf(".", 1) < 0) return "";
    var dot = base.lastIndexOf(".");
    if (dot <= 0 || dot === base.length - 1) return "";
    return normalizeExtension(base.slice(dot));
  }

  function storage() {
    try {
      if (typeof localStorage !== "undefined" && localStorage) return localStorage;
    } catch (_) {}
    try {
      if (typeof window !== "undefined" && window && window.localStorage) return window.localStorage;
    } catch (_) {}
    return null;
  }

  function readJson(key, fallback) {
    var store = storage();
    if (!store) return fallback;
    try {
      var raw = store.getItem(key);
      if (raw == null) return fallback;
      var parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    var store = storage();
    if (!store) return;
    try {
      store.setItem(key, JSON.stringify(value));
    } catch (_) {}
  }

  function emit(name, detail) {
    try {
      var target = (typeof window !== "undefined" && window) || (typeof globalThis !== "undefined" && globalThis);
      if (target && typeof target.dispatchEvent === "function" && typeof CustomEvent === "function") {
        target.dispatchEvent(new CustomEvent(name, { detail: detail }));
      }
    } catch (_) {}
  }

  // ------------------------------------------------------------------- state
  var builtInById = new Map();
  var builtInByExt = new Map();
  var builtInByMime = new Map();
  BUILT_IN_TYPES.forEach(function (def) {
    builtInById.set(def.id, freezeDef(def));
    (def.extensions || []).forEach(function (ext) {
      var key = normalizeExtension(ext);
      if (key && !builtInByExt.has(key)) builtInByExt.set(key, def.id);
    });
    (def.mimeTypes || []).forEach(function (mime) {
      var key = normalizeMime(mime);
      if (key && !builtInByMime.has(key)) builtInByMime.set(key, def.id);
    });
  });

  // installed layer: { types: {id: def}, owners: {appId: [typeId]} }
  var installedTypes = new Map();
  var installedOwners = new Map();

  function loadInstalled() {
    installedTypes.clear();
    installedOwners.clear();
    var saved = readJson(INSTALLED_KEY, null);
    if (!saved || typeof saved !== "object") return;
    var types = saved.types && typeof saved.types === "object" ? saved.types : {};
    Object.keys(types).forEach(function (id) {
      try {
        var def = sanitizeInstalledDef(types[id]);
        if (def) installedTypes.set(id, def);
      } catch (_) {}
    });
    var owners = saved.owners && typeof saved.owners === "object" ? saved.owners : {};
    Object.keys(owners).forEach(function (appId) {
      if (Array.isArray(owners[appId])) installedOwners.set(appId, owners[appId].filter(Boolean));
    });
  }

  function saveInstalled() {
    var types = {};
    installedTypes.forEach(function (def, id) { types[id] = def; });
    var owners = {};
    installedOwners.forEach(function (list, appId) { owners[appId] = list; });
    writeJson(INSTALLED_KEY, { version: 1, types: types, owners: owners });
  }

  var userDefaults = {};
  function loadUserDefaults() {
    var saved = readJson(USER_DEFAULTS_KEY, {});
    userDefaults = saved && typeof saved === "object" ? saved : {};
  }
  function saveUserDefaults() {
    writeJson(USER_DEFAULTS_KEY, userDefaults);
  }

  function freezeDef(def) {
    return Object.freeze({
      id: def.id,
      extensions: Object.freeze((def.extensions || []).slice()),
      mimeTypes: Object.freeze((def.mimeTypes || []).slice()),
      category: def.category || "file",
      icon: def.icon || CATEGORY_ICONS[def.category] || CATEGORY_ICONS.file,
      handlers: Object.freeze((def.handlers || []).slice()),
      defaultHandler: def.defaultHandler || null,
      previewProvider: def.previewProvider || null,
      packageKind: def.packageKind || null,
      ownerAppId: def.ownerAppId || null,
      source: def.source || "built-in"
    });
  }

  function cloneDef(def) {
    return {
      id: def.id,
      extensions: (def.extensions || []).slice(),
      mimeTypes: (def.mimeTypes || []).slice(),
      category: def.category || "file",
      icon: def.icon,
      handlers: (def.handlers || []).slice(),
      defaultHandler: def.defaultHandler || null,
      previewProvider: def.previewProvider || null,
      packageKind: def.packageKind || null,
      ownerAppId: def.ownerAppId || null,
      source: def.source || "installed"
    };
  }

  function sanitizeInstalledDef(raw) {
    if (!raw || typeof raw !== "object" || !ID_PATTERN.test(String(raw.id || ""))) return null;
    var def = cloneDef(raw);
    def.extensions = def.extensions.map(normalizeExtension).filter(function (e, i, a) { return e && EXT_PATTERN.test(e) && a.indexOf(e) === i; });
    def.mimeTypes = def.mimeTypes.map(normalizeMime).filter(function (m, i, a) { return m && a.indexOf(m) === i; });
    def.source = "installed";
    return freezeDef(def);
  }

  // Merge installed handlers over a built-in base without mutating the base.
  function mergedView(id) {
    var base = builtInById.get(id);
    var extra = installedTypes.get(id);
    if (!base && !extra) return null;
    if (base && !extra) return applyUserDefault(base);
    if (!base && extra) return applyUserDefault(extra);
    var handlers = base.handlers.slice();
    extra.handlers.forEach(function (h) { if (handlers.indexOf(h) < 0) handlers.push(h); });
    var view = freezeDef({
      id: base.id,
      extensions: base.extensions.slice(),
      mimeTypes: base.mimeTypes.slice().concat(extra.mimeTypes.filter(function (m) { return base.mimeTypes.indexOf(m) < 0; })),
      category: base.category,
      icon: extra.icon && extra.icon !== CATEGORY_ICONS[extra.category] ? extra.icon : base.icon,
      handlers: handlers,
      defaultHandler: base.defaultHandler,
      previewProvider: extra.previewProvider || base.previewProvider,
      packageKind: base.packageKind || extra.packageKind || null,
      source: "built-in+installed"
    });
    return applyUserDefault(view);
  }

  function applyUserDefault(def) {
    // User overrides are resolved via effectiveDefault() at read time and
    // never mutate the stored system definition. Stale overrides (handler
    // uninstalled) are inert for launch but preserved for reinstall.
    return def;
  }

  function effectiveDefault(def) {
    var override = userDefaults[def.id];
    if (override && def.handlers.indexOf(override) >= 0) return override;
    return def.defaultHandler || null;
  }

  // ------------------------------------------------------------------ lookup
  function findIdByExtension(ext) {
    var key = normalizeExtension(ext);
    if (!key) return null;
    var owned = null;
    installedTypes.forEach(function (def) {
      if (!owned && def.extensions.indexOf(key) >= 0) owned = def.id;
    });
    if (owned) return owned;
    return builtInByExt.get(key) || null;
  }

  function findIdByMime(mime) {
    var key = normalizeMime(mime);
    if (!key) return null;
    var owned = null;
    installedTypes.forEach(function (def) {
      if (!owned && def.mimeTypes.indexOf(key) >= 0) owned = def.id;
    });
    if (owned) return owned;
    return builtInByMime.get(key) || null;
  }

  function toFileInput(file) {
    if (typeof file === "string") return { name: file };
    return file && typeof file === "object" ? file : {};
  }

  function resolve(file) {
    var input = toFileInput(file);
    var name = input.name != null ? String(input.name) : (input.path != null ? String(input.path) : "");
    var base = baseNameOf(name);
    var ext = input.extension != null && String(input.extension) !== ""
      ? normalizeExtension(input.extension)
      : extensionOf(base);
    var mime = normalizeMime(input.mimeType != null ? input.mimeType : input.type);
    var directId = input.typeId != null ? String(input.typeId) : (input.type != null && ID_PATTERN.test(String(input.type)) && String(input.type).indexOf("/") < 0 ? String(input.type) : "");

    var id = null;
    if (directId && (builtInById.has(directId) || installedTypes.has(directId))) {
      id = directId;
    }
    if (!id && base && EXACT_FILENAMES[String(base).toUpperCase()]) {
      id = EXACT_FILENAMES[String(base).toUpperCase()];
    }
    if (!id && ext) id = findIdByExtension(ext);
    if (!id && mime) id = findIdByMime(mime);
    if (!id) id = UNKNOWN_ID;

    var def = mergedView(id) || mergedView(UNKNOWN_ID);
    return {
      id: def.id,
      extension: ext || "",
      fileName: base || name || "",
      mime: mime || (def.mimeTypes[0] || ""),
      category: def.category,
      icon: def.icon || CATEGORY_ICONS[def.category] || CATEGORY_ICONS.file,
      handlers: def.handlers.slice(),
      defaultHandler: effectiveDefault(def),
      systemDefaultHandler: def.defaultHandler || null,
      userOverride: userDefaults[def.id] || null,
      previewProvider: def.previewProvider || null,
      packageKind: def.packageKind || null,
      source: def.source
    };
  }

  function get(typeId) {
    if (!ID_PATTERN.test(String(typeId || ""))) return null;
    var def = mergedView(String(typeId));
    if (!def) return null;
    return {
      id: def.id,
      extensions: def.extensions.slice(),
      mimeTypes: def.mimeTypes.slice(),
      category: def.category,
      icon: def.icon,
      handlers: def.handlers.slice(),
      defaultHandler: effectiveDefault(def),
      systemDefaultHandler: def.defaultHandler || null,
      userOverride: userDefaults[def.id] || null,
      previewProvider: def.previewProvider || null,
      packageKind: def.packageKind || null,
      source: def.source
    };
  }

  function list() {
    var ids = {};
    builtInById.forEach(function (_, id) { ids[id] = true; });
    installedTypes.forEach(function (_, id) { ids[id] = true; });
    return Object.keys(ids).map(get).filter(Boolean);
  }

  // --------------------------------------------------------------- mutations
  function validateRegisterDef(def) {
    if (!def || typeof def !== "object") throw new Error("fileTypes.register 需要传入类型定义对象。");
    if (!ID_PATTERN.test(String(def.id || ""))) throw new Error("类型 ID 无效：" + String(def.id || "(empty)"));
    var extensions = (def.extensions || []).map(normalizeExtension).filter(Boolean);
    extensions.forEach(function (ext) {
      if (!EXT_PATTERN.test(ext)) throw new Error("扩展名无效：" + ext);
    });
    var mimeTypes = (def.mimeTypes || []).map(normalizeMime).filter(Boolean);
    var handlers = (def.handlers || []).map(function (h) { return String(h || "").trim(); }).filter(Boolean);
    handlers.forEach(function (h) {
      if (!ID_PATTERN.test(h) && !/^[A-Za-z0-9._-]+$/.test(h)) throw new Error("Handler ID 无效：" + h);
    });
    if (def.defaultHandler != null && String(def.defaultHandler) !== "" && handlers.indexOf(String(def.defaultHandler)) < 0) {
      throw new Error("defaultHandler 必须是 handlers 成员之一。");
    }
    return {
      id: String(def.id),
      extensions: extensions.filter(function (e, i, a) { return a.indexOf(e) === i; }),
      mimeTypes: mimeTypes.filter(function (m, i, a) { return a.indexOf(m) === i; }),
      category: String(def.category || "file"),
      icon: String(def.icon || CATEGORY_ICONS[def.category] || CATEGORY_ICONS.file),
      handlers: handlers.filter(function (h, i, a) { return a.indexOf(h) === i; }),
      defaultHandler: def.defaultHandler != null && String(def.defaultHandler) !== "" ? String(def.defaultHandler) : null,
      previewProvider: def.previewProvider != null && String(def.previewProvider) !== "" ? String(def.previewProvider) : null,
      packageKind: def.packageKind != null ? String(def.packageKind) : null,
      ownerAppId: def.ownerAppId != null ? String(def.ownerAppId) : null
    };
  }

  // options: { ownerAppId, allowBuiltinOverride }
  function register(def, options) {
    var clean = validateRegisterDef(def);
    var opts = options && typeof options === "object" ? options : {};
    if (opts.ownerAppId) clean.ownerAppId = String(opts.ownerAppId);
    var base = builtInById.get(clean.id);
    if (base && !opts.allowBuiltinOverride) {
      // Extend-only: merge handlers/mime into the installed overlay so a new
      // install can never silently rewrite a built-in system definition.
      var overlay = installedTypes.get(clean.id) ? cloneDef(installedTypes.get(clean.id)) : { id: clean.id, extensions: [], mimeTypes: [], category: base.category, icon: base.icon, handlers: [], defaultHandler: null, previewProvider: null, packageKind: null, ownerAppId: null, source: "installed" };
      clean.handlers.forEach(function (h) { if (overlay.handlers.indexOf(h) < 0) overlay.handlers.push(h); });
      clean.mimeTypes.forEach(function (m) { if (overlay.mimeTypes.indexOf(m) < 0) overlay.mimeTypes.push(m); });
      if (!overlay.previewProvider && clean.previewProvider) overlay.previewProvider = clean.previewProvider;
      installedTypes.set(clean.id, freezeDef(overlay));
    } else {
      var prev = installedTypes.get(clean.id);
      var mergedHandlers = (prev ? prev.handlers.slice() : []).concat(clean.handlers.filter(function (h) { return !(prev && prev.handlers.indexOf(h) >= 0); }));
      clean.handlers = mergedHandlers;
      if (prev && !clean.defaultHandler) clean.defaultHandler = prev.defaultHandler;
      clean.source = "installed";
      installedTypes.set(clean.id, freezeDef(clean));
    }
    if (clean.ownerAppId) {
      var owned = installedOwners.get(clean.ownerAppId) || [];
      if (owned.indexOf(clean.id) < 0) owned.push(clean.id);
      installedOwners.set(clean.ownerAppId, owned);
    }
    saveInstalled();
    emit("webwindows:file-types-changed", { typeId: clean.id });
    return get(clean.id);
  }

  // unregister(typeId) removes an installed type; unregister(typeId, appId)
  // removes only that app's handler (used by uninstall cleanup).
  function unregister(typeId, appId) {
    var id = String(typeId || "");
    if (appId != null) {
      var target = String(appId);
      var changed = false;
      var overlay = installedTypes.get(id);
      if (overlay && overlay.handlers.indexOf(target) >= 0) {
        var next = cloneDef(overlay);
        next.handlers = next.handlers.filter(function (h) { return h !== target; });
        if (next.defaultHandler === target) next.defaultHandler = next.handlers[0] || null;
        if (next.previewProvider === target) next.previewProvider = null;
        installedTypes.set(id, freezeDef(next));
        changed = true;
      }
      var owned = installedOwners.get(target);
      if (owned) {
        installedOwners.set(target, owned.filter(function (t) { return t !== id; }));
        if (installedOwners.get(target).length === 0) installedOwners.delete(target);
      }
      // Owned shell types keep resolving (with zero handlers) so user files
      // stay recognized as their type instead of degrading to unknown.
      if (changed) {
        saveInstalled();
        emit("webwindows:file-types-changed", { typeId: id, removedHandler: target });
      }
      return changed;
    }
    if (builtInById.has(id)) return false;
    var removed = installedTypes.delete(id);
    if (userDefaults[id] != null) {
      // Keep the user override for reinstall; it is inert while type is gone.
    }
    if (removed) {
      saveInstalled();
      emit("webwindows:file-types-changed", { typeId: id, removed: true });
    }
    return removed;
  }

  function getHandlers(typeId) {
    var def = get(typeId);
    return def ? def.handlers : [];
  }

  function getDefaultHandler(typeId) {
    var def = get(typeId);
    return def ? def.defaultHandler : null;
  }

  function setDefaultHandler(typeId, appId, options) {
    var id = String(typeId || "");
    var def = mergedView(id);
    if (!def) throw new Error("未知的文件类型：" + id);
    var handler = String(appId || "");
    if (!handler) throw new Error("应用 ID 不能为空。");
    var opts = options && typeof options === "object" ? options : {};
    if (def.handlers.indexOf(handler) < 0 && opts.allowUnknown !== true) {
      throw new Error("应用 " + handler + " 尚未注册为类型 " + id + " 的 Handler。");
    }
    userDefaults[id] = handler;
    saveUserDefaults();
    emit("webwindows:file-default-changed", { typeId: id, handler: handler });
    return get(id);
  }

  function clearDefaultHandler(typeId) {
    var id = String(typeId || "");
    if (userDefaults[id] != null) {
      delete userDefaults[id];
      saveUserDefaults();
      emit("webwindows:file-default-changed", { typeId: id, handler: null });
      return true;
    }
    return false;
  }

  // ------------------------------------------------------- app manifest sync
  var ACTION_ALLOW = { open: true, edit: true, preview: true, print: true, share: true };

  function validateFileAssociation(entry) {
    var errors = [];
    if (!entry || typeof entry !== "object") return { ok: false, errors: ["fileAssociation 必须是对象。"] };
    if (!ID_PATTERN.test(String(entry.type || ""))) errors.push("association.type 非法：" + String(entry.type || "(empty)"));
    var extensions = Array.isArray(entry.extensions) ? entry.extensions.map(normalizeExtension).filter(Boolean) : [];
    var mimeTypes = Array.isArray(entry.mimeTypes) ? entry.mimeTypes.map(normalizeMime).filter(Boolean) : [];
    if (extensions.length === 0 && mimeTypes.length === 0) errors.push("association 至少需要一个 extension 或 mimeType。");
    extensions.forEach(function (ext) { if (!EXT_PATTERN.test(ext)) errors.push("扩展名无效：" + ext); });
    var actions = Array.isArray(entry.actions) && entry.actions.length ? entry.actions : ["open"];
    actions.forEach(function (a) { if (!ACTION_ALLOW[String(a)]) errors.push("未知 action：" + String(a)); });
    return { ok: errors.length === 0, errors: errors, clean: { type: String(entry.type || ""), extensions: extensions, mimeTypes: mimeTypes, icon: entry.icon != null ? String(entry.icon) : null, actions: actions } };
  }

  function installAppAssociations(appId, associations) {
    if (!ID_PATTERN.test(String(appId || ""))) throw new Error("应用 ID 无效：" + String(appId || "(empty)"));
    var list = Array.isArray(associations) ? associations : [];
    var results = [];
    list.forEach(function (entry) {
      var checked = validateFileAssociation(entry);
      if (!checked.ok) throw new Error("应用 " + appId + " 的 fileAssociations 非法：" + checked.errors.join("；"));
      var clean = checked.clean;
      var existing = mergedView(clean.type);
      if (existing) {
        var overlay = installedTypes.get(clean.type) ? cloneDef(installedTypes.get(clean.type)) : { id: clean.type, extensions: [], mimeTypes: [], category: existing.category, icon: existing.icon, handlers: [], defaultHandler: null, previewProvider: null, packageKind: null, source: "installed" };
        // Never steal the default: first default wins, new installs append.
        if (overlay.handlers.indexOf(appId) < 0) overlay.handlers.push(appId);
        clean.extensions.forEach(function (e) { if (overlay.extensions.indexOf(e) < 0 && builtInByExt.get(e) !== clean.type && !findInstalledExtOwner(e)) overlay.extensions.push(e); });
        clean.mimeTypes.forEach(function (m) { if (overlay.mimeTypes.indexOf(m) < 0) overlay.mimeTypes.push(m); });
        if (!overlay.previewProvider && clean.actions.indexOf("preview") >= 0) overlay.previewProvider = appId;
        if (clean.icon && (!overlay.icon || overlay.icon === CATEGORY_ICONS[overlay.category])) overlay.icon = clean.icon;
        installedTypes.set(clean.type, freezeDef(overlay));
      } else {
        register({ id: clean.type, extensions: clean.extensions, mimeTypes: clean.mimeTypes, category: guessCategory(clean), icon: clean.icon || "system:file", handlers: [appId], defaultHandler: appId, previewProvider: clean.actions.indexOf("preview") >= 0 ? appId : null }, { ownerAppId: appId });
      }
      var owned = installedOwners.get(appId) || [];
      if (owned.indexOf(clean.type) < 0) { owned.push(clean.type); installedOwners.set(appId, owned); }
      results.push(clean.type);
    });
    saveInstalled();
    emit("webwindows:file-types-changed", { appId: appId, types: results });
    return results;
  }

  function findInstalledExtOwner(ext) {
    var found = null;
    installedTypes.forEach(function (def) {
      if (!found && def.extensions.indexOf(ext) >= 0) found = def.id;
    });
    return found;
  }

  function guessCategory(clean) {
    var ext = (clean.extensions[0] || "").toLowerCase();
    if (/\.(png|jpe?g|gif|webp|svg|bmp|ico)$/.test(ext)) return "image";
    if (/\.(mp3|wav|ogg|m4a|aac)$/.test(ext)) return "audio";
    if (/\.(mp4|webm|mov|mkv)$/.test(ext)) return "video";
    if (/\.(zip|tar|gz|tgz|7z)$/.test(ext)) return "archive";
    if (/\.(html?|css|js|mjs)$/.test(ext)) return "web";
    if (/\.(pdf|docx?|xlsx?|pptx?)$/.test(ext)) return "document";
    var mime = (clean.mimeTypes[0] || "").toLowerCase();
    if (mime.indexOf("image/") === 0) return "image";
    if (mime.indexOf("audio/") === 0) return "audio";
    if (mime.indexOf("video/") === 0) return "video";
    if (mime.indexOf("text/") === 0 || mime === "application/json") return "text";
    return "file";
  }

  // Accepts both new fileAssociations and legacy fileHandlers shapes so the
  // existing catalog (system-apps.json) syncs without a data migration.
  function syncAppManifest(app) {
    if (!app || typeof app !== "object" || !app.id) return [];
    var out = [];
    if (Array.isArray(app.fileAssociations) && app.fileAssociations.length) {
      out = out.concat(installAppAssociations(app.id, app.fileAssociations));
    }
    (Array.isArray(app.fileHandlers) ? app.fileHandlers : []).forEach(function (handler) {
      if (!handler || typeof handler !== "object") return;
      var extensions = (handler.extensions || []).map(normalizeExtension).filter(Boolean);
      var mimeTypes = (handler.mimeTypes || []).map(normalizeMime).filter(Boolean);
      extensions.concat(mimeTypes.map(function () { return ""; }).slice(0, 0));
      extensions.forEach(function (ext) {
        var typeId = findIdByExtension(ext) || findInstalledExtOwner(ext);
        if (!typeId) return;
        var overlay = installedTypes.get(typeId) ? cloneDef(installedTypes.get(typeId)) : null;
        var base = mergedView(typeId);
        if (overlay) {
          if (overlay.handlers.indexOf(app.id) < 0) overlay.handlers.push(app.id);
          installedTypes.set(typeId, freezeDef(overlay));
        } else if (base && base.handlers.indexOf(app.id) < 0) {
          installedTypes.set(typeId, freezeDef({ id: typeId, extensions: [], mimeTypes: mimeTypes.filter(function (m) { return base.mimeTypes.indexOf(m) < 0; }), category: base.category, icon: base.icon, handlers: [app.id], defaultHandler: null, previewProvider: null, source: "installed" }));
        }
      });
      // MIME-only legacy handlers attach to their MIME type.
      if (extensions.length === 0) {
        mimeTypes.forEach(function (mime) {
          var typeId = findIdByMime(mime);
          if (!typeId) return;
          var base = mergedView(typeId);
          if (base && base.handlers.indexOf(app.id) < 0) {
            var overlay = installedTypes.get(typeId) ? cloneDef(installedTypes.get(typeId)) : { id: typeId, extensions: [], mimeTypes: [], category: base.category, icon: base.icon, handlers: [], defaultHandler: null, previewProvider: null, source: "installed" };
            overlay.handlers.push(app.id);
            installedTypes.set(typeId, freezeDef(overlay));
          }
        });
      }
      var owned = installedOwners.get(app.id) || [];
      saveInstalled();
      void owned;
    });
    return out;
  }

  function uninstallAppAssociations(appId) {
    var id = String(appId || "");
    var changed = [];
    var ids = [];
    builtInById.forEach(function (_, typeId) { ids.push(typeId); });
    installedTypes.forEach(function (_, typeId) { if (ids.indexOf(typeId) < 0) ids.push(typeId); });
    ids.forEach(function (typeId) {
      var view = mergedView(typeId);
      if (view && view.handlers.indexOf(id) >= 0) {
        unregister(typeId, id);
        changed.push(typeId);
      }
    });
    // Drop empty non-built-in shells owned solely by this app.
    (installedOwners.get(id) || []).slice().forEach(function (typeId) {
      if (!builtInById.has(typeId)) {
        var still = installedTypes.get(typeId);
        if (still && still.handlers.length === 0) {
          // Keep the shell so user files stay typed (Case 7): do NOT delete.
        }
      }
    });
    installedOwners.delete(id);
    saveInstalled();
    // User override pointing at the removed app falls back silently; the
    // stored override is kept so reinstalling restores the user choice.
    emit("webwindows:file-types-changed", { appId: id, removedFrom: changed });
    // Never touches user files: this function only edits handler references.
    return changed;
  }

  // Upgrade/downgrade: reconcile an app's associations to a new manifest.
  function syncAppUpgrade(appId, nextAssociations) {
    var wanted = {};
    (Array.isArray(nextAssociations) ? nextAssociations : []).forEach(function (entry) {
      if (entry && entry.type) wanted[String(entry.type)] = entry;
    });
    var previously = (installedOwners.get(String(appId)) || []).slice();
    var result = installAppAssociations(appId, Array.isArray(nextAssociations) ? nextAssociations : []);
    previously.forEach(function (typeId) {
      if (!wanted[typeId]) unregister(typeId, appId);
    });
    return result;
  }

  // ------------------------------------------------------------- ww packages
  function checkManifestCommon(manifest, expectedFormat) {
    var errors = [];
    if (!manifest || typeof manifest !== "object") return ["manifest 必须是对象。"];
    if (manifest.format !== expectedFormat) errors.push("format 必须为 " + expectedFormat + "。");
    if (typeof manifest.formatVersion !== "number" || manifest.formatVersion < 1) errors.push("formatVersion 非法。");
    if (!ID_PATTERN.test(String(manifest.id || ""))) errors.push("id 非法。");
    if (!manifest.name || typeof manifest.name !== "string") errors.push("name 缺失。");
    if (!/^[0-9]+(?:\.[0-9]+){1,3}(?:[._-][a-z0-9]+)?$/i.test(String(manifest.version || ""))) errors.push("version 非法。");
    if (!manifest.entry || typeof manifest.entry !== "string" || /^(?:\/|[A-Za-z]:|.*\\\\)/.test(manifest.entry) || manifest.entry.indexOf("..") >= 0) errors.push("entry 非法。");
    if (manifest.fileAssociations !== undefined) {
      if (!Array.isArray(manifest.fileAssociations)) {
        errors.push("fileAssociations 必须是数组。");
      } else {
        manifest.fileAssociations.forEach(function (entry, index) {
          var checked = validateFileAssociation(entry);
          if (!checked.ok) errors.push("fileAssociations[" + index + "]：" + checked.errors.join("；"));
        });
      }
    }
    return errors;
  }

  function validateAppPackageManifest(manifest) {
    var errors = checkManifestCommon(manifest, "webwindows.app");
    return { ok: errors.length === 0, errors: errors };
  }

  function validateThemePackageManifest(manifest) {
    var errors = checkManifestCommon(manifest, "webwindows.theme");
    return { ok: errors.length === 0, errors: errors };
  }

  function validateSystemPackageManifest(manifest) {
    // .wwpkg shares the envelope but is system-grade: permissions capable of
    // system/runtime/native/device/administrator MUST be rejected here until
    // the dedicated system-package security design lands (v1 reserves only).
    var errors = checkManifestCommon(manifest, "webwindows.package");
    var perms = Array.isArray(manifest.permissions) ? manifest.permissions.map(String) : [];
    var blocked = ["system", "runtime", "native", "device", "administrator"];
    perms.forEach(function (p) {
      if (blocked.indexOf(String(p).toLowerCase()) >= 0) errors.push("系统级权限预留未开放：" + p);
    });
    return { ok: errors.length === 0, errors: errors };
  }

  // Structural check only (extension alone never proves a valid package).
  function validateWwAppStructure(fileList, manifest) {
    var errors = [];
    var files = Array.isArray(fileList) ? fileList.map(String) : [];
    var has = function (name) { return files.indexOf(name) >= 0; };
    if (!has("manifest.json")) errors.push("缺少 manifest.json。");
    var checked = validateAppPackageManifest(manifest);
    errors = errors.concat(checked.errors);
    if (checked.ok && !has(String(manifest.entry || ""))) errors.push("缺少入口文件：" + manifest.entry);
    return { ok: errors.length === 0, errors: errors };
  }

  // --------------------------------------------------------------- UI helpers
  function getIcon(fileOrTypeId) {
    if (typeof fileOrTypeId === "string" && ID_PATTERN.test(fileOrTypeId) && fileOrTypeId.indexOf("/") < 0 && mergedView(fileOrTypeId)) {
      var def = get(fileOrTypeId);
      return (def && def.icon) || CATEGORY_ICONS.file;
    }
    return resolve(fileOrTypeId).icon;
  }

  function getPreviewProvider(typeId) {
    var def = get(String(typeId || ""));
    return def ? def.previewProvider : null;
  }

  // Data for an "打开方式 >" submenu. No DOM here; hosts render natively.
  function getOpenWithMenu(file) {
    var resolved = resolve(file);
    return {
      fileName: resolved.fileName,
      typeId: resolved.id,
      extension: resolved.extension,
      handlers: resolved.handlers.slice(),
      defaultHandler: resolved.defaultHandler,
      unknown: resolved.id === UNKNOWN_ID
    };
  }

  function isCloudResource(file) {
    var input = toFileInput(file);
    return input && (input.protocol === "webwindows-cloud-resource" || (input.url && input.path !== undefined && input.protocol !== undefined));
  }

  function launchApp(appId, file) {
    var apps = host().apps;
    if (!apps || typeof apps.launch !== "function") throw new Error("应用注册表尚未就绪。");
    var input = toFileInput(file);
    var context = input && typeof input === "object" && input.launchContext ? input.launchContext : undefined;
    return apps.launch(appId, context);
  }

  function host() {
    try {
      if (typeof window !== "undefined" && window && window.WebWindows) return window.WebWindows;
    } catch (_) {}
    return {};
  }

  // Unified double-click entry: File -> resolve -> defaultHandler -> launch.
  // Returns a result object; never throws for unknown/no-handler (UI shows
  // the "no app" dialog instead). Rejects only when the launcher itself fails.
  async function open(file, options) {
    var resolved = resolve(file);
    var opts = options && typeof options === "object" ? options : {};
    if (resolved.id === UNKNOWN_ID || !resolved.defaultHandler) {
      return { status: resolved.id === UNKNOWN_ID ? "unknown-type" : "no-handler", resolved: resolved };
    }
    if (!opts.allowUninstalled && host().apps && typeof host().apps.isInstalled === "function") {
      try {
        var installed = await host().apps.isInstalled(resolved.defaultHandler);
        if (!installed) {
          // Fall through to the first installed handler before giving up.
          var fallback = null;
          for (var i = 0; i < resolved.handlers.length; i += 1) {
            try {
              if (await host().apps.isInstalled(resolved.handlers[i])) { fallback = resolved.handlers[i]; break; }
            } catch (_) {}
          }
          if (!fallback) return { status: "no-handler", resolved: resolved };
          resolved = get(resolved.id);
          return openWith(file, fallback, opts);
        }
      } catch (_) {}
    }
    if (isCloudResource(file) && typeof hostWindow().openResource === "function") {
      await hostWindow().openResource(file);
      return { status: "opened", resolved: resolved, via: "cloud-resource" };
    }
    await launchApp(resolved.defaultHandler, file);
    return { status: "opened", resolved: resolved, handler: resolved.defaultHandler };
  }

  function hostWindow() {
    try {
      if (typeof window !== "undefined" && window) return window;
    } catch (_) {}
    return {};
  }

  async function openWith(file, appId, options) {
    var resolved = resolve(file);
    var opts = options && typeof options === "object" ? options : {};
    var handler = String(appId || "");
    if (!handler) throw new Error("应用 ID 不能为空。");
    if (resolved.handlers.indexOf(handler) < 0 && opts.allowUnknown !== true) {
      throw new Error("应用 " + handler + " 不支持打开此文件类型。");
    }
    if (opts.makeDefault === true) {
      try { setDefaultHandler(resolved.id, handler, { allowUnknown: opts.allowUnknown === true }); } catch (_) {}
      resolved = resolve(file);
    }
    if (isCloudResource(file) && typeof hostWindow().openResource === "function" && opts.viaCloud !== false) {
      // Cloud resources route through the resource opener after the default
      // choice is recorded; handler-specific cloud adapters stay in resource-open.js.
      await hostWindow().openResource(file);
      return { status: "opened", resolved: resolved, handler: handler, via: "cloud-resource" };
    }
    await launchApp(handler, file);
    return { status: "opened", resolved: resolved, handler: handler };
  }

  // File-dialog compatibility: expand { types:[TypeID], mimeTypes, extensions }
  // into the accept/extensions shape the existing dialog already understands.
  function toAccept(filter) {
    var input = filter && typeof filter === "object" ? filter : {};
    var extensions = {};
    (Array.isArray(input.extensions) ? input.extensions : []).forEach(function (e) {
      var key = normalizeExtension(e);
      if (key) extensions[key] = true;
    });
    (Array.isArray(input.types) ? input.types : []).forEach(function (typeId) {
      var def = get(String(typeId));
      if (def) def.extensions.forEach(function (e) { extensions[e] = true; });
    });
    (Array.isArray(input.mimeTypes) ? input.mimeTypes : []).forEach(function (mime) {
      var key = normalizeMime(mime);
      if (!key) return;
      if (key.slice(-2) === "/*") {
        var prefix = key.slice(0, -1);
        list().forEach(function (def) {
          def.mimeTypes.forEach(function (m) {
            if (m.indexOf(prefix) === 0) def.extensions.forEach(function (e) { extensions[e] = true; });
          });
        });
      } else {
        var typeId = findIdByMime(key);
        var def = typeId ? get(typeId) : null;
        if (def) def.extensions.forEach(function (e) { extensions[e] = true; });
      }
    });
    return Object.keys(extensions).sort();
  }

  function matchesFilter(file, filter) {
    var input = filter && typeof filter === "object" ? filter : {};
    if (!input.types && !input.mimeTypes && !input.extensions) return true;
    var resolved = resolve(file);
    if (Array.isArray(input.types) && input.types.some(function (t) { return String(t) === resolved.id; })) return true;
    if (Array.isArray(input.mimeTypes)) {
      var mime = resolved.mime;
      for (var i = 0; i < input.mimeTypes.length; i += 1) {
        var pattern = normalizeMime(input.mimeTypes[i]);
        if (!pattern) continue;
        if (pattern.slice(-2) === "/*" ? mime.indexOf(pattern.slice(0, -1)) === 0 : mime === pattern) return true;
      }
    }
    if (Array.isArray(input.extensions) && input.extensions.some(function (e) { return normalizeExtension(e) === resolved.extension; })) return true;
    return false;
  }

  // ------------------------------------------------------- legacy bridges
  // Additive wrappers: legacy resolveResource keeps its contract, but prefers
  // the File Type default handler among installed apps when one exists.
  var bridgesInstalled = false;
  function patchAppRegistry() {
    try {
      var w = hostWindow();
      var apps = w && w.WebWindows && w.WebWindows.apps;
      if (!apps || typeof apps.resolveResource !== "function" || apps.resolveResource.__wwFileTypesPatched) return;
      var original = apps.resolveResource.bind(apps);
      var wrapped = async function (resource) {
        var resolved = null;
        try { resolved = resolve(resource); } catch (_) {}
        var legacy = await original(resource);
        if (!resolved || resolved.id === UNKNOWN_ID || !resolved.defaultHandler) return legacy;
        try {
          if (typeof apps.isInstalled === "function") {
            var defInstalled = await apps.isInstalled(resolved.defaultHandler);
            if (defInstalled && (!legacy || legacy.app.id !== resolved.defaultHandler)) {
              var direct = await apps.get(resolved.defaultHandler).catch(function () { return null; });
              if (direct) {
                var adapter = (direct.fileHandlers || []).filter(function (h) {
                  var exts = (h.extensions || []).map(normalizeExtension);
                  var mimes = (h.mimeTypes || []).map(normalizeMime);
                  return (resolved.extension && exts.indexOf(resolved.extension) >= 0) || (resolved.mime && mimes.indexOf(resolved.mime) >= 0);
                })[0] || (legacy ? legacy.handler : (direct.fileHandlers || [])[0]);
                if (adapter) return { app: direct, handler: adapter };
              }
            }
          }
        } catch (_) {}
        return legacy;
      };
      wrapped.__wwFileTypesPatched = true;
      apps.resolveResource = wrapped;
    } catch (_) {}
  }

  function patchFileDialog() {
    try {
      var w = hostWindow();
      var dialog = w && w.WebWindows && w.WebWindows.fileDialog;
      if (!dialog || typeof dialog.open !== "function" || dialog.open.__wwFileTypesPatched) return;
      var originalOpen = dialog.open.bind(dialog);
      var wrappedOpen = function (options) {
        var opts = options && typeof options === "object" ? Object.assign({}, options) : {};
        if ((opts.types || opts.mimeTypes) && Array.isArray(opts.fileTypes)) {
          var expanded = toAccept({ types: opts.types, mimeTypes: opts.mimeTypes, extensions: [] });
          if (expanded.length) {
            opts.fileTypes = opts.fileTypes.concat([{ name: opts.typesLabel || "匹配的文件", extensions: expanded }]);
          }
        }
        return originalOpen(opts);
      };
      wrappedOpen.__wwFileTypesPatched = true;
      dialog.open = wrappedOpen;
    } catch (_) {}
  }

  // Pull legacy fileHandlers + new fileAssociations from the installed
  // catalog into the registry overlay (one-way sync, never deletes user files
  // or other apps' handlers). Runs once the AppRegistry is ready.
  var catalogSynced = false;
  async function syncAllFromCatalog() {
    if (catalogSynced) return;
    try {
      var apps = host().apps;
      if (!apps || typeof apps.listCatalog !== "function") return;
      var catalog = await apps.listCatalog();
      if (!Array.isArray(catalog) || !catalog.length) return;
      catalogSynced = true;
      for (var i = 0; i < catalog.length; i += 1) {
        try { syncAppManifest(catalog[i]); } catch (_) {}
      }
    } catch (_) {}
  }

  function installBridges() {
    if (bridgesInstalled) { patchAppRegistry(); patchFileDialog(); return; }
    bridgesInstalled = true;
    patchAppRegistry();
    patchFileDialog();
    try {
      var w = hostWindow();
      if (w && typeof w.addEventListener === "function") {
        w.addEventListener("webwindows:apps-ready", function () { patchAppRegistry(); syncAllFromCatalog(); });
      }
    } catch (_) {}
    syncAllFromCatalog();
  }

  // ------------------------------------------------------------------ public
  loadInstalled();
  loadUserDefaults();

  var api = {
    UNKNOWN_ID: UNKNOWN_ID,
    register: register,
    unregister: unregister,
    resolve: resolve,
    get: get,
    list: list,
    getHandlers: getHandlers,
    getDefaultHandler: getDefaultHandler,
    setDefaultHandler: setDefaultHandler,
    clearDefaultHandler: clearDefaultHandler,
    getUserOverride: function (typeId) { return userDefaults[String(typeId || "")] || null; },
    getIcon: getIcon,
    getPreviewProvider: getPreviewProvider,
    getOpenWithMenu: getOpenWithMenu,
    open: open,
    openWith: openWith,
    installAppAssociations: installAppAssociations,
    uninstallAppAssociations: uninstallAppAssociations,
    syncAppUpgrade: syncAppUpgrade,
    syncAppManifest: syncAppManifest,
    validateFileAssociation: validateFileAssociation,
    validateAppPackageManifest: validateAppPackageManifest,
    validateThemePackageManifest: validateThemePackageManifest,
    validateSystemPackageManifest: validateSystemPackageManifest,
    validateWwAppStructure: validateWwAppStructure,
    toAccept: toAccept,
    matchesFilter: matchesFilter,
    normalizeExtension: normalizeExtension,
    extensionOf: extensionOf,
    normalizeMime: normalizeMime,
    categoryIcon: function (category) { return CATEGORY_ICONS[String(category || "")] || CATEGORY_ICONS.file; }
  };

  try {
    var scope = (typeof window !== "undefined" && window) || (typeof globalThis !== "undefined" && globalThis);
    scope.WebWindows = scope.WebWindows || {};
    scope.WebWindows.fileTypes = api;
  } catch (_) {}

  installBridges();

  // Test seam (not a public capability API): read-only counts.
  try {
    Object.defineProperty(api, "__internal", {
      value: Object.freeze({
        builtInCount: function () { return builtInById.size; },
        installedCount: function () { return installedTypes.size; },
        userDefaultsKey: USER_DEFAULTS_KEY,
        installedKey: INSTALLED_KEY
      }),
      enumerable: false
    });
  } catch (_) {}
})();
