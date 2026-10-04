(function () {
  "use strict";

  const labels = {
    system: "系统功能",
    user: "我的功能",
    all: "全部功能",
    back: "返回",
    systemBadge: "系统组件",
    removableBadge: "可移除",
    pinned: "置顶",
    pin: "置顶该功能",
    unpin: "取消置顶"
  };

  const PIN_KEY = "webwindows.startmenu.pinned";

  function readPinned() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(PIN_KEY) || "[]");
      return Array.isArray(stored) ? stored.filter((id) => typeof id === "string") : [];
    } catch (_) {
      return [];
    }
  }

  function writePinned(ids) {
    try {
      window.localStorage.setItem(PIN_KEY, JSON.stringify(ids));
    } catch (_) {}
  }

  function togglePinned(appId) {
    const pinned = readPinned();
    const index = pinned.indexOf(appId);
    if (index === -1) pinned.push(appId);
    else pinned.splice(index, 1);
    writePinned(pinned);
    return pinned;
  }

  function orderPinned(apps) {
    const order = new Map(readPinned().map((id, index) => [id, index]));
    return apps
      .filter((app) => order.has(app.id))
      .sort((left, right) => order.get(left.id) - order.get(right.id));
  }

  function registry() {
    return window.WebWindows?.apps || null;
  }

  function localizedAppName(app) {
    return window.WebWindowsI18n?.translate?.(app.name) || app.name;
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

  function createFunctionButton(app, listMode, options = {}) {
    const appName = localizedAppName(app);
    const button = document.createElement("button");
    button.type = "button";
    button.className = listMode ? "function-list-item" : "function-grid-item";
    button.dataset.functionId = app.id;
    button.title = appName;

    const icon = document.createElement("img");
    icon.src = app.icon;
    icon.alt = "";
    button.appendChild(icon);

    const content = document.createElement("span");
    content.className = "function-item-content";

    const name = document.createElement("span");
    name.className = "function-item-name";
    name.textContent = appName;
    content.appendChild(name);

    if (listMode) {
      const badge = document.createElement("span");
      const system = isSystemFunction(app);
      badge.className = `function-type-badge ${system ? "is-system" : "is-removable"}`;
      badge.textContent = system ? labels.systemBadge : labels.removableBadge;
      content.appendChild(badge);
    }

    button.appendChild(content);
    if (options.allowPin) {
      const pinned = readPinned().includes(app.id);
      const pin = document.createElement("span");
      pin.className = `function-pin${pinned ? " is-pinned" : ""}`;
      pin.textContent = "📌";
      pin.title = pinned ? labels.unpin : labels.pin;
      pin.setAttribute("role", "button");
      pin.addEventListener("click", (event) => {
        event.stopPropagation();
        togglePinned(app.id);
        const host = hostElement();
        if (!host || host.hidden) return;
        (host.dataset.view === "all" ? renderAll() : renderHome()).catch((error) => {
          console.error("[FunctionMenu] 置顶状态刷新失败。", error);
        });
      });
      button.appendChild(pin);
    }
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

  function createGrid(apps, options = {}) {
    const grid = document.createElement("div");
    grid.className = "function-menu-grid";
    sortByPlacement(apps).forEach((app) => {
      grid.appendChild(createFunctionButton(app, false, options));
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
    const pinned = orderPinned(visible);
    const pinnedIds = new Set(pinned.map((app) => app.id));
    const systemFunctions = visible.filter((app) => isSystemFunction(app) && !pinnedIds.has(app.id));
    const userFunctions = visible.filter((app) => !isSystemFunction(app) && !pinnedIds.has(app.id));

    host.replaceChildren();
    if (pinned.length) {
      host.appendChild(createSectionHeader(labels.pinned));
      host.appendChild(createGrid(pinned, { allowPin: true }));
    }
    host.appendChild(createSectionHeader(labels.system, {
      label: `${labels.all} ›`,
      handler: renderAll
    }));
    host.appendChild(createGrid(systemFunctions, { allowPin: true }));
    host.appendChild(createSectionHeader(labels.user));
    host.appendChild(createGrid(userFunctions, { allowPin: true }));
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
    showHome: renderHome,
    getPinned: readPinned,
    togglePinned,
    clearPinned() {
      writePinned([]);
      const host = hostElement();
      if (!host || host.hidden) return;
      (host.dataset.view === "all" ? renderAll() : renderHome()).catch((error) => {
        console.error("[FunctionMenu] 清空置顶后刷新失败。", error);
      });
    }
  };

  window.addEventListener("webwindows:installation-changed", () => {
    const host = hostElement();
    if (!host || host.hidden) return;
    (host.dataset.view === "all" ? renderAll() : renderHome()).catch((error) => {
      console.error("[FunctionMenu] 功能状态刷新失败。", error);
    });
  });

  window.addEventListener("webwindows:language-changed", () => {
    const host = hostElement();
    if (!host) return;
    const render = host.dataset.view === "all" ? renderAll : renderHome;
    return render().catch((error) => {
      console.error("[FunctionMenu] 语言切换后刷新失败。", error);
    });
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== PIN_KEY) return;
    const host = hostElement();
    if (!host || host.hidden) return;
    (host.dataset.view === "all" ? renderAll() : renderHome()).catch((error) => {
      console.error("[FunctionMenu] 置顶同步刷新失败。", error);
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
