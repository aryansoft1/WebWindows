(function () {
  "use strict";

  let pendingMedia = null;

  function stableId(value) {
    let hash = 2166136261;
    const text = String(value || "");
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  async function openSpreadsheet(resource, app) {
    const query = new URLSearchParams({
      source: "cloud",
      scope: resource.scope || "public",
      nodeId: resource.nodeId || "local-main",
      path: resource.path || "",
      name: resource.name || "工作表.xlsx",
      readUrl: resource.url || "",
      readOnly: resource.permissions?.edit === true ? "0" : "1"
    });
    if (resource.editorDataUrl) query.set("editorDataUrl", resource.editorDataUrl);
    if (resource.saveEndpoint) query.set("saveEndpoint", resource.saveEndpoint);

    const identity = [
      "sheet-editor",
      resource.nodeId || "local-main",
      resource.scope || "public",
      resource.path || resource.name
    ].join(":");
    await window.WebWindows.apps.launch(app.id, {
      instanceId: `sheet-${stableId(identity)}`,
      title: `${app.name} - ${resource.name || "工作表"}`,
      url: `worker_SheetCreater.html?${query.toString()}`
    });
  }

  async function openWriteEditor(resource, app) {
    const query = new URLSearchParams({
      source: "cloud",
      scope: resource.scope || "public",
      nodeId: resource.nodeId || "local-main",
      path: resource.path || "",
      name: resource.name || "文档.docx",
      readUrl: resource.url || "",
      readOnly: resource.permissions?.edit === true ? "0" : "1"
    });
    if (resource.editorDataUrl) query.set("editorDataUrl", resource.editorDataUrl);
    if (resource.saveEndpoint) query.set("saveEndpoint", resource.saveEndpoint);

    const identity = [
      "write-editor",
      resource.nodeId || "local-main",
      resource.scope || "public",
      resource.path || resource.name
    ].join(":");
    await window.WebWindows.apps.launch(app.id, {
      instanceId: `write-${stableId(identity)}`,
      title: `${app.name} - ${resource.name || "文档"}`,
      url: `worker_WriteEditor.html?${query.toString()}`
    });
  }

  async function openSlideEditor(resource, app) {
    const query = new URLSearchParams({
      source: "cloud",
      scope: resource.scope || "public",
      nodeId: resource.nodeId || "local-main",
      path: resource.path || "",
      name: resource.name || "演示文稿.pptx",
      readUrl: resource.url || "",
      readOnly: "1"
    });
    const identity = [
      "slide-editor",
      resource.nodeId || "local-main",
      resource.scope || "public",
      resource.path || resource.name
    ].join(":");
    await window.WebWindows.apps.launch(app.id, {
      instanceId: `slide-${stableId(identity)}`,
      title: `${app.name} - ${resource.name || "演示文稿"}`,
      url: `worker_SlideEditor.html?${query.toString()}`
    });
  }

  async function openGeneric(resource, app) {
    if (!resource.url) {
      window.alert("此文件暂时没有可用的打开方式。");
      return;
    }
    const identity = [
      "resource",
      resource.nodeId || "local-main",
      resource.scope || "public",
      resource.path || resource.name
    ].join(":");
    await window.WebWindows.apps.launch(app.id, {
      instanceId: `resource-${stableId(identity)}`,
      title: resource.name || app.name,
      url: resource.url
    });
  }

  function mediaKind(resource) {
    const mimeType = String(resource.mimeType || resource.type || "").toLowerCase();
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("video/")) return "video";
    const extension = String(resource.name || "").split(".").pop().toLowerCase();
    if (["mp3", "wav", "ogg", "oga", "m4a", "aac", "flac", "opus"].includes(extension)) return "audio";
    if (["mp4", "webm", "mov", "m4v", "ogv", "mkv"].includes(extension)) return "video";
    return "";
  }

  function safeMediaDescriptor(resource) {
    const kind = mediaKind(resource);
    if (!kind) throw new Error("APlay 不支持此媒体格式。");
    const candidate = resource.url || resource.readUrl;
    if (!candidate) throw new Error("媒体资料缺少可用的读取地址。");
    const url = new URL(candidate, window.location.href);
    if (!["http:", "https:", "blob:"].includes(url.protocol)) {
      throw new Error("媒体资料读取地址不安全。");
    }
    if (resource.scope === "device" && url.protocol !== "blob:") {
      throw new Error("设备媒体必须通过受控临时地址打开。");
    }
    if (url.protocol === "blob:" && !url.href.startsWith(`blob:${window.location.origin}/`)) {
      throw new Error("媒体临时地址不属于当前 WebWindows 会话。");
    }
    return Object.freeze({
      name: String(resource.name || (kind === "audio" ? "音频" : "视频")).slice(0, 240),
      mimeType: String(resource.mimeType || resource.type || "").slice(0, 120),
      kind,
      url: url.href,
      sourceLabel: resource.scope === "device"
        ? "此设备"
        : (resource.scope === "private" ? "私人云" : "公共云")
    });
  }

  function aplayFrame() {
    return document.querySelector("#win-aplay iframe");
  }

  function deliverPendingMedia(frame) {
    if (!pendingMedia || !frame?.contentWindow) return false;
    frame.contentWindow.postMessage({
      type: "webwindows-aplay-open-media",
      media: pendingMedia
    }, window.location.origin);
    return true;
  }

  async function openMedia(resource, app) {
    pendingMedia = safeMediaDescriptor(resource);
    await window.WebWindows.apps.launch(app.id, {
      instanceId: "aplay",
      title: `${app.name} - ${pendingMedia.name}`,
      url: app.entry
    });
    const frame = aplayFrame();
    if (!frame) throw new Error("APlay 窗口未能启动。");
    deliverPendingMedia(frame);
    frame.addEventListener("load", () => deliverPendingMedia(frame), { once: true });
  }

  window.openResource = async function (resource) {
    if (!resource || resource.protocol !== "webwindows-cloud-resource") {
      throw new Error("无效的 WebWindows 云资源描述。");
    }
    const resolution = await window.WebWindows?.apps?.resolveResource(resource);
    if (!resolution) {
      window.alert("没有已安装的应用可以打开此文件。");
      return;
    }

    switch (resolution.handler.adapter) {
      case "cloud-sheet":
        await openSpreadsheet(resource, resolution.app);
        return;
      case "cloud-write":
        await openWriteEditor(resource, resolution.app);
        return;
      case "cloud-slide":
        await openSlideEditor(resource, resolution.app);
        return;
      case "cloud-media":
        await openMedia(resource, resolution.app);
        return;
      case "direct-url":
        await openGeneric(resource, resolution.app);
        return;
      default:
        throw new Error(`应用 ${resolution.app.name} 缺少可用的云资源启动适配器。`);
    }
  };

  window.addEventListener("message", async (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === "webwindows-aplay-ready") {
      const frame = aplayFrame();
      if (frame?.contentWindow === event.source) deliverPendingMedia(frame);
      return;
    }
    if (event.data?.type !== "webwindows-open-resource") return;
    try {
      await window.openResource(event.data.resource);
    } catch (error) {
      console.error("[ResourceOpen]", error);
      window.alert(error.message || "资料打开失败。");
    }
  });
})();
