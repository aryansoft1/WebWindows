import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { MessageChannel } from "node:worker_threads";
import { createPreviewSdkBootstrap } from "../webwindows-vue/src/developer-studio/preview/preview-sdk-bootstrap.js";

const session = { sessionId: "session-facade-identity-0001", snapshotId: "snapshot-facade-identity-0001" };
const launch = {
  facadeEnabled: true,
  protocol: "webwindows-capability-broker-v1",
  version: 1,
  channelId: "channel-facade-identity-0001",
  refreshTimeoutMs: 3000,
  clientErrors: {
    "request-timeout": { code: "request-timeout", message: "Timed out.", retryable: true },
    "broker-unavailable": { code: "broker-unavailable", message: "Unavailable.", retryable: true }
  },
  handshake: { ok: true, result: state(0.4) }
};
assert.equal(createPreviewSdkBootstrap(session, { facadeEnabled: false }), "");

const listeners = new Map();
const context = {
  crypto: webcrypto, Uint8Array, Map, Object, Array, Error, Promise, JSON, String,
  setTimeout, clearTimeout,
  addEventListener: (type, listener) => listeners.set(type, listener)
};
context.window = context;
context.globalThis = context;
vm.runInNewContext(createPreviewSdkBootstrap(session, launch), context, { filename: "preview-sdk-bootstrap.js" });

assert.deepEqual(Object.keys(context.WebWindows), ["device"]);
assert.deepEqual(Object.keys(context.WebWindows.device), ["battery"]);
assert.deepEqual(Object.keys(context.WebWindows.device.battery).sort(), ["getState", "refresh"]);
assert.equal(context.WebWindows.apps, undefined);
assert.equal(context.WebWindows.fileDialog, undefined);
assert.equal(context.WebWindowsNative, undefined);
assert.equal(Object.isFrozen(context.WebWindows), true);
assert.equal(Object.isFrozen(context.WebWindows.device), true);
assert.equal(Object.isFrozen(context.WebWindows.device.battery), true);
assert.equal(context.WebWindows.device.battery.getState() instanceof Promise, false);
assert.equal(context.WebWindows.device.battery.getState().level, 0.4);

const channel = new MessageChannel();
const requests = [];
channel.port1.on("message", (message) => {
  requests.push(message);
  channel.port1.postMessage({
    ...message, type: "response", ok: true, result: state(0.8)
  });
});
listeners.get("message")({
  data: {
    protocol: "webwindows-studio-preview-sdk-init-v1", version: 1,
    sessionId: session.sessionId, snapshotId: session.snapshotId, channelId: launch.channelId
  },
  ports: [channel.port2]
});
const refreshPromise = context.WebWindows.device.battery.refresh();
assert.equal(refreshPromise instanceof Promise, true);
const refreshed = await refreshPromise;
assert.equal(refreshed.level, 0.8);
assert.equal(context.WebWindows.device.battery.getState().level, 0.8, "refresh updates the local synchronous snapshot cache");
assert.equal(requests.length, 1);
assert.equal(requests[0].method, "device.battery.refresh");
assert.deepEqual(requests[0].params, {});

const deniedListeners = new Map();
const deniedContext = {
  crypto: webcrypto, Uint8Array, Map, Object, Array, Error, Promise, JSON, String,
  setTimeout, clearTimeout, addEventListener: (type, listener) => deniedListeners.set(type, listener)
};
deniedContext.window = deniedContext;
deniedContext.globalThis = deniedContext;
vm.runInNewContext(createPreviewSdkBootstrap(session, {
  ...launch,
  handshake: { ok: false, error: { code: "permission-not-declared", message: "Not declared.", retryable: false } }
}), deniedContext);
assert.throws(
  () => deniedContext.WebWindows.device.battery.getState(),
  (error) => error.name === "WebWindowsCapabilityError" && error.code === "permission-not-declared"
);

const source = await fs.readFile(new URL("../webwindows-vue/src/developer-studio/preview/preview-sdk-bootstrap.js", import.meta.url), "utf8");
for (const forbidden of ["parent.", "parent[", "top.", "WebWindowsNative", "NativeAdapter", "BrowserAdapter", ".apps", "fileDialog"]) {
  assert.equal(source.includes(forbidden), false, `sandbox facade must not reference ${forbidden}`);
}
channel.port1.close();
console.log("developer studio battery sandbox facade smoke test passed");

function state(level) {
  return { supported: true, present: true, level, charging: false, connected: false, source: "browser" };
}
