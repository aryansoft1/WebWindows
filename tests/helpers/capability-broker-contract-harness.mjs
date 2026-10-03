import Ajv2020 from "ajv/dist/2020.js";

export class CapabilityBrokerContractHarness {
  constructor({ schema, methods, errors, policy, session, now = 0 }) {
    this.schema = schema;
    this.methods = new Map(methods.methods.map((method) => [method.id, method]));
    this.errors = new Map(errors.errors.map((error) => [error.code, error]));
    this.policy = policy;
    this.session = { ...session };
    this.now = now;
    this.seen = new Set();
    this.pending = new Map();
    this.terminal = new Map();
    this.audit = [];
    this.ajv = new Ajv2020({ strict: false, allErrors: true });
    this.validateMessage = this.ajv.compile(schema);
    this.paramValidators = new Map();
    this.resultValidators = new Map();
    for (const method of methods.methods) {
      this.paramValidators.set(method.id, this.ajv.compile(method.parameterSchema));
      this.resultValidators.set(method.id, this.ajv.compile({ $defs: methods.$defs, ...method.resultSchema }));
    }
  }

  request(message, context = {}) {
    if (!this.validateMessage(message) || message.type !== "request") return this.reject(message, "invalid-params");
    if (!this.matchesSession(message)) return this.reject(message, "session-invalid");
    if (this.now >= this.session.expiresAt) return this.reject(message, "session-expired");
    if (this.seen.has(message.requestId)) return this.reject(message, "duplicate-request-id");
    this.seen.add(message.requestId);
    if (bytes(message) > this.policy.limits.maximumRequestBytes) return this.reject(message, "request-too-large");
    const method = this.methods.get(message.method);
    if (!method || method.invocation !== "request-response") return this.reject(message, "method-not-allowed");
    if (!context.declaredPermissions?.includes(method.requiredPermission)) {
      return this.reject(message, "permission-not-declared", method);
    }
    if (context.platformPolicyPermits !== true) return this.reject(message, "policy-denied", method);
    if (!context.grantedPermissions?.includes(method.requiredPermission)) {
      return this.reject(message, "permission-denied", method);
    }
    if (context.capabilities?.[method.requiredRuntimeCapability] !== true) {
      return this.reject(message, "capability-unsupported", method);
    }
    if (!this.paramValidators.get(method.id)(message.params)) return this.reject(message, "invalid-params", method);
    if (method.userGesture === "host-required" && context.hostGesture !== true) {
      return this.reject(message, "gesture-required", method);
    }
    if (this.pending.size >= this.policy.limits.maximumConcurrentRequests) {
      return this.reject(message, "rate-limited", method);
    }
    const timeoutMs = Math.min(
      method.timeoutMs || this.policy.limits.defaultRequestTimeoutMs,
      this.policy.limits.maximumRequestTimeoutMs,
      Math.max(0, this.session.expiresAt - this.now)
    );
    this.pending.set(message.requestId, { message, method, startedAt: this.now, deadline: this.now + timeoutMs });
    this.record(message, method, "allow", "pending");
    return { accepted: true, timeoutMs };
  }

  cancel(message) {
    if (!this.validateMessage(message) || message.type !== "cancel" || !this.matchesSession(message)) return { ignored: true };
    const pending = this.pending.get(message.requestId);
    if (!pending || pending.message.method !== message.method) return { ignored: true };
    this.pending.delete(message.requestId);
    return this.finish(pending, "request-cancelled");
  }

  complete(requestId, result) {
    const pending = this.pending.get(requestId);
    if (!pending) return { ignored: true, reason: "late-or-stale" };
    this.pending.delete(requestId);
    if (bytes(result) > pending.method.maximumResponseBytes) return this.finish(pending, "response-too-large");
    if (!this.resultValidators.get(pending.method.id)(result)) return this.finish(pending, "internal-error");
    const response = { ok: true, result: structuredClone(result) };
    this.terminal.set(requestId, response);
    this.record(pending.message, pending.method, "allow", "success", this.now - pending.startedAt);
    return response;
  }

  advance(milliseconds) {
    this.now += milliseconds;
    for (const [requestId, pending] of [...this.pending]) {
      if (this.now < pending.deadline) continue;
      this.pending.delete(requestId);
      this.finish(pending, "request-timeout");
    }
  }

  reload(nextSession) {
    for (const pending of this.pending.values()) this.finish(pending, "request-cancelled");
    this.pending.clear();
    this.session = { ...nextSession };
    this.seen.clear();
  }

  reject(message, code, method = null) {
    const error = this.publicError(code);
    this.record(message, method, "deny", code);
    return { accepted: false, error };
  }

  finish(pending, code) {
    const response = { ok: false, error: this.publicError(code) };
    this.terminal.set(pending.message.requestId, response);
    this.record(pending.message, pending.method, "allow", code, this.now - pending.startedAt);
    return response;
  }

  publicError(code) {
    const definition = this.errors.get(code);
    if (!definition) throw new Error(`Unknown public error: ${code}`);
    return { code: definition.code, message: definition.message, retryable: definition.retryable };
  }

  matchesSession(message) {
    return message.sessionId === this.session.sessionId
      && message.snapshotId === this.session.snapshotId
      && message.channelId === this.session.channelId;
  }

  record(message, method, decision, resultCategory, latencyMs = 0) {
    this.audit.push({
      timestamp: this.now,
      mode: "preview",
      appIdentity: "fixture-app",
      projectIdentity: "fixture-project",
      sessionId: message?.sessionId || null,
      snapshotId: message?.snapshotId || null,
      requestId: message?.requestId || null,
      method: message?.method || null,
      permission: method?.requiredPermission || null,
      decision,
      resultCategory,
      latencyMs
    });
  }
}

function bytes(value) {
  try { return new TextEncoder().encode(JSON.stringify(value)).byteLength; }
  catch { return Number.POSITIVE_INFINITY; }
}
