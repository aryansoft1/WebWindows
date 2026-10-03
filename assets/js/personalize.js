/* personalize.js — 桌面个性化应用器（主题色 / 毛玻璃 / 任务栏）。
 * - 所有偏好只读写 localStorage，默认主题蓝 #0078d7、模糊 8px、24 小时制、普通图标。
 * - 设置页（iframe）通过宿主 localStorage + storage 事件实时生效，无需刷新。
 * - 对外暴露 window.WebWindowsPersonalize 供设置页调用，读不到时设置页直接读写宿主 storage。
 */
(function () {
  "use strict";

  const KEYS = {
    accent: "webwindows.theme.accent",
    acrylic: "webwindows.theme.acrylic",
    clock12: "webwindows.taskbar.clock12",
    icons: "webwindows.taskbar.icons",
    pinned: "webwindows.startmenu.pinned",
  };

  const DEFAULTS = {
    accent: "#0078d7",
    acrylic: 8,
    clock12: false,
    icons: "normal",
  };

  const ACCENT_PATTERN = /^#[0-9a-f]{6}$/i;

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (_) {}
  }

  function readAccent() {
    const stored = readStorage(KEYS.accent);
    return stored && ACCENT_PATTERN.test(stored) ? stored.toLowerCase() : DEFAULTS.accent;
  }

  function readAcrylic() {
    const raw = readStorage(KEYS.acrylic);
    if (raw == null || raw === "") return DEFAULTS.acrylic;
    const stored = Number(raw);
    if (!Number.isFinite(stored)) return DEFAULTS.acrylic;
    return Math.max(0, Math.min(20, Math.round(stored)));
  }

  function readClock12() {
    const stored = readStorage(KEYS.clock12);
    if (stored == null) return DEFAULTS.clock12;
    return stored === "1" || stored === "true";
  }

  function readIconSize() {
    const stored = readStorage(KEYS.icons);
    return stored === "large" ? "large" : DEFAULTS.icons;
  }

  function applyAll() {
    try {
      const root = document.documentElement;
      root.style.setProperty("--ww-accent", readAccent());
      root.style.setProperty("--ww-acrylic-blur", `${readAcrylic()}px`);
      root.dataset.wwTaskbarIcons = readIconSize();
    } catch (_) {}
  }

  function notifyChanged(detail) {
    try {
      window.dispatchEvent(new CustomEvent("webwindows:personalize-changed", { detail }));
    } catch (_) {}
  }

  function setAccent(value) {
    const next = typeof value === "string" && ACCENT_PATTERN.test(value.trim())
      ? value.trim().toLowerCase()
      : DEFAULTS.accent;
    writeStorage(KEYS.accent, next);
    applyAll();
    notifyChanged({ key: KEYS.accent, value: next });
    return next;
  }

  function setAcrylic(px) {
    const next = Number.isFinite(Number(px))
      ? Math.max(0, Math.min(20, Math.round(Number(px))))
      : DEFAULTS.acrylic;
    writeStorage(KEYS.acrylic, String(next));
    applyAll();
    notifyChanged({ key: KEYS.acrylic, value: next });
    return next;
  }

  function setClock12(enabled) {
    const next = enabled === true;
    writeStorage(KEYS.clock12, next ? "1" : "0");
    try {
      if (typeof window.updateTaskbarClock === "function") window.updateTaskbarClock(false);
    } catch (_) {}
    notifyChanged({ key: KEYS.clock12, value: next });
    return next;
  }

  function setIconSize(size) {
    const next = size === "large" ? "large" : DEFAULTS.icons;
    writeStorage(KEYS.icons, next);
    applyAll();
    notifyChanged({ key: KEYS.icons, value: next });
    return next;
  }

  function readAll() {
    return {
      accent: readAccent(),
      acrylic: readAcrylic(),
      clock12: readClock12(),
      icons: readIconSize(),
    };
  }

  window.WebWindowsPersonalize = {
    KEYS,
    DEFAULTS,
    readAll,
    applyAll,
    setAccent,
    setAcrylic,
    setClock12,
    setIconSize,
  };

  window.addEventListener("storage", (event) => {
    if (!event || !Object.values(KEYS).includes(event.key)) return;
    applyAll();
    if (event.key === KEYS.clock12) {
      try {
        if (typeof window.updateTaskbarClock === "function") window.updateTaskbarClock(false);
      } catch (_) {}
    }
  });
  window.addEventListener("webwindows:personalize-changed", () => applyAll());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAll, { once: true });
  } else {
    applyAll();
  }
})();
