(function installWebWindowsSystemDialog(global) {
  "use strict";

  const INSTALL_FLAG = "__webWindowsSystemDialogInstalled";
  if (global[INSTALL_FLAG]) return;
  Object.defineProperty(global, INSTALL_FLAG, { value: true });

  const queue = [];
  const wiredFrames = new WeakSet();
  let activeRequest = null;
  let previousFocus = null;
  let elements = null;

  function ensureUi() {
    if (elements) return elements;

    const style = document.createElement("style");
    style.textContent = `
      .ww-system-dialog-host {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: none;
        place-items: center;
        padding: 16px;
        background: rgba(7, 22, 48, .32);
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
        box-sizing: border-box;
      }
      .ww-system-dialog-host[data-open="true"] { display: grid; }
      .ww-system-dialog {
        width: min(430px, calc(100vw - 32px));
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, .82);
        border-radius: 16px;
        color: #172033;
        background: rgba(250, 252, 255, .96);
        box-shadow: 0 24px 70px rgba(4, 20, 48, .34), 0 2px 10px rgba(4, 20, 48, .2);
        font: 14px/1.55 "Segoe UI", "Microsoft YaHei", sans-serif;
      }
      .ww-system-dialog__titlebar {
        display: flex;
        align-items: center;
        gap: 9px;
        min-height: 46px;
        padding: 0 16px;
        color: #fff;
        background: linear-gradient(135deg, #0878d8, #23a4ee);
        font-weight: 650;
      }
      .ww-system-dialog__mark {
        display: grid;
        place-items: center;
        width: 22px;
        height: 22px;
        border-radius: 6px;
        color: #0878d8;
        background: rgba(255, 255, 255, .94);
        font-size: 13px;
        font-weight: 800;
      }
      .ww-system-dialog__message {
        min-height: 62px;
        margin: 0;
        padding: 22px 22px 14px;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        user-select: text;
      }
      .ww-system-dialog__actions {
        display: flex;
        justify-content: flex-end;
        padding: 10px 18px 18px;
      }
      .ww-system-dialog__button {
        min-width: 88px;
        min-height: 40px;
        border: 1px solid #0878d8;
        border-radius: 9px;
        color: #fff;
        background: linear-gradient(#168ee7, #0878d8);
        box-shadow: 0 2px 6px rgba(0, 105, 195, .22);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }
      .ww-system-dialog__button:hover { filter: brightness(1.06); }
      .ww-system-dialog__button:focus-visible {
        outline: 3px solid rgba(26, 134, 229, .3);
        outline-offset: 2px;
      }
      @media (max-width: 480px) {
        .ww-system-dialog-host { align-items: end; padding: 12px; }
        .ww-system-dialog { width: 100%; border-radius: 16px; }
        .ww-system-dialog__button { min-height: 44px; }
      }
      @media (prefers-reduced-motion: no-preference) {
        .ww-system-dialog-host[data-open="true"] .ww-system-dialog {
          animation: ww-system-dialog-in .16s ease-out;
        }
        @keyframes ww-system-dialog-in {
          from { opacity: 0; transform: translateY(8px) scale(.985); }
          to { opacity: 1; transform: none; }
        }
      }
    `;

    const host = document.createElement("div");
    host.className = "ww-system-dialog-host";
    host.dataset.open = "false";
    host.innerHTML = `
      <section class="ww-system-dialog" role="alertdialog" aria-modal="true"
        aria-labelledby="ww-system-dialog-title" aria-describedby="ww-system-dialog-message">
        <div class="ww-system-dialog__titlebar">
          <span class="ww-system-dialog__mark" aria-hidden="true">W</span>
          <span id="ww-system-dialog-title">WebWindows</span>
        </div>
        <p class="ww-system-dialog__message" id="ww-system-dialog-message"></p>
        <div class="ww-system-dialog__actions">
          <button class="ww-system-dialog__button" type="button">确定</button>
        </div>
      </section>
    `;

    (document.head || document.documentElement).appendChild(style);
    (document.body || document.documentElement).appendChild(host);
    elements = {
      host,
      title: host.querySelector("#ww-system-dialog-title"),
      message: host.querySelector("#ww-system-dialog-message"),
      button: host.querySelector(".ww-system-dialog__button")
    };
    elements.button.addEventListener("click", closeActive);
    host.addEventListener("keydown", (event) => {
      if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
        closeActive();
      }
      if (event.key === "Tab") {
        event.preventDefault();
        elements.button.focus();
      }
    });
    return elements;
  }

  function showNext() {
    if (activeRequest || queue.length === 0) return;
    activeRequest = queue.shift();
    const ui = ensureUi();
    previousFocus = document.activeElement;
    ui.title.textContent = activeRequest.title || "WebWindows";
    ui.message.textContent = activeRequest.message;
    ui.host.dataset.open = "true";
    document.documentElement.dataset.wwSystemDialogOpen = "true";
    requestAnimationFrame(() => ui.button.focus());
  }

  function closeActive() {
    if (!activeRequest || !elements) return;
    const request = activeRequest;
    activeRequest = null;
    elements.host.dataset.open = "false";
    delete document.documentElement.dataset.wwSystemDialogOpen;
    try {
      previousFocus?.focus?.();
    } catch (_) {
      // The original control may have been removed with its window.
    }
    previousFocus = null;
    request.resolve();
    showNext();
  }

  function showAlert(message, options) {
    return new Promise((resolve) => {
      queue.push({
        message: String(message ?? ""),
        title: String(options?.title || "WebWindows"),
        resolve
      });
      showNext();
    });
  }

  const api = Object.freeze({
    alert: showAlert,
    close: closeActive
  });

  global.WebWindows = global.WebWindows || {};
  global.WebWindows.dialog = api;
  global.alert = function webWindowsAlert(message) {
    void showAlert(message);
  };

  function installFrame(frame) {
    if (!frame || wiredFrames.has(frame)) return;
    wiredFrames.add(frame);

    const installIntoFrame = () => {
      try {
        const child = frame.contentWindow;
        if (!child || child === global) return;
        child.WebWindows = child.WebWindows || {};
        child.WebWindows.dialog = api;
        child.alert = function webWindowsFrameAlert(message) {
          void showAlert(message, {
            title: child.document?.title || "WebWindows"
          });
        };
      } catch (_) {
        // Cross-origin programs remain isolated from the WebWindows host.
      }
    };

    frame.addEventListener("load", installIntoFrame);
    installIntoFrame();
  }

  function scanFrames(root) {
    root.querySelectorAll?.("iframe").forEach(installFrame);
  }

  scanFrames(document);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!node || node.nodeType !== 1) return;
        if (node.matches?.("iframe")) installFrame(node);
        scanFrames(node);
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})(window);

