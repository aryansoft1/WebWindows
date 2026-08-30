(function () {
  "use strict";

  const API_URL = "/admin_api/functionCatalog.asp";
  const PUBLIC_CATALOG_URL = "/api/function-catalog.asp";
  const ADMIN_HEADERS = { "X-WebWindows-Admin-Request": "function-catalog" };
  const CORE_FUNCTIONS = new Set([
    "webwindows.system.cloud-files",
    "webwindows.system.settings",
    "webwindows.system.function-center"
  ]);

  let catalogDocument = null;
  let revision = null;
  let editingId = null;
  let dirty = false;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function setStatus(message, kind) {
    const status = document.getElementById("adminStatus");
    status.textContent = message || "";
    status.className = `admin-status${kind ? ` ${kind}` : ""}`;
  }

  async function apiRequest(url, options) {
    const response = await fetch(url, {
      credentials: "same-origin",
      cache: "no-store",
      ...options,
      headers: {
        ...ADMIN_HEADERS,
        ...(options?.headers || {})
      }
    });
    let payload;
    try {
      payload = await response.json();
    } catch (_) {
      throw new Error(`后台接口响应格式异常（${response.status}）。`);
    }
    if (!response.ok || payload?.ok === false) {
      const error = new Error(payload?.message || `后台接口请求失败（${response.status}）。`);
      error.code = payload?.code || "";
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  async function ensureSeededCatalog(payload) {
    if (payload.catalog) return payload;
    await fetch(PUBLIC_CATALOG_URL, {
      credentials: "same-origin",
      cache: "no-store"
    });
    return apiRequest(API_URL);
  }

  async function loadCatalog() {
    setStatus("正在读取当前发布目录……");
    try {
      const payload = await ensureSeededCatalog(await apiRequest(API_URL));
      if (!payload.catalog || payload.catalog.schemaVersion !== 1 ||
          !Array.isArray(payload.catalog.apps)) {
        throw new Error("当前发布目录格式无效。");
      }
      catalogDocument = structuredClone(payload.catalog);
      revision = payload.revision || null;
      dirty = false;
      const releaseBound = catalogDocument.apps.some(releaseProtected);
      document.getElementById("publishCatalog").disabled = releaseBound;
      document.getElementById("newFunction").disabled = releaseBound;
      updateRevision();
      renderRows();
      setStatus(releaseBound
        ? "当前 revision 含第三方 Release；发布、下架与撤销请前往开发者平台。"
        : "当前发布目录已读取。");
    } catch (error) {
      catalogDocument = null;
      renderRows();
      if (error.status === 401 || error.code === "ADMIN_LOGIN_REQUIRED") {
        setStatus("请先在 WebWindows 使用 admin 账户登录，然后重新打开后台管理。", "error");
      } else {
        setStatus(error.message || "功能目录读取失败。", "error");
      }
    }
  }

  function distributionOf(app) {
    if (app.type === "system" || app.install?.uninstallable === false) return "system";
    if (app.install?.source === "preinstalled" ||
        app.install?.defaultState === "installed") return "preinstalled";
    return "optional";
  }

  function sourceTypeOf(app) {
    if (app.sourceType) return app.sourceType;
    return app.package ? "legacy-third-party" : "system";
  }

  function releaseProtected(app) {
    return sourceTypeOf(app) !== "system";
  }

  function distributionLabel(value) {
    return {
      system: "系统功能",
      preinstalled: "默认预装",
      optional: "普通功能"
    }[value] || value;
  }

  function catalogStatus(app) {
    return app.catalog?.status === "disabled" ? "disabled" : "published";
  }

  function updateRevision() {
    const info = document.getElementById("revisionInfo");
    if (!revision?.id) {
      info.textContent = dirty ? "待首次发布" : "尚无发布版本";
      return;
    }
    info.textContent = `当前版本 ${revision.version || revision.id}${dirty ? " · 有未发布修改" : ""}`;
  }

  function updateSummary(apps) {
    const distributions = apps.map(distributionOf);
    document.getElementById("totalCount").textContent = apps.length;
    document.getElementById("systemCount").textContent =
      distributions.filter((value) => value === "system").length;
    document.getElementById("preinstalledCount").textContent =
      distributions.filter((value) => value === "preinstalled").length;
    document.getElementById("optionalCount").textContent =
      distributions.filter((value) => value === "optional").length;
  }

  function actionButton(label, className, handler, disabled) {
    const button = element("button", className, label);
    button.type = "button";
    button.disabled = Boolean(disabled);
    button.addEventListener("click", handler);
    return button;
  }

  function removeFunction(app) {
    if (CORE_FUNCTIONS.has(app.id) || distributionOf(app) === "system" || releaseProtected(app)) return;
    if (!window.confirm(`从待发布目录移除“${app.name}”吗？服务器程序文件不会被删除。`)) return;
    catalogDocument.apps = catalogDocument.apps.filter((item) => item.id !== app.id);
    dirty = true;
    updateRevision();
    renderRows();
    setStatus(`${app.name} 已从待发布目录移除；需要发布后才会生效。`);
  }

  function toggleCatalogStatus(app) {
    if (CORE_FUNCTIONS.has(app.id) || releaseProtected(app)) return;
    app.catalog = {
      ...(app.catalog || {}),
      status: catalogStatus(app) === "published" ? "disabled" : "published"
    };
    dirty = true;
    updateRevision();
    renderRows();
  }

  function renderRows() {
    const tbody = document.getElementById("catalogRows");
    tbody.replaceChildren();
    const apps = catalogDocument?.apps || [];
    updateSummary(apps);
    if (!catalogDocument) {
      const row = document.createElement("tr");
      const cell = element("td", "empty-row", "登录管理员账户后可读取功能目录。");
      cell.colSpan = 6;
      row.appendChild(cell);
      tbody.appendChild(row);
      return;
    }

    const search = document.getElementById("catalogSearch").value.trim().toLowerCase();
    const filter = document.getElementById("catalogFilter").value;
    const filtered = apps.filter((app) => {
      const distribution = distributionOf(app);
      const status = catalogStatus(app);
      if (search && !`${app.name} ${app.id} ${app.entry}`.toLowerCase().includes(search)) {
        return false;
      }
      if (filter === "disabled") return status === "disabled";
      if (filter !== "all") return distribution === filter;
      return true;
    });

    filtered.forEach((app) => {
      const row = document.createElement("tr");
      const functionCell = document.createElement("td");
      const functionInfo = element("div", "function-cell");
      const icon = document.createElement("img");
      icon.src = `/${String(app.icon || "").replace(/^\/+/, "")}`;
      icon.alt = "";
      const text = document.createElement("div");
      text.appendChild(element("strong", "", app.name));
      text.appendChild(element("small", "", app.id));
      text.appendChild(element("small", "", sourceTypeOf(app) === "developer-release"
        ? `Verified release · ${app.release?.id || "unknown"}`
        : (sourceTypeOf(app) === "legacy-third-party" ? "Legacy · unverified" : "System")));
      functionInfo.append(icon, text);
      functionCell.appendChild(functionInfo);
      row.appendChild(functionCell);

      const distribution = distributionOf(app);
      const typeCell = document.createElement("td");
      typeCell.appendChild(element(
        "span",
        `type-badge${distribution === "system" ? " system" : ""}`,
        distributionLabel(distribution)
      ));
      row.appendChild(typeCell);
      row.appendChild(element("td", "", app.version || "1.0.0"));
      row.appendChild(element("td", "", app.entry || "系统适配器"));

      const status = catalogStatus(app);
      const statusCell = document.createElement("td");
      statusCell.appendChild(element(
        "span",
        `status-badge ${status}`,
        status === "published" ? "已上架" : "已下架"
      ));
      row.appendChild(statusCell);

      const actionsCell = document.createElement("td");
      const actions = element("div", "row-actions");
      actions.appendChild(actionButton("编辑", "", () => openEditor(app), releaseProtected(app)));
      actions.appendChild(actionButton(
        status === "published" ? "下架" : "上架",
        "",
        () => toggleCatalogStatus(app),
        CORE_FUNCTIONS.has(app.id) || releaseProtected(app)
      ));
      actions.appendChild(actionButton(
        "移除定义",
        "danger",
        () => removeFunction(app),
        distribution === "system" || CORE_FUNCTIONS.has(app.id) || releaseProtected(app)
      ));
      actionsCell.appendChild(actions);
      row.appendChild(actionsCell);
      tbody.appendChild(row);
    });

    if (!filtered.length) {
      const row = document.createElement("tr");
      const cell = element("td", "empty-row", "没有符合条件的功能。");
      cell.colSpan = 6;
      row.appendChild(cell);
      tbody.appendChild(row);
    }
  }

  function value(id) {
    return document.getElementById(id).value.trim();
  }

  function checked(id) {
    return document.getElementById(id).checked;
  }

  function setValue(id, valueToSet) {
    document.getElementById(id).value = valueToSet == null ? "" : valueToSet;
  }

  function setChecked(id, valueToSet) {
    document.getElementById(id).checked = Boolean(valueToSet);
  }

  function openEditor(app) {
    const definition = app ? structuredClone(app) : {
      id: "",
      legacyIds: [],
      type: "application",
      name: "",
      description: "",
      category: "",
      version: "1.0.0",
      icon: "",
      entry: "",
      install: {
        defaultState: "available",
        source: "repository",
        uninstallable: true
      },
      placement: {
        desktop: false,
        startMenu: true,
        startMenuGroup: "user",
        startMenuOrder: 100,
        allFunctions: true,
        taskbar: false
      },
      window: {
        mode: "iframe",
        singleton: true,
        width: "900px",
        height: "640px"
      },
      catalog: { status: "published" }
    };
    definition.sourceType = definition.sourceType || "system";
    definition.releaseBinding = definition.releaseBinding || "system";
    editingId = app?.id || null;
    document.getElementById("editorTitle").textContent =
      app ? `编辑 ${app.name}` : "新建功能";
    setValue("functionId", definition.id);
    document.getElementById("functionId").disabled = Boolean(app);
    setValue("functionName", definition.name);
    setValue("functionVersion", definition.version || "1.0.0");
    setValue("functionDescription", definition.description || "");
    setValue("functionDistribution", distributionOf(definition));
    setValue("functionStatus", catalogStatus(definition));
    setValue("functionEntry", definition.entry);
    setValue("functionIcon", definition.icon);
    setValue("functionCategory", definition.category || "");
    setValue("windowMode", definition.window?.mode || "iframe");
    setValue("windowWidth", definition.window?.width || "900px");
    setValue("windowHeight", definition.window?.height || "640px");
    setValue("startMenuOrder", definition.placement?.startMenuOrder ?? 100);
    setValue("fileExtensions", [...new Set((definition.fileHandlers || [])
      .flatMap((handler) => handler.extensions || []))].join(", "));
    setChecked("showStartMenu", definition.placement?.startMenu !== false);
    setChecked("showDesktop", definition.placement?.desktop === true);
    setChecked("singletonWindow", definition.window?.singleton !== false);
    setValue("advancedDefinition", JSON.stringify(definition, null, 2));
    document.getElementById("functionEditor").showModal();
  }

  function definitionFromForm() {
    let definition;
    try {
      definition = JSON.parse(value("advancedDefinition") || "{}");
    } catch (_) {
      throw new Error("高级定义 JSON 格式无效。");
    }
    const id = value("functionId");
    if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)+$/.test(id)) {
      throw new Error("功能 ID 格式无效。");
    }
    if (!value("functionName") || !value("functionEntry") || !value("functionIcon")) {
      throw new Error("名称、入口地址和图标地址不能为空。");
    }
    const distribution = value("functionDistribution");
    const system = distribution === "system";
    definition.id = id;
    definition.sourceType = "system";
    definition.releaseBinding = "system";
    definition.name = value("functionName");
    definition.version = value("functionVersion") || "1.0.0";
    definition.description = value("functionDescription");
    definition.category = value("functionCategory");
    definition.entry = value("functionEntry");
    definition.icon = value("functionIcon");
    definition.type = system ? "system" : "application";
    definition.install = {
      ...(definition.install || {}),
      defaultState: distribution === "optional" ? "available" : "installed",
      source: system ? "system" :
        (distribution === "preinstalled" ? "preinstalled" : "repository"),
      uninstallable: !system
    };
    definition.placement = {
      ...(definition.placement || {}),
      desktop: checked("showDesktop"),
      startMenu: checked("showStartMenu"),
      startMenuGroup: system ? "system" : "user",
      startMenuOrder: Number(value("startMenuOrder")) || 100,
      allFunctions: true,
      taskbar: definition.placement?.taskbar === true
    };
    definition.window = {
      ...(definition.window || {}),
      mode: value("windowMode") || "iframe",
      singleton: checked("singletonWindow"),
      width: value("windowWidth") || "900px",
      height: value("windowHeight") || "640px"
    };
    definition.catalog = {
      ...(definition.catalog || {}),
      status: value("functionStatus") || "published"
    };

    const extensions = value("fileExtensions").split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
      .map((item) => item.startsWith(".") ? item : `.${item}`);
    if (extensions.length) {
      const existingHandler = definition.fileHandlers?.[0] || {
        action: "open",
        adapter: "direct-url",
        priority: 50
      };
      definition.fileHandlers = [{
        ...existingHandler,
        extensions: [...new Set(extensions)]
      }, ...(definition.fileHandlers || []).slice(1)];
    } else {
      delete definition.fileHandlers;
    }
    return definition;
  }

  function saveDraft(event) {
    event.preventDefault();
    try {
      const definition = definitionFromForm();
      const duplicate = catalogDocument.apps.some((app) =>
        app.id === definition.id && app.id !== editingId);
      if (duplicate) throw new Error(`功能 ID 已存在：${definition.id}`);
      const index = catalogDocument.apps.findIndex((app) => app.id === editingId);
      if (index >= 0) catalogDocument.apps[index] = definition;
      else catalogDocument.apps.push(definition);
      dirty = true;
      document.getElementById("functionEditor").close();
      updateRevision();
      renderRows();
      setStatus(`${definition.name} 已保存到待发布目录。`);
    } catch (error) {
      window.alert(error.message || "功能定义保存失败。");
    }
  }

  function defaultPublishVersion() {
    const now = new Date();
    const pad = (valueToPad) => String(valueToPad).padStart(2, "0");
    return `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}.${pad(now.getHours())}${pad(now.getMinutes())}`;
  }

  function openPublishDialog() {
    if (!catalogDocument) return;
    setValue("publishVersion", defaultPublishVersion());
    setValue("publishNote", dirty ? "后台更新功能目录" : "重新发布当前目录");
    document.getElementById("publishDialog").showModal();
  }

  async function publishCatalog(event) {
    event.preventDefault();
    const version = value("publishVersion");
    if (!version) {
      window.alert("请输入目录版本。");
      return;
    }
    const ids = new Set();
    for (const app of catalogDocument.apps) {
      if (!app.id || !app.name || typeof app.entry !== "string" || !app.window?.mode) {
        window.alert(`功能定义不完整：${app.id || "(无 ID)"}`);
        return;
      }
      if (ids.has(app.id)) {
        window.alert(`存在重复功能 ID：${app.id}`);
        return;
      }
      ids.add(app.id);
    }

    const publishButton = document.getElementById("confirmPublish");
    publishButton.disabled = true;
    try {
      catalogDocument.repository = {
        ...(catalogDocument.repository || {}),
        catalogVersion: version,
        updatedAt: new Date().toISOString()
      };
      const body = new URLSearchParams();
      body.set("version", version);
      body.set("note", value("publishNote"));
      body.set("catalogJson", JSON.stringify(catalogDocument));
      await apiRequest(API_URL, { method: "POST", body });
      document.getElementById("publishDialog").close();
      await loadCatalog();
      setStatus(`目录版本 ${version} 已发布，WebWindows 将自动读取新版本。`, "success");
    } catch (error) {
      setStatus(error.message || "目录发布失败。", "error");
    } finally {
      publishButton.disabled = false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("catalogSearch").addEventListener("input", renderRows);
    document.getElementById("catalogFilter").addEventListener("change", renderRows);
    document.getElementById("reloadCatalog").addEventListener("click", () => {
      if (dirty && !window.confirm("重新读取会丢弃尚未发布的修改，确定继续吗？")) return;
      loadCatalog();
    });
    document.getElementById("newFunction").addEventListener("click", () => {
      if (!catalogDocument) return;
      openEditor(null);
    });
    document.getElementById("publishCatalog").addEventListener("click", openPublishDialog);
    document.getElementById("saveFunctionDraft").addEventListener("click", saveDraft);
    document.getElementById("confirmPublish").addEventListener("click", publishCatalog);
    window.addEventListener("beforeunload", (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    });
    loadCatalog();
  });
})();
