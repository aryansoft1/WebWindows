import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { MessageChannel } from "node:worker_threads";

const source = await fs.readFile(new URL("../assets/js/developer-preview-host.js", import.meta.url), "utf8");
const windowListeners = new Map();
const parent = {};
const stateNode = element("p");
const identityNode = element("span");
const frames = [];
const surface = {
  replaceChildren(node) {
    stateNode.isConnected = node === stateNode;
    if (node) node.isConnected = true;
    this.child = node;
  }
};
stateNode.isConnected = true;
surface.child = stateNode;
const document = {
  getElementById(id) {
    return { previewSurface: surface, previewState: stateNode, previewIdentity: identityNode }[id];
  },
  createElement(tag) {
    assert.equal(tag, "iframe");
    const frame = createFrame();
    frames.push(frame);
    return frame;
  }
};
const window = { addEventListener: (type, listener) => windowListeners.set(type, listener) };
const context = {
  window, parent, location: { origin: "https://studio.test" }, document, MessageChannel, TextEncoder,
  Set, Object, Array, String, Number, RegExp, Error, Promise, JSON, console
};
context.globalThis = context;
vm.runInNewContext(source, context, { filename: "developer-preview-host.js" });

const wrong = new MessageChannel();
windowListeners.get("message")({
  source: {}, origin: "https://studio.test", ports: [wrong.port2],
  data: { protocol: "webwindows-studio-preview-control-v1", version: 1, type: "host.connect", hostNonce: "wrong" }
});
wrong.port1.postMessage(control("host.ping", "wrong", "ignored", {}));

const controls = new MessageChannel();
const received = [];
controls.port1.on("message", (message) => received.push(message));
windowListeners.get("message")({
  source: parent, origin: "https://studio.test", ports: [controls.port2],
  data: { protocol: "webwindows-studio-preview-control-v1", version: 1, type: "host.connect", hostNonce: "host-good" }
});
controls.port1.postMessage(control("host.ping", "host-good", "ping", {}));
await waitFor(() => response(received, "ping"));
assert.equal(response(received, "ping").ok, true);

const sessionA = session("session-a", "snapshot-a");
const htmlA = "<!doctype html><p>A</p>";
controls.port1.postMessage(control("preview.start", "host-good", "start-a", {
  session: sessionA, token: "token-a-opaque-identity-123456", documentHtml: htmlA,
  documentBytes: new TextEncoder().encode(htmlA).byteLength, brokerLaunch: { facadeEnabled: false }
}));
await waitFor(() => response(received, "start-a") && frames[0]?.appPort);
assert.equal(response(received, "start-a").ok, true);
assert.equal(frames[0].attributes.get("sandbox"), "allow-scripts allow-forms allow-modals allow-downloads");
assert.equal(frames[0].attributes.get("referrerpolicy"), "no-referrer");

frames[0].appPort.postMessage(consoleEvent(sessionA, "wrong-token", 0, ["ignored"]));
frames[0].appPort.postMessage(consoleEvent(sessionA, "token-a-opaque-identity-123456", 1, ["accepted"]));
frames[0].appPort.postMessage(consoleEvent(session("session-b", "snapshot-b"), "token-a-opaque-identity-123456", 2, ["wrong session"]));
frames[0].appPort.postMessage(consoleEvent(sessionA, "token-a-opaque-identity-123456", 3, ["x".repeat(40000)]));
await waitFor(() => received.some((message) => message.type === "preview.console"));
const logsA = received.filter((message) => message.type === "preview.console");
assert.equal(logsA.length, 1);
assert.deepEqual(logsA[0].payload.arguments, ["accepted"]);
assert.equal(Object.prototype.hasOwnProperty.call(logsA[0].payload, "token"), false);

const stalePort = frames[0].appPort;
const sessionB = session("session-b", "snapshot-b");
const htmlB = "<!doctype html><p>B</p>";
controls.port1.postMessage(control("preview.start", "host-good", "start-b", {
  session: sessionB, token: "token-b-opaque-identity-123456", documentHtml: htmlB,
  documentBytes: new TextEncoder().encode(htmlB).byteLength, brokerLaunch: brokerLaunch()
}));
await waitFor(() => response(received, "start-b") && frames[1]?.appPort);
stalePort.postMessage(consoleEvent(sessionA, "token-a-opaque-identity-123456", 4, ["stale"]));
frames[1].appPort.postMessage(consoleEvent(sessionB, "token-b-opaque-identity-123456", 0, ["session B"]));
await waitFor(() => received.filter((message) => message.type === "preview.console").length === 2);
assert.deepEqual(received.filter((message) => message.type === "preview.console").map((message) => message.payload.arguments[0]), ["accepted", "session B"]);

const brokerResponses = [];
frames[1].brokerPort.on("message", (message) => brokerResponses.push(message));
const batteryRequest = brokerEnvelope(sessionB, "battery-request-1", "request", { params: {} });
frames[1].brokerPort.postMessage(batteryRequest);
await waitFor(() => received.some((message) => message.type === "preview.broker"));
const forwarded = received.find((message) => message.type === "preview.broker");
assert.deepEqual(forwarded.payload.params, {});
controls.port1.postMessage({
  protocol: "webwindows-studio-preview-control-v1", version: 1, type: "preview.broker.response", hostNonce: "host-good",
  payload: brokerEnvelope(sessionA, "battery-request-1", "response", { ok: true, result: batteryState() })
});
await new Promise((resolve) => setTimeout(resolve, 20));
assert.equal(brokerResponses.length, 0, "a response from another session must not enter the active sandbox port");
controls.port1.postMessage({
  protocol: "webwindows-studio-preview-control-v1", version: 1, type: "preview.broker.response", hostNonce: "host-good",
  payload: brokerEnvelope(sessionB, "battery-request-1", "response", { ok: true, result: batteryState() })
});
await waitFor(() => brokerResponses.length === 1);
assert.equal(brokerResponses[0].result.level, 0.5);

controls.port1.postMessage(control("preview.stop", "host-good", "bad-stop", { sessionId: sessionB.sessionId, token: "wrong" }));
await waitFor(() => response(received, "bad-stop"));
assert.equal(response(received, "bad-stop").ok, false);
controls.port1.postMessage(control("preview.stop", "host-good", "stop-b", { sessionId: sessionB.sessionId, token: "token-b-opaque-identity-123456" }));
await waitFor(() => response(received, "stop-b"));
assert.equal(response(received, "stop-b").ok, true);
assert.equal(frames[1].removed, true);
assert.equal(frames[1].attributes.has("srcdoc"), false);

controls.port1.close();
wrong.port1.close();
wrong.port2.close();
for (const frame of frames) {
  frame.appPort?.close();
  frame.brokerPort?.close();
}
console.log("developer studio preview host protocol smoke test passed");

function element(tag) {
  return {
    tag, textContent: "", isConnected: false,
    classList: { toggle() {} }
  };
}

function createFrame() {
  const listeners = new Map();
  const frame = {
    attributes: new Map(), removed: false, isConnected: false,
    setAttribute(name, value) { this.attributes.set(name, String(value)); },
    removeAttribute(name) { this.attributes.delete(name); },
    addEventListener(type, listener) { listeners.set(type, listener); },
    remove() { this.removed = true; this.isConnected = false; },
    contentWindow: {
      postMessage(data, targetOrigin, ports) {
        assert.equal(targetOrigin, "*");
        if (data.protocol === "webwindows-studio-preview-console-init-v1") frame.appPort = ports[0];
        else if (data.protocol === "webwindows-studio-preview-sdk-init-v1") frame.brokerPort = ports[0];
        else assert.fail(`unexpected iframe init protocol: ${data.protocol}`);
      }
    }
  };
  Object.defineProperty(frame, "srcdoc", {
    set(value) {
      assert.equal(frame.isConnected, false, "srcdoc must be assigned before attachment so about:blank cannot consume the one-shot load binding");
      frame.attributes.set("srcdoc", value);
      queueMicrotask(() => listeners.get("load")?.());
    }
  });
  return frame;
}

function session(sessionId, snapshotId) {
  return {
    contract: "webwindows-studio-preview-session-v1", sessionId, projectUuid: "project-test", snapshotId,
    createdAt: "2026-01-01T00:00:00.000Z", expiresAt: "2026-01-01T00:30:00.000Z", state: "created"
  };
}

function control(type, hostNonce, requestId, payload) {
  return { protocol: "webwindows-studio-preview-control-v1", version: 1, type, hostNonce, requestId, payload };
}

function consoleEvent(item, token, sequence, args) {
  return {
    protocol: "webwindows-studio-preview-console-v1", version: 1, type: "console.event",
    sessionId: item.sessionId, snapshotId: item.snapshotId, token, sequence,
    timestamp: "2026-01-01T00:00:00.000Z", level: "log", arguments: args
  };
}

function brokerLaunch() {
  return {
    facadeEnabled: true, protocol: "webwindows-capability-broker-v1", version: 1,
    channelId: "channel-battery-identity-0001", refreshTimeoutMs: 3000,
    handshake: { ok: true, result: batteryState() },
    clientErrors: { "request-timeout": { code: "request-timeout", message: "Timed out", retryable: true } }
  };
}

function brokerEnvelope(item, requestId, type, extra) {
  return {
    protocol: "webwindows-capability-broker-v1", version: 1, type,
    sessionId: item.sessionId, snapshotId: item.snapshotId, channelId: "channel-battery-identity-0001",
    requestId, method: "device.battery.refresh", ...extra
  };
}

function batteryState() {
  return { supported: true, present: true, level: 0.5, charging: false, connected: false, source: "browser" };
}

function response(messages, requestId) {
  return messages.find((message) => message.type === "host.response" && message.requestId === requestId);
}

async function waitFor(predicate) {
  const deadline = Date.now() + 1000;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error("Timed out waiting for Preview Host protocol message");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}
