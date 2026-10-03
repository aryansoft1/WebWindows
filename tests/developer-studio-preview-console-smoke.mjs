import assert from "node:assert/strict";
import vm from "node:vm";
import { MessageChannel } from "node:worker_threads";
import { createConsoleBootstrap } from "../webwindows-vue/src/developer-studio/preview/preview-console-bootstrap.js";
import { isConsoleEnvelope } from "../webwindows-vue/src/developer-studio/preview/preview-protocol.js";

const identity = { sessionId: "session-test", snapshotId: "snapshot-test", token: "token-test-opaque-identity-123456" };
const listeners = new Map();
class FakeNode { constructor() { this.nodeName = "BUTTON"; } }
const context = {
  console: Object.fromEntries(["log", "info", "warn", "error", "debug"].map((level) => [level, () => {}])),
  addEventListener: (type, listener) => listeners.set(type, listener),
  Date,
  Set,
  Array,
  Object,
  String,
  Number,
  JSON,
  Error,
  Node: FakeNode
};
context.globalThis = context;
context.window = context;
vm.runInNewContext(createConsoleBootstrap(identity), context, { filename: "preview-console-bootstrap.js" });

const wrongChannel = new MessageChannel();
listeners.get("message")({ data: { protocol: "wrong", ...identity, version: 1 }, ports: [wrongChannel.port1] });
context.console.log("must remain buffered");
const channel = new MessageChannel();
const messages = [];
channel.port1.on("message", (message) => messages.push(message));
listeners.get("message")({
  data: { protocol: "webwindows-studio-preview-console-init-v1", version: 1, ...identity },
  ports: [channel.port2]
});
await waitFor(() => messages.length >= 1);

const cycle = { name: "cycle" };
cycle.self = cycle;
context.console.warn(cycle, new FakeNode(), function named() {}, "x".repeat(6000));
listeners.get("error")({ message: "boom", filename: "app.js", lineno: 4, colno: 2, error: new Error("boom") });
listeners.get("unhandledrejection")({ reason: new Error("rejected") });
await waitFor(() => messages.length >= 4);

assert.equal(messages.every((message) => isConsoleEnvelope(message, identity)), true);
assert.deepEqual(messages.map((message) => message.level), ["log", "warn", "error", "error"]);
const warning = messages[1];
assert.equal(warning.arguments[0].self, "[Circular]");
assert.equal(warning.arguments[1], "[DOM BUTTON]");
assert.match(warning.arguments[2], /^\[Function named\]$/);
assert.match(warning.arguments[3], /\[truncated\]$/);
assert.doesNotThrow(() => structuredClone(warning));
assert.equal(isConsoleEnvelope(warning, { ...identity, token: "wrong" }), false);
assert.equal(isConsoleEnvelope({ ...warning, arguments: ["x".repeat(40000)] }, identity), false);

channel.port1.close();
wrongChannel.port1.close();
wrongChannel.port2.close();
console.log("developer studio preview console smoke test passed");

async function waitFor(predicate) {
  const deadline = Date.now() + 1000;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error("Timed out waiting for console event");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}
