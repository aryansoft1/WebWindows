(function () {
  "use strict";

  const viewText = {
    all: ["全部功能", "浏览 WebWindows 当前提供的全部功能。"],
    installed: ["我的功能", "这里显示当前使用者已经添加的功能。"],
    available: ["可添加", "从服务器功能仓库添加新的使用关联。"],
    system: ["系统功能", "由管理员配置并随 WebWindows 提供的受保护功能。"],
    office: ["办公与文件", "支持云资料中文档、表格、演示文稿和其他文件的功能。"]
  };

  let activeView = "all";
  let pendingRemoval = null;

  function hostWindow() {
    try {
      return window.parent?.WebWindows?.apps ? window.parent : window;
    } catch (_) {
      return window;
    }
  }

  function registry() {
    return hostWindow().WebWindows?.apps || null;
  }

  function openDeveloperCenter() {
    const host = hostWindow();
    if (typeof host.openWindow === "function") {
      host.openWindow(
        "developer-center",
        "开发者中心",
        "developer.html?v=20260729-7",
        "assets/icons/logo_large.png",
        true,
        "",
        "1020px",
        "725px"
      );
      return;
    }
    window.location.href = "/developer.html";
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function setStatus(message, error) {
    const status = document.getElementById("catalogStatus");
    status.textContent = message || "";
    status.classList.toggle("error", Boolean(error));
  }

  function isSystem(app, association) {
    return association.state === "system" ||
      app.type === "system" ||
      app.install?.uninstallable === false;
  }

  function fileExtensions(app) {
    return [...new Set((app.fileHandlers || [])
      .flatMap((handler) => handler.extensions || []))];
  }

  function isOffice(app) {
    const extensions = fileExtensions(app);
    return app.category === "office" || extensions.some((extension) =>
      [".doc", ".docx", ".xls", ".xlsx", ".csv", ".ppt", ".pptx", ".pdf"]
        .includes(String(extension).toLowerCase())
    );
  }

  function descriptionFor(app) {
    if (app.description) return app.description;
    const extensions = fileExtensions(app);
    if (extensions.length) return `支持 ${extensions.join("、")} 文件。`;
    if (app.type === "system") return "WebWindows 内置系统功能。";
    return "可关联到当前使用者的 WebWindows 功能。";
  }

  function scopeLabel() {
    try {
      const host = hostWindow();
      const user = JSON.parse(host.sessionStorage.getItem("webwindows_user") || "null");
      if (!user) return "本机使用者 · 仅本机";
      const state = host.WebWindows?.functionSync?.getState?.();
      const suffix = {
        syncing: "同步中",
        synced: "已同步",
        offline: "离线待同步",
        error: "等待重试",
        local: "仅本机"
      }[state?.status] || "准备同步";
      return `${user.nickname || user.username || "登录账户"} · ${suffix}`;
    } catch (_) {
      return "本机使用者 · 仅本机";
    }
  }

  function renderRepositoryState() {
    const status = registry()?.getRepositoryStatus?.() || {};
    const indicator = document.getElementById("repositoryIndicator");
    indicator.className = status.source === "server" ? "online" : "fallback";
    document.getElementById("repositoryName").textContent =
      status.repository?.name || "WebWindows 功能仓库";
    document.getElementById("repositoryMessage").textContent =
      status.message || "目录已就绪。";
  }

  function updateSummary(records) {
    const systemCount = records.filter(({ app, association }) =>
      isSystem(app, association)).length;
    const installedCount = records.filter(({ app, association }) =>
      !isSystem(app, association) && association.installed).length;
    const availableCount = records.filter(({ app, association }) =>
      !isSystem(app, association) && !association.installed).length;
    const summary = document.getElementById("catalogSummary");
    summary.replaceChildren(
      element("span", "", `目录功能 ${records.length}`),
      element("span", "", `我的功能 ${installedCount}`),
      element("span", "", `可添加 ${availableCount}`),
      element("span", "", `系统功能 ${systemCount}`)
    );
  }

  function actionButton(label, className, handler) {
    const button = element("button", className, label);
    button.type = "button";
    button.addEventListener("click", handler);
    return button;
  }

  function requestRemoval(app) {
    pendingRemoval = app;
    document.getElementById("removeFunctionMessage").textContent =
      `确定从当前使用者移除“${app.name}”吗？`;
    const dialog = document.getElementById("removeFunctionDialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
  }

  async function removePending() {
    if (!pendingRemoval) return;
    const app = pendingRemoval;
    pendingRemoval = null;
    try {
      setStatus(`正在移除 ${app.name} 的使用关联……`);
      await registry().uninstall(app.id, { retainData: true });
      await renderCatalog();
      setStatus(`${app.name} 已移除；服务器程序文件、云资料和个人数据均已保留。`);
    } catch (error) {
      setStatus(error.message || "移除失败。", true);
    }
  }

  function createCard(app, association) {
    const card = element("article", "catalog-card");
    card.dataset.functionId = app.id;
    const icon = document.createElement("img");
    icon.src = app.icon;
    icon.alt = "";
    card.appendChild(icon);

    const details = element("div", "catalog-card-details");
    details.appendChild(element("h3", "", app.name));
    details.appendChild(element("p", "", descriptionFor(app)));
    const metadata = element("div", "catalog-card-meta");
    const system = isSystem(app, association);
    metadata.appendChild(element(
      "span",
      system ? "system" : "",
      system ? "系统功能" : (association.installed ? "已添加" : "可添加")
    ));
    metadata.appendChild(element("span", "", `版本 ${app.version || "1.0.0"}`));
    const extensions = fileExtensions(app);
    if (extensions.length) metadata.appendChild(element("span", "", extensions.join("、")));
    details.appendChild(metadata);
    card.appendChild(details);

    const actions = element("div", "catalog-card-actions");
    if (association.installed) {
      actions.appendChild(actionButton("打开", "", async () => {
        try {
          await registry().launch(app.id);
        } catch (error) {
          setStatus(error.message || "功能启动失败。", true);
        }
      }));
    }
    if (!system && association.installed) {
      actions.appendChild(actionButton("移除", "danger", () => requestRemoval(app)));
    } else if (!system) {
      actions.appendChild(actionButton("添加", "primary", async () => {
        try {
          setStatus(`正在添加 ${app.name}……`);
          await registry().install(app.id, { source: "repository" });
          await renderCatalog();
          setStatus(`${app.name} 已关联到当前使用者。`);
        } catch (error) {
          setStatus(error.message || "添加失败。", true);
        }
      }));
    }
    card.appendChild(actions);
    return card;
  }

  function matchesView(app, association) {
    const system = isSystem(app, association);
    if (activeView === "installed") return !system && association.installed;
    if (activeView === "available") return !system && !association.installed;
    if (activeView === "system") return system;
    if (activeView === "office") return isOffice(app);
    return true;
  }

  async function renderCatalog() {
    const api = registry();
    const grid = document.getElementById("catalogGrid");
    if (!api) {
      setStatus("功能注册服务不可用。请从 WebWindows 桌面打开功能中心。", true);
      return;
    }

    setStatus("正在读取功能仓库……");
    await api.ready();
    const catalog = (await api.listCatalog())
      .filter((app) => app.placement?.allFunctions !== false);
    const records = await Promise.all(catalog.map(async (app) => ({
      app,
      association: await api.getInstallation(app)
    })));
    updateSummary(records);
    renderRepositoryState();
    document.getElementById("accountScope").textContent = scopeLabel();

    const search = document.getElementById("functionCenterSearch").value
      .trim().toLowerCase();
    const filtered = records.filter(({ app, association }) => {
      const searchable = `${app.name} ${app.id} ${fileExtensions(app).join(" ")}`.toLowerCase();
      return (!search || searchable.includes(search)) && matchesView(app, association);
    });

    grid.replaceChildren();
    filtered.forEach(({ app, association }) => {
      grid.appendChild(createCard(app, association));
    });
    if (!filtered.length) {
      grid.appendChild(element("div", "catalog-empty", "没有符合当前条件的功能。"));
    }
    setStatus("");
  }

  function selectView(view) {
    activeView = view;
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.classList.toggle("active", button.dataset.view === view);
    });
    const text = viewText[view] || viewText.all;
    document.getElementById("viewTitle").textContent = text[0];
    document.getElementById("viewDescription").textContent = text[1];
    renderCatalog().catch((error) => setStatus(error.message, true));
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("developerCenterEntry").addEventListener("click", openDeveloperCenter);
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => selectView(button.dataset.view));
    });
    document.getElementById("functionCenterSearch").addEventListener("input", () => {
      renderCatalog().catch((error) => setStatus(error.message, true));
    });
    document.getElementById("refreshCatalog").addEventListener("click", async () => {
      try {
        setStatus("正在刷新服务器功能仓库……");
        await registry()?.reload?.();
        await renderCatalog();
      } catch (error) {
        setStatus(error.message || "功能仓库刷新失败。", true);
      }
    });
    const dialog = document.getElementById("removeFunctionDialog");
    dialog.addEventListener("close", () => {
      if (dialog.returnValue === "confirm") removePending();
      else pendingRemoval = null;
      dialog.returnValue = "";
    });

    const host = hostWindow();
    if (host !== window) {
      host.addEventListener("webwindows:installation-changed", () => {
        renderCatalog().catch((error) => setStatus(error.message, true));
      });
      host.addEventListener("webwindows:function-sync-state", () => {
        document.getElementById("accountScope").textContent = scopeLabel();
      });
    }
    renderCatalog().catch((error) => setStatus(error.message || "功能中心初始化失败。", true));
  });
})();
