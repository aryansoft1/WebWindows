(function () {
  "use strict";

  const spreadsheetExtensions = new Set(["xlsx", "xls", "csv"]);
  const documentExtensions = new Set(["docx", "doc"]);
  const presentationExtensions = new Set(["pptx", "ppt"]);
  const extensionOf = (name) => {
    const value = String(name || "");
    const dot = value.lastIndexOf(".");
    return dot >= 0 ? value.slice(dot + 1).toLowerCase() : "";
  };

  function stableId(value) {
    let hash = 2166136261;
    const text = String(value || "");
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function openSpreadsheet(resource) {
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
    window.openWindow(
      `sheet-${stableId(identity)}`,
      `Sheet Editor - ${resource.name || "工作表"}`,
      `worker_SheetCreater.html?${query.toString()}`,
      "assets/icons/sheeteditor.png",
      true,
      "",
      "1100px",
      "760px"
    );
  }

  function openWriteEditor(resource) {
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
    window.openWindow(
      `write-${stableId(identity)}`,
      `Write Editor - ${resource.name || "文档"}`,
      `worker_WriteEditor.html?${query.toString()}`,
      "assets/icons/writeeditor.svg",
      true,
      "",
      "1080px",
      "780px"
    );
  }

  function openSlideEditor(resource) {
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
    window.openWindow(
      `slide-${stableId(identity)}`,
      `Slide Editor - ${resource.name || "演示文稿"}`,
      `worker_SlideEditor.html?${query.toString()}`,
      "assets/icons/slideeditor.svg",
      true,
      "",
      "1100px",
      "780px"
    );
  }

  function openGeneric(resource) {
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
    window.openWindow(
      `resource-${stableId(identity)}`,
      resource.name || "文件预览",
      resource.url,
      resource.iconUrl || "assets/icons/explorer.png",
      true,
      "",
      "900px",
      "680px"
    );
  }

  window.openResource = function (resource) {
    if (!resource || resource.protocol !== "webwindows-cloud-resource") {
      throw new Error("无效的 WebWindows 云资源描述。");
    }
    if (spreadsheetExtensions.has(extensionOf(resource.name))) {
      openSpreadsheet(resource);
      return;
    }
    if (documentExtensions.has(extensionOf(resource.name))) {
      openWriteEditor(resource);
      return;
    }
    if (presentationExtensions.has(extensionOf(resource.name))) {
      openSlideEditor(resource);
      return;
    }
    openGeneric(resource);
  };

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type !== "webwindows-open-resource") return;
    window.openResource(event.data.resource);
  });
})();
