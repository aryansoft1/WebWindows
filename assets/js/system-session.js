(function () {
  "use strict";

  var ACTIONS = ["shutdown", "restart", "sleep", "lock", "reloadSession"];
  var DEVICE_ACTIONS = ["shutdown", "restart", "sleep", "lock"];
  var NATIVE_BRIDGE_NAME = "WebWindowsNativeDeviceOperations";
  var requestSequence = 0;

  var SESSION_PRESENTATION = {
    shutdown: { label: "关闭 WebWindows 会话", title: "WebWindows 会话已关闭", icon: "⏻", detail: "宿主设备仍在运行。你可以随时返回当前 WebWindows 会话。", button: "返回 WebWindows" },
    restart: { label: "重新启动 WebWindows", title: "重新启动 WebWindows", icon: "🔄", detail: "这只会重新载入 WebWindows，不会重新启动宿主设备。" },
    sleep: { label: "休眠 WebWindows 会话", title: "WebWindows 会话已休眠", icon: "🌙", detail: "这只会遮住当前 WebWindows 会话，不会让宿主设备进入睡眠。", button: "唤醒 WebWindows" },
    lock: { label: "锁定 WebWindows", title: "WebWindows 已锁定", icon: "🔒", detail: "这是会话级隐私遮罩，并非宿主设备锁屏；继续时无需设备密码。", button: "继续使用" },
    reloadSession: { label: "重新载入 WebWindows", title: "重新载入 WebWindows", icon: "🔄", detail: "这只会重新载入当前 WebWindows 页面。" }
  };

  var NATIVE_LABELS = {
    shutdown: "关闭设备",
    restart: "重新启动设备",
    sleep: "设备休眠",
    lock: "锁定设备"
  };

  function isTopLevelTrustedDocument() {
    if (window.top !== window.self) return false;
    return location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  }

  function nativeBridge() {
    var bridge = window[NATIVE_BRIDGE_NAME];
    if (!isTopLevelTrustedDocument() || !bridge || bridge.version !== 1) return null;
    if (typeof bridge.getCapabilities !== "function" || typeof bridge.requestOperation !== "function") return null;
    return bridge;
  }

  function readNativeCapabilities() {
    var bridge = nativeBridge();
    if (!bridge) return {};
    try {
      var value = bridge.getCapabilities();
      if (typeof value === "string") value = JSON.parse(value);
      if (!value || typeof value !== "object") return {};
      var result = {};
      DEVICE_ACTIONS.forEach(function (action) {
        result[action] = value[action] === true;
      });
      return result;
    } catch (error) {
      console.warn("[DeviceOperations] 无法读取原生能力，使用会话级替代行为。", error);
      return {};
    }
  }

  function getCapabilities() {
    var native = readNativeCapabilities();
    var result = {};
    ACTIONS.forEach(function (action) {
      var isNative = native[action] === true;
      result[action] = {
        available: true,
        level: isNative ? "native" : "session",
        label: isNative ? NATIVE_LABELS[action] : SESSION_PRESENTATION[action].label
      };
    });
    return result;
  }

  function hideMenus() {
    var powerMenu = document.getElementById("power-menu");
    var startMenu = document.getElementById("start-menu");
    if (powerMenu) powerMenu.style.display = "none";
    if (startMenu) startMenu.style.display = "none";
  }

  function ensureSessionCover() {
    var cover = document.getElementById("webwindows-session-cover");
    if (cover) return cover;
    cover = document.createElement("section");
    cover.id = "webwindows-session-cover";
    cover.className = "webwindows-session-cover";
    cover.hidden = true;
    cover.setAttribute("role", "dialog");
    cover.setAttribute("aria-modal", "true");
    cover.innerHTML = '<div class="webwindows-session-cover__panel">' +
      '<span class="webwindows-session-cover__icon" aria-hidden="true"></span>' +
      '<h1></h1><p></p><button type="button"></button></div>';
    document.body.appendChild(cover);
    return cover;
  }

  function showSessionCover(action) {
    var content = SESSION_PRESENTATION[action];
    var cover = ensureSessionCover();
    cover.querySelector(".webwindows-session-cover__icon").textContent = content.icon;
    cover.querySelector("h1").textContent = content.title;
    cover.querySelector("p").textContent = content.detail;
    var button = cover.querySelector("button");
    button.textContent = content.button;
    button.onclick = function () {
      cover.hidden = true;
      document.body.removeAttribute("data-webwindows-session-state");
      window.dispatchEvent(new CustomEvent("webwindows:device-operation", { detail: { action: action, level: "session", status: "resumed" } }));
    };
    document.body.setAttribute("data-webwindows-session-state", action);
    cover.hidden = false;
    button.focus();
  }

  function confirmOperation(action, level) {
    if (action === "reloadSession" || (action === "lock" && level === "session")) return true;
    var deviceCopy = {
      shutdown: "关闭宿主设备？设备上的其他工作也会结束。原生外壳还会再次确认。",
      restart: "重新启动宿主设备？设备上的其他工作也会中断。原生外壳还会再次确认。",
      sleep: "让宿主设备进入睡眠？原生外壳还会再次确认。",
      lock: "锁定宿主设备？原生外壳还会再次确认。"
    };
    var sessionCopy = {
      shutdown: "关闭当前 WebWindows 会话视图？宿主设备不会关机。",
      restart: "重新载入 WebWindows？宿主设备不会重新启动。",
      sleep: "休眠当前 WebWindows 会话视图？宿主设备不会进入睡眠。"
    };
    return window.confirm((level === "native" ? deviceCopy : sessionCopy)[action]);
  }

  function emit(action, level, status, extra) {
    window.dispatchEvent(new CustomEvent("webwindows:device-operation", {
      detail: Object.assign({ action: action, level: level, status: status }, extra || {})
    }));
  }

  async function requestNative(action) {
    var bridge = nativeBridge();
    if (!bridge) throw new Error("native_bridge_unavailable");
    var payload = JSON.stringify({
      version: 1,
      requestId: "ww-device-" + Date.now() + "-" + (++requestSequence),
      action: action,
      reason: "user_power_menu"
    });
    var response = await Promise.resolve(bridge.requestOperation(payload));
    if (typeof response === "string") {
      try { response = JSON.parse(response); } catch (_) { response = { status: response }; }
    }
    if (!response || ["accepted", "completed"].indexOf(response.status) === -1) {
      var reason = response && response.status ? response.status : "native_request_rejected";
      throw new Error(reason);
    }
    return response;
  }

  async function perform(action) {
    if (ACTIONS.indexOf(action) === -1) throw new TypeError("Unsupported device operation: " + action);
    hideMenus();
    var capability = getCapabilities()[action];
    if (!confirmOperation(action, capability.level)) {
      emit(action, capability.level, "cancelled");
      return { status: "cancelled", level: capability.level };
    }

    if (capability.level === "native") {
      if (!navigator.userActivation || !navigator.userActivation.isActive) {
        emit(action, "native", "denied", { reason: "user_activation_required" });
        throw new Error("Native device operations require an active user gesture.");
      }
      try {
        var response = await requestNative(action);
        emit(action, "native", response.status);
        return Object.assign({ level: "native" }, response);
      } catch (error) {
        emit(action, "native", "error", { reason: error.message });
        window.alert("设备操作未执行：" + error.message + "。WebWindows 不会把失败显示成已完成。");
        throw error;
      }
    }

    if (action === "restart" || action === "reloadSession") {
      emit(action, "session", "accepted");
      if (action === "restart") sessionStorage.removeItem("booted");
      location.reload();
      return { status: "accepted", level: "session" };
    }

    showSessionCover(action);
    emit(action, "session", "completed");
    return { status: "completed", level: "session" };
  }

  var api = {
    version: 1,
    getCapabilities: getCapabilities,
    shutdown: function () { return perform("shutdown"); },
    restart: function () { return perform("restart"); },
    sleep: function () { return perform("sleep"); },
    lock: function () { return perform("lock"); },
    reloadSession: function () { return perform("reloadSession"); }
  };

  Object.defineProperty(window, "WebWindowsDeviceOperations", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: Object.freeze(api)
  });

  function bindPowerMenu() {
    var capabilities = getCapabilities();
    document.querySelectorAll("[data-device-operation]").forEach(function (button) {
      var action = button.getAttribute("data-device-operation");
      if (!capabilities[action]) return;
      var label = button.querySelector("span:last-child");
      if (label) label.textContent = capabilities[action].label;
      button.setAttribute("data-operation-level", capabilities[action].level);
      button.addEventListener("click", function () {
        perform(action).catch(function () { /* error is reported without claiming success */ });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindPowerMenu, { once: true });
  } else {
    bindPowerMenu();
  }
})();

