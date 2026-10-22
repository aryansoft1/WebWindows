/* Composed sandbox bootstrap for Developer Studio PREVIEW sessions that need BOTH the battery
 * facade and the ai assist pilot facade on window.WebWindows.
 *
 * Why one function instead of two: shared/battery-sdk-bootstrap.js defines
 * `globalThis.WebWindows` as a frozen, non-configurable object, so a second independent
 * bootstrap cannot attach `ai` afterwards (defineProperty would throw). This preview-only
 * module mirrors the battery block VERBATIM (behavior parity is asserted in
 * tmp/studio-audit-smoke.cjs against the same states and transitions) and adds the ai block.
 * shared/battery-sdk-bootstrap.js itself and the production broker build are untouched.
 */
export function createComposedSdkBootstrap(identity, launch, initProtocol) {
  const hasBattery = Boolean(launch?.facadeEnabled);
  const hasAi = Boolean(launch?.ai?.facadeEnabled);
  if (!hasBattery && !hasAi) return "";
  const configuration = JSON.stringify({
    initProtocol,
    protocol: launch.protocol,
    version: launch.version,
    sessionId: identity.sessionId,
    snapshotId: identity.snapshotId,
    channelId: launch.channelId,
    battery: hasBattery ? {
      refreshTimeoutMs: launch.refreshTimeoutMs,
      clientErrors: launch.clientErrors,
      handshake: launch.handshake
    } : null,
    ai: hasAi ? {
      assistTimeoutMs: launch.ai.assistTimeoutMs,
      handshake: launch.ai.handshake,
      clientErrors: launch.ai.clientErrors
    } : null
  }).replace(/</g, "\\u003c");
  return `;(${composedSdkBootstrap.toString()})(${configuration});`;
}

function composedSdkBootstrap(config) {
  "use strict";
  let port = null, sequence = 0;
  const pending = new Map(), queue = [];

  /* ---------- battery block: mirrors shared/battery-sdk-bootstrap.js verbatim ---------- */
  let cachedState = config.battery?.handshake?.ok === true ? cloneState(config.battery.handshake.result) : null;
  const handshakeError = config.battery?.handshake?.ok === false ? config.battery.handshake.error : null;

  function cloneState(state) {
    return {
      supported: state.supported, present: state.present, level: state.level,
      charging: state.charging, connected: state.connected, source: state.source
    };
  }
  function capabilityError(definition) {
    const error = new Error(definition?.message || "The WebWindows capability request failed.");
    error.name = "WebWindowsCapabilityError";
    error.code = definition?.code || "broker-unavailable";
    error.retryable = definition?.retryable === true;
    return error;
  }
  function requestId() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return `sdk-${sequence++}-${Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("")}`;
  }
  function send(message) { if (port) port.postMessage(message); else queue.push(message); }

  function refresh() {
    if (!config.battery) throw capabilityError({ code: "broker-unavailable" });
    const id = requestId();
    const message = {
      protocol: config.protocol, version: config.version, type: "request",
      sessionId: config.sessionId, snapshotId: config.snapshotId, channelId: config.channelId,
      requestId: id, method: "device.battery.refresh", params: {}
    };
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (!pending.delete(id)) return;
        const { params: _params, ...cancel } = message;
        send({ ...cancel, type: "cancel" });
        reject(capabilityError(config.battery.clientErrors?.["request-timeout"]));
      }, config.battery.refreshTimeoutMs);
      pending.set(id, { resolve, reject, timer, kind: "battery" });
      send(message);
    });
  }
  const battery = Object.freeze({
    getState() {
      if (!config.battery) throw capabilityError({ code: "broker-unavailable" });
      if (!cachedState) throw capabilityError(handshakeError || config.battery.clientErrors?.["broker-unavailable"]);
      return cloneState(cachedState);
    },
    refresh
  });

  /* ---------- ai assist block: preview-audit pilot facade ---------- */
  const aiListeners = new Set();
  const aiPending = new Map();
  function assistError(definition) {
    const error = new Error(definition?.message || "The WebWindows AI assist request failed.");
    error.name = "WebWindowsCapabilityError";
    error.code = definition?.code || "broker-unavailable";
    error.retryable = definition?.retryable === true;
    return error;
  }
  function aiRequestId() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return `sdk-ai-${sequence++}-${Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("")}`;
  }
  function requestAssist(assistRequest) {
    if (!config.ai || config.ai.handshake?.ok !== true) {
      throw assistError(config.ai?.clientErrors?.["broker-unavailable"]);
    }
    if (!assistRequest || typeof assistRequest !== "object" || Array.isArray(assistRequest)
      || typeof assistRequest.scene !== "string" || typeof assistRequest.payload !== "string"
      || (assistRequest.requestId !== undefined && typeof assistRequest.requestId !== "string")) {
      throw assistError({ code: "invalid-params", message: "The assist request shape is invalid.", retryable: false });
    }
    const id = aiRequestId();
    const message = {
      protocol: config.protocol, version: config.version, type: "request",
      sessionId: config.sessionId, snapshotId: config.snapshotId, channelId: config.channelId,
      requestId: id, method: "ai.desktalk.requestAssist",
      params: {
        scene: assistRequest.scene,
        payload: assistRequest.payload,
        ...(assistRequest.requestId !== undefined ? { requestId: assistRequest.requestId } : {})
      }
    };
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (!aiPending.delete(id)) return;
        const { params: _params, ...cancel } = message;
        send({ ...cancel, type: "cancel" });
        reject(assistError(config.ai.clientErrors?.["request-timeout"]));
      }, config.ai.assistTimeoutMs);
      aiPending.set(id, { resolve, reject, timer });
      send(message);
    });
  }
  /* registered sanitization: null on host decline (fail-closed, mistake-silent) */
  function handleAiResponse(message) {
    if (message.protocol !== config.protocol || message.version !== config.version
      || message.type !== "response" || message.sessionId !== config.sessionId
      || message.snapshotId !== config.snapshotId || message.channelId !== config.channelId
      || message.method !== "ai.desktalk.requestAssist" || typeof message.requestId !== "string") return;
    const request = aiPending.get(message.requestId);
    if (!request) return;
    aiPending.delete(message.requestId);
    clearTimeout(request.timer);
    if (message.ok === true) request.resolve(message.result);
    else if (message.error?.code === "assist-rejected-by-user") request.resolve(null);
    else request.reject(assistError(message.error));
  }
  function handleAssistEvent(frame) {
    if (frame.protocol !== "webwindows-studio-preview-assist-event-v1"
      || frame.version !== 1 || frame.type !== "event"
      || frame.event !== "ai.assist.received" || frame.method !== "ai.assist.received"
      || frame.sessionId !== config.sessionId || frame.snapshotId !== config.snapshotId
      || frame.channelId !== config.channelId
      || typeof frame.requestId !== "string"
      || !frame.detail || typeof frame.detail !== "object") return;
    const reply = Object.freeze(JSON.parse(JSON.stringify(frame.detail)));
    for (const listener of [...aiListeners]) {
      try { listener(reply); } catch { /* listener faults must not break dispatch */ }
    }
  }
  function onAssistEvent(type, handler) {
    if (type !== "assist.received" || typeof handler !== "function") {
      throw assistError({ code: "invalid-params", message: "Unsupported event name or handler.", retryable: false });
    }
    aiListeners.add(handler);
    return () => aiListeners.delete(handler);
  }
  const ai = Object.freeze({
    isSupported() { return config.ai?.handshake?.ok === true; },
    requestAssist,
    on: onAssistEvent
  });

  /* ---------- assembly: one WebWindows definition point ---------- */
  const namespaces = {};
  if (config.battery) namespaces.device = Object.freeze({ battery });
  if (config.ai) namespaces.ai = ai;
  Object.defineProperty(globalThis, "WebWindows", {
    value: Object.freeze(namespaces), configurable: false, enumerable: true, writable: false
  });

  addEventListener("message", function initialize(event) {
    const data = event.data;
    if (!data || data.protocol !== config.initProtocol || data.version !== 1
      || data.sessionId !== config.sessionId || data.snapshotId !== config.snapshotId
      || data.channelId !== config.channelId || event.ports.length !== 1 || port) return;
    port = event.ports[0];
    port.onmessage = (portEvent) => {
      const message = portEvent.data;
      if (!message || typeof message !== "object" || typeof message.type !== "string") return;
      if (message.type === "event") handleAssistEvent(message);
      else if (message.type === "response") {
        if (message.method === "device.battery.refresh") handleBatteryResponse(message);
        else if (message.method === "ai.desktalk.requestAssist") handleAiResponse(message);
      }
    };
    port.start?.();
    while (queue.length) port.postMessage(queue.shift());
  });

  function handleBatteryResponse(message) {
    if (!message.protocol || message.protocol !== config.protocol || message.version !== config.version
      || message.type !== "response" || message.sessionId !== config.sessionId
      || message.snapshotId !== config.snapshotId || message.channelId !== config.channelId
      || message.method !== "device.battery.refresh" || typeof message.requestId !== "string") return;
    const request = pending.get(message.requestId);
    if (!request) return;
    pending.delete(message.requestId);
    clearTimeout(request.timer);
    if (message.ok === true) {
      cachedState = cloneState(message.result);
      request.resolve(cloneState(cachedState));
    } else request.reject(capabilityError(message.error));
  }
}
