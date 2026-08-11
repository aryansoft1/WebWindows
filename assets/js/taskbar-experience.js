(function installTaskbarExperience() {
  "use strict";

  const ORDER_KEY = "webwindows.taskbarOrder";
  let dragged = null;
  let longPressTimer = null;
  let previewRequest = 0;
  let previewShowTimer = null;
  let previewHideTimer = null;
  const thumbnailCache = new Map();
  const PREVIEW_SHOW_DELAY = 110;
  const PREVIEW_HIDE_DELAY = 240;
  const THUMBNAIL_CACHE_MS = 2500;

  function taskbarApps() {
    return [...document.querySelectorAll(".taskbar-app[data-id]")];
  }

  function translated(text) {
    return window.WebWindowsI18n?.translate?.(text) || text;
  }

  function windowSummary(icon) {
    const win = document.getElementById(icon.dataset.id);
    if (!win) return "窗口内容暂不可用。";
    let text = "";
    const frame = win.querySelector("iframe");
    if (frame) {
      try { text = frame.contentDocument?.body?.innerText || ""; }
      catch (_) { text = "跨域窗口内容受浏览器保护，无法生成内容缩略。"; }
    }
    if (!text) text = win.querySelector(".window-content, .window-body")?.innerText || win.innerText || "";
    const summary = text.replace(/\s+/g, " ").trim().slice(0, 260);
    const language = window.WebWindowsI18n?.getLanguage?.() || "zh";
    if (language !== "zh" && /[\u3400-\u9fff]/.test(summary)) {
      return translated("窗口已打开，请打开窗口查看内容。");
    }
    return summary || translated("窗口已打开，暂无可读取的文字内容。");
  }

  function previewElement() {
    let preview = document.getElementById("taskbar-window-preview");
    if (preview) return preview;
    preview = document.createElement("aside");
    preview.id = "taskbar-window-preview";
    preview.className = "taskbar-window-preview";
    preview.hidden = true;
    preview.innerHTML = '<strong class="taskbar-window-preview__title"></strong><div class="taskbar-window-preview__viewport"></div>';
    document.body.appendChild(preview);
    return preview;
  }

  function snapshotPlaceholder(message) {
    const fallback = document.createElement("div");
    fallback.className = "taskbar-window-preview__frame-placeholder";
    fallback.textContent = message;
    return fallback;
  }

  function snapshotImage(dataUrl) {
    const image = document.createElement("img");
    image.className = "taskbar-window-preview__snapshot";
    image.alt = translated("窗口截图");
    image.src = dataUrl;
    return image;
  }

  function captureTarget(win) {
    const frame = win.querySelector("iframe");
    if (!frame) return { element: win, width: 0, height: 0 };
    try {
      const frameDocument = frame.contentDocument;
      const element = frameDocument?.body || frameDocument?.documentElement;
      if (!element) throw new Error("iframe_document_unavailable");
      return {
        element,
        width: frame.clientWidth || frameDocument.documentElement?.clientWidth || 640,
        height: frame.clientHeight || frameDocument.documentElement?.clientHeight || 420,
      };
    } catch (_) {
      return { element: win, width: 0, height: 0 };
    }
  }

  async function buildWindowSnapshot(win, viewport, requestId) {
    if (typeof window.html2canvas !== "function") {
      viewport.replaceChildren(snapshotPlaceholder(translated("窗口截图组件未加载。")));
      return;
    }

    const cached = thumbnailCache.get(win.id);
    if (cached && Date.now() - cached.createdAt < THUMBNAIL_CACHE_MS) {
      viewport.replaceChildren(snapshotImage(cached.dataUrl));
      return;
    }
    const target = captureTarget(win);
    const rect = target.element.getBoundingClientRect();
    const width = target.width || rect.width || win.offsetWidth || parseFloat(getComputedStyle(win).width) || 640;
    const height = target.height || rect.height || win.offsetHeight || parseFloat(getComputedStyle(win).height) || 420;
    viewport.replaceChildren(snapshotPlaceholder(translated("正在生成窗口截图…")));

    try {
      const rendered = await window.html2canvas(target.element, {
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: false,
        scale: 1,
        width,
        height,
        onclone(clonedDocument) {
          const clonedWindow = clonedDocument.getElementById(win.id);
          if (!clonedWindow) return;
          clonedWindow.hidden = false;
          clonedWindow.classList.remove("minimized");
          clonedWindow.style.setProperty("display", "block", "important");
          clonedWindow.style.setProperty("visibility", "visible", "important");
          clonedWindow.style.setProperty("opacity", "1", "important");
          clonedWindow.style.setProperty("transform", "none", "important");
        },
      });
      if (requestId !== previewRequest || viewport.closest(".taskbar-window-preview")?.hidden) return;

      const thumbnail = document.createElement("canvas");
      thumbnail.className = "taskbar-window-preview__snapshot";
      thumbnail.width = 280;
      thumbnail.height = 176;
      thumbnail.setAttribute("aria-label", translated("窗口截图"));
      const context = thumbnail.getContext("2d");
      context.fillStyle = "#dce3ec";
      context.fillRect(0, 0, thumbnail.width, thumbnail.height);
      const scale = Math.min(thumbnail.width / rendered.width, thumbnail.height / rendered.height);
      const drawWidth = rendered.width * scale;
      const drawHeight = rendered.height * scale;
      context.drawImage(
        rendered,
        (thumbnail.width - drawWidth) / 2,
        (thumbnail.height - drawHeight) / 2,
        drawWidth,
        drawHeight
      );
      try {
        const dataUrl = thumbnail.toDataURL("image/png");
        thumbnailCache.set(win.id, { createdAt: Date.now(), dataUrl });
        viewport.replaceChildren(snapshotImage(dataUrl));
      } catch (_) {
        viewport.replaceChildren(thumbnail);
      }
    } catch (error) {
      console.warn("[TaskbarPreview] Window screenshot failed", error);
      if (requestId === previewRequest) {
        viewport.replaceChildren(snapshotPlaceholder(translated("无法生成窗口截图。")));
      }
    }
  }

  async function showPreview(icon) {
    if (matchMedia("(hover: none)").matches) return;
    clearTimeout(previewHideTimer);
    const requestId = ++previewRequest;
    const preview = previewElement();
    preview.dataset.windowId = icon.dataset.id || "";
    preview.querySelector("strong").textContent = icon.title || icon.innerText.trim() || translated("窗口");
    const win = document.getElementById(icon.dataset.id);
    const viewport = preview.querySelector(".taskbar-window-preview__viewport");
    if (win) buildWindowSnapshot(win, viewport, requestId);
    else viewport.textContent = translated("窗口内容暂不可用。");
    const rect = icon.getBoundingClientRect();
    preview.hidden = false;
    const width = preview.offsetWidth || 260;
    preview.style.left = `${Math.max(8, Math.min(innerWidth - width - 8, rect.left + rect.width / 2 - width / 2))}px`;
    preview.style.bottom = `${Math.max(52, innerHeight - rect.top + 8)}px`;
  }

  function hidePreview() {
    clearTimeout(previewShowTimer);
    previewRequest += 1;
    const preview = document.getElementById("taskbar-window-preview");
    if (preview) {
      preview.hidden = true;
      preview.dataset.windowId = "";
    }
  }

  function scheduleShowPreview(icon) {
    clearTimeout(previewHideTimer);
    clearTimeout(previewShowTimer);
    previewShowTimer = setTimeout(() => showPreview(icon), PREVIEW_SHOW_DELAY);
  }

  function scheduleHidePreview() {
    clearTimeout(previewShowTimer);
    clearTimeout(previewHideTimer);
    previewHideTimer = setTimeout(hidePreview, PREVIEW_HIDE_DELAY);
  }

  function taskView() {
    let overlay = document.getElementById("task-view-overlay");
    if (overlay) return overlay;
    overlay = document.createElement("section");
    overlay.id = "task-view-overlay";
    overlay.className = "task-view-overlay";
    overlay.hidden = true;
    overlay.innerHTML = '<div class="task-view-panel" role="dialog" aria-modal="true" aria-label="任务视图"><h2>任务视图</h2><div class="task-view-grid"></div></div>';
    overlay.addEventListener("click", (event) => { if (event.target === overlay) overlay.hidden = true; });
    document.body.appendChild(overlay);
    return overlay;
  }

  function openTaskView() {
    const overlay = taskView();
    const grid = overlay.querySelector(".task-view-grid");
    grid.replaceChildren();
    taskbarApps().forEach((icon) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "task-view-card";
      const title = document.createElement("strong");
      title.textContent = icon.title || icon.innerText.trim() || translated("窗口");
      const summary = document.createElement("span");
      summary.textContent = windowSummary(icon);
      card.append(title, summary);
      card.addEventListener("click", () => { overlay.hidden = true; icon.click(); });
      grid.appendChild(card);
    });
    overlay.hidden = false;
  }

  function saveOrder() {
    localStorage.setItem(ORDER_KEY, JSON.stringify(taskbarApps().map((icon) => icon.dataset.id)));
  }

  function applyOrder() {
    let order = [];
    try { order = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]"); } catch (_) {}
    const strip = document.querySelector(".taskbar-app-strip");
    if (!strip) return;
    const icons = taskbarApps();
    const rank = new Map(order.map((id, index) => [id, index]));
    const desired = [...icons].sort((a, b) =>
      (rank.get(a.dataset.id) ?? Number.MAX_SAFE_INTEGER) -
      (rank.get(b.dataset.id) ?? Number.MAX_SAFE_INTEGER)
    );
    if (desired.some((icon, index) => icon !== icons[index])) {
      desired.forEach((icon) => strip.appendChild(icon));
    }
    desired.forEach((icon) => { icon.draggable = true; });

    const liveWindowIds = new Set(icons.map((icon) => icon.dataset.id).filter((id) => document.getElementById(id)));
    for (const id of thumbnailCache.keys()) if (!liveWindowIds.has(id)) thumbnailCache.delete(id);
    const preview = document.getElementById("taskbar-window-preview");
    if (preview?.dataset.windowId && !liveWindowIds.has(preview.dataset.windowId)) hidePreview();
  }

  document.addEventListener("load", (event) => {
    const frame = event.target?.closest?.(".window iframe") || (event.target?.matches?.(".window iframe") ? event.target : null);
    const win = frame?.closest?.(".window");
    if (win?.id) thumbnailCache.delete(win.id);
  }, true);
  document.addEventListener("webwindows:window-content-changed", (event) => {
    const id = event.detail?.windowId;
    if (id) thumbnailCache.delete(String(id).startsWith("win-") ? String(id) : `win-${id}`);
  });

  document.addEventListener("pointerover", (event) => {
    const icon = event.target.closest?.(".taskbar-app[data-id]");
    const previousIcon = event.relatedTarget?.closest?.(".taskbar-app[data-id]");
    if (icon && icon !== previousIcon) scheduleShowPreview(icon);
  });
  document.addEventListener("pointerout", (event) => {
    if (event.target.closest?.(".taskbar-app[data-id]") && !event.relatedTarget?.closest?.(".taskbar-window-preview")) scheduleHidePreview();
  });
  document.addEventListener("focusin", (event) => { const icon = event.target.closest?.(".taskbar-app[data-id]"); if (icon) showPreview(icon); });
  document.addEventListener("focusout", (event) => { if (event.target.closest?.(".taskbar-app[data-id]")) scheduleHidePreview(); });
  document.addEventListener("pointerover", (event) => { if (event.target.closest?.(".taskbar-window-preview")) clearTimeout(previewHideTimer); });
  document.addEventListener("pointerout", (event) => {
    if (event.target.closest?.(".taskbar-window-preview") && !event.relatedTarget?.closest?.(".taskbar-app[data-id]")) scheduleHidePreview();
  });

  document.addEventListener("pointerdown", (event) => {
    const icon = event.target.closest?.(".taskbar-app[data-id]");
    if (!icon || (event.pointerType !== "touch" && event.pointerType !== "pen")) return;
    longPressTimer = setTimeout(() => { longPressTimer = null; openTaskView(); }, 560);
  });
  ["pointerup", "pointercancel", "pointermove"].forEach((name) => document.addEventListener(name, () => {
    if (longPressTimer) clearTimeout(longPressTimer);
    longPressTimer = null;
  }));

  document.addEventListener("dragstart", (event) => {
    dragged = event.target.closest?.(".taskbar-app[data-id]") || null;
    dragged?.classList.add("is-dragging");
  });
  document.addEventListener("dragover", (event) => {
    const target = event.target.closest?.(".taskbar-app[data-id]");
    if (!dragged || !target || dragged === target) return;
    event.preventDefault();
    const rect = target.getBoundingClientRect();
    target.parentElement.insertBefore(dragged, event.clientX < rect.left + rect.width / 2 ? target : target.nextSibling);
  });
  document.addEventListener("dragend", () => {
    dragged?.classList.remove("is-dragging");
    if (dragged) saveOrder();
    dragged = null;
  });

  const observer = new MutationObserver(applyOrder);
  document.addEventListener("DOMContentLoaded", () => {
    applyOrder();
    document.getElementById("task-view-button")?.addEventListener("click", openTaskView);
    observer.observe(document.body, { childList: true, subtree: true });
  }, { once: true });

  window.WebWindows = window.WebWindows || {};
  window.WebWindows.taskView = Object.freeze({ open: openTaskView, getOrder: () => taskbarApps().map((icon) => icon.dataset.id) });
})();
