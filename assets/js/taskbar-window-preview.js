(function installTaskbarWindowPreview() {
  "use strict";

  const THUMBNAIL_WIDTH = 280;
  const THUMBNAIL_HEIGHT = 176;
  let requestId = 0;

  function translate(text) {
    return window.WebWindowsI18n?.translate?.(text) || text;
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

  function placeholder(message) {
    const element = document.createElement("div");
    element.className = "taskbar-window-preview__placeholder";
    element.textContent = message;
    return element;
  }

  async function renderThumbnail(win, viewport, activeRequest) {
    if (typeof window.html2canvas !== "function") {
      viewport.replaceChildren(placeholder(translate("窗口截图组件未加载。")));
      return;
    }

    const rect = win.getBoundingClientRect();
    const style = getComputedStyle(win);
    const width = rect.width || win.offsetWidth || parseFloat(style.width) || 640;
    const height = rect.height || win.offsetHeight || parseFloat(style.height) || 420;
    viewport.replaceChildren(placeholder(translate("正在生成窗口截图…")));

    try {
      const rendered = await window.html2canvas(win, {
        backgroundColor: null,
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

      if (activeRequest !== requestId || viewport.closest(".taskbar-window-preview")?.hidden) return;
      const thumbnail = document.createElement("canvas");
      thumbnail.className = "taskbar-window-preview__snapshot";
      thumbnail.width = THUMBNAIL_WIDTH;
      thumbnail.height = THUMBNAIL_HEIGHT;
      thumbnail.setAttribute("role", "img");
      thumbnail.setAttribute("aria-label", translate("窗口截图"));
      const context = thumbnail.getContext("2d");
      context.fillStyle = "#dce3ec";
      context.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
      const scale = Math.min(THUMBNAIL_WIDTH / rendered.width, THUMBNAIL_HEIGHT / rendered.height);
      const drawWidth = rendered.width * scale;
      const drawHeight = rendered.height * scale;
      context.drawImage(rendered, (THUMBNAIL_WIDTH - drawWidth) / 2, (THUMBNAIL_HEIGHT - drawHeight) / 2, drawWidth, drawHeight);
      viewport.replaceChildren(thumbnail);
    } catch (error) {
      console.warn("[TaskbarPreview] Window screenshot failed", error);
      if (activeRequest === requestId) {
        viewport.replaceChildren(placeholder(translate("无法生成窗口截图。")));
      }
    }
  }

  function showPreview(icon) {
    if (matchMedia("(hover: none)").matches) return;
    const activeRequest = ++requestId;
    const preview = previewElement();
    const win = document.getElementById(icon.dataset.id);
    preview.querySelector(".taskbar-window-preview__title").textContent = icon.title || translate("窗口");
    const viewport = preview.querySelector(".taskbar-window-preview__viewport");
    if (win) renderThumbnail(win, viewport, activeRequest);
    else viewport.replaceChildren(placeholder(translate("窗口内容暂不可用。")));
    const rect = icon.getBoundingClientRect();
    preview.hidden = false;
    const width = preview.offsetWidth || 304;
    preview.style.left = `${Math.max(8, Math.min(innerWidth - width - 8, rect.left + rect.width / 2 - width / 2))}px`;
    preview.style.bottom = `${Math.max(52, innerHeight - rect.top + 8)}px`;
  }

  function hidePreview() {
    requestId += 1;
    const preview = document.getElementById("taskbar-window-preview");
    if (!preview) return;
    preview.hidden = true;
    preview.querySelector(".taskbar-window-preview__viewport")?.replaceChildren();
  }

  document.addEventListener("pointerover", (event) => {
    const icon = event.target.closest?.(".taskbar-app[data-id]");
    const previous = event.relatedTarget?.closest?.(".taskbar-app[data-id]");
    if (icon && icon !== previous) showPreview(icon);
  });
  document.addEventListener("pointerout", (event) => {
    if (event.target.closest?.(".taskbar-app[data-id]") && !event.relatedTarget?.closest?.(".taskbar-window-preview")) hidePreview();
  });
  document.addEventListener("focusin", (event) => {
    const icon = event.target.closest?.(".taskbar-app[data-id]");
    if (icon) showPreview(icon);
  });
  document.addEventListener("focusout", (event) => {
    if (event.target.closest?.(".taskbar-app[data-id]")) hidePreview();
  });
})();
