(function initializeWallpaperLibrary() {
  "use strict";

  const LIBRARY_KEY = "webwindows.wallpaper.library.v1";
  const CATALOG_URL = "api/wallpapers.asp";
  const MANIFEST_URL = "assets/data/wallpaper-index.json";
  let builtInWallpapers = [];
  let catalogRequested = false;
  let renderedSignature = null;

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

  function readJson(url) {
    return fetch(url, { cache: "no-cache" }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    });
  }

  function applyCatalog(payload) {
    const entries = Array.isArray(payload) ? payload : payload?.wallpapers;
    builtInWallpapers = (Array.isArray(entries) ? entries : [])
      .map(normalizeEntry)
      .filter(Boolean);
  }

  /* The live catalogue reflects administrator uploads; the generated manifest
   * keeps the library working when the endpoint is unavailable. */
  function loadBuiltInWallpapers() {
    if (catalogRequested) return Promise.resolve();
    catalogRequested = true;
    return readJson(CATALOG_URL)
      .then(applyCatalog)
      .catch(() => readJson(MANIFEST_URL).then(applyCatalog))
      .catch(() => {
        builtInWallpapers = [];
        catalogRequested = false;
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
    syncActiveWallpaper(container, item.url);
  }

  function syncActiveWallpaper(container, current) {
    container.querySelectorAll("img[data-wallpaper-url]").forEach((node) => {
      node.classList.toggle("active", node.dataset.wallpaperUrl === current);
    });
  }

  /* Rebuilding the grid restarts every <img> request, and Chromium reports the
   * superseded ones as (canceled), which leaves blank thumbnails. The tab
   * switch and the catalogue fetch both call this, so an unchanged item set
   * must not touch the DOM at all, and a selection change must only move the
   * highlight. */
  function renderWallpaperLibrary() {
    const container = document.getElementById("wallpaperThumbnails");
    if (!container) return;
    const current = localStorage.getItem("selectedWallpaper");
    const items = wallpaperItems();
    const signature = items.map((item) => `${item.url}\u0000${item.name || ""}`).join("\u0001");

    if (signature === renderedSignature) {
      syncActiveWallpaper(container, current);
      return;
    }
    renderedSignature = signature;
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
      image.dataset.wallpaperUrl = item.url;
      image.className = "wallpaper-thumb";
      image.alt = item.name || "桌面壁纸";
      image.title = item.name || item.url;
      if (current === item.url) image.classList.add("active");
      image.addEventListener("click", () => applyWallpaper(item, image, container));
      container.appendChild(image);
    });
    syncActiveWallpaper(container, current);
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
