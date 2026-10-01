(function installTaskbarExperience() {
  "use strict";

  const ORDER_KEY = "webwindows.taskbarOrder";
  let dragged = null;
  let longPressTimer = null;
  let previewRequest = 0;
  let pendingPreviewTimer = null;
  let activePreviewId = null;

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
    preview.innerHTML = '<header><strong class="taskbar-window-preview__title"></strong><button type="button" class="taskbar-window-preview__close" aria-label="关闭预览">×</button></header><div class="taskbar-window-preview__viewport"></div>';
    preview.querySelector(".taskbar-window-preview__close").setAttribute("aria-label", translated("关闭预览"));
    preview.querySelector(".taskbar-window-preview__close").addEventListener("click", (event) => {
      event.stopPropagation();
      hidePreview();
    });
    preview.querySelector(".taskbar-window-preview__viewport").addEventListener("click", () => {
      const id = preview.dataset.windowId;
      const selector = id && window.CSS?.escape ? `.taskbar-app[data-id="${window.CSS.escape(id)}"]` : (id ? `.taskbar-app[data-id="${id}"]` : null);
      const target = selector && document.querySelector(selector);
      hidePreview();
      if (target) target.click();
    });
    preview.addEventListener("pointerleave", hidePreview);
    const header = preview.querySelector("header");
    header.style.cursor = "move";
    preview.querySelector(".taskbar-window-preview__viewport").style.cursor = "pointer";
    let dragPreview = null;
    header.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest?.(".taskbar-window-preview__close")) return;
      const rect = preview.getBoundingClientRect();
      dragPreview = { id: event.pointerId, dx: event.clientX - rect.left, dy: event.clientY - rect.top };
      preview.style.left = `${rect.left}px`;
      preview.style.top = `${rect.top}px`;
      preview.style.bottom = "auto";
      try { header.setPointerCapture(event.pointerId); } catch (_) {}
      event.preventDefault();
    });
    header.addEventListener("pointermove", (event) => {
      if (!dragPreview || event.pointerId !== dragPreview.id) return;
      const width = preview.offsetWidth || 304;
      const height = preview.offsetHeight || 240;
      preview.style.left = `${Math.max(4, Math.min(innerWidth - width - 4, event.clientX - dragPreview.dx))}px`;
      preview.style.top = `${Math.max(4, Math.min(innerHeight - height - 4, event.clientY - dragPreview.dy))}px`;
    });
    const endPreviewDrag = (event) => { if (dragPreview && event.pointerId === dragPreview.id) dragPreview = null; };
    header.addEventListener("pointerup", endPreviewDrag);
    header.addEventListener("pointercancel", endPreviewDrag);
    document.body.appendChild(preview);
    return preview;
  }

  function snapshotPlaceholder(message) {
    const fallback = document.createElement("div");
    fallback.className = "taskbar-window-preview__frame-placeholder";
    fallback.textContent = message;
    return fallback;
  }

  const SNAPSHOT_TIMEOUT_MS = 1500;

  function summaryCard(icon) {
    const card = document.createElement("div");
    card.className = "taskbar-window-preview__frame-placeholder";
    const art = icon.querySelector?.("img");
    if (art?.src) {
      const logo = document.createElement("img");
      logo.src = art.src;
      logo.alt = "";
      logo.style.width = "44px";
      logo.style.height = "44px";
      logo.style.borderRadius = "9px";
      logo.style.objectFit = "contain";
      card.appendChild(logo);
    }
    const body = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = icon.title || icon.innerText.trim() || translated("窗口");
    const excerpt = document.createElement("span");
    excerpt.textContent = windowSummary(icon).slice(0, 120);
    excerpt.style.display = "-webkit-box";
    excerpt.style.webkitLineClamp = "3";
    excerpt.style.webkitBoxOrient = "vertical";
    excerpt.style.whiteSpace = "normal";
    excerpt.style.overflow = "hidden";
    body.appendChild(name);
    body.appendChild(excerpt);
    card.appendChild(body);
    return card;
  }

  async function buildWindowSnapshot(win, viewport, requestId) {
    if (typeof window.html2canvas !== "function") return;

    const rect = win.getBoundingClientRect();
    const width = rect.width || win.offsetWidth || parseFloat(getComputedStyle(win).width) || 640;
    const height = rect.height || win.offsetHeight || parseFloat(getComputedStyle(win).height) || 420;

    let rendered;
    try {
      const renderTask = window.html2canvas(win, {
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: false,
        scale: 0.5,
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
      const timeoutTask = new Promise((_, reject) => setTimeout(() => reject(new Error("snapshot timeout")), SNAPSHOT_TIMEOUT_MS));
      rendered = await Promise.race([renderTask, timeoutTask]);
    } catch (error) {
      console.warn("[TaskbarPreview] Window snapshot skipped, keeping summary", error?.message || error);
      return;
    }
    if (requestId !== previewRequest || viewport.closest(".taskbar-window-preview")?.hidden) return;

    try {
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
      viewport.replaceChildren(thumbnail);
    } catch (error) {
      console.warn("[TaskbarPreview] Window snapshot failed, keeping summary", error);
    }
  }

  function renderPreviewShell(icon) {
    const preview = previewElement();
    const title = preview.querySelector(".taskbar-window-preview__title");
    if (title) title.textContent = icon.title || icon.innerText.trim() || translated("窗口");
    preview.dataset.windowId = icon.dataset.id || "";
    const viewport = preview.querySelector(".taskbar-window-preview__viewport");
    viewport.replaceChildren(summaryCard(icon));
    const rect = icon.getBoundingClientRect();
    preview.hidden = false;
    activePreviewId = icon.dataset.id || null;
    const width = preview.offsetWidth || 304;
    preview.style.left = `${Math.max(8, Math.min(innerWidth - width - 8, rect.left + rect.width / 2 - width / 2))}px`;
    preview.style.bottom = `${Math.max(52, innerHeight - rect.top + 8)}px`;
    preview.style.top = "auto";
    return viewport;
  }

  function showPreview(icon, immediate) {
    if (matchMedia("(hover: none)").matches) return;
    const livePreview = document.getElementById("taskbar-window-preview");
    const sameVisible = !!icon.dataset.id && icon.dataset.id === activePreviewId && !!livePreview && !livePreview.hidden;
    if (pendingPreviewTimer) { clearTimeout(pendingPreviewTimer); pendingPreviewTimer = null; }
    if (sameVisible) return;
    const requestId = ++previewRequest;
    const viewport = renderPreviewShell(icon);
    const win = document.getElementById(icon.dataset.id);
    if (!win) {
      viewport.replaceChildren(snapshotPlaceholder(translated("窗口内容暂不可用。")));
      return;
    }
    const runSnapshot = () => {
      pendingPreviewTimer = null;
      buildWindowSnapshot(win, viewport, requestId);
    };
    if (immediate) runSnapshot();
    else pendingPreviewTimer = setTimeout(runSnapshot, 120);
  }

  function hidePreview() {
    if (pendingPreviewTimer) { clearTimeout(pendingPreviewTimer); pendingPreviewTimer = null; }
    activePreviewId = null;
    previewRequest += 1;
    const preview = document.getElementById("taskbar-window-preview");
    if (preview) {
      preview.hidden = true;
      preview.querySelector(".taskbar-window-preview__viewport")?.replaceChildren();
    }
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
  }

  document.addEventListener("pointerover", (event) => {
    const icon = event.target.closest?.(".taskbar-app[data-id]");
    const previousIcon = event.relatedTarget?.closest?.(".taskbar-app[data-id]");
    if (icon && icon !== previousIcon) showPreview(icon, false);
  });
  document.addEventListener("pointerout", (event) => {
    const fromIcon = event.target.closest?.(".taskbar-app[data-id]");
    if (!fromIcon) return;
    if (event.relatedTarget?.closest?.(".taskbar-app[data-id]") === fromIcon) return;
    if (event.relatedTarget?.closest?.(".taskbar-window-preview")) return;
    hidePreview();
  });
  document.addEventListener("focusin", (event) => { const icon = event.target.closest?.(".taskbar-app[data-id]"); if (icon) showPreview(icon, true); });
  document.addEventListener("focusout", (event) => { if (event.target.closest?.(".taskbar-app[data-id]")) hidePreview(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") hidePreview(); });

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
