(function installDeviceLocations(global) {
  "use strict";

  const objectUrls = new Set();
  let device = null;
  let storage = null;
  let volumes = [];
  let activeVolume = null;
  let activePath = [];

  const labels = {
    zh: {
      device: "此设备", empty: "没有可访问的本地位置",
      emptyHint: "当前环境没有已授权给 WebWindows 的本地位置。", loading: "正在读取…",
      readOnly: "只读", readWrite: "可读写", persisted: "持久授权", session: "当前会话授权",
      revoked: "授权已失效", unknown: "权限未知", unavailable: "本地位置不可访问",
      emptyDirectory: "此文件夹为空", openFailed: "文件无法打开", directoryFailed: "目录无法读取"
    },
    jp: {
      device: "このデバイス", empty: "アクセス可能なローカル場所はありません",
      emptyHint: "現在の環境には WebWindows が許可済みの場所がありません。", loading: "読み込み中…",
      readOnly: "読み取り専用", readWrite: "読み書き可能", persisted: "永続的な許可", session: "現在のセッション",
      revoked: "許可が無効です", unknown: "許可は不明です", unavailable: "ローカルの場所にアクセスできません",
      emptyDirectory: "このフォルダーは空です", openFailed: "ファイルを開けません", directoryFailed: "フォルダーを読み取れません"
    },
    en: {
      device: "This device", empty: "No accessible local locations",
      emptyHint: "This environment has no local location already granted to WebWindows.", loading: "Loading…",
      readOnly: "Read only", readWrite: "Read and write", persisted: "Persistent grant", session: "Current session",
      revoked: "Authorization expired", unknown: "Permission unknown", unavailable: "Local location unavailable",
      emptyDirectory: "This folder is empty", openFailed: "The file could not be opened", directoryFailed: "The folder could not be read"
    }
  };

  function language() {
    const value = String(global.localStorage?.getItem("lang") || document.body.dataset.language || "zh").toLowerCase();
    if (value === "jp" || value.startsWith("ja")) return "jp";
    if (value.startsWith("en")) return "en";
    return "zh";
  }

  function text(key) { return labels[language()][key] || labels.zh[key] || key; }

  function localStorageSupported(capabilities) {
    if (!capabilities || typeof capabilities !== "object") return false;
    return capabilities.directoryPicker?.supported === true && capabilities.read?.supported === true;
  }

  function deviceUrl(volumeId, path) {
    const id = encodeURIComponent(String(volumeId || ""));
    const suffix = (Array.isArray(path) ? path : []).map((part) => encodeURIComponent(String(part))).join("/");
    return `device://${id}/${suffix}`;
  }

  function permissionState(permission) {
    const value = permission || {};
    if (value.revoked === true || value.state === "denied" || value.state === "revoked") return "revoked";
    if (value.readable === true) return value.writable === true ? "readwrite" : "readonly";
    return "unknown";
  }

  async function availability(storageApi) {
    if (!storageApi || typeof storageApi.getCapabilities !== "function") return { state: "unsupported", volumes: [] };
    const capabilities = storageApi.getCapabilities();
    if (!localStorageSupported(capabilities)) return { state: "unsupported", capabilities, volumes: [] };
    const knownVolumes = await storageApi.listVolumes();
    return { state: knownVolumes.length ? "volumes" : "empty", capabilities, volumes: knownVolumes };
  }

  function hostDevice() {
    try {
      const parentDevice = global.parent?.WebWindows?.device;
      if (parentDevice?.storage) return parentDevice;
    } catch (_) {}
    return global.WebWindows?.device || null;
  }

  function elements() {
    return {
      root: document.getElementById("device-root-button"),
      publicRoot: document.getElementById("public-root-button"),
      cloudList: document.querySelector(".file-list"),
      panel: document.getElementById("device-panel"),
      add: document.getElementById("device-add-location"),
      status: document.getElementById("device-status"),
      content: document.getElementById("device-content"),
      breadcrumbs: document.getElementById("device-breadcrumbs")
    };
  }

  function setStatus(message, error) {
    const node = elements().status;
    if (!node) return;
    node.textContent = message || "";
    node.classList.toggle("is-error", Boolean(error));
  }

  function setDeviceView(visible) {
    const ui = elements();
    ui.panel.hidden = !visible;
    ui.cloudList.hidden = visible;
    ui.root.classList.toggle("selected", visible);
    ui.publicRoot.classList.toggle("selected", !visible);
  }

  function formatSize(value) {
    const bytes = Number(value);
    if (!Number.isFinite(bytes)) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function permissionLabel(permission) {
    const state = permissionState(permission);
    if (state === "revoked") return text("revoked");
    if (state === "unknown") return text("unknown");
    const access = state === "readwrite" ? text("readWrite") : text("readOnly");
    return `${access} · ${permission?.persisted ? text("persisted") : text("session")}`;
  }

  function emptyCard(title, description) {
    const card = document.createElement("div");
    card.className = "device-empty";
    const strong = document.createElement("strong");
    strong.textContent = title;
    const paragraph = document.createElement("div");
    paragraph.textContent = description || "";
    card.append(strong, paragraph);
    return card;
  }

  function renderBreadcrumbs() {
    const host = elements().breadcrumbs;
    host.replaceChildren();
    const root = document.createElement("button");
    root.type = "button";
    root.textContent = text("device");
    root.addEventListener("click", renderVolumes);
    host.appendChild(root);
    if (!activeVolume) return;
    const volumeSeparator = document.createElement("span");
    volumeSeparator.textContent = "›";
    const volumeButton = document.createElement("button");
    volumeButton.type = "button";
    volumeButton.textContent = activeVolume.name;
    volumeButton.addEventListener("click", () => openDirectory(activeVolume, []));
    host.append(volumeSeparator, volumeButton);
    activePath.forEach((part, index) => {
      const separator = document.createElement("span");
      separator.textContent = "›";
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = part;
      button.addEventListener("click", () => openDirectory(activeVolume, activePath.slice(0, index + 1)));
      host.append(separator, button);
    });
  }

  function createEntry(entry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `device-entry${entry.kind === "directory" ? " is-folder" : ""}`;
    const icon = document.createElement("span");
    icon.className = "device-entry-icon";
    icon.textContent = entry.kind === "directory" ? "▰" : (String(entry.name || "").split(".").pop() || "FILE").slice(0, 4).toUpperCase();
    const copy = document.createElement("span");
    copy.className = "device-entry-copy";
    const name = document.createElement("span");
    name.className = "device-entry-name";
    name.textContent = entry.name || "—";
    const metadata = document.createElement("span");
    metadata.className = "device-entry-meta";
    const details = [entry.kind === "directory" ? null : formatSize(entry.size)];
    if (Number.isFinite(Number(entry.lastModified))) details.push(new Date(Number(entry.lastModified)).toLocaleString());
    if (entry.readable === false) details.push(text("unavailable"));
    metadata.textContent = details.filter(Boolean).join(" · ");
    copy.append(name, metadata);
    button.append(icon, copy);
    button.addEventListener("click", () => entry.kind === "directory"
      ? openDirectory(activeVolume, entry.path || [...activePath, entry.name])
      : openLocalFile(activeVolume, entry));
    return button;
  }

  function renderVolumes() {
    activeVolume = null;
    activePath = [];
    renderBreadcrumbs();
    const content = elements().content;
    content.replaceChildren();
    if (!volumes.length) {
      content.appendChild(emptyCard(text("empty"), text("emptyHint")));
      setStatus("");
      return;
    }
    volumes.forEach((volume) => {
      const state = permissionState(volume.permission);
      const card = document.createElement("div");
      card.className = "device-location";
      const icon = document.createElement("span");
      icon.className = "device-entry-icon";
      icon.textContent = "▣";
      const copy = document.createElement("div");
      copy.className = "device-entry-copy";
      const name = document.createElement("span");
      name.className = "device-entry-name";
      name.textContent = volume.name || text("device");
      const badge = document.createElement("span");
      badge.className = `device-permission-badge${state === "revoked" ? " is-revoked" : ""}`;
      badge.textContent = permissionLabel(volume.permission);
      copy.append(name, badge);
      if (state === "readonly" || state === "readwrite") {
        card.setAttribute("role", "button");
        card.tabIndex = 0;
        const open = () => openDirectory(volume, []);
        card.addEventListener("click", open);
        card.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") open(); });
      } else {
        card.setAttribute("aria-disabled", "true");
      }
      card.append(icon, copy);
      content.appendChild(card);
    });
    setStatus("");
  }

  async function openDirectory(volume, path) {
    activeVolume = volume;
    activePath = Array.isArray(path) ? [...path] : [];
    renderBreadcrumbs();
    const content = elements().content;
    content.replaceChildren();
    setStatus(text("loading"));
    try {
      const entries = await storage.listDirectory(volume.id, activePath);
      if (!entries.length) content.appendChild(emptyCard(text("emptyDirectory"), deviceUrl(volume.id, activePath)));
      else entries.forEach((entry) => content.appendChild(createEntry(entry)));
      setStatus(deviceUrl(volume.id, activePath));
    } catch (error) {
      const state = /revoked|permission/i.test(String(error?.message)) ? "revoked" : "unknown";
      volume.permission = Object.assign({}, volume.permission, { state, revoked: state === "revoked", readable: false });
      renderVolumes();
      setStatus(error?.message || text("directoryFailed"), true);
    }
  }

  async function openLocalFile(volume, entry) {
    setStatus(text("loading"));
    try {
      const result = await storage.openFile(volume.id, entry.path || [...activePath, entry.name]);
      const mimeType = result.metadata?.type || entry.type || "application/octet-stream";
      const url = URL.createObjectURL(new Blob([result.data], { type: mimeType }));
      objectUrls.add(url);
      const resource = {
        protocol: "webwindows-cloud-resource",
        version: "1.0",
        nodeId: volume.id,
        scope: "device",
        path: deviceUrl(volume.id, entry.path || [...activePath, entry.name]),
        name: result.metadata?.name || entry.name,
        mimeType,
        url,
        permissions: { read: true, edit: false },
        source: "device-storage"
      };
      if (global.parent && global.parent !== global && typeof global.parent.openResource === "function") {
        await global.parent.openResource(resource);
      } else if (typeof global.openResource === "function") {
        await global.openResource(resource);
      } else {
        global.open(url, "_blank", "noopener");
      }
      setStatus(resource.path);
    } catch (error) {
      setStatus(error?.message || text("openFailed"), true);
    }
  }

  async function initialize() {
    const ui = elements();
    if (!ui.root || !ui.panel) return;
    device = hostDevice();
    if (!device) return;
    await device.ready?.();
    storage = device.storage;
    const state = await availability(storage);
    if (state.state === "unsupported" || state.state === "empty") return;
    volumes = state.volumes;
    ui.root.hidden = false;
    ui.add.hidden = true;
    ui.root.querySelector("span:last-child").textContent = text("device");
    ui.root.addEventListener("click", () => { setDeviceView(true); renderVolumes(); });
    ui.publicRoot.addEventListener("click", () => setDeviceView(false));
    renderVolumes();
  }

  global.WebWindowsDeviceLocations = Object.freeze({
    initialize,
    availability,
    localStorageSupported,
    permissionState,
    deviceUrl
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => initialize().catch((error) => console.warn("[DeviceLocations]", error)), { once: true });
  else initialize().catch((error) => console.warn("[DeviceLocations]", error));
})(window);
