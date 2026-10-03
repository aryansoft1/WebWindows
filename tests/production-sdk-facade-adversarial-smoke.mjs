import assert from "node:assert/strict";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { MessageChannel } from "node:worker_threads";
import { createProductionSdkBootstrap } from "../webwindows-vue/src/production-broker/entry.js";

const identity = { sessionId:"production-wire-session", snapshotId:"production-wire-snapshot" };
const launch = { facadeEnabled:true, protocol:"webwindows-capability-broker-v1", version:1, channelId:"production-wire-channel",
  refreshTimeoutMs:3000, clientErrors:{ "request-timeout":error("request-timeout"), "broker-unavailable":error("broker-unavailable") },
  handshake:{ ok:true, result:state(0.4) } };
const listeners = new Map();
const sandbox = { crypto:webcrypto, Uint8Array, Map, Object, Array, Error, Promise, JSON, String, setTimeout, clearTimeout,
  addEventListener:(type, listener) => listeners.set(type, listener) };
sandbox.window = sandbox; sandbox.globalThis = sandbox;
const hostWebWindows = Object.freeze({ device:Object.freeze({ battery:Object.freeze({ hostSecret:true }) }) });
vm.runInNewContext(createProductionSdkBootstrap(identity, launch), sandbox, { filename:"production-sdk-bootstrap.js" });

assert.notEqual(sandbox.WebWindows, hostWebWindows);
assert.deepEqual(Object.keys(sandbox.WebWindows), ["device"]);
assert.deepEqual(Object.keys(sandbox.WebWindows.device), ["battery"]);
assert.deepEqual(Object.keys(sandbox.WebWindows.device.battery).sort(), ["getState", "refresh"]);
assert.equal(Object.isFrozen(sandbox.WebWindows), true);
assert.equal(Object.isFrozen(sandbox.WebWindows.device), true);
assert.equal(Object.isFrozen(sandbox.WebWindows.device.battery), true);
assert.throws(() => Object.setPrototypeOf(sandbox.WebWindows.device.battery, { escape:true }), TypeError);
assert.throws(() => Object.defineProperty(sandbox.WebWindows, "apps", { value:{ privileged:true } }), TypeError);
assert.equal(sandbox.WebWindows.apps, undefined);
assert.equal(sandbox.WebWindowsNative, undefined);
assert.equal(sandbox.ProductionBrokerContext, undefined);
assert.equal(sandbox.VerifiedRuntimePackageIdentity, undefined);
const first = sandbox.WebWindows.device.battery.getState(); first.level = 1;
assert.equal(sandbox.WebWindows.device.battery.getState().level, 0.4, "getState must return a clone");
assert.equal(sandbox.WebWindows.device.battery.getState.call({ attacker:true }).level, 0.4);
assert.equal(sandbox.WebWindows.device.battery.getState.bind(null)().level, 0.4);
assert.equal(sandbox.WebWindows.device.battery.getState.constructor("return typeof WebWindowsNative")(), "undefined");
assert.doesNotMatch(JSON.stringify(sandbox.WebWindows), /session|snapshot|channel|publisher|release|hostSecret/i);

const ignored = new MessageChannel();
listeners.get("message")({ data:{ ...identity, protocol:"console-port", version:1, channelId:launch.channelId }, ports:[ignored.port2] });
const channel = new MessageChannel();
channel.port1.on("message", (message) => channel.port1.postMessage({ ...message, type:"response", ok:true, result:state(0.8) }));
listeners.get("message")({ data:{ ...identity, protocol:"webwindows-production-sdk-init-v1", version:1, channelId:launch.channelId }, ports:[channel.port2] });
const replacement = new MessageChannel();
listeners.get("message")({ data:{ ...identity, protocol:"webwindows-production-sdk-init-v1", version:1, channelId:launch.channelId }, ports:[replacement.port2] });
assert.equal((await sandbox.WebWindows.device.battery.refresh()).level, 0.8);

channel.port1.close(); ignored.port1.close(); replacement.port1.close();
console.log("production sandbox facade mutation, escape, and port replacement smoke test passed");

function state(level) { return { supported:true, present:true, level, charging:false, connected:false, source:"browser" }; }
function error(code) { return { code, message:code, retryable:false }; }
