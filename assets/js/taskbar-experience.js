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

  const SNAPSHOT_TIMEOUT_MS = 1500;

  const CHROME_SEL = 'header,nav,footer,.window-header,.appbar,.toolbar,.menubar,.menu,.titlebar,.buttons,.templatebar,.hfbar,.footer,.outline,.findpanel,.notice,.statusbar,[role="toolbar"],[role="menubar"],[role="navigation"],[role="status"]';

  function collectWindowText(root, maxChars) {
    const chunks = [];
    let chars = 0;
    const BLOCK = /^(ADDRESS|ARTICLE|ASIDE|BLOCKQUOTE|BR|DD|DIALOG|DIV|DL|DT|FIELDSET|FIGCAPTION|FIGURE|FOOTER|FORM|H1|H2|H3|H4|H5|H6|HEADER|HR|LI|MAIN|NAV|OL|P|PRE|SECTION|TABLE|TR|UL)$/;
    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|SVG)$/;
    const walk = (node) => {
      if (!node || chars >= maxChars) return;
      if (node.nodeType === 3) {
        const value = (node.nodeValue || "").replace(/\s+/g, " ");
        if (value.trim()) {
          chunks.push(value.trim());
          chars += value.length;
        }
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName;
      if (SKIP.test(tag)) return;
      if (node.matches && node.matches(CHROME_SEL)) return;
      if (tag === "BR" || tag === "HR") { chunks.push("\n"); return; }
      const newline = BLOCK.test(tag);
      if (newline) chunks.push("\n");
      let child = node.firstChild;
      while (child) {
        walk(child);
        child = child.nextSibling;
        if (chars >= maxChars) break;
      }
      if (newline) chunks.push("\n");
    };
    walk(root);
    return chunks.join(" ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n");
  }

  function extractMiniLines(win) {
    let source = null;
    try {
      const frame = win.querySelector("iframe");
      const doc = frame ? frame.contentDocument : null;
      if (doc && doc.body) source = doc.body;
    } catch (_) { source = null; }
    if (!source) source = win.querySelector(".window-content, .window-body") || win;
    return collectWindowText(source, 600).split("\n").map((line) => line.trim()).filter(Boolean);
  }

  function liveMiniature(icon, win) {
    const box = document.createElement("div");
    box.dataset.miniature = "1";
    box.style.width = "280px";
    box.style.height = "176px";
    box.style.overflow = "hidden";
    box.style.borderRadius = "7px";
    box.style.background = "#ffffff";
    box.style.display = "flex";
    box.style.flexDirection = "column";
    box.style.textAlign = "left";
    box.style.pointerEvents = "none";

    const bar = document.createElement("div");
    bar.style.display = "flex";
    bar.style.alignItems = "center";
    bar.style.gap = "6px";
    bar.style.flex = "0 0 26px";
    bar.style.padding = "0 8px";
    bar.style.background = "#eef2f6";
    bar.style.borderBottom = "1px solid #e2e8f0";
    const art = icon.querySelector ? icon.querySelector("img") : null;
    if (art && art.src) {
      const logo = document.createElement("img");
      logo.src = art.src;
      logo.alt = "";
      logo.style.width = "14px";
      logo.style.height = "14px";
      logo.style.borderRadius = "3px";
      logo.style.objectFit = "contain";
      bar.appendChild(logo);
    }
    const name = document.createElement("span");
    const label = icon.title || icon.innerText.trim() || translated("窗口");
    name.textContent = label;
    name.style.flex = "1";
    name.style.minWidth = "0";
    name.style.overflow = "hidden";
    name.style.textOverflow = "ellipsis";
    name.style.whiteSpace = "nowrap";
    name.style.fontSize = "11px";
    name.style.fontWeight = "600";
    name.style.color = "#24344d";
    bar.appendChild(name);
    box.appendChild(bar);

    const page = document.createElement("div");
    page.style.flex = "1";
    page.style.overflow = "hidden";
    page.style.padding = "8px 10px";
    page.style.background = "#ffffff";
    let lines = win ? extractMiniLines(win) : [];
    const norm = (value) => value.replace(/\s+/g, "").toLowerCase();
    const dup = lines.slice(0, 3).findIndex((line) => norm(line) === norm(label));
    if (dup >= 0) lines.splice(dup, 1);
    if (!lines.length) lines = [windowSummary(icon)];
    lines.slice(0, 8).forEach((line, index) => {
      const row = document.createElement("div");
      row.textContent = line.slice(0, 48);
      row.style.fontSize = index === 0 ? "10px" : "9px";
      row.style.fontWeight = index === 0 ? "600" : "400";
      row.style.color = index === 0 ? "#0f172a" : "#475569";
      row.style.lineHeight = "1.55";
      row.style.whiteSpace = "nowrap";
      row.style.overflow = "hidden";
      row.style.textOverflow = "ellipsis";
      page.appendChild(row);
    });
    box.appendChild(page);
    return box;
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
      console.warn("[TaskbarPreview] Window snapshot skipped, keeping miniature", error?.message || error);
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
      console.warn("[TaskbarPreview] Window snapshot failed, keeping miniature", error);
    }
  }

  function renderPreviewShell(icon, win) {
    const preview = previewElement();
    const title = preview.querySelector(".taskbar-window-preview__title");
    if (title) title.textContent = icon.title || icon.innerText.trim() || translated("窗口");
    preview.dataset.windowId = icon.dataset.id || "";
    const viewport = preview.querySelector(".taskbar-window-preview__viewport");
    viewport.replaceChildren(liveMiniature(icon, win));
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
    const win = document.getElementById(icon.dataset.id);
    const viewport = renderPreviewShell(icon, win);
    if (!win) return;
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
