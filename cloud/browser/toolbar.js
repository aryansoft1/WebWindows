(function () {
  "use strict";

  const currentPath = document.body.dataset.currentPath || "";
  const pickerMode = document.body.dataset.mode === "picker";
  const pickerPurpose = document.body.dataset.pickerPurpose || "";
  const pickerRequestId = document.body.dataset.pickerRequestId || "";
  const pickerMultiple = document.body.dataset.pickerMultiple === "1";
  const pickerAction = document.body.dataset.pickerAction || "open";
  const pickerNodeId = document.body.dataset.nodeId || "local-main";
  const pickerSelections = new Set();
  const directoryNames = {
    public: { zh: "公共区域", jp: "パブリックエリア", en: "Public" },
    welcome: { zh: "欢迎", jp: "ようこそ", en: "Welcome" },
    documents: { zh: "官方文档", jp: "公式ドキュメント", en: "Official Documents" },
    samples: { zh: "示例文件", jp: "サンプルファイル", en: "Sample Files" },
    resources: { zh: "官方资源", jp: "公式リソース", en: "Official Resources" },
    changelog: { zh: "更新日志", jp: "更新履歴", en: "Changelog" },
    community: { zh: "社区", jp: "コミュニティ", en: "Community" },
    icons: { zh: "图标", jp: "アイコン", en: "Icons" },
    wallpapers: { zh: "壁纸", jp: "壁紙", en: "Wallpapers" }
  };
  const fileNames = {
    "welcome_to_webwindows.docx": { zh: "欢迎使用 WebWindows.docx", jp: "WebWindows へようこそ.docx", en: "Welcome_to_WebWindows.docx" },
    "developer_guide.docx": { zh: "开发者指南.docx", jp: "開発者ガイド.docx", en: "Developer_Guide.docx" },
    "keyboard_shortcuts.md": { zh: "键盘快捷键.md", jp: "キーボードショートカット.md", en: "Keyboard_Shortcuts.md" },
    "user_guide.docx": { zh: "用户指南.docx", jp: "ユーザーガイド.docx", en: "User_Guide.docx" },
    "sample_document.docx": { zh: "示例文档.docx", jp: "サンプル文書.docx", en: "Sample_Document.docx" },
    "sample_image.png": { zh: "示例图片.png", jp: "サンプル画像.png", en: "Sample_Image.png" },
    "sample_presentation.pptx": { zh: "示例演示文稿.pptx", jp: "サンプルプレゼンテーション.pptx", en: "Sample_Presentation.pptx" },
    "sample_spreadsheet.xlsx": { zh: "示例表格.xlsx", jp: "サンプル表計算.xlsx", en: "Sample_Spreadsheet.xlsx" },
    "webwindows_default_wallpaper.png": { zh: "WebWindows 默认壁纸.png", jp: "WebWindows 既定の壁紙.png", en: "WebWindows_Default_Wallpaper.png" },
    "readme.md": { zh: "图标说明.md", jp: "アイコンについて.md", en: "README.md" },
    "changelog.md": { zh: "更新日志.md", jp: "更新履歴.md", en: "CHANGELOG.md" },
    "feedback_and_community.md": { zh: "反馈与社区.md", jp: "フィードバックとコミュニティ.md", en: "Feedback_and_Community.md" }
  };
  const uiText = {
    nodeName: { zh: "WebWindows 主云资源节点", jp: "WebWindows メインクラウドリソース", en: "WebWindows Primary Cloud Resources" },
    privateFiles: { zh: "我的私人文件", jp: "プライベートファイル", en: "My Private Files" },
    publicReadOnly: { zh: "所有人可查看", jp: "全員が閲覧可能", en: "Visible to everyone" },
    publicAreaReadOnly: { zh: "公共区域只读", jp: "パブリックエリアは読み取り専用", en: "Public area is read-only" },
    back: { zh: "返回", jp: "戻る", en: "Back" },
    forward: { zh: "前进", jp: "進む", en: "Forward" },
    up: { zh: "上一级", jp: "上の階層", en: "Up" },
    sortName: { zh: "按名称", jp: "名前順", en: "By name" },
    sortDate: { zh: "按更新时间", jp: "更新日時順", en: "By modified date" },
    sortSize: { zh: "按大小", jp: "サイズ順", en: "By size" },
    listView: { zh: "列表", jp: "リスト", en: "List" },
    compactView: { zh: "紧凑", jp: "コンパクト", en: "Compact" },
    iconView: { zh: "图标", jp: "アイコン", en: "Icons" },
    locations: { zh: "资料位置", jp: "場所", en: "Locations" },
    emptyTitle: { zh: "此资料夹暂时没有资料", jp: "このフォルダーにはまだファイルがありません", en: "This folder is currently empty" },
    emptyDescription: { zh: "公共资料由维护人员在后台统一管理。", jp: "公開資料は管理者が一元管理します。", en: "Public resources are managed centrally by administrators." },
    nothingSelected: { zh: "尚未选择资料", jp: "ファイルが選択されていません", en: "No file selected" },
    cancel: { zh: "取消", jp: "キャンセル", en: "Cancel" },
    confirmSelection: { zh: "确认选择", jp: "選択を確定", en: "Confirm selection" },
    open: { zh: "打开", jp: "開く", en: "Open" },
    copyPath: { zh: "复制资料位置", jp: "場所をコピー", en: "Copy location" },
    saveCopy: { zh: "保存副本到私人云资料", jp: "プライベートクラウドにコピーを保存", en: "Save a copy to private cloud" },
    setWallpaper: { zh: "设置为桌面壁纸", jp: "デスクトップの壁紙に設定", en: "Set as desktop wallpaper" },
    saveWallpaper: { zh: "保存到壁纸库", jp: "壁紙ライブラリに保存", en: "Save to wallpaper library" },
    info: { zh: "资料信息", jp: "ファイル情報", en: "Information" },
    refresh: { zh: "刷新", jp: "更新", en: "Refresh" },
    confirm: { zh: "确定", jp: "確認", en: "OK" }
  };
  const normalizeLanguage = (value) => {
    const language = String(value || "").toLowerCase();
    if (language === "jp" || language.startsWith("ja")) return "jp";
    if (language.startsWith("en")) return "en";
    return "zh";
  };
  let currentLanguage = normalizeLanguage(
    window.localStorage.getItem("lang") || document.body.dataset.language
  );
  const navigationStorageKey = `webwindows-cloud-navigation:${window.location.pathname}`;
  const currentUrl = () => new URL(window.location.href);

  function directoryDisplayName(physicalName) {
    const names = directoryNames[String(physicalName || "").toLowerCase()];
    return names?.[currentLanguage] || physicalName;
  }

  function fileDisplayName(physicalName) {
    const names = fileNames[String(physicalName || "").toLowerCase()];
    return names?.[currentLanguage] || physicalName;
  }

  function text(key) {
    return uiText[key]?.[currentLanguage] || uiText[key]?.zh || key;
  }

  function displayPath(path) {
    const parts = String(path || "").split("/").filter(Boolean).map(directoryDisplayName);
    return [directoryDisplayName("Public"), ...parts].join(" / ");
  }

  function navigateWith(updates) {
    const url = currentUrl();
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    });
    url.searchParams.set("lang", currentLanguage);
    window.location.href = url.toString();
  }

  function readNavigationState() {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(navigationStorageKey));
      if (
        saved &&
        Array.isArray(saved.entries) &&
        saved.entries.length &&
        Number.isInteger(saved.index) &&
        saved.index >= 0 &&
        saved.index < saved.entries.length
      ) {
        return saved;
      }
    } catch (error) {
      // A disabled or damaged sessionStorage should not prevent folder browsing.
    }
    return { entries: [currentPath], index: 0 };
  }

  function writeNavigationState(state) {
    try {
      window.sessionStorage.setItem(navigationStorageKey, JSON.stringify(state));
    } catch (error) {
      // Navigation still works; only the internal back/forward stack is unavailable.
    }
  }

  function initializeNavigationState() {
    const state = readNavigationState();
    if (state.entries[state.index] !== currentPath) {
      return { entries: [currentPath], index: 0 };
    }
    return state;
  }

  let navigationState = initializeNavigationState();
  writeNavigationState(navigationState);

  function updateNavigationButtons() {
    document.querySelector('[data-action="back"]').disabled = navigationState.index <= 0;
    document.querySelector('[data-action="forward"]').disabled =
      navigationState.index >= navigationState.entries.length - 1;
    document.querySelector('[data-action="up"]').disabled = currentPath === "";
  }

  function navigateToResourcePath(path, recordNavigation = true) {
    const targetPath = path || "";
    if (targetPath === currentPath) return;

    if (recordNavigation) {
      navigationState.entries = navigationState.entries.slice(0, navigationState.index + 1);
      navigationState.entries.push(targetPath);
      navigationState.index = navigationState.entries.length - 1;
    }
    writeNavigationState(navigationState);
    navigateWith({ path: targetPath || null });
  }

  function goBack() {
    if (navigationState.index <= 0) return;
    navigationState.index -= 1;
    const targetPath = navigationState.entries[navigationState.index];
    writeNavigationState(navigationState);
    navigateToResourcePath(targetPath, false);
  }

  function goForward() {
    if (navigationState.index >= navigationState.entries.length - 1) return;
    navigationState.index += 1;
    const targetPath = navigationState.entries[navigationState.index];
    writeNavigationState(navigationState);
    navigateToResourcePath(targetPath, false);
  }

  function goUp() {
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    navigateToResourcePath(parts.join("/"));
  }

  function showMessage(text) {
    const overlay = document.getElementById("message-box");
    document.getElementById("message-text").textContent = text || "操作未完成";
    overlay.hidden = false;
    document.getElementById("message-close").focus();
  }

  function closeMessage() {
    document.getElementById("message-box").hidden = true;
  }

  function renderBreadcrumbs() {
    const host = document.getElementById("breadcrumbs");
    host.innerHTML = "";
    const root = document.createElement("button");
    root.type = "button";
    const rootIcon = document.createElement("img");
    rootIcon.src = "assets/home.svg";
    rootIcon.alt = "";
    root.append(rootIcon, document.createTextNode(directoryDisplayName("Public")));
    root.addEventListener("click", () => navigateToResourcePath(""));
    host.appendChild(root);

    let cumulative = "";
    currentPath.split("/").filter(Boolean).forEach((part) => {
      const separator = document.createElement("span");
      separator.textContent = "›";
      separator.setAttribute("aria-hidden", "true");
      host.appendChild(separator);

      cumulative = cumulative ? `${cumulative}/${part}` : part;
      const targetPath = cumulative;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = directoryDisplayName(part);
      button.addEventListener("click", () => navigateToResourcePath(targetPath));
      host.appendChild(button);
    });
  }

  function renderFolderNode(folder, parent) {
    const item = document.createElement("li");
    item.className = "folder-node";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "folder-label";
    button.textContent = folder.displayName || directoryDisplayName(folder.name);
    button.addEventListener("click", () => navigateToResourcePath(folder.path));
    item.appendChild(button);

    if (Array.isArray(folder.children) && folder.children.length) {
      const list = document.createElement("ul");
      list.className = "subfolders";
      folder.children.forEach((child) => renderFolderNode(child, list));
      item.appendChild(list);
    }
    parent.appendChild(item);
  }

  async function loadFolderTree() {
    const list = document.getElementById("folder-tree");
    list.innerHTML = "";
    try {
      const response = await fetch(`getFolders.asp?lang=${encodeURIComponent(currentLanguage)}`, {
        cache: "no-store"
      });
      const payload = await response.json();
      if (!response.ok || !Array.isArray(payload)) {
        throw new Error(payload?.error?.message || "资料夹列表不可用");
      }
      payload.forEach((folder) => renderFolderNode(folder, list));
    } catch (error) {
      const item = document.createElement("li");
      item.className = "tree-error";
      item.textContent = "资料夹列表加载失败";
      list.appendChild(item);
    }
  }

  function resourceWindowId(path) {
    let hash = 0;
    for (let i = 0; i < path.length; i += 1) hash = ((hash << 5) - hash + path.charCodeAt(i)) | 0;
    return `public-resource-${Math.abs(hash)}`;
  }

  function openFile(item) {
    if (pickerMode) {
      if (item.dataset.pickerEligible === "true") {
        selectPickerItem(item);
      }
      return;
    }
    const openMode = item.dataset.openMode || "";
    if (openMode === "download") {
      downloadFile(item);
      return;
    }
    if (openMode !== "preview" && openMode !== "app") {
      showMessage("此类资料暂时没有可用的预览方式，可使用右键菜单保存副本到私人云资料。");
      return;
    }

    const resource = {
      protocol: "webwindows-cloud-resource",
      version: "1.0",
      nodeId: "local-main",
      scope: "public",
      openMode,
      path: item.dataset.path,
      name: item.dataset.name,
      mimeType: item.dataset.mimeType || "application/octet-stream",
      url: new URL(item.dataset.resourceUrl, window.location.href).toString()
    };

    try {
      if (window.parent && typeof window.parent.openResource === "function") {
        window.parent.openResource(resource);
        return;
      }
    } catch (error) {
      // Cross-node pages cannot inspect their parent; the message bridge handles them.
      window.parent?.postMessage({ type: "webwindows-open-resource", resource }, "*");
      return;
    }
    if (window.parent && typeof window.parent.openWindow === "function") {
      window.parent.openWindow(
        resourceWindowId(resource.path),
        resource.name,
        resource.url,
        "assets/icons/folder.png",
        true,
        "",
        "860px",
        "680px"
      );
      return;
    }

    window.location.href = resource.url;
  }

  async function downloadFile(item) {
    try {
      let api = window.WebWindows?.fileDialog;
      try {
        api = api || window.parent?.WebWindows?.fileDialog;
      } catch (_) {
        // A cross-origin host cannot provide the shared cloud dialog.
      }
      if (!api) throw new Error("通用云文件对话框尚未加载。");
      const readUrl = new URL(item.dataset.resourceUrl, window.location.href);
      readUrl.searchParams.set("raw", "1");
      const name = item.dataset.name || "资料";
      const extension = (name.split(".").pop() || "bin").toLowerCase();
      const resource = {
        scope: "public",
        path: item.dataset.path,
        name,
        mimeType: item.dataset.mimeType || "application/octet-stream",
        readUrl: readUrl.href
      };
      const content = await api.read(resource);
      const saved = await api.saveBlob({
        title: "保存公共资料副本",
        fileTypes: [{ name: "云资料", extensions: [extension] }],
        suggestedName: name,
        purpose: "public-cloud-save-copy"
      }, content);
      if (saved) showMessage("资料副本已保存到私人云资料。");
    } catch (error) {
      showMessage(error.message || "保存资料副本失败。");
    }
  }

  const contextMenu = document.getElementById("resource-context-menu");
  const contextOpen = contextMenu.querySelector('[data-context-action="open"]');
  const contextCopyPath = contextMenu.querySelector('[data-context-action="copy-path"]');
  const contextDownload = contextMenu.querySelector('[data-context-action="download"]');
  const contextSetWallpaper = contextMenu.querySelector('[data-context-action="set-wallpaper"]');
  const contextSaveWallpaper = contextMenu.querySelector('[data-context-action="save-wallpaper"]');
  const contextInfo = contextMenu.querySelector('[data-context-action="info"]');
  const contextSeparator = contextMenu.querySelector(".context-separator");
  let contextTarget = null;

  function closeContextMenu() {
    contextMenu.hidden = true;
    contextTarget = null;
  }

  function placeContextMenu(clientX, clientY) {
    contextMenu.hidden = false;
    contextMenu.style.left = "0";
    contextMenu.style.top = "0";
    const bounds = contextMenu.getBoundingClientRect();
    const left = Math.max(8, Math.min(clientX, window.innerWidth - bounds.width - 8));
    const top = Math.max(8, Math.min(clientY, window.innerHeight - bounds.height - 8));
    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;
  }

  function showContextMenu(event, item) {
    event.preventDefault();
    contextTarget = item || null;
    const hasTarget = Boolean(contextTarget);
    contextOpen.hidden = !hasTarget;
    contextCopyPath.hidden = !hasTarget;
    contextDownload.hidden = !hasTarget || contextTarget.dataset.kind !== "file";
    const isImage = hasTarget &&
      contextTarget.dataset.kind === "file" &&
      String(contextTarget.dataset.mimeType || "").startsWith("image/");
    contextSetWallpaper.hidden = !isImage;
    contextSaveWallpaper.hidden = !isImage;
    contextInfo.hidden = !hasTarget;
    contextSeparator.hidden = !hasTarget;

    if (hasTarget) {
      activateItem(contextTarget);
      const canOpen =
        contextTarget.dataset.kind === "folder" || Boolean(contextTarget.dataset.openMode);
      contextOpen.disabled = !canOpen;
      contextOpen.title = canOpen ? "" : "此类资料暂时没有可用的打开方式";
    }
    placeContextMenu(event.clientX, event.clientY);
    const firstAction = contextMenu.querySelector("button:not([hidden]):not(:disabled)");
    if (firstAction) firstAction.focus({ preventScroll: true });
  }

  async function copyResourcePath(item) {
    const value = displayPath(item.dataset.path);
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      const input = document.createElement("textarea");
      input.value = value;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    showMessage("资料位置已复制。");
  }

  function cloudWallpaper(item) {
    const url = new URL(item.dataset.resourceUrl, window.location.href);
    url.searchParams.set("raw", "1");
    return {
      url: url.href,
      name: fileDisplayName(item.dataset.name || "云资料壁纸"),
      sourcePath: item.dataset.path || ""
    };
  }

  function saveWallpaperToLibrary(item, applyNow) {
    const wallpaper = cloudWallpaper(item);
    let library = [];
    try {
      library = JSON.parse(localStorage.getItem("webwindows.wallpaper.library.v1") || "[]");
      if (!Array.isArray(library)) library = [];
    } catch (_) {
      library = [];
    }
    const next = library.filter((entry) => {
      const url = typeof entry === "string" ? entry : entry?.url;
      return url && url !== wallpaper.url;
    });
    next.push(wallpaper);
    localStorage.setItem("webwindows.wallpaper.library.v1", JSON.stringify(next));

    let host = window;
    try {
      if (window.parent && window.parent !== window) host = window.parent;
    } catch (_) {}
    host.postMessage?.({ type: "webwindows:wallpaper-library-changed" }, window.location.origin);
    if (applyNow) {
      host.localStorage?.setItem("selectedWallpaper", wallpaper.url);
      host.setWallpaperByPath?.(wallpaper.url);
      showMessage("已保存到壁纸库并设置为桌面壁纸。");
    } else {
      showMessage("已保存到设置中的壁纸库。");
    }
  }

  function runContextAction(action) {
    const item = contextTarget;
    closeContextMenu();

    switch (action) {
      case "open":
        if (!item) return;
        if (item.dataset.kind === "folder") navigateToResourcePath(item.dataset.path);
        else openFile(item);
        break;
      case "copy-path":
        if (item) copyResourcePath(item);
        break;
      case "download":
        if (item && item.dataset.kind === "file") downloadFile(item);
        break;
      case "set-wallpaper":
        if (item) saveWallpaperToLibrary(item, true);
        break;
      case "save-wallpaper":
        if (item) saveWallpaperToLibrary(item, false);
        break;
      case "info":
        if (item) {
          const kind = item.dataset.kind === "folder" ? "资料夹" : "资料";
          showMessage(
            `名称：${item.dataset.name}\n显示名称：${item.dataset.kind === "file" ? fileDisplayName(item.dataset.name) : directoryDisplayName(item.dataset.name)}\n类型：${kind}\n位置：${displayPath(item.dataset.path)}`
          );
        }
        break;
      case "root":
        navigateToResourcePath("");
        break;
      case "detail-view":
        navigateWith({ view: "detail" });
        break;
      case "large-view":
        navigateWith({ view: "large" });
        break;
      case "refresh":
        window.location.reload();
        break;
      default:
        break;
    }
  }

  function activateItem(item) {
    document.querySelectorAll(".file-item.selected").forEach((node) => node.classList.remove("selected"));
    item.classList.add("selected");
  }

  function selectPickerItem(item) {
    if (!pickerMode || item?.dataset.pickerEligible !== "true") return;
    if (!pickerMultiple) {
      pickerSelections.clear();
      document.querySelectorAll(".file-item.selected").forEach((node) => node.classList.remove("selected"));
      pickerSelections.add(item);
      item.classList.add("selected");
    } else if (pickerSelections.has(item)) {
      pickerSelections.delete(item);
      item.classList.remove("selected");
    } else {
      pickerSelections.add(item);
      item.classList.add("selected");
    }
    const selections = Array.from(pickerSelections);
    document.getElementById("picker-selection-text").textContent = selections.length
      ? (pickerMultiple
        ? `已选择 ${selections.length} 项`
        : `${selections[0].dataset.name} · ${Math.ceil(Number(selections[0].dataset.size || 0) / 1024)} KB`)
      : "尚未选择资料";
    document.getElementById("picker-confirm").disabled = selections.length === 0;
  }

  function pickerMessage(type, resources) {
    const message = {
      type,
      purpose: pickerPurpose,
      requestId: pickerRequestId,
      action: pickerAction,
      multiple: pickerMultiple
    };
    if (resources?.length) {
      message.resource = resources[0];
      message.resources = resources;
    }
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, window.location.origin);
      return;
    }
    if (type === "webwindows:cloud-resource-picker-cancelled") window.history.back();
  }

  function confirmPickerSelection() {
    const resources = Array.from(pickerSelections).map((selection) => {
      const readUrl = new URL(selection.dataset.resourceUrl, window.location.href);
      readUrl.searchParams.set("raw", "1");
      if (readUrl.origin !== window.location.origin ||
          !readUrl.pathname.endsWith("/cloud/browser/openResource.asp")) {
        throw new Error("云资料读取地址无效。");
      }
      return {
        name: selection.dataset.name,
        path: selection.dataset.path,
        nodeId: pickerNodeId,
        scope: "public",
        size: Number(selection.dataset.size || 0),
        mimeType: selection.dataset.mimeType || "application/octet-stream",
        readUrl: readUrl.href
      };
    });
    if (!resources.length) return;
    pickerMessage("webwindows:cloud-resource-selected", resources);
  }

  function applyDirectoryDisplayNames() {
    document.querySelectorAll("[data-directory-name]").forEach((element) => {
      element.textContent = directoryDisplayName(element.dataset.directoryName);
    });
    document.querySelectorAll(".file-item.folder .file-name[data-physical-name]").forEach((element) => {
      element.textContent = directoryDisplayName(element.dataset.physicalName);
    });
    document.querySelectorAll(".file-item.file .file-name[data-file-physical-name]").forEach((element) => {
      element.textContent = fileDisplayName(element.dataset.filePhysicalName);
    });
    document.querySelectorAll("[data-cloud-i18n]").forEach((element) => {
      element.textContent = text(element.dataset.cloudI18n);
    });
    document.querySelectorAll("[data-cloud-i18n-title]").forEach((element) => {
      const label = text(element.dataset.cloudI18nTitle);
      element.title = label;
      element.setAttribute("aria-label", label);
    });
    renderBreadcrumbs();
  }

  function applyLanguage(language) {
    const nextLanguage = normalizeLanguage(language);
    if (nextLanguage === currentLanguage) return;
    currentLanguage = nextLanguage;
    applyDirectoryDisplayNames();
    loadFolderTree();
  }

  document.querySelector('[data-action="back"]').addEventListener("click", goBack);
  document.querySelector('[data-action="forward"]').addEventListener("click", goForward);
  document.querySelector('[data-action="up"]').addEventListener("click", goUp);
  document.getElementById("public-root-button").addEventListener("click", () => navigateToResourcePath(""));
  document.getElementById("sort-select").addEventListener("change", (event) => {
    navigateWith({ sort: event.target.value });
  });
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => navigateWith({ view: button.dataset.view }));
  });
  document.querySelectorAll(".file-item").forEach((item) => {
    item.addEventListener("click", (event) => {
      if (item.dataset.kind === "folder") {
        activateItem(item);
        event.preventDefault();
        navigateToResourcePath(item.dataset.path);
      } else if (pickerMode) {
        if (!pickerMultiple || event.detail <= 1) selectPickerItem(item);
      } else {
        activateItem(item);
      }
    });
    if (item.dataset.kind === "file") {
      item.addEventListener("dblclick", () => {
        if (pickerMode && item.dataset.pickerEligible === "true") {
          if (!pickerMultiple) {
            selectPickerItem(item);
            confirmPickerSelection();
          }
        } else {
          openFile(item);
        }
      });
    }
  });
  document.addEventListener("contextmenu", (event) => {
    if (pickerMode) {
      event.preventDefault();
      return;
    }
    const item = event.target.closest(".file-item");
    if (item) {
      showContextMenu(event, item);
    } else if (event.target.closest(".main")) {
      showContextMenu(event, null);
    }
  });
  contextMenu.addEventListener("click", (event) => {
    const action = event.target.closest("[data-context-action]");
    if (action && !action.disabled) runContextAction(action.dataset.contextAction);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#resource-context-menu")) closeContextMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeContextMenu();
  });
  window.addEventListener("blur", closeContextMenu);
  window.addEventListener("resize", closeContextMenu);
  window.addEventListener("message", (event) => {
    if (event.data?.type === "change-language") applyLanguage(event.data.lang);
  });
  window.addEventListener("storage", (event) => {
    if (event.key === "lang") applyLanguage(event.newValue);
  });
  document.addEventListener("scroll", closeContextMenu, true);
  document.getElementById("message-close").addEventListener("click", closeMessage);
  if (pickerMode) {
    document.getElementById("picker-cancel").addEventListener("click", () => {
      pickerMessage("webwindows:cloud-resource-picker-cancelled");
    });
    document.getElementById("picker-confirm").addEventListener("click", confirmPickerSelection);
  }

  updateNavigationButtons();
  applyDirectoryDisplayNames();
  loadFolderTree();
})();
