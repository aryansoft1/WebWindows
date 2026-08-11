(function () {
  "use strict";

  const labels = {
    system: "系统功能",
    user: "我的功能",
    all: "全部功能",
    back: "返回",
    systemBadge: "系统组件",
    removableBadge: "可移除"
  };

  function registry() {
    return window.WebWindows?.apps || null;
  }

  function menuElement() {
    return document.getElementById("start-menu");
  }

  function hostElement() {
    return document.getElementById("start-menu-functions");
  }

  function fallbackElement() {
    return document.getElementById("start-menu-static-fallback");
  }

  function closeMenu() {
    const menu = menuElement();
    if (menu) menu.style.display = "none";
  }

  function sortByPlacement(apps) {
    return [...apps].sort((left, right) => {
      const orderDifference =
        (left.placement?.startMenuOrder || 999) -
        (right.placement?.startMenuOrder || 999);
      return orderDifference || left.name.localeCompare(right.name, "zh-CN");
    });
  }

  function isSystemFunction(app) {
    return app.type === "system" || app.install?.uninstallable === false;
  }

  function createButton(text, className, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = text;
    button.addEventListener("click", handler);
    return button;
  }

  function createSectionHeader(title, action) {
    const header = document.createElement("div");
    header.className = "function-menu-section-header";

    const heading = document.createElement("h3");
    heading.textContent = title;
    header.appendChild(heading);

    if (action) {
      header.appendChild(createButton(action.label, "function-menu-link", action.handler));
    }
    return header;
  }

  function createFunctionButton(app, listMode) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = listMode ? "function-list-item" : "function-grid-item";
    button.dataset.functionId = app.id;
    button.title = app.name;

    const icon = document.createElement("img");
    icon.src = app.icon;
    icon.alt = "";
    button.appendChild(icon);

    const content = document.createElement("span");
    content.className = "function-item-content";

    const name = document.createElement("span");
    name.className = "function-item-name";
    name.textContent = app.name;
    content.appendChild(name);

    if (listMode) {
      const badge = document.createElement("span");
      const system = isSystemFunction(app);
      badge.className = `function-type-badge ${system ? "is-system" : "is-removable"}`;
      badge.textContent = system ? labels.systemBadge : labels.removableBadge;
      content.appendChild(badge);
    }

    button.appendChild(content);
    button.addEventListener("click", async () => {
      closeMenu();
      try {
        await registry().launch(app.id);
      } catch (error) {
        console.error("[FunctionMenu]", error);
        window.alert(error.message || "功能启动失败。");
      }
    });
    return button;
  }

  function createGrid(apps) {
    const grid = document.createElement("div");
    grid.className = "function-menu-grid";
    sortByPlacement(apps).forEach((app) => {
      grid.appendChild(createFunctionButton(app, false));
    });
    return grid;
  }

  function createList(apps) {
    const list = document.createElement("div");
    list.className = "function-menu-list";
    sortByPlacement(apps).forEach((app) => {
      list.appendChild(createFunctionButton(app, true));
    });
    return list;
  }

  async function installedFunctions() {
    const apps = await registry().listInstalled();
    return apps.filter((app) => app.placement?.allFunctions !== false);
  }

  async function renderHome() {
    const host = hostElement();
    if (!host) return;
    const apps = await installedFunctions();
    const visible = apps.filter((app) => app.placement?.startMenu);
    const systemFunctions = visible.filter((app) => isSystemFunction(app));
    const userFunctions = visible.filter((app) => !isSystemFunction(app));

    host.replaceChildren();
    host.appendChild(createSectionHeader(labels.system, {
      label: `${labels.all} ›`,
      handler: renderAll
    }));
    host.appendChild(createGrid(systemFunctions));
    host.appendChild(createSectionHeader(labels.user));
    host.appendChild(createGrid(userFunctions));
    host.dataset.view = "home";
  }

  async function renderAll() {
    const host = hostElement();
    if (!host) return;
    const apps = await installedFunctions();
    const systemFunctions = apps.filter((app) => isSystemFunction(app));
    const userFunctions = apps.filter((app) => !isSystemFunction(app));

    host.replaceChildren();
    host.appendChild(createSectionHeader(labels.all, {
      label: `‹ ${labels.back}`,
      handler: renderHome
    }));
    host.appendChild(createSectionHeader(labels.system));
    host.appendChild(createList(systemFunctions));
    host.appendChild(createSectionHeader(labels.user));
    host.appendChild(createList(userFunctions));
    host.dataset.view = "all";
  }

  async function initialize() {
    const apps = registry();
    const host = hostElement();
    if (!apps || !host) return;
    try {
      await apps.ready();
      await renderHome();
      host.hidden = false;
      const fallback = fallbackElement();
      if (fallback) fallback.hidden = true;
      window.dispatchEvent(new CustomEvent("webwindows:function-menu-ready"));
    } catch (error) {
      console.error("[FunctionMenu] 动态功能菜单初始化失败，保留静态菜单。", error);
      host.hidden = true;
    }
  }

  window.WebWindows = window.WebWindows || {};
  window.WebWindows.functionMenu = {
    labels: Object.freeze({ ...labels }),
    render: renderHome,
    showAll: renderAll,
    showHome: renderHome
  };

  window.addEventListener("webwindows:installation-changed", () => {
    const host = hostElement();
    if (!host || host.hidden) return;
    (host.dataset.view === "all" ? renderAll() : renderHome()).catch((error) => {
      console.error("[FunctionMenu] 功能状态刷新失败。", error);
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();

