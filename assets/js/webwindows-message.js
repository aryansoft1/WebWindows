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

  const actionLabels = {
    zh: { confirm: "确定", cancel: "取消" },
    tw: { confirm: "確定", cancel: "取消" },
    jp: { confirm: "確認", cancel: "キャンセル" },
    en: { confirm: "OK", cancel: "Cancel" }
  };

  function currentLanguage() {
    const language = String(global.WebWindowsI18n?.getLanguage?.() || global.localStorage?.getItem("lang") || "zh").toLowerCase();
    if (language === "jp" || language.startsWith("ja")) return "jp";
    if (language === "tw" || language.includes("hant")) return "tw";
    if (language.startsWith("en")) return "en";
    return "zh";
  }

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
        gap: 8px;
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
      .ww-system-dialog__button--secondary {
        border-color: #aebdce;
        color: #25364d;
        background: #fff;
        box-shadow: none;
      }
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
          <button class="ww-system-dialog__button ww-system-dialog__button--secondary" type="button" data-dialog-action="cancel">取消</button>
          <button class="ww-system-dialog__button" type="button" data-dialog-action="confirm">确定</button>
        </div>
      </section>
    `;

    (document.head || document.documentElement).appendChild(style);
    (document.body || document.documentElement).appendChild(host);
    elements = {
      host,
      title: host.querySelector("#ww-system-dialog-title"),
      message: host.querySelector("#ww-system-dialog-message"),
      confirmButton: host.querySelector('[data-dialog-action="confirm"]'),
      cancelButton: host.querySelector('[data-dialog-action="cancel"]')
    };
    elements.confirmButton.addEventListener("click", () => closeActive(true));
    elements.cancelButton.addEventListener("click", () => closeActive(false));
    host.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeActive(false);
      }
      if (event.key === "Enter") {
        event.preventDefault();
        closeActive(true);
      }
      if (event.key === "Tab") {
        event.preventDefault();
        const target = document.activeElement === elements.confirmButton && !elements.cancelButton.hidden
          ? elements.cancelButton
          : elements.confirmButton;
        target.focus();
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
    const labels = actionLabels[currentLanguage()];
    ui.confirmButton.textContent = activeRequest.confirmLabel || labels.confirm;
    ui.cancelButton.textContent = activeRequest.cancelLabel || labels.cancel;
    ui.cancelButton.hidden = activeRequest.type !== "confirm";
    ui.host.dataset.open = "true";
    document.documentElement.dataset.wwSystemDialogOpen = "true";
    requestAnimationFrame(() => ui.confirmButton.focus());
  }

  function closeActive(confirmed) {
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
    request.resolve(request.type === "confirm" ? confirmed === true : undefined);
    showNext();
  }

  function showAlert(message, options) {
    return new Promise((resolve) => {
      queue.push({
        type: "alert",
        message: String(message ?? ""),
        title: String(options?.title || "WebWindows"),
        confirmLabel: options?.confirmLabel ? String(options.confirmLabel) : "",
        resolve
      });
      showNext();
    });
  }

  function showConfirm(message, options) {
    return new Promise((resolve) => {
      queue.push({
        type: "confirm",
        message: String(message ?? ""),
        title: String(options?.title || "WebWindows"),
        confirmLabel: options?.confirmLabel ? String(options.confirmLabel) : "",
        cancelLabel: options?.cancelLabel ? String(options.cancelLabel) : "",
        resolve
      });
      showNext();
    });
  }

  const api = Object.freeze({
    alert: showAlert,
    confirm: showConfirm,
    close: () => closeActive(false)
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

