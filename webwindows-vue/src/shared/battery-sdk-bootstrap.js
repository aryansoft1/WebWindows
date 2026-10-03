export function createBatterySdkBootstrap(identity, launch, initProtocol) {
  if (!launch?.facadeEnabled) return "";
  const configuration = JSON.stringify({
    initProtocol, protocol:launch.protocol, version:launch.version,
    sessionId:identity.sessionId, snapshotId:identity.snapshotId, channelId:launch.channelId,
    refreshTimeoutMs:launch.refreshTimeoutMs, clientErrors:launch.clientErrors, handshake:launch.handshake
  }).replace(/</g, "\\u003c");
  return `;(${batterySdkBootstrap.toString()})(${configuration});`;
}

function batterySdkBootstrap(config) {
  "use strict";
  let port = null, sequence = 0;
  let cachedState = config.handshake?.ok === true ? cloneState(config.handshake.result) : null;
  const handshakeError = config.handshake?.ok === false ? config.handshake.error : null;
  const pending = new Map(), queue = [];
  function cloneState(state) { return { supported:state.supported, present:state.present, level:state.level, charging:state.charging, connected:state.connected, source:state.source }; }
  function capabilityError(definition) {
    const error = new Error(definition?.message || "The WebWindows capability request failed.");
    error.name = "WebWindowsCapabilityError"; error.code = definition?.code || "broker-unavailable"; error.retryable = definition?.retryable === true; return error;
  }
  function requestId() {
    const bytes = new Uint8Array(16); crypto.getRandomValues(bytes);
    return `sdk-${sequence++}-${Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("")}`;
  }
  function send(message) { if (port) port.postMessage(message); else queue.push(message); }
  function refresh() {
    const id = requestId();
    const message = { protocol:config.protocol, version:config.version, type:"request", sessionId:config.sessionId,
      snapshotId:config.snapshotId, channelId:config.channelId, requestId:id, method:"device.battery.refresh", params:{} };
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (!pending.delete(id)) return;
        const { params: _params, ...cancel } = message; send({ ...cancel, type:"cancel" });
        reject(capabilityError(config.clientErrors?.["request-timeout"]));
      }, config.refreshTimeoutMs);
      pending.set(id, { resolve, reject, timer }); send(message);
    });
  }
  function handleResponse(message) {
    if (!message || message.protocol !== config.protocol || message.version !== config.version || message.type !== "response"
        || message.sessionId !== config.sessionId || message.snapshotId !== config.snapshotId || message.channelId !== config.channelId
        || message.method !== "device.battery.refresh" || typeof message.requestId !== "string") return;
    const request = pending.get(message.requestId); if (!request) return;
    pending.delete(message.requestId); clearTimeout(request.timer);
    if (message.ok === true) { cachedState = cloneState(message.result); request.resolve(cloneState(cachedState)); }
    else request.reject(capabilityError(message.error));
  }
  const battery = Object.freeze({ getState() {
    if (!cachedState) throw capabilityError(handshakeError || config.clientErrors?.["broker-unavailable"]);
    return cloneState(cachedState);
  }, refresh });
  Object.defineProperty(globalThis, "WebWindows", { value:Object.freeze({ device:Object.freeze({ battery }) }), configurable:false, enumerable:true, writable:false });
  addEventListener("message", function initialize(event) {
    const data = event.data;
    if (!data || data.protocol !== config.initProtocol || data.version !== 1 || data.sessionId !== config.sessionId
        || data.snapshotId !== config.snapshotId || data.channelId !== config.channelId || event.ports.length !== 1 || port) return;
    port = event.ports[0]; port.onmessage = (portEvent) => handleResponse(portEvent.data); port.start?.();
    while (queue.length) port.postMessage(queue.shift());
  });
}
