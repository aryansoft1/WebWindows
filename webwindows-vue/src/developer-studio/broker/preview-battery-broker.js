import {
  validateEnvelope,
  validateRefreshParams
} from "./generated-broker-validator.js";
import { createOpaqueIdentity, isPlainObject } from "../preview/preview-protocol.js";
import { selectManifestVersion } from "../manifest/manifest-version.js";
import { evaluatePermissionDecision, publicErrorForDecision } from "../permissions/permission-policy-engine.js";
import { byteLength, sanitizeBatteryResult } from "../../shared/battery-result-policy.js";

export class PreviewBatteryBroker {
  constructor(options) {
    this.session = options.session;
    this.manifest = options.manifest;
    this.contracts = options.contracts;
    this.publicApi = options.publicApi || null;
    this.platformPolicyPermits = options.platformPolicyPermits ?? true;
    this.grantResolver = options.grantResolver || defaultGrantResolver;
    this.now = options.now || (() => Date.now());
    this.setTimer = options.setTimer || ((callback, delay) => setTimeout(callback, delay));
    this.clearTimer = options.clearTimer || ((timer) => clearTimeout(timer));
    this.onDiagnostic = typeof options.onDiagnostic === "function" ? options.onDiagnostic : null;
    this.channelId = options.channelId || createOpaqueIdentity("broker");
    this.methods = new Map(this.contracts.brokerMethods.methods.map((method) => [method.id, method]));
    this.errors = new Map(this.contracts.brokerErrors.errors.map((error) => [error.code, error]));
    this.seen = new Set();
    this.pending = new Map();
    this.requestTimes = [];
    this.audit = [];
    this.diagnostics = [];
    this.closed = false;
  }

  async createLaunchDescriptor() {
    if (selectManifestVersion(this.manifest) !== 2 || this.manifest.sdk?.apiVersion !== "1") {
      return Object.freeze({ facadeEnabled: false });
    }
    const method = this.methods.get("device.battery.getState");
    const permissionDecision = this.#authorize(method);
    const failure = publicErrorForDecision(permissionDecision);
    let handshake;
    if (failure) {
      handshake = { ok: false, error: this.#publicError(failure) };
      this.#record("handshake", method, "deny", failure, 0, permissionDecision);
    } else {
      const startedAt = this.now();
      try {
        const raw = this.#batteryApi().getState();
        const result = this.#validateAndSanitize(raw, method);
        handshake = { ok: true, result };
        this.#record("handshake", method, "allow", "success", this.now() - startedAt, permissionDecision);
      } catch (error) {
        const code = publicFailureCode(error);
        handshake = { ok: false, error: this.#publicError(code) };
        this.#record("handshake", method, "allow", code, this.now() - startedAt, permissionDecision);
      }
    }
    const refresh = this.methods.get("device.battery.refresh");
    const clientErrorCodes = ["request-timeout", "broker-unavailable"];
    return Object.freeze({
      facadeEnabled: true,
      protocol: this.contracts.brokerPolicy.protocol,
      version: this.contracts.brokerPolicy.protocolVersion,
      channelId: this.channelId,
      refreshTimeoutMs: refresh.timeoutMs,
      clientErrors: Object.fromEntries(clientErrorCodes.map((code) => [code, this.#publicError(code)])),
      handshake: structuredClone(handshake)
    });
  }

  handleEnvelope(message) {
    if (!this.#matchesSession(message) || this.closed) return Promise.resolve(this.#errorResponse(message, "session-invalid"));
    if (this.now() >= Date.parse(this.session.expiresAt)) {
      return Promise.resolve(this.#errorResponse(message, "session-expired"));
    }
    if (message?.protocol !== this.contracts.brokerPolicy.protocol
        || message?.version !== this.contracts.brokerPolicy.protocolVersion) {
      return Promise.resolve(this.#errorResponse(message, "protocol-unsupported"));
    }
    if (message.type === "cancel") return Promise.resolve(this.#cancel(message));
    if (message.type !== "request" || typeof message.requestId !== "string") {
      return Promise.resolve(this.#errorResponse(message, "invalid-params"));
    }
    if (this.seen.has(message.requestId)) return Promise.resolve(this.#errorResponse(message, "duplicate-request-id"));
    this.seen.add(message.requestId);
    if (byteLength(message) > this.contracts.brokerPolicy.limits.maximumRequestBytes) {
      return Promise.resolve(this.#errorResponse(message, "request-too-large"));
    }
    const method = this.methods.get(message.method);
    if (!method || method.invocation !== "request-response" || method.previewAvailability !== "enabled") {
      return Promise.resolve(this.#errorResponse(message, "method-not-allowed", method));
    }
    const permissionDecision = this.#authorize(method);
    const authorizationFailure = publicErrorForDecision(permissionDecision);
    if (authorizationFailure) return Promise.resolve(this.#errorResponse(message, authorizationFailure, method, true, permissionDecision));
    if (!validateEnvelope(message) || !validateRefreshParams(message.params)) {
      return Promise.resolve(this.#errorResponse(message, "invalid-params", method, true, permissionDecision));
    }
    if (method.userGesture === "host-required") {
      return Promise.resolve(this.#errorResponse(message, "gesture-required", method, true, permissionDecision));
    }
    this.#pruneRateWindow();
    const limits = this.contracts.brokerPolicy.limits;
    if (this.pending.size >= limits.maximumConcurrentRequests
        || this.requestTimes.length >= limits.maximumRequestsPerMinute) {
      return Promise.resolve(this.#errorResponse(message, "rate-limited", method, true, permissionDecision));
    }
    this.requestTimes.push(this.now());
    return this.#dispatch(message, method, permissionDecision);
  }

  close(code = "request-cancelled") {
    if (this.closed) return;
    this.closed = true;
    for (const pending of [...this.pending.values()]) this.#finishPending(pending, this.#errorResponse(pending.message, code, pending.method, false));
  }

  getAudit() {
    return this.audit.map((entry) => Object.freeze({ ...entry }));
  }

  getDiagnostics() {
    return this.diagnostics.map((entry) => Object.freeze({ ...entry }));
  }

  clearDiagnostics() {
    this.diagnostics = [];
  }

  #authorize(method) {
    return evaluatePermissionDecision({
      manifest: this.manifest,
      method,
      decisionContract: this.contracts.permissionDecision,
      platformPolicyAllowed: () => typeof this.platformPolicyPermits === "function"
        ? this.platformPolicyPermits(method, this.manifest, this.session) === true
        : this.platformPolicyPermits === true,
      hostGrant: () => this.grantResolver(method, this.manifest, this.session),
      capabilitySupported: () => this.#capabilitySupported(method.requiredRuntimeCapability)
    });
  }

  #capabilitySupported(capability) {
    if (capability !== "battery.status") return false;
    try {
      const battery = this.#batteryApi();
      return typeof battery.getState === "function" && typeof battery.refresh === "function"
        && battery.getCapabilities?.().status?.supported === true;
    } catch {
      return false;
    }
  }

  #batteryApi() {
    const battery = this.publicApi?.device?.battery;
    if (!battery) throw brokerFailure("capability-unsupported");
    return battery;
  }

  #dispatch(message, method, permissionDecision) {
    const startedAt = this.now();
    const configuredTimeout = method.timeoutMs || this.contracts.brokerPolicy.limits.defaultRequestTimeoutMs;
    const remainingSession = Math.max(0, Date.parse(this.session.expiresAt) - this.now());
    const timeoutMs = Math.min(configuredTimeout, this.contracts.brokerPolicy.limits.maximumRequestTimeoutMs, remainingSession);
    return new Promise((resolve) => {
      const pending = { message, method, permissionDecision, startedAt, resolve, timer: null, settled: false };
      pending.timer = this.setTimer(() => {
        this.#finishPending(pending, this.#errorResponse(message, "request-timeout", method, false));
      }, timeoutMs);
      this.pending.set(message.requestId, pending);
      this.#record(message.requestId, method, "allow", "pending", 0, permissionDecision);
      Promise.resolve().then(() => this.#batteryApi().refresh()).then(
        (raw) => {
          if (pending.settled) {
            this.#record(message.requestId, method, "allow", "late-result-ignored", this.now() - startedAt);
            return;
          }
          try {
            const result = this.#validateAndSanitize(raw, method);
            this.#finishPending(pending, this.#successResponse(message, result));
          } catch (error) {
            this.#finishPending(pending, this.#errorResponse(message, publicFailureCode(error), method, false));
          }
        },
        () => {
          if (pending.settled) {
            this.#record(message.requestId, method, "allow", "late-result-ignored", this.now() - startedAt);
            return;
          }
          this.#finishPending(pending, this.#errorResponse(message, "internal-error", method, false));
        }
      );
    });
  }

  #cancel(message) {
    if (!validateEnvelope(message)) return null;
    const pending = this.pending.get(message.requestId);
    if (!pending || pending.message.method !== message.method) return null;
    this.#finishPending(pending, this.#errorResponse(pending.message, "request-cancelled", pending.method, false));
    return null;
  }

  #finishPending(pending, response) {
    if (pending.settled) return;
    pending.settled = true;
    this.clearTimer(pending.timer);
    this.pending.delete(pending.message.requestId);
    const category = response.ok ? "success" : response.error.code;
    this.#record(pending.message.requestId, pending.method, response.ok ? "allow" : decisionFor(category), category, this.now() - pending.startedAt, pending.permissionDecision);
    pending.resolve(response);
  }

  #validateAndSanitize(raw, method) {
    return sanitizeBatteryResult(raw, method);
  }

  #matchesSession(message) {
    return isPlainObject(message)
      && message.sessionId === this.session.sessionId
      && message.snapshotId === this.session.snapshotId
      && message.channelId === this.channelId;
  }

  #successResponse(message, result) {
    return {
      protocol: this.contracts.brokerPolicy.protocol,
      version: this.contracts.brokerPolicy.protocolVersion,
      type: "response",
      sessionId: this.session.sessionId,
      snapshotId: this.session.snapshotId,
      channelId: this.channelId,
      requestId: message.requestId,
      method: message.method,
      ok: true,
      result: structuredClone(result)
    };
  }

  #errorResponse(message, code, method = null, record = true, permissionDecision = null) {
    if (record) this.#record(message?.requestId || null, method, "deny", code, 0, permissionDecision);
    return {
      protocol: this.contracts.brokerPolicy.protocol,
      version: this.contracts.brokerPolicy.protocolVersion,
      type: "response",
      sessionId: this.session.sessionId,
      snapshotId: this.session.snapshotId,
      channelId: this.channelId,
      requestId: typeof message?.requestId === "string" && message.requestId ? message.requestId : "invalid-request",
      method: typeof message?.method === "string" && message.method ? message.method : "device.battery.refresh",
      ok: false,
      error: this.#publicError(code)
    };
  }

  #publicError(code) {
    const definition = this.errors.get(code) || this.errors.get("internal-error");
    return { code: definition.code, message: definition.message, retryable: definition.retryable };
  }

  #record(requestId, method, decision, resultCategory, latencyMs, permissionDecision = null) {
    const auditEntry = Object.freeze({
      timestamp: new Date(this.now()).toISOString(),
      mode: "preview",
      appIdentity: typeof this.manifest.id === "string" ? this.manifest.id : null,
      projectIdentity: this.session.projectUuid,
      sessionId: this.session.sessionId,
      snapshotId: this.session.snapshotId,
      requestId,
      method: method?.id || null,
      permission: method?.requiredPermission || null,
      decision,
      resultCategory,
      latencyMs
    });
    this.audit.push(auditEntry);
    const denialReason = permissionDecision?.denialReason || diagnosticReason(resultCategory);
    const diagnostic = Object.freeze({
      timestamp: auditEntry.timestamp,
      sessionId: auditEntry.sessionId,
      snapshotId: auditEntry.snapshotId,
      projectIdentity: auditEntry.projectIdentity,
      appIdentity: auditEntry.appIdentity,
      requestId,
      method: auditEntry.method,
      permission: auditEntry.permission,
      declared: permissionDecision?.declared ?? null,
      policyDecision: permissionDecision?.policy || "not-evaluated",
      consentMode: permissionDecision?.consentMode || method?.consent || null,
      grantState: permissionDecision?.grantState || null,
      capabilityState: permissionDecision?.capability || "not-evaluated",
      methodPolicy: permissionDecision?.methodPolicy || (method ? "enabled" : "not-evaluated"),
      finalDecision: decision,
      resultCategory,
      publicError: this.errors.has(resultCategory) ? resultCategory : null,
      denialReason,
      latencyMs,
      policyVersion: this.contracts.permissionDecision.policyVersion
    });
    this.diagnostics.push(diagnostic);
    try { this.onDiagnostic?.(Object.freeze({ ...diagnostic })); } catch { /* diagnostics must not affect dispatch */ }
  }

  #pruneRateWindow() {
    const threshold = this.now() - 60_000;
    this.requestTimes = this.requestTimes.filter((time) => time > threshold);
  }
}

function defaultGrantResolver(method) {
  return method.consent === "no-consent";
}

function diagnosticReason(category) {
  const reasons = {
    "permission-not-declared": "not-declared",
    "policy-denied": "policy-denied",
    "permission-denied": "grant-denied",
    "capability-unsupported": "capability-unsupported",
    "method-not-allowed": "method-disabled",
    "gesture-required": "gesture-required",
    "rate-limited": "rate-limited"
  };
  return reasons[category] || null;
}

function brokerFailure(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function publicFailureCode(error) {
  return ["response-too-large", "capability-unsupported"].includes(error?.code) ? error.code : "internal-error";
}

function decisionFor(category) {
  return [
    "session-invalid", "session-expired", "protocol-unsupported", "duplicate-request-id", "method-not-allowed",
    "permission-not-declared", "policy-denied", "permission-denied", "capability-unsupported", "invalid-params",
    "request-too-large", "gesture-required", "rate-limited"
  ].includes(category)
    ? "deny" : "allow";
}
