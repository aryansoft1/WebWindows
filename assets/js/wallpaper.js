(function initializeWallpaperLibrary() {
  "use strict";

  const LIBRARY_KEY = "webwindows.wallpaper.library.v1";
  const MANIFEST_URL = "assets/data/wallpaper-index.json";
  let builtInWallpapers = [];
  let manifestRequested = false;

  function readCloudLibrary() {
    try {
      const value = JSON.parse(localStorage.getItem(LIBRARY_KEY) || "[]");
      return Array.isArray(value)
        ? value.map((item) => typeof item === "string" ? { url: item, name: "" } : item)
          .filter((item) => item?.url)
        : [];
    } catch (_) {
      return [];
    }
  }

  function normalizeEntry(entry) {
    if (typeof entry === "string") return { url: entry, name: "" };
    const url = entry?.url || entry?.path;
    if (!url) return null;
    return { url, name: entry.name || "" };
  }

  function loadBuiltInWallpapers() {
    if (manifestRequested) return Promise.resolve();
    manifestRequested = true;
    return fetch(MANIFEST_URL, { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        const entries = Array.isArray(payload) ? payload : payload?.wallpapers;
        builtInWallpapers = (Array.isArray(entries) ? entries : [])
          .map(normalizeEntry)
          .filter(Boolean);
      })
      .catch(() => {
        builtInWallpapers = [];
        manifestRequested = false;
      });
  }

  function wallpaperItems() {
    const injected = Array.isArray(window.wallpaperList) ? window.wallpaperList : null;
    const source = (injected || builtInWallpapers).map(normalizeEntry).filter(Boolean);
    const builtIn = source.map((item) => ({
      url: item.url,
      name: item.name || "内置壁纸"
    }));
    const seen = new Set();
    return [...builtIn, ...readCloudLibrary()].filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
  }

  function applyWallpaper(item, image, container) {
    localStorage.setItem("selectedWallpaper", item.url);
    const host = window.parent && window.parent !== window ? window.parent : window;
    host.localStorage.setItem("selectedWallpaper", item.url);
    host.setWallpaperByPath?.(item.url);
    container.querySelectorAll("img").forEach((node) => node.classList.remove("active"));
    image.classList.add("active");
  }

  function renderWallpaperLibrary() {
    const container = document.getElementById("wallpaperThumbnails");
    if (!container) return;
    const current = localStorage.getItem("selectedWallpaper");
    const items = wallpaperItems();
    container.replaceChildren();

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "wallpaper-empty";
      empty.textContent = "壁纸库暂时为空。";
      container.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const image = document.createElement("img");
      image.src = item.url;
      image.className = "wallpaper-thumb";
      image.alt = item.name || "桌面壁纸";
      image.title = item.name || item.url;
      if (current === item.url) image.classList.add("active");
      image.addEventListener("click", () => applyWallpaper(item, image, container));
      container.appendChild(image);
    });
  }

  function refreshWallpaperLibrary() {
    return loadBuiltInWallpapers().then(renderWallpaperLibrary);
  }

  window.renderWallpaperLibrary = renderWallpaperLibrary;
  window.refreshWallpaperLibrary = refreshWallpaperLibrary;
  document.addEventListener("DOMContentLoaded", refreshWallpaperLibrary);
  window.addEventListener("storage", (event) => {
    if (event.key === LIBRARY_KEY || event.key === "selectedWallpaper") {
      renderWallpaperLibrary();
    }
  });
  window.addEventListener("message", (event) => {
    if (event.data?.type === "webwindows:wallpaper-library-changed") {
      renderWallpaperLibrary();
    }
  });
})();
