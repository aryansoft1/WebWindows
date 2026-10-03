import { validateEnvelope, validateRefreshParams } from "../developer-studio/broker/generated-broker-validator.js";
import { byteLength, sanitizeBatteryResult } from "../shared/battery-result-policy.js";

export const PRODUCTION_SDK_INIT_PROTOCOL = "webwindows-production-sdk-init-v1";

export class ProductionBatteryBroker {
  constructor(options) {
    this.context = options.context;
    this.contracts = options.contracts;
    this.publicApi = options.publicApi;
    this.releaseStatusProvider = options.releaseStatusProvider;
    this.now = options.now || (() => Date.now());
    this.setTimer = options.setTimer || ((callback, delay) => setTimeout(callback, delay));
    this.clearTimer = options.clearTimer || ((timer) => clearTimeout(timer));
    this.setAuthorityTimer = options.setAuthorityTimer || ((callback, delay) => setTimeout(callback, delay));
    this.clearAuthorityTimer = options.clearAuthorityTimer || ((timer) => clearTimeout(timer));
    this.onDiagnostic = typeof options.onDiagnostic === "function" ? options.onDiagnostic : null;
    this.binding = Object.freeze({
      sessionId:opaque("broker-session"), snapshotId:opaque("broker-binding"),
      channelId:opaque("broker-channel"), hostNonce:opaque("broker-nonce"),
      runtimeSessionId:this.context.runtimeSessionId, contextId:this.context.contextId,
      publishedReleaseId:this.context.publishedReleaseId
    });
    this.methods = new Map(this.contracts.brokerMethods.methods.map((method) => [method.id, method]));
    this.errors = new Map(this.contracts.brokerErrors.errors.map((error) => [error.code, error]));
    this.pending = new Map(); this.seen = new Set(); this.requestTimes = []; this.authorityChecks = 0; this.diagnostics = []; this.closed = false;
  }

  async createLaunchDescriptor() {
    if (!eligibleContext(this.context) || this.context.manifestVersion !== 2 || this.context.sdkVersion !== "1") return Object.freeze({ facadeEnabled:false });
    const method = this.methods.get("device.battery.getState");
    const decision = this.#authorize(method);
    let handshake;
    if (decision.error) {
      handshake = { ok:false, error:this.#publicError(decision.error) };
      this.#record("handshake", method, decision, decision.error, 0, decision.error);
    } else {
      const startedAt = this.now();
      try {
        handshake = { ok:true, result:sanitizeBatteryResult(this.#battery().getState(), method) };
        this.#record("handshake", method, decision, "success", this.now() - startedAt);
      } catch (error) {
        const code = publicFailure(error);
        handshake = { ok:false, error:this.#publicError(code) };
        this.#record("handshake", method, decision, code, this.now() - startedAt);
      }
    }
    const refresh = this.methods.get("device.battery.refresh");
    return Object.freeze({
      facadeEnabled:true, protocol:this.contracts.brokerPolicy.protocol, version:this.contracts.brokerPolicy.protocolVersion,
      channelId:this.binding.channelId, refreshTimeoutMs:refresh.timeoutMs,
      clientErrors:Object.fromEntries(["request-timeout", "broker-unavailable"].map((code) => [code, this.#publicError(code)])),
      handshake:structuredClone(handshake)
    });
  }

  initMessage() {
    return Object.freeze({ protocol:PRODUCTION_SDK_INIT_PROTOCOL, version:1, sessionId:this.binding.sessionId,
      snapshotId:this.binding.snapshotId, channelId:this.binding.channelId });
  }

  async handleEnvelope(message) {
    if (!this.#matches(message) || this.closed) return this.#errorResponse(message, "session-invalid");
    if (message?.protocol !== this.contracts.brokerPolicy.protocol || message?.version !== this.contracts.brokerPolicy.protocolVersion)
      return this.#errorResponse(message, "protocol-unsupported");
    if (message.type === "cancel") return this.#cancel(message);
    if (message.type !== "request" || typeof message.requestId !== "string") return this.#errorResponse(message, "invalid-params");
    if (this.seen.has(message.requestId)) return this.#errorResponse(message, "duplicate-request-id");
    this.seen.add(message.requestId);
    if (byteLength(message) > this.contracts.brokerPolicy.limits.maximumRequestBytes) return this.#errorResponse(message, "request-too-large");
    const method = this.methods.get(message.method);
    if (!method || method.id !== "device.battery.refresh" || method.invocation !== "request-response" || method.productionAvailability !== "enabled")
      return this.#errorResponse(message, "method-not-allowed", method);
    const decision = this.#authorize(method);
    if (decision.error) return this.#errorResponse(message, decision.error, method, decision);
    if (!validateEnvelope(message) || !validateRefreshParams(message.params)) return this.#errorResponse(message, "invalid-params", method, decision);
    this.#pruneRateWindow();
    const limits = this.contracts.brokerPolicy.limits;
    if (this.pending.size + this.authorityChecks >= limits.maximumConcurrentRequests || this.requestTimes.length >= limits.maximumRequestsPerMinute)
      return this.#errorResponse(message, "rate-limited", method, decision);
    this.requestTimes.push(this.now());
    this.authorityChecks += 1;
    let active = false;
    try { active = await this.#releaseStillActive(); }
    finally { this.authorityChecks -= 1; }
    if (!active) return this.#errorResponse(message, "policy-denied", method, decision, "release-not-active");
    return this.#dispatch(message, method, decision);
  }

  close(code = "request-cancelled") {
    if (this.closed) return;
    this.closed = true;
    for (const pending of [...this.pending.values()]) this.#finish(pending, this.#errorResponse(pending.message, code, pending.method, pending.decision));
  }

  getDiagnostics() { return this.diagnostics.map((entry) => Object.freeze({ ...entry })); }

  #authorize(method) {
    const permission = method?.requiredPermission || null;
    const declared = Boolean(permission && this.context.requestedPermissions.includes(permission));
    const reviewApproved = Boolean(permission && this.context.approvedPermissions.includes(permission));
    const effective = Boolean(permission && this.context.effectivePermissions.includes(permission));
    const capability = method ? this.context.runtimeCapabilities[method.requiredRuntimeCapability]?.supported === true : false;
    const methodEnabled = method?.productionAvailability === "enabled" && method?.currentStatus === "enabled";
    let error = null;
    if (!declared) error = "permission-not-declared";
    else if (!reviewApproved) error = "policy-denied";
    else if (!capability) error = "capability-unsupported";
    else if (!methodEnabled) error = "method-not-allowed";
    else if (!effective) error = "policy-denied";
    return Object.freeze({ permission, declared, reviewApproved, effective, capability, methodEnabled, error });
  }

  async #releaseStillActive() {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    let timer = null;
    try {
      const timeoutMs = this.contracts.brokerPolicy.limits.maximumRequestTimeoutMs;
      const timeout = new Promise((resolve) => { timer = this.setAuthorityTimer(() => { controller?.abort(); resolve(null); }, timeoutMs); });
      const lookup = Promise.resolve().then(() => this.releaseStatusProvider({ signal:controller?.signal })).catch(() => null);
      const fact = await Promise.race([lookup, timeout]);
      const fields = ["publishedReleaseId", "appId", "publisherId", "version", "packageSha256", "sourceManifestSha256",
        "sourceManifestIntegrityVersion", "reviewDecisionId", "reviewPolicyVersion"];
      return fact?.releaseStatus === "active" && fields.every((field) => fact[field] === this.context[field])
        && sameArray(fact.approvedPermissions, this.context.approvedPermissions);
    } catch { return false; }
    finally { if (timer !== null) this.clearAuthorityTimer(timer); }
  }

  #dispatch(message, method, decision) {
    const startedAt = this.now();
    const timeoutMs = Math.min(method.timeoutMs, this.contracts.brokerPolicy.limits.maximumRequestTimeoutMs);
    return new Promise((resolve) => {
      const pending = { message, method, decision, startedAt, resolve, timer:null, settled:false };
      pending.timer = this.setTimer(() => this.#finish(pending, this.#errorResponse(message, "request-timeout", method, decision)), timeoutMs);
      this.pending.set(message.requestId, pending);
      Promise.resolve().then(() => this.#battery().refresh()).then(async (raw) => {
        if (pending.settled) { this.#record(message.requestId, method, decision, "late-result-ignored", this.now() - startedAt); return; }
        const stillActive = await this.#releaseStillActive();
        if (pending.settled) { this.#record(message.requestId, method, decision, "late-result-ignored", this.now() - startedAt); return; }
        if (!stillActive) { this.#finish(pending, this.#errorResponse(message, "policy-denied", method, decision, "release-revoked-before-response")); return; }
        try { this.#finish(pending, this.#successResponse(message, sanitizeBatteryResult(raw, method))); }
        catch (error) { this.#finish(pending, this.#errorResponse(message, publicFailure(error), method, decision)); }
      }, () => {
        if (pending.settled) { this.#record(message.requestId, method, decision, "late-result-ignored", this.now() - startedAt); return; }
        this.#finish(pending, this.#errorResponse(message, "internal-error", method, decision));
      });
    });
  }

  #cancel(message) {
    if (!validateEnvelope(message)) return null;
    const pending = this.pending.get(message.requestId);
    if (!pending || pending.message.method !== message.method) return null;
    this.#finish(pending, this.#errorResponse(pending.message, "request-cancelled", pending.method, pending.decision));
    return null;
  }
  #finish(pending, response) {
    if (pending.settled) return;
    pending.settled = true; this.clearTimer(pending.timer); this.pending.delete(pending.message.requestId);
    this.#record(pending.message.requestId, pending.method, pending.decision, response.ok ? "success" : response.error.code, this.now() - pending.startedAt);
    pending.resolve(response);
  }
  #matches(message) {
    return plain(message) && message.sessionId === this.binding.sessionId && message.snapshotId === this.binding.snapshotId && message.channelId === this.binding.channelId;
  }
  #successResponse(message, result) { return { protocol:this.contracts.brokerPolicy.protocol, version:this.contracts.brokerPolicy.protocolVersion,
    type:"response", sessionId:this.binding.sessionId, snapshotId:this.binding.snapshotId, channelId:this.binding.channelId,
    requestId:message.requestId, method:message.method, ok:true, result:structuredClone(result) }; }
  #errorResponse(message, code, method = null, decision = null, denialReason = null) {
    this.#record(message?.requestId || null, method, decision, denialReason || code, 0, code);
    return { protocol:this.contracts.brokerPolicy.protocol, version:this.contracts.brokerPolicy.protocolVersion, type:"response",
      sessionId:this.binding.sessionId, snapshotId:this.binding.snapshotId, channelId:this.binding.channelId,
      requestId:typeof message?.requestId === "string" && message.requestId ? message.requestId : "invalid-request",
      method:typeof message?.method === "string" && message.method ? message.method : "device.battery.refresh",
      ok:false, error:this.#publicError(code) };
  }
  #publicError(code) { const item = this.errors.get(code) || this.errors.get("internal-error"); return { code:item.code, message:item.message, retryable:item.retryable }; }
  #battery() { const battery = this.publicApi?.device?.battery; if (!battery) throw failure("capability-unsupported"); return battery; }
  #record(requestId, method, decision, result, latencyMs, publicError = null) {
    const diagnostic = Object.freeze({ timestamp:new Date(this.now()).toISOString(), publishedReleaseId:this.context.publishedReleaseId,
      runtimeSessionId:this.context.runtimeSessionId, requestId, method:method?.id || null, permission:method?.requiredPermission || null,
      declared:decision?.declared ?? null, reviewApproved:decision?.reviewApproved ?? null, effective:decision?.effective ?? null,
      capability:decision?.capability ?? null, releaseState:this.context.releaseState, decision:publicError ? "deny" : "allow",
      resultCategory:result, publicError, latencyMs });
    this.diagnostics.push(diagnostic);
    try { this.onDiagnostic?.(diagnostic); } catch { /* diagnostics never affect dispatch */ }
  }
  #pruneRateWindow() { const threshold = this.now() - 60_000; this.requestTimes = this.requestTimes.filter((time) => time > threshold); }
}

function eligibleContext(context) {
  return context?.contextState === "eligible"
    && context.trustState === "verified-release"
    && context.releaseState === "active"
    && context.sourceManifestIntegrityVersion === 1;
}
function opaque(prefix) { const bytes = new Uint8Array(24); crypto.getRandomValues(bytes); return `${prefix}-${Array.from(bytes, (v) => v.toString(16).padStart(2, "0")).join("")}`; }
function sameArray(left, right) { return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value, index) => value === right[index]); }
function plain(value) { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function failure(code) { const error = new Error(code); error.code = code; return error; }
function publicFailure(error) { return ["response-too-large", "capability-unsupported"].includes(error?.code) ? error.code : "internal-error"; }
