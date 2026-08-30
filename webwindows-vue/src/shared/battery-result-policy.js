import { validateBatteryResult } from "../developer-studio/broker/generated-broker-validator.js";

export function sanitizeBatteryResult(raw, method) {
  if (byteLength(raw) > method.maximumResponseBytes) throw capabilityFailure("response-too-large");
  if (!plain(raw)) throw capabilityFailure("internal-error");
  const result = {
    supported:raw.supported,
    present:raw.present,
    level:raw.level,
    charging:raw.charging,
    connected:raw.connected,
    source:sanitizeSource(raw.supported, raw.source)
  };
  if (!validateBatteryResult(result)) throw capabilityFailure("internal-error");
  if (byteLength(result) > method.maximumResponseBytes) throw capabilityFailure("response-too-large");
  return Object.freeze(result);
}

export function byteLength(value) {
  try { return new TextEncoder().encode(JSON.stringify(value)).byteLength; }
  catch { return Number.POSITIVE_INFINITY; }
}

export function capabilityFailure(code) {
  const error = new Error(code); error.code = code; return error;
}

function sanitizeSource(supported, source) {
  if (!supported || source === "unsupported") return "unsupported";
  return source === "battery-status-api" || source === "browser" ? "browser" : "runtime";
}

function plain(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
