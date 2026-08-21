(function installCloudSearchUI(global) {
  "use strict";
  const labels = {
    zh: { placeholder: "搜索文件，例如：上周修改的 PDF", search: "搜索", title: "云资料搜索", empty: "没有找到符合条件的文件", loading: "正在搜索…", close: "关闭",
      private: "我的云资料", public: "公共资料", device: "此设备", fileNameExact: "文件名精确命中", fileNamePrefix: "文件名前缀命中",
      fileNameContains: "文件名命中", fileNameTokens: "文件名词组命中", fileNameFuzzy: "文件名模糊命中", fileType: "文件类型命中",
      mimeType: "MIME 类型命中", folderPath: "路径命中", createdAt: "创建日期命中", modifiedAt: "修改日期命中", uploadedAt: "上传日期命中" },
    jp: { placeholder: "ファイルを検索（例：先週更新した PDF）", search: "検索", title: "クラウドファイル検索", empty: "条件に一致するファイルはありません", loading: "検索中…", close: "閉じる",
      private: "マイクラウド", public: "パブリック", device: "このデバイス", fileNameExact: "ファイル名が完全一致", fileNamePrefix: "ファイル名の先頭が一致",
      fileNameContains: "ファイル名が一致", fileNameTokens: "名前の語句が一致", fileNameFuzzy: "ファイル名が類似", fileType: "種類が一致",
      mimeType: "MIME が一致", folderPath: "パスが一致", createdAt: "作成日が一致", modifiedAt: "更新日が一致", uploadedAt: "保存日が一致" },
    en: { placeholder: "Search files, e.g. PDFs modified last week", search: "Search", title: "Cloud file search", empty: "No files match these conditions", loading: "Searching…", close: "Close",
      private: "My cloud files", public: "Public files", device: "This device", fileNameExact: "Exact file name", fileNamePrefix: "File name prefix",
      fileNameContains: "File name match", fileNameTokens: "File name tokens", fileNameFuzzy: "Fuzzy file name match", fileType: "File type match",
      mimeType: "MIME type match", folderPath: "Folder path match", createdAt: "Created date match", modifiedAt: "Modified date match", uploadedAt: "Upload date match" }
  };
  function language() {
    const value = String(document.body.dataset.language || global.localStorage?.getItem("lang") || "zh").toLowerCase();
    if (value === "jp" || value.startsWith("ja")) return "jp";
    if (value.startsWith("en")) return "en";
    return "zh";
  }
  function t(key) { return labels[language()][key] || labels.zh[key] || key; }
  function formatDate(value) { return Number(value) ? new Date(Number(value)).toLocaleString() : ""; }
  function formatSize(value) {
    const size = Number(value) || 0;
    if (size < 1024) return size + " B";
    if (size < 1048576) return (size / 1024).toFixed(1) + " KB";
    return (size / 1048576).toFixed(1) + " MB";
  }
  function createPanel() {
    const panel = document.createElement("section");
    panel.className = "file-search-panel";
    panel.hidden = true;
    panel.innerHTML = '<div class="file-search-panel-head"><div><strong></strong><span class="file-search-summary"></span></div><button type="button" class="file-search-close"></button></div><div class="file-search-results"></div>';
    panel.querySelector("strong").textContent = t("title");
    panel.querySelector(".file-search-close").textContent = t("close");
    panel.querySelector(".file-search-close").addEventListener("click", () => { panel.hidden = true; });
    document.body.appendChild(panel);
    return panel;
  }
  async function openResult(result) {
    if (result.source === "device") {
      const device = global.WebWindows?.device || (() => { try { return global.parent?.WebWindows?.device; } catch (_) { return null; } })();
      const match = String(result.path).match(/^device:\/\/([^/]+)\/(.*)$/);
      if (!device?.storage || !match) return;
      const opened = await device.storage.openFile(decodeURIComponent(match[1]), match[2].split("/").filter(Boolean).map(decodeURIComponent));
      const url = URL.createObjectURL(new Blob([opened.data], { type: result.mimeType }));
      result = Object.assign({}, result, { url: url, readUrl: url });
    }
    const resource = { protocol: "webwindows-cloud-resource", version: "1.0", nodeId: result.nodeId, scope: result.scope,
      path: result.path, name: result.name, mimeType: result.mimeType, size: result.size, readUrl: result.readUrl, url: result.readUrl,
      permissions: { read: true, edit: result.scope === "private" } };
    if (global.parent && global.parent !== global && typeof global.parent.openResource === "function") return global.parent.openResource(resource);
    if (typeof global.openResource === "function") return global.openResource(resource);
    if (result.readUrl) global.open(result.readUrl, "_blank", "noopener");
  }
  function render(panel, payload) {
    const results = panel.querySelector(".file-search-results");
    const summary = panel.querySelector(".file-search-summary");
    results.replaceChildren();
    summary.textContent = payload.total + " · " + payload.searchedSources.map((source) => t(source)).join(" / ");
    if (!payload.results.length) {
      const empty = document.createElement("div"); empty.className = "file-search-empty"; empty.textContent = t("empty"); results.appendChild(empty); return;
    }
    payload.results.forEach((result) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "file-search-result";
      const name = document.createElement("strong"); name.textContent = result.name;
      const path = document.createElement("span"); path.className = "file-search-path"; path.textContent = t(result.source) + " · " + (result.folderPath || "/");
      const metadata = document.createElement("span"); metadata.className = "file-search-meta";
      metadata.textContent = [result.extension?.toUpperCase(), formatSize(result.size), formatDate(result.modifiedAt), "Score " + result.relevanceScore].filter(Boolean).join(" · ");
      const reasons = document.createElement("span"); reasons.className = "file-search-reasons";
      (result.matchReasons || []).forEach((reason) => { const badge = document.createElement("em"); badge.textContent = t(reason); reasons.appendChild(badge); });
      button.append(name, path, metadata, reasons); button.addEventListener("click", () => openResult(result).catch(console.warn)); results.appendChild(button);
    });
  }
  function initialize() {
    if (document.body.dataset.mode === "picker" || !global.WebWindows?.files?.search) return;
    const host = document.querySelector(".toolbar-right") || document.querySelector(".actions");
    if (!host) return;
    const form = document.createElement("form"); form.className = "file-search-box"; form.setAttribute("role", "search");
    const input = document.createElement("input"); input.type = "search"; input.placeholder = t("placeholder"); input.setAttribute("aria-label", t("title"));
    const submit = document.createElement("button"); submit.type = "submit"; submit.textContent = t("search");
    form.append(input, submit); host.prepend(form);
    const panel = createPanel();
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); const query = input.value.trim(); if (!query) return;
      panel.hidden = false; panel.querySelector(".file-search-summary").textContent = t("loading"); panel.querySelector(".file-search-results").replaceChildren();
      try { render(panel, await global.WebWindows.files.search(query)); }
      catch (error) { panel.querySelector(".file-search-summary").textContent = error.message; }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true }); else initialize();
})(window);
