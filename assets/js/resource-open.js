(function () {
  "use strict";

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
      case "direct-url":
        await openGeneric(resource, resolution.app);
        return;
      default:
        throw new Error(`应用 ${resolution.app.name} 缺少可用的云资源启动适配器。`);
    }
  };

  window.addEventListener("message", async (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type !== "webwindows-open-resource") return;
    try {
      await window.openResource(event.data.resource);
    } catch (error) {
      console.error("[ResourceOpen]", error);
      window.alert(error.message || "资料打开失败。");
    }
  });
})();
