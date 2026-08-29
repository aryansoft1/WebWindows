import { PREVIEW_CONSOLE_INIT_PROTOCOL, PREVIEW_CONSOLE_PROTOCOL } from "./preview-protocol.js";

export function createConsoleBootstrap({ sessionId, snapshotId, token }) {
  const configuration = JSON.stringify({
    initProtocol: PREVIEW_CONSOLE_INIT_PROTOCOL,
    protocol: PREVIEW_CONSOLE_PROTOCOL,
    sessionId,
    snapshotId,
    token
  }).replace(/</g, "\\u003c");
  return `;(${previewConsoleBootstrap.toString()})(${configuration});`;
}

function previewConsoleBootstrap(config) {
  "use strict";
  const MAX_DEPTH = 4;
  const MAX_ITEMS = 40;
  const MAX_STRING = 4096;
  const MAX_QUEUE = 200;
  let port = null;
  let sequence = 0;
  const queue = [];

  function clipped(value) {
    const text = String(value);
    return text.length <= MAX_STRING ? text : `${text.slice(0, MAX_STRING)}…[truncated]`;
  }

  function safeValue(value, depth, seen) {
    if (value == null || typeof value === "boolean") return value;
    if (typeof value === "string" || typeof value === "number") return clipped(value);
    if (typeof value === "bigint") return `${value}n`;
    if (typeof value === "undefined") return "[undefined]";
    if (typeof value === "function") return `[Function${value.name ? ` ${value.name}` : ""}]`;
    if (typeof value === "symbol") return clipped(value.toString());
    if (value === globalThis || value === globalThis.window) return "[Window]";
    if (depth >= MAX_DEPTH) return "[Max depth]";
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    try {
      if (typeof Error !== "undefined" && value instanceof Error) {
        return { name: clipped(value.name), message: clipped(value.message), stack: clipped(value.stack || "") };
      }
      if (typeof Node !== "undefined" && value instanceof Node) {
        return `[DOM ${value.nodeName || "Node"}]`;
      }
      if (Array.isArray(value)) {
        const output = value.slice(0, MAX_ITEMS).map((item) => safeValue(item, depth + 1, seen));
        if (value.length > MAX_ITEMS) output.push(`[${value.length - MAX_ITEMS} more items]`);
        return output;
      }
      const output = {};
      const keys = Object.keys(value).slice(0, MAX_ITEMS);
      for (const key of keys) {
        try { output[clipped(key)] = safeValue(value[key], depth + 1, seen); }
        catch (error) { output[clipped(key)] = `[Unreadable: ${clipped(error?.message || error)}]`; }
      }
      if (Object.keys(value).length > MAX_ITEMS) output["…"] = "[truncated properties]";
      return output;
    } catch (error) {
      return `[Unserializable: ${clipped(error?.message || error)}]`;
    } finally {
      seen.delete(value);
    }
  }

  function envelope(level, args) {
    return {
      protocol: config.protocol,
      version: 1,
      type: "console.event",
      sessionId: config.sessionId,
      snapshotId: config.snapshotId,
      token: config.token,
      sequence: sequence++,
      timestamp: new Date().toISOString(),
      level,
      arguments: Array.from(args).map((value) => safeValue(value, 0, new Set()))
    };
  }

  function send(level, args) {
    const message = envelope(level, args);
    if (port) {
      try { port.postMessage(message); } catch { /* revoked or closed */ }
    } else if (queue.length < MAX_QUEUE) queue.push(message);
  }

  for (const level of ["log", "info", "warn", "error", "debug"]) {
    const original = console[level]?.bind(console) || console.log.bind(console);
    console[level] = function (...args) {
      send(level, args);
      original(...args);
    };
  }
  addEventListener("error", (event) => send("error", [{
    name: "UncaughtError",
    message: event.message || "Uncaught error",
    file: event.filename || null,
    line: event.lineno || null,
    column: event.colno || null,
    error: event.error || null
  }]));
  addEventListener("unhandledrejection", (event) => send("error", [{
    name: "UnhandledRejection",
    reason: event.reason
  }]));
  addEventListener("message", function initialize(event) {
    const data = event.data;
    if (!data || data.protocol !== config.initProtocol || data.version !== 1
        || data.sessionId !== config.sessionId || data.snapshotId !== config.snapshotId
        || data.token !== config.token || event.ports.length !== 1 || port) return;
    port = event.ports[0];
    port.start?.();
    while (queue.length) port.postMessage(queue.shift());
  });
}
