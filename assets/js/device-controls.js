(function installDeviceControlsCompatibility(global) {
  "use strict";

  const device = global.WebWindows?.device;
  if (!device) {
    console.warn("[DeviceControls] WebWindows Device API is unavailable.");
    return;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
  }

  function capabilities() {
    const audio = device.audio.getCapabilities().volume;
    const display = device.display.getCapabilities().brightness;
    const battery = device.battery.getCapabilities().status;
    return {
      volume: { available: audio.supported, level: audio.scope === "native" ? "native" : "page" },
      brightness: { available: display.supported, level: display.scope === "native" ? "native" : "visual" },
      battery: { available: battery.supported, level: battery.source === "android-native" ? "native" :
        (battery.supported ? "api" : "none") }
    };
  }

  function state() {
    return {
      volume: device.audio.getVolume().value,
      brightness: Number(global.localStorage?.getItem("webwindows.visualBrightness") ?? 1)
    };
  }

  function batteryTitle(current) {
    const percent = Number.isFinite(current.level) ? `${Math.round(current.level * 100)}%` : "电量未知";
    if (current.charging === true) return `${percent} · 正在充电`;
    if (current.acConnected === true) return `${percent} · 已接电源`;
    return `${percent} · 使用电池`;
  }

  function renderBattery(current) {
    const indicator = document.getElementById("ww-battery-indicator");
    if (!indicator) return;
    if (!current?.supported || current.present !== true) {
      indicator.hidden = true;
      return;
    }
    indicator.hidden = false;
    indicator.classList.toggle("is-charging", current.charging === true);
    const percent = Number.isFinite(current.level) ? Math.round(clamp(current.level, 0, 1) * 100) : 0;
    indicator.style.setProperty("--battery-level", `${percent}%`);
    const title = batteryTitle(current);
    indicator.title = title;
    indicator.setAttribute("aria-label", title);
    const tip = indicator.querySelector(".battery-indicator__tip");
    if (tip) tip.textContent = Number.isFinite(current.level) ? `${percent}%` : "×";
    global.dispatchEvent(new CustomEvent("webwindows:battery-changed", { detail: current }));
  }

  function setVolume(value, options) {
    return device.audio.setVolume(value, options);
  }

  function setBrightness(value, options) {
    return device.display.setBrightness(value, options);
  }

  global.addEventListener("message", (event) => {
    if (event.origin !== location.origin || event.source === global) return;
    if (event.data?.type !== "webwindows:set-device-control") return;
    const method = event.data.control === "volume" ? setVolume :
      event.data.control === "brightness" ? setBrightness : null;
    method?.(event.data.value).catch((error) => console.warn("[DeviceControls]", error));
  });

  global.addEventListener("webwindows:battery-change", (event) => renderBattery(event.detail));

  global.WebWindows.deviceControls = Object.freeze({
    getCapabilities: capabilities,
    getState: state,
    setVolume,
    setBrightness,
    refreshBattery: () => device.battery.refresh()
  });

  device.ready().then(() => renderBattery(device.battery.getState()));
})(window);

