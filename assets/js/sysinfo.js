(() => {
  "use strict";
  const byId = (id) => document.getElementById(id);
  const setText = (id, value) => { const element = byId(id); if (element) element.textContent = value ?? "不可用"; };
  const unavailable = "不可用";

  document.addEventListener("contextmenu", (event) => event.preventDefault());

  function activateTab(tabName, focus = false) {
    const button = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const panel = byId(`tab-${tabName}`);
    if (!button || !panel) return false;
    document.querySelectorAll(".tab-btn[data-tab]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll(".tab-content").forEach((item) => {
      const active = item === panel;
      item.classList.toggle("active", active);
      item.setAttribute("aria-hidden", String(!active));
    });
    if (focus) button.focus();
    return true;
  }

  document.querySelector(".tabs")?.addEventListener("click", (event) => {
    const button = event.target.closest?.(".tab-btn[data-tab]");
    if (button) activateTab(button.dataset.tab);
  });
  document.querySelector(".tabs")?.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const buttons = [...document.querySelectorAll(".tab-btn[data-tab]")];
    const current = buttons.indexOf(document.activeElement);
    if (current < 0 || !buttons.length) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
      : (current + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    activateTab(buttons[next].dataset.tab, true);
  });
  activateTab(document.querySelector(".tab-btn.active[data-tab]")?.dataset.tab || "system");

  function deviceApi() {
    try { return window.parent?.WebWindows?.device || window.WebWindows?.device || null; }
    catch (_) { return null; }
  }
  function formatBytes(bytes) {
    const value = Number(bytes);
    if (!Number.isFinite(value) || value < 0) return unavailable;
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = value; let index = 0;
    while (size >= 1024 && index < units.length - 1) { size /= 1024; index += 1; }
    return `${size.toFixed(index ? 2 : 0)} ${units[index]}`;
  }
  function formatMB(value) { return Number.isFinite(Number(value)) ? formatBytes(Number(value) * 1024 * 1024) : unavailable; }
  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? unavailable : date.toLocaleString();
  }
  function runtimeLabel(adapter) {
    if (adapter === "android") return "Android Host / WebView";
    if (adapter && adapter !== "browser") return `WebWindows Host (${adapter})`;
    return "Browser / WebWindows OS";
  }
  function deviceType() {
    const ua = navigator.userAgent || "";
    if (/Android|iPhone|iPad|Mobile/i.test(ua)) return "移动设备";
    return "桌面设备";
  }

  async function loadRelease() {
    try {
      const response = await fetch("deploy/ftp-manifest.json", { cache: "no-store", credentials: "same-origin" });
      const release = await response.json();
      if (!response.ok || !release.releaseVersion) throw new Error("release-unavailable");
      setText("releaseVersion", release.releaseVersion);
      setText("buildDate", formatDate(release.generatedAt));
      setText("previousVersion", release.previousReleaseVersion || unavailable);
    } catch (_) {
      setText("releaseVersion", unavailable); setText("buildDate", unavailable);
      setText("releaseSource", "部署清单当前不可读取；未显示推测版本。");
    }
  }

  function renderCapabilities(capabilities) {
    const root = byId("capabilities");
    if (!root) return;
    root.replaceChildren();
    const groups = capabilities && typeof capabilities === "object" ? capabilities : {};
    Object.entries(groups).forEach(([group, entries]) => {
      const supported = Object.values(entries || {}).some((entry) => entry?.supported === true);
      const item = document.createElement("div"); item.className = `capability ${supported ? "supported" : "unsupported"}`;
      const sources = [...new Set(Object.values(entries || {}).map((entry) => entry?.source).filter((source) => source && source !== "unsupported"))];
      item.innerHTML = `<strong>${group}</strong><span>${supported ? "可用" : unavailable}</span><small></small>`;
      item.querySelector("small").textContent = sources.join(" / ") || "unsupported";
      root.appendChild(item);
    });
    if (!root.childElementCount) root.textContent = "Device API 不可用";
  }

  async function refreshDevice() {
    const device = deviceApi();
    const adapter = device?.getAdapter?.() || "browser";
    setText("runtimeMode", runtimeLabel(adapter));
    setText("deviceApiVersion", device ? `v${device.version || 1}` : unavailable);
    setText("language", navigator.language || unavailable);
    setText("browserInfo", navigator.userAgent || unavailable);
    setText("deviceType", deviceType());
    setText("cpuCores", navigator.hardwareConcurrency || unavailable);
    setText("deviceMemory", navigator.deviceMemory ? `${navigator.deviceMemory} GB（浏览器近似值）` : unavailable);
    setText("screenSize", window.screen ? `${screen.width} × ${screen.height} @ ${window.devicePixelRatio || 1}x` : unavailable);
    if (!device) { renderCapabilities(null); return; }
    try {
      const network = device.network?.getState?.();
      setText("networkState", network ? `${network.online ? "在线" : "离线"} · ${network.kind || "unknown"}` : unavailable);
    } catch (_) { setText("networkState", unavailable); }
    try {
      await device.battery?.refresh?.();
      const battery = device.battery?.getState?.(); const power = device.power?.getState?.();
      setText("batteryState", battery?.supported ? `${Math.round((battery.level || 0) * 100)}% · ${power?.acConnected ? "外接供电" : "电池供电"}` : unavailable);
    } catch (_) { setText("batteryState", unavailable); }
    try {
      await device.storage?.refresh?.();
      const storage = device.storage?.getState?.(); const volumes = await device.storage?.listVolumes?.();
      const estimate = storage?.supported ? `${formatBytes(storage.usage)} / ${formatBytes(storage.quota)}` : unavailable;
      setText("storageState", `${estimate}${Array.isArray(volumes) ? ` · ${volumes.length} 个已授权位置` : ""}`);
    } catch (_) { setText("storageState", unavailable); }
    try { renderCapabilities(device.getCapabilities?.()); } catch (_) { renderCapabilities(null); }
  }

  async function refreshHost() {
    try {
      const response = await fetch("inc/sysinfo.asp", { cache: "no-store", credentials: "same-origin" });
      const data = await response.json(); if (!response.ok || data.ok === false) throw new Error("host-unavailable");
      setText("hostCpuModel", data.cpuModel || unavailable);
      setText("hostCpuUsage", data.cpuUsage == null ? unavailable : `${data.cpuUsage}%`);
      setText("hostMemory", Number(data.memTotal) > 0 ? `${formatMB(data.memUsed)} / ${formatMB(data.memTotal)}` : unavailable);
      setText("systemStorage", data.sysUsed == null ? unavailable : formatMB(data.sysUsed));
    } catch (_) {
      ["hostCpuModel", "hostCpuUsage", "hostMemory", "systemStorage"].forEach((id) => setText(id, unavailable));
    }
  }

  function resetStorage(message, status = "unavailable") {
    setText("userStorageUsed", message);
    setText("userStorageRemaining", unavailable);
    setText("userStorageTotal", unavailable);
    setText("userStorageDatacenter", "数据中心未知");
    setText("userStorageStatus", message);
    const bar = byId("userStorageBar");
    const progress = byId("userStorageProgress");
    const allocation = document.querySelector(".storage-allocation");
    if (bar) bar.style.width = "0%";
    if (progress) progress.setAttribute("aria-valuenow", "0");
    if (allocation) allocation.dataset.status = status;
  }

  async function refreshStorage() {
    try {
      const response = await fetch("api/storage-quota.asp", { cache: "no-store", credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok || data.ok !== true) throw new Error(data.storageStatus || "storage-unavailable");
      if (!data.authenticated) {
        resetStorage("未登录，无法读取用户空间", "unavailable");
        return;
      }

      setText("userStorageDatacenter", data.dataCenterName || "数据中心未分配");
      setText("userStorageUsed", data.statsAvailable ? formatMB(data.usedMB) : unavailable);
      if (!data.statsAvailable) {
        setText("userStorageRemaining", unavailable);
        setText("userStorageTotal", data.quotaKnown ? formatMB(data.quotaMB) : unavailable);
        setText("userStorageStatus", "用户目录统计失败；未显示推测值。");
        resetStorageProgress("unavailable");
        return;
      }
      if (!data.quotaKnown) {
        setText("userStorageRemaining", unavailable);
        setText("userStorageTotal", unavailable);
        setText("userStorageStatus", "账号未分配有效数据中心配额。");
        resetStorageProgress("unavailable");
        return;
      }

      const percent = Math.min(100, Math.max(0, Number(data.usedPercent) || 0));
      setText("userStorageRemaining", formatMB(data.remainingMB));
      setText("userStorageTotal", formatMB(data.quotaMB));
      setText("userStorageStatus", data.storageStatus === "over-quota"
        ? "已超过分配空间，请清理文件或联系管理员调整配额。"
        : `${percent.toFixed(2)}% 已使用${data.legacyDefault ? "（兼容默认 1 GB）" : ""}`);
      const bar = byId("userStorageBar");
      const progress = byId("userStorageProgress");
      const allocation = document.querySelector(".storage-allocation");
      if (bar) bar.style.width = `${percent}%`;
      if (progress) progress.setAttribute("aria-valuenow", String(percent));
      if (allocation) allocation.dataset.status = data.storageStatus === "over-quota" ? "over-quota" : "available";
    } catch (_) {
      resetStorage("配额或空间统计暂时不可用", "unavailable");
    }
  }

  function resetStorageProgress(status) {
    const bar = byId("userStorageBar");
    const progress = byId("userStorageProgress");
    const allocation = document.querySelector(".storage-allocation");
    if (bar) bar.style.width = "0%";
    if (progress) progress.setAttribute("aria-valuenow", "0");
    if (allocation) allocation.dataset.status = status;
  }

  loadRelease(); refreshDevice(); refreshHost(); refreshStorage();
  const hostTimer = setInterval(() => { refreshHost(); refreshStorage(); }, 30000);
  window.addEventListener("pagehide", () => clearInterval(hostTimer), { once: true });
})();
