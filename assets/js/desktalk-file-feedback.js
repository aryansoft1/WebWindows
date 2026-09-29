(function (global) {
  "use strict";

  var pendingTimer = null;
  var pendingSequence = 0;

  function showNotice(chat, message, kind) {
    var notice = chat.querySelector("#chat-file-notice");
    if (!notice) {
      notice = document.createElement("div");
      notice.id = "chat-file-notice";
      notice.setAttribute("role", "status");
      notice.setAttribute("aria-live", "polite");
      var header = chat.querySelector("header");
      if (header && header.parentNode === chat) header.insertAdjacentElement("afterend", notice);
      else chat.insertBefore(notice, chat.firstChild);
    }
    notice.textContent = message;
    notice.dataset.kind = kind;
    notice.style.cssText = "display:block;padding:8px 12px;font-size:13px;line-height:1.45;border-bottom:1px solid rgba(100,116,139,.2);background:" +
      (kind === "warn" ? "#fff7ed" : "#eff6ff") + ";color:" + (kind === "warn" ? "#9a3412" : "#1d4ed8");
    return notice;
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    var button = target && target.closest ? target.closest("#btn-file") : null;
    if (!button) return;

    var chat = document.getElementById("chat");
    if (!chat) return;
    var waitingText = "正在打开云端文件选择器…";
    var notice = showNotice(chat, waitingText, "info");
    var pendingId = String(Date.now()) + "-" + String(++pendingSequence);
    notice.dataset.filePickerPending = pendingId;
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(function () {
      if (!notice.isConnected || notice.dataset.filePickerPending !== pendingId) return;
      var picker = document.querySelector("dialog[open][data-cloud-dialog-id]");
      delete notice.dataset.filePickerPending;
      if (!picker) showNotice(chat, "云端文件选择器未能打开，请刷新页面后重试。", "warn");
    }, 1800);

    if (typeof global.attempt === "function" && typeof global.chooseAndSendCloudFile === "function") {
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        global.attempt("发送文件", global.chooseAndSendCloudFile);
      } catch (error) {
        delete notice.dataset.filePickerPending;
        showNotice(chat, error && error.message ? error.message : "文件入口初始化失败，请刷新页面后重试。", "warn");
      }
    }
  }, true);
})(window);
