(function initializeWallpaperLibrary() {
  "use strict";

  const LIBRARY_KEY = "webwindows.wallpaper.library.v1";
  const defaults = [
    "assets/wallpapers/wall1.jpg",
    "assets/wallpapers/wall2.jpg",
    "assets/wallpapers/wall3.jpg",
    "assets/wallpapers/wall4.jpg",
    "assets/wallpapers/wall5.jpg",
    "assets/wallpapers/wall6.jpg"
  ];

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

  function wallpaperItems() {
    const builtIn = (Array.isArray(window.wallpaperList) ? window.wallpaperList : defaults)
      .map((url) => ({ url, name: "内置壁纸" }));
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

  window.renderWallpaperLibrary = renderWallpaperLibrary;
  document.addEventListener("DOMContentLoaded", renderWallpaperLibrary);
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
