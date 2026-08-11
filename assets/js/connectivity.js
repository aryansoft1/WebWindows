(function installWebWindowsConnectivity(global) {
  "use strict";

  const device = global.WebWindows?.device;

  function isMobileDevice() {
    const info = device?.system.getInfo();
    if (typeof info?.mobile === "boolean") return info.mobile;
    return false;
  }

  function connectionKind() {
    return device?.network.getState().kind || "unknown";
  }

  function connectionLabel(kind) {
    return {
      ethernet: "家庭宽带直连（有线）",
      wifi: "Wi‑Fi 无线网络",
      cellular: "手机移动网络",
      offline: "未连接网络",
      unknown: "接入方式未识别"
    }[kind];
  }

  function qualityLabel(raw) {
    if (!raw.online) return "不可用";
    const labels = {
      "slow-2g": "很慢",
      "2g": "较慢",
      "3g": "一般",
      "4g": "良好"
    };
    const effective = String(raw.effectiveType || "").toLowerCase();
    const quality = labels[effective] || "未知";
    return Number.isFinite(raw.downlink)
      ? `${quality} · 约 ${raw.downlink} Mbps`
      : quality;
  }

  function mobileGeneration(kind, raw) {
    if (kind !== "cellular") return "未检测到";
    const effective = String(raw.effectiveType || "").toLowerCase();
    if (effective === "slow-2g" || effective === "2g") return "2G 级";
    if (effective === "3g") return "3G 级";
    if (effective === "4g") {
      return Number(raw.downlink) >= 25
        ? "4G / 5G 级（浏览器不细分）"
        : "4G 级";
    }
    return "移动数据（代际未知）";
  }

  function signalLevel(raw) {
    if (!raw.online) return 0;
    return {
      "slow-2g": 1,
      "2g": 1,
      "3g": 2,
      "4g": 4
    }[String(raw.effectiveType || "").toLowerCase()] || 3;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function setIndicator(id, visible, level, title) {
    const indicator = document.getElementById(id);
    if (!indicator) return;
    indicator.hidden = !visible;
    indicator.dataset.level = String(level);
    indicator.title = title;
    indicator.setAttribute("aria-label", title);
  }

  function updateTaskbar(state) {
    const mobile = isMobileDevice();
    setIndicator(
      "ww-ethernet-indicator",
      state.online && state.kind === "ethernet",
      state.level,
      `${state.type} · ${state.quality}`
    );
    setIndicator(
      "ww-wifi-indicator",
      state.online && state.kind === "wifi",
      state.level,
      `${state.type} · ${state.quality}`
    );
    setIndicator(
      "ww-cellular-indicator",
      state.online && mobile && state.kind === "cellular",
      state.level,
      `${state.generation} · ${state.quality}`
    );
  }

  function snapshot(raw = device?.network.getState() || { supported: false, online: false, kind: "unknown" }) {
    const kind = raw.kind || connectionKind();
    const quality = qualityLabel(raw);
    const latency = raw.online && Number.isFinite(raw.rtt)
      ? `约 ${raw.rtt} ms`
      : "未知";
    return {
      supported: raw.supported === true,
      online: raw.online === true,
      kind,
      type: connectionLabel(kind),
      generation: mobileGeneration(kind, raw),
      quality,
      latency,
      saveData: raw.saveData === true,
      device: isMobileDevice() ? "手机或平板" : "电脑",
      level: signalLevel(raw),
      source: raw.source || "unsupported"
    };
  }

  function update(raw) {
    const state = snapshot(raw);
    setText("network-status", state.online ? "网络已连接" : "网络已断开");
    setText(
      "network-summary",
      !state.online
        ? "请检查设备或浏览器的网络连接。"
        : state.kind === "unknown"
          ? "已联网，但当前浏览器没有返回直连、Wi‑Fi 或移动网络类型。"
          : `${state.type} · ${state.quality}`
    );
    setText("network-type", state.type);
    setText("network-generation", state.generation);
    setText("network-quality", state.quality);
    setText("network-latency", state.latency);
    setText("network-save-data", state.saveData ? "开启" : "关闭");
    setText("network-device", state.device);
    updateTaskbar(state);
    global.dispatchEvent(new CustomEvent("webwindows:connectivity-changed", {
      detail: state
    }));
    return state;
  }

  function openNetworkSettings() {
    const apps = global.WebWindows?.apps;
    if (apps?.launch) {
      apps.launch("webwindows.system.settings", {
        url: "settings.html?tab=network"
      }).catch((error) => console.warn("[Connectivity]", error));
      return;
    }
    global.openWindow?.(
      "settings",
      "设置",
      "settings.html?tab=network",
      "assets/icons/settings.png",
      true,
      "",
      "900px",
      "640px"
    );
  }

  ["ww-ethernet-indicator", "ww-wifi-indicator", "ww-cellular-indicator"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", openNetworkSettings);
  });
  global.addEventListener("webwindows:network-change", (event) => update(event.detail));
  document.addEventListener("DOMContentLoaded", () => update(), { once: true });

  global.WebWindows = global.WebWindows || {};
  global.WebWindows.connectivity = Object.freeze({
    getState: snapshot,
    refresh: () => update(device?.network.refresh())
  });
})(window);

