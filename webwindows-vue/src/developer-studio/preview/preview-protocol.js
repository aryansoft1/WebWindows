export const PREVIEW_CONTROL_PROTOCOL = "webwindows-studio-preview-control-v1";
export const PREVIEW_CONSOLE_PROTOCOL = "webwindows-studio-preview-console-v1";
export const PREVIEW_CONSOLE_INIT_PROTOCOL = "webwindows-studio-preview-console-init-v1";
export const PREVIEW_SDK_INIT_PROTOCOL = "webwindows-studio-preview-sdk-init-v1";
export const PREVIEW_SESSION_CONTRACT = "webwindows-studio-preview-session-v1";
export const PREVIEW_SANDBOX = "allow-scripts allow-forms allow-modals allow-downloads";
export const PREVIEW_REFERRER_POLICY = "no-referrer";
export const PREVIEW_CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
export const PREVIEW_SESSION_STATES = Object.freeze(["created", "running", "reloading", "closed", "failed"]);
export const PREVIEW_CONSOLE_LEVELS = Object.freeze(["log", "info", "warn", "error", "debug"]);
export const MAX_PREVIEW_DOCUMENT_BYTES = 30 * 1024 * 1024;
export const MAX_CONSOLE_EVENT_BYTES = 32 * 1024;
export const MAX_BROKER_EVENT_BYTES = 64 * 1024;

export function createOpaqueIdentity(prefix = "preview") {
  const cryptoObject = globalThis.crypto;
  if (!cryptoObject?.getRandomValues) throw new Error("Web Crypto is required for Preview sessions.");
  const bytes = new Uint8Array(24);
  cryptoObject.getRandomValues(bytes);
  const value = [...bytes].map((item) => item.toString(16).padStart(2, "0")).join("");
  return `${prefix}-${value}`;
}

export function isConsoleEnvelope(value, expected) {
  if (!isPlainObject(value)
      || value.protocol !== PREVIEW_CONSOLE_PROTOCOL
      || value.version !== 1
      || value.type !== "console.event"
      || value.sessionId !== expected.sessionId
      || value.snapshotId !== expected.snapshotId
      || value.token !== expected.token
      || !PREVIEW_CONSOLE_LEVELS.includes(value.level)
      || !Number.isSafeInteger(value.sequence)
      || value.sequence < 0
      || typeof value.timestamp !== "string"
      || !Array.isArray(value.arguments)) return false;
  try {
    return new TextEncoder().encode(JSON.stringify(value)).byteLength <= MAX_CONSOLE_EVENT_BYTES;
  } catch {
    return false;
  }
}

export function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
