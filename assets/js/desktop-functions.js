(function () {
  "use strict";

  const ICON_GAP_X = 20;
  const ICON_GAP_Y = 20;

  function registry() {
    return window.WebWindows?.apps || null;
  }

  function desktop() {
    return document.querySelector(".desktop");
  }

  function findExisting(appId) {
    const host = desktop();
    if (!host) return null;
    return Array.from(host.querySelectorAll(".icon[data-function-id]"))
      .find((element) => element.dataset.functionId === appId) || null;
  }

  function placeInFreeDesktopSlot(element, host) {
    const icons = Array.from(host.querySelectorAll(".icon[id]"))
      .filter((icon) => icon !== element && icon.style.display !== "none");
    const style = getComputedStyle(host);
    const originX = parseFloat(style.paddingLeft) || 20;
    const originY = parseFloat(style.paddingTop) || 20;
    const paddingRight = parseFloat(style.paddingRight) || 20;
    const paddingBottom = parseFloat(style.paddingBottom) || 20;
    const iconWidth = Math.max(
      element.offsetWidth || 76,
      ...icons.map((icon) => icon.offsetWidth || 76)
    );
    const iconHeight = Math.max(
      element.offsetHeight || 97,
      ...icons.map((icon) => icon.offsetHeight || 97)
    );
    const stepX = iconWidth + ICON_GAP_X;
    const stepY = iconHeight + ICON_GAP_Y;
    const rows = Math.max(
      1,
      Math.floor((host.clientHeight - originY - paddingBottom - iconHeight) / stepY) + 1
    );
    const occupied = new Set();

    icons.forEach((icon) => {
      const savedSlot = Number(icon.dataset.wwGridSlot);
      if (Number.isFinite(savedSlot)) {
        occupied.add(savedSlot);
        return;
      }
      const left = parseFloat(icon.style.left);
      const top = parseFloat(icon.style.top);
      if (!Number.isFinite(left) || !Number.isFinite(top)) return;
      const column = Math.max(0, Math.round((left - originX) / stepX));
      const row = Math.max(0, Math.round((top - originY) / stepY));
      occupied.add(column * rows + row);
    });

    let slot = 0;
    while (occupied.has(slot)) slot += 1;
    const column = Math.floor(slot / rows);
    const row = slot % rows;
    const x = Math.min(
      originX + column * stepX,
      Math.max(originX, host.clientWidth - paddingRight - iconWidth)
    );
    const y = originY + row * stepY;

    element.style.position = "absolute";
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.zIndex = "";
    element.dataset.wwGridSlot = String(slot);

    // The window manager persists this only when a user layout already exists.
    // A first-run default layout must not become user data before the viewport settles.
    window.updateIconPositionState?.(element.id, x, y);
  }

  function createDesktopIcon(app) {
    const element = document.createElement("div");
    element.className = "icon no-auto function-desktop-icon";
    element.id = `function-${app.id.replace(/[^a-z0-9_-]/gi, "-")}`;
    element.dataset.functionId = app.id;
    element.tabIndex = 0;
    element.title = app.name;

    const image = document.createElement("img");
    image.src = app.icon;
    image.alt = "";
    element.appendChild(image);

    const label = document.createElement("label");
    label.textContent = app.name;
    element.appendChild(label);

    const launch = async () => {
      try {
        await registry().launch(app.id);
      } catch (error) {
        console.error("[DesktopFunctions]", error);
        window.alert(error.message || "功能启动失败。");
      }
    };
    element.addEventListener("click", launch);
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        launch();
      }
    });
    return element;
  }

  async function refresh() {
    const api = registry();
    const host = desktop();
    if (!api || !host) return;
    await api.ready();
    const catalog = await api.listCatalog();
    const knownIds = new Set(catalog.map((app) => app.id));

    for (const app of catalog) {
      const visible = await api.isDesktopVisible(app);
      let element = findExisting(app.id);
      if (!element && visible) {
        element = createDesktopIcon(app);
        host.appendChild(element);
        placeInFreeDesktopSlot(element, host);
      }
      if (element) {
        element.style.display = visible ? "" : "none";
        element.setAttribute("aria-hidden", visible ? "false" : "true");
        if (visible && element.classList.contains("function-desktop-icon") &&
            !element.dataset.wwGridSlot) {
          placeInFreeDesktopSlot(element, host);
        }
      }
    }

    document.querySelectorAll(".function-desktop-icon[data-function-id]")
      .forEach((element) => {
        if (!knownIds.has(element.dataset.functionId)) element.remove();
      });
  }

  window.WebWindows = window.WebWindows || {};
  window.WebWindows.desktopFunctions = { refresh };

  window.addEventListener("webwindows:installation-changed", () => {
    refresh().catch((error) => {
      console.error("[DesktopFunctions] 桌面功能状态刷新失败。", error);
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      refresh().catch((error) => {
        console.error("[DesktopFunctions] 初始化失败。", error);
      });
    }, { once: true });
  } else {
    refresh().catch((error) => {
      console.error("[DesktopFunctions] 初始化失败。", error);
    });
  }
})();

