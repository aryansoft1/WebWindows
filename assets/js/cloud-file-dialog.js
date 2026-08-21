(function (global) {
  "use strict";

  const ORIGIN = global.location.origin;
  const PICKER_SELECTED = "webwindows:cloud-resource-selected";
  const PICKER_CANCELLED = "webwindows:cloud-resource-picker-cancelled";
  const MAX_BYTES = 15 * 1024 * 1024;
  let sequence = 0;

  function cleanText(value, fallback, maxLength) {
    const text = String(value || "").replace(/[\u0000-\u001f\u007f]/g, "").trim();
    return (text || fallback).slice(0, maxLength);
  }

  function normalizePurpose(value) {
    const purpose = cleanText(value, "generic-file-dialog", 64);
    if (!/^[A-Za-z0-9][A-Za-z0-9:_-]{0,63}$/.test(purpose)) {
      throw new TypeError("purpose 只能包含字母、数字、冒号、下划线和连字符。");
    }
    return purpose;
  }

  function normalizeExtensions(options) {
    const values = [];
    if (Array.isArray(options.fileTypes)) {
      options.fileTypes.forEach((type) => {
        const extensions = Array.isArray(type?.extensions) ? type.extensions : [];
        extensions.forEach((extension) => values.push(extension));
      });
    }
    if (Array.isArray(options.extensions)) values.push(...options.extensions);
    if (typeof options.accept === "string") values.push(...options.accept.split(","));
    const normalized = [...new Set(values.map((value) =>
      String(value || "").trim().toLowerCase().replace(/^\*\./, "").replace(/^\./, "")
    ).filter((value) => /^[a-z0-9]{1,12}$/.test(value)))];
    if (!normalized.length) throw new TypeError("至少需要提供一种可选择的文件类型。");
    if (normalized.length > 16) throw new TypeError("文件类型筛选不能超过 16 项。");
    return normalized;
  }

  function requestId() {
    sequence += 1;
    if (global.crypto?.randomUUID) return global.crypto.randomUUID();
    return `cloud-dialog-${Date.now()}-${sequence}`;
  }

  function pickerUrl(options, action, id, extensions) {
    const start = action === "save" || options.location === "private"
      ? "/cloud/browser/private-files.asp"
      : "/cloud/browser/files.asp";
    const url = new URL(start, ORIGIN);
    url.searchParams.set("mode", "picker");
    url.searchParams.set("action", action);
    url.searchParams.set("accept", extensions.map((item) => `.${item}`).join(","));
    url.searchParams.set("multiple", action === "open" && options.multiple ? "1" : "0");
    url.searchParams.set("purpose", normalizePurpose(options.purpose));
    url.searchParams.set("requestId", id);
    url.searchParams.set("title", cleanText(
      options.title,
      action === "save" ? "保存到云资料" : "从云资料打开",
      80
    ));
    if (action === "save") {
      url.searchParams.set("suggestedName", cleanText(options.suggestedName, "", 120));
      if (options.overwrite) url.searchParams.set("overwrite", "1");
    }
    return url.toString();
  }

  function showDialog(url, title, id) {
    return new Promise((resolve, reject) => {
      const dialog = document.createElement("dialog");
      const frame = document.createElement("iframe");
      const close = document.createElement("button");
      dialog.dataset.cloudDialogId = id;
      dialog.setAttribute("aria-label", title);
      Object.assign(dialog.style, {
        width: "min(1080px, calc(100vw - 32px))",
        height: "min(760px, calc(100vh - 32px))",
        padding: "0",
        border: "1px solid #cbd5e1",
        borderRadius: "12px",
        overflow: "hidden"
      });
      frame.title = title;
      frame.src = url;
      frame.referrerPolicy = "same-origin";
      Object.assign(frame.style, { width: "100%", height: "100%", border: "0", display: "block" });
      close.type = "button";
      close.textContent = "×";
      close.setAttribute("aria-label", "关闭云文件对话框");
      Object.assign(close.style, {
        position: "absolute", top: "8px", right: "10px", zIndex: "2",
        width: "32px", height: "32px", border: "0", borderRadius: "6px",
        background: "rgba(255,255,255,.92)", fontSize: "22px", cursor: "pointer"
      });
      dialog.append(frame, close);
      document.body.appendChild(dialog);

      let settled = false;
      function finish(value, error) {
        if (settled) return;
        settled = true;
        global.removeEventListener("message", onMessage);
        try { dialog.close(); } catch (_) {}
        dialog.remove();
        if (error) reject(error);
        else resolve(value);
      }
      function cancel() {
        finish(null);
      }
      function onMessage(event) {
        if (event.origin !== ORIGIN || event.source !== frame.contentWindow) return;
        const message = event.data || {};
        if (message.requestId !== id) return;
        if (message.type === PICKER_CANCELLED) {
          cancel();
          return;
        }
        if (message.type !== PICKER_SELECTED) return;
        const resources = Array.isArray(message.resources)
          ? message.resources
          : (message.resource ? [message.resource] : []);
        finish({ resource: resources[0] || null, resources });
      }
      global.addEventListener("message", onMessage);
      close.addEventListener("click", cancel);
      dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        cancel();
      });
      dialog.showModal();
    });
  }

  async function choose(options, action) {
    const settings = options && typeof options === "object" ? options : {};
    const extensions = normalizeExtensions(settings);
    const id = requestId();
    const title = cleanText(
      settings.title,
      action === "save" ? "保存到云资料" : "从云资料打开",
      80
    );
    const result = await showDialog(pickerUrl(settings, action, id, extensions), title, id);
    if (!result) return null;
    return settings.multiple && action === "open" ? result.resources : result.resource;
  }

  async function apiJson(response) {
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error?.message || `云资料请求失败（${response.status}）`);
    }
    return payload;
  }

  async function write(resource, content, options) {
    if (!resource || resource.scope !== "private" || !resource.path || !resource.writeUrl) {
      throw new TypeError("保存目标不是可写的私人云资料。");
    }
    const endpoint = new URL(resource.writeUrl, ORIGIN);
    if (endpoint.origin !== ORIGIN || !endpoint.pathname.endsWith("/cloud/browser/private-resource.asp")) {
      throw new TypeError("云资料写入地址无效。");
    }
    const blob = content instanceof Blob ? content : new Blob([content]);
    if (!blob.size || blob.size > MAX_BYTES) throw new RangeError("保存内容必须在 1 字节到 15 MB 之间。");
    const headers = { "X-WebWindows-Request": "private-resource" };
    const body = new URLSearchParams({
      mode: "save-as",
      path: resource.path,
      overwrite: options?.overwrite || resource.overwrite ? "1" : "0"
    });
    const begin = await apiJson(await fetch(`${endpoint}?op=begin`, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body
    }));
    try {
      const chunkSize = 96 * 1024;
      for (let offset = 0; offset < blob.size; offset += chunkSize) {
        await apiJson(await fetch(`${endpoint}?op=chunk&id=${encodeURIComponent(begin.uploadId)}`, {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers,
          body: blob.slice(offset, Math.min(offset + chunkSize, blob.size))
        }));
      }
      await apiJson(await fetch(`${endpoint}?op=commit&id=${encodeURIComponent(begin.uploadId)}`, {
        method: "POST", credentials: "same-origin", cache: "no-store", headers
      }));
    } catch (error) {
      fetch(`${endpoint}?op=cancel&id=${encodeURIComponent(begin.uploadId)}`, {
        method: "POST", credentials: "same-origin", cache: "no-store", headers
      }).catch(() => {});
      throw error;
    }
    const readUrl = new URL(endpoint);
    readUrl.searchParams.set("op", "content");
    readUrl.searchParams.set("path", resource.path);
    const editorDataUrl = new URL(endpoint);
    editorDataUrl.searchParams.set("op", "editor-data");
    editorDataUrl.searchParams.set("path", resource.path);
    return {
      ...resource,
      size: blob.size,
      mimeType: blob.type || resource.mimeType,
      readUrl: readUrl.href,
      editorDataUrl: editorDataUrl.href,
      saveEndpoint: endpoint.href
    };
  }

  async function read(resource) {
    if (!resource?.readUrl) throw new TypeError("云资料缺少读取地址。");
    const url = new URL(resource.readUrl, ORIGIN);
    if (url.origin !== ORIGIN || !url.pathname.startsWith("/cloud/browser/")) {
      throw new TypeError("云资料读取地址无效。");
    }
    const response = await fetch(url, { credentials: "same-origin", cache: "no-store" });
    if (!response.ok) throw new Error(`云资料读取失败（${response.status}）`);
    return response.blob();
  }

  const api = Object.freeze({
    open: (options) => choose(options, "open"),
    save: (options) => choose({ ...options, multiple: false, location: "private" }, "save"),
    write,
    read,
    saveBlob: async (options, content) => {
      const target = await choose({ ...options, multiple: false, location: "private" }, "save");
      return target ? write(target, content, options) : null;
    }
  });
  global.WebWindows = global.WebWindows || {};
  global.WebWindows.fileDialog = api;
  global.WebWindowsCloudFiles = api;
})(window);
