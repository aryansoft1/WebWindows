(function () {
  "use strict";

  const CONTROL_PROTOCOL = "webwindows-studio-preview-control-v1";
  const CONSOLE_PROTOCOL = "webwindows-studio-preview-console-v1";
  const CONSOLE_INIT_PROTOCOL = "webwindows-studio-preview-console-init-v1";
  const SESSION_CONTRACT = "webwindows-studio-preview-session-v1";
  const SANDBOX = "allow-scripts allow-forms allow-modals allow-downloads";
  const REFERRER_POLICY = "no-referrer";
  const MAX_DOCUMENT_BYTES = 30 * 1024 * 1024;
  const MAX_CONSOLE_BYTES = 32 * 1024;
  const LEVELS = new Set(["log", "info", "warn", "error", "debug"]);
  const surface = document.getElementById("previewSurface");
  const stateNode = document.getElementById("previewState");
  const identityNode = document.getElementById("previewIdentity");
  let controlPort = null;
  let hostNonce = null;
  let active = null;

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (event.source !== parent || event.origin !== location.origin || !plain(message)
        || message.protocol !== CONTROL_PROTOCOL || message.version !== 1 || message.type !== "host.connect"
        || typeof message.hostNonce !== "string" || event.ports.length !== 1) return;
    disconnect();
    hostNonce = message.hostNonce;
    controlPort = event.ports[0];
    controlPort.onmessage = (portEvent) => handleControl(portEvent.data);
    controlPort.start();
  });

  async function handleControl(message) {
    if (!plain(message) || message.protocol !== CONTROL_PROTOCOL || message.version !== 1
        || message.hostNonce !== hostNonce || typeof message.type !== "string"
        || typeof message.requestId !== "string" || !plain(message.payload)) return;
    try {
      let payload = null;
      if (message.type === "host.ping") payload = { ready: true };
      else if (message.type === "preview.start") payload = startPreview(message.payload);
      else if (message.type === "preview.stop") payload = stopPreview(message.payload);
      else return;
      respond(message.requestId, true, payload);
    } catch (error) {
      setState(error?.message || String(error), true);
      respond(message.requestId, false, null, error?.message || String(error));
    }
  }

  function startPreview(payload) {
    const session = payload.session;
    if (!validSession(session) || typeof payload.token !== "string" || payload.token.length < 24
        || typeof payload.documentHtml !== "string" || !Number.isSafeInteger(payload.documentBytes)
        || payload.documentBytes !== byteLength(payload.documentHtml)
        || payload.documentBytes > MAX_DOCUMENT_BYTES) throw new Error("Developer Preview start payload 无效。");
    stopActive();
    const frame = document.createElement("iframe");
    frame.title = `Developer Preview ${session.snapshotId}`;
    frame.setAttribute("sandbox", SANDBOX);
    frame.setAttribute("referrerpolicy", REFERRER_POLICY);
    const consoleChannel = new MessageChannel();
    active = { session, token: payload.token, frame, consolePort: consoleChannel.port1 };
    active.consolePort.onmessage = (event) => forwardConsole(event.data, active);
    active.consolePort.start();
    frame.addEventListener("load", () => {
      if (!active || active.frame !== frame) return;
      frame.contentWindow.postMessage({
        protocol: CONSOLE_INIT_PROTOCOL,
        version: 1,
        sessionId: session.sessionId,
        snapshotId: session.snapshotId,
        token: payload.token
      }, "*", [consoleChannel.port2]);
      emitState("running", session);
    }, { once: true });
    surface.replaceChildren(frame);
    identityNode.textContent = `${session.projectUuid} · ${short(session.snapshotId)}`;
    frame.srcdoc = payload.documentHtml;
    return { state: "created", sessionId: session.sessionId, snapshotId: session.snapshotId };
  }

  function stopPreview(payload) {
    if (!active) return { state: "closed" };
    if (payload.sessionId !== active.session.sessionId || payload.token !== active.token) {
      throw new Error("Developer Preview stop identity 无效。");
    }
    const session = active.session;
    stopActive();
    emitState("closed", session);
    return { state: "closed", sessionId: session.sessionId };
  }

  function forwardConsole(message, binding) {
    if (!active || binding !== active || !validConsole(message, binding)) return;
    const safeMessage = {
      sessionId: message.sessionId,
      snapshotId: message.snapshotId,
      sequence: message.sequence,
      timestamp: message.timestamp,
      level: message.level,
      arguments: message.arguments
    };
    send({ type: "preview.console", payload: safeMessage });
  }

  function validConsole(message, binding) {
    if (!plain(message) || message.protocol !== CONSOLE_PROTOCOL || message.version !== 1
        || message.type !== "console.event" || message.sessionId !== binding.session.sessionId
        || message.snapshotId !== binding.session.snapshotId || message.token !== binding.token
        || !LEVELS.has(message.level) || !Number.isSafeInteger(message.sequence) || message.sequence < 0
        || typeof message.timestamp !== "string" || !Array.isArray(message.arguments)) return false;
    try { return byteLength(JSON.stringify(message)) <= MAX_CONSOLE_BYTES; } catch { return false; }
  }

  function validSession(session) {
    return plain(session) && session.contract === SESSION_CONTRACT
      && typeof session.sessionId === "string" && typeof session.projectUuid === "string"
      && typeof session.snapshotId === "string" && typeof session.createdAt === "string"
      && typeof session.expiresAt === "string" && session.state === "created";
  }

  function respond(requestId, ok, payload, error) {
    send({ type: "host.response", requestId, ok, payload, ...(error ? { error } : {}) });
  }

  function emitState(state, session) {
    send({ type: "preview.state", payload: { state, sessionId: session.sessionId, snapshotId: session.snapshotId } });
  }

  function send(message) {
    if (!controlPort || !hostNonce) return;
    try { controlPort.postMessage({ protocol: CONTROL_PROTOCOL, version: 1, hostNonce, ...message }); }
    catch { disconnect(); }
  }

  function stopActive() {
    if (!active) return;
    active.consolePort.close();
    active.frame.removeAttribute("srcdoc");
    active.frame.remove();
    active.token = null;
    active = null;
    identityNode.textContent = "No active session";
    setState("Run a validated Snapshot to start.");
  }

  function disconnect() {
    stopActive();
    controlPort?.close();
    controlPort = null;
    hostNonce = null;
  }

  function setState(message, error = false) {
    stateNode.textContent = message;
    stateNode.classList.toggle("error", error);
    if (!stateNode.isConnected) surface.replaceChildren(stateNode);
  }

  function byteLength(value) { return new TextEncoder().encode(String(value)).byteLength; }
  function short(value) { return value.length > 22 ? `${value.slice(0, 19)}…` : value; }
  function plain(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value)
      && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  }
})();
