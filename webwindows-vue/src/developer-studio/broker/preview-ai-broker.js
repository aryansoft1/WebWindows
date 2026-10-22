/* PreviewAiBroker — Developer Studio ONLY. Audit-mode pilot for the registered candidate
 * ai.desktalk.requestAssist (previewAvailability "proposed-enabled" / production
 * "proposed-disabled" / currentStatus "draft", registered verbatim 2026-10-22 round 17).
 *
 * Standing discipline of this pilot (must stay true as long as this class exists):
 *  - audit mode is EXPLICIT (auditMode !== true disables the facade entirely);
 *  - the method-policy check (previewAvailability === "enabled" inside the permission decision
 *    engine) is bypassed ONLY for methods whose registered previewAvailability is
 *    "proposed-enabled"; every bypass is recorded in diagnostics (auditAllowance: true);
 *  - the confirmation card is the host-owned gesture evidence (consent mode
 *    "host-confirmation-card"; sandbox clicks are not authorization). Deep payload schema
 *    validation runs BEFORE the card (fail-closed variant of the policy order: never grant
 *    toward a schema-invalid payload; ratify at the enablement review);
 *  - "仅在本次会话允许" records a scene-scoped session grant (session-memory only);
 *    "发送到桌讯" is a one-shot grant for that single request; persistent grants stay unreviewed;
 *  - payload text is never echoed: the card shows a machine summary (field names + numbers +
 *    counts), audit rows record scene + payload byte counts + proposal counts only;
 *  - the ticket resolves immediately; proposals flow back through PreviewHostClient event
 *    frames on the preview-assist pilot transport (the broker v1 wire event enum cannot carry
 *    ai.assist.received yet — the gap is recorded for the next schema revision);
 *  - timeout budget: min(registry timeoutMs 120000, remaining session). The global policy
 *    maximumRequestTimeoutMs (10 s) intentionally does NOT clamp here: a 10 s window would
 *    make the confirmation card unusable, so the pilot runs at the registered method value.
 *    This deviation is recorded per audit row (timeoutBudgetSource) and is a finding the
 *    per-method enablement review must ratify (production may keep clamping);
 *  - the production battery broker, the production broker build and all data/sdk registries
 *    stay untouched by this pilot.
 */
import { createOpaqueIdentity, isPlainObject, PREVIEW_ASSIST_EVENT_PROTOCOL } from "../preview/preview-protocol.js";
import { selectManifestVersion } from "../manifest/manifest-version.js";
import { evaluatePermissionDecision } from "../permissions/permission-policy-engine.js";
import { byteLength, capabilityFailure } from "../../shared/battery-result-policy.js";
import { validateEnvelope } from "./generated-broker-validator.js";
import {
  AI_ASSIST_METHOD_ID,
  AI_ASSIST_EVENT_ID,
  AI_ASSIST_PERMISSION_ID,
  AI_ASSIST_SCENE,
  AI_ASSIST_TIMEOUT_MS,
  validateAiParameters,
  parseVideoEditScenePayload,
  validateAiTicketResult,
  validateAssistEventDetail
} from "./assist-schema-validators.js";
import { AI_ASSIST_PILOT_ERRORS } from "./ai-assist-errors.js";
import { buildAssistConfirmationSummary } from "./ai-confirmation-summary.js";

/* design doc §3: 每 session 至多 1 个 in-flight、速率上限 6 次/分钟（pilot 常量；未登记为 broker limit） */
const PILOT_MAX_REQUESTS_PER_MINUTE = 6;
/* request-level denials audit as "deny"; wire-accepted outcomes (timeout, delay, cancel,
 * provider failure after acceptance) keep "allow" like the battery broker's ledger. */
const REQUEST_LEVEL_DENIAL_CATEGORIES = [
  "session-invalid", "session-expired", "protocol-unsupported", "duplicate-request-id",
  "method-not-allowed", "permission-not-declared", "policy-denied", "permission-denied",
  "invalid-params", "request-too-large", "assist-rejected-by-user", "assist-confirmation-required",
  "assist-session-limit", "ai-rate-limited", "payload-schema-invalid", "scene-not-registered",
  "desktalk-unavailable"
];

export class PreviewAiBroker {
  constructor(options) {
    this.session = options.session;
    this.manifest = options.manifest;
    this.contracts = options.contracts;
    this.auditMode = options.auditMode === true;
    this.assistanceSource = options.assistanceSource || null;
    this.onConfirmation = typeof options.onConfirmation === "function" ? options.onConfirmation : null;
    this.onEvent = typeof options.onEvent === "function" ? options.onEvent : null;
    this.platformPolicyPermits = options.platformPolicyPermits ?? true;
    this.onDiagnostic = typeof options.onDiagnostic === "function" ? options.onDiagnostic : null;
    /* ai traffic shares the preview broker channel (one MessageChannel per sandbox) */
    this.channelId = options.channelId || null;
    this.now = options.now || (() => Date.now());
    this.setTimer = options.setTimer || ((callback, delay) => setTimeout(callback, delay));
    this.clearTimer = options.clearTimer || ((timer) => clearTimeout(timer));
    this.stableErrors = new Map(this.contracts.brokerErrors.errors.map((error) => [error.code, error]));
    this.method = this.contracts.brokerMethods.methods.find((method) => method.id === AI_ASSIST_METHOD_ID) || null;
    this.sessionGrants = new Map(); // scene -> { state: "session-grant", grantedAt }
    this.seen = new Set();
    this.pending = new Map();
    this.routesInFlight = 0; // proposal routes after the ticket, until event delivery
    this.confirmations = new Map(); // requestId -> { resolve }
    this.requestTimes = [];
    this.audit = [];
    this.diagnostics = [];
    this.closed = false;
  }

  async createLaunchDescriptor() {
    const declared = Array.isArray(this.manifest?.permissions)
      && this.manifest.permissions.includes(AI_ASSIST_PERMISSION_ID);
    const pilotEligible = Boolean(
      this.auditMode
      && this.method
      && selectManifestVersion(this.manifest) === 2
      && this.manifest.sdk?.apiVersion === "1"
      && this.method.previewAvailability === "proposed-enabled"
      && this.assistanceSource?.isAvailable() === true
      && typeof this.channelId === "string"
    );
    if (!declared || !pilotEligible) {
      return Object.freeze({ facadeEnabled: false });
    }
    return Object.freeze({
      facadeEnabled: true,
      mode: "preview-audit",
      methodId: AI_ASSIST_METHOD_ID,
      protocol: this.contracts.brokerPolicy.protocol,
      version: this.contracts.brokerPolicy.protocolVersion,
      assistTimeoutMs: AI_ASSIST_TIMEOUT_MS,
      handshake: Object.freeze({ ok: true, simulationNote: "preview-audit 仿真提案源，未接入桌讯真实对话" }),
      clientErrors: Object.freeze(Object.fromEntries(
        ["request-timeout", "broker-unavailable"].map((code) => [code, this.#publicError(code)])
      ))
    });
  }

  async handleEnvelope(message) {
    if (!this.#matchesSession(message) || this.closed) {
      return this.#errorResponse(message, "session-invalid");
    }
    if (this.now() >= Date.parse(this.session.expiresAt)) {
      return this.#errorResponse(message, "session-expired");
    }
    if (message?.protocol !== this.contracts.brokerPolicy.protocol
      || message?.version !== this.contracts.brokerPolicy.protocolVersion) {
      return this.#errorResponse(message, "protocol-unsupported");
    }
    if (message.type === "cancel") return this.#guardCancel(message);
    if (message.type !== "request" || typeof message.requestId !== "string") {
      return this.#errorResponse(message, "invalid-params");
    }
    if (this.seen.has(message.requestId)) return this.#errorResponse(message, "duplicate-request-id");
    this.seen.add(message.requestId);
    if (byteLength(message) > this.contracts.brokerPolicy.limits.maximumRequestBytes) {
      return this.#errorResponse(message, "request-too-large");
    }
    if (!this.#pilotMethodEligible()) {
      return this.#errorResponse(message, "method-not-allowed", { decision: "deny", category: "method-not-allowed" });
    }

    const scene = typeof message.params?.scene === "string" ? message.params.scene : null;
    const permissionDecision = this.#authorize(scene);
    const sourceAvailable = this.assistanceSource?.isAvailable?.() === true;

    if (!permissionDecision.declared) {
      return this.#errorResponse(message, "permission-not-declared", { decision: "deny", category: "permission-not-declared", permissionDecision });
    }
    if (permissionDecision.policy === "denied") {
      return this.#errorResponse(message, "policy-denied", { decision: "deny", category: "policy-denied", permissionDecision });
    }
    if (!sourceAvailable) {
      return this.#errorResponse(message, "desktalk-unavailable", { decision: "deny", category: "desktalk-unavailable", permissionDecision });
    }

    /* registry boundaries BEFORE any grant (fail-closed: never grant toward garbage) */
    const parameterFailure = validateAiParameters(message.params);
    if (parameterFailure) {
      return this.#errorResponse(message, parameterFailure, {
        decision: "deny", category: parameterFailure, permissionDecision,
        extras: {
          scene: typeof message.params?.scene === "string" ? message.params.scene : null,
          payloadChars: typeof message.params?.payload === "string" ? message.params.payload.length : null,
          payloadBytes: typeof message.params?.payload === "string" ? textByteLength(message.params.payload) : null
        }
      });
    }
    const parsedPayload = parseVideoEditScenePayload(message.params.payload);
    const payloadFacts = {
      scene: AI_ASSIST_SCENE,
      payloadChars: message.params.payload.length,
      payloadBytes: textByteLength(message.params.payload)
    };
    if (!parsedPayload.ok) {
      return this.#errorResponse(message, "payload-schema-invalid", {
        decision: "deny", category: "payload-schema-invalid", permissionDecision, extras: payloadFacts
      });
    }

    /* pilot quota: 1 in-flight per session (wire-pending OR proposal route), 6/min */
    if (this.pending.size >= 1 || this.routesInFlight >= 1) {
      return this.#errorResponse(message, "assist-session-limit", { decision: "deny", category: "assist-session-limit", permissionDecision, extras: payloadFacts });
    }
    this.#pruneRateWindow();
    if (this.requestTimes.length >= PILOT_MAX_REQUESTS_PER_MINUTE) {
      return this.#errorResponse(message, "ai-rate-limited", { decision: "deny", category: "ai-rate-limited", permissionDecision, extras: payloadFacts });
    }
    this.requestTimes.push(this.now());

    if (this.#pilotEffective(permissionDecision)) {
      return this.#dispatch(message, parsedPayload, permissionDecision, false, payloadFacts);
    }
    if (permissionDecision.denialReason === "grant-denied"
      && permissionDecision.consentMode === "host-confirmation-card") {
      return this.#dispatch(message, parsedPayload, permissionDecision, true, payloadFacts);
    }
    return this.#errorResponse(message, permissionDecision.publicErrorCode || "permission-denied", {
      decision: "deny", category: permissionDecision.publicErrorCode || "permission-denied", permissionDecision, extras: payloadFacts
    });
  }

  /* audit-mode allowance: the ONLY permitted divergence from the permission engine is the
   * method-policy step (registered "proposed-enabled" methods read as "disabled" there).
   * Everything else — declaration, platform policy, grant, capability — must be genuinely
   * effective. This is the one place the pilot stands on the registry, and every dispatched
   * request records auditAllowance: true. */
  #pilotEffective(decision) {
    if (decision?.effective) return true;
    return Boolean(decision
      && decision.declared === true
      && decision.policy === "allowed"
      && decision.capability === "supported"
      && (decision.grantState === "session-grant" || decision.grantState === "not-required")
      && decision.denialReason === "method-disabled");
  }

  close(code = "request-cancelled") {
    if (this.closed) return;
    this.closed = true;
    for (const pending of [...this.pending.values()]) {
      this.#finishPending(pending, this.#errorPendingResponse(pending.message, code));
    }
    for (const confirmation of [...this.confirmations.values()]) {
      try { confirmation.resolve({ kind: "cancel" }); } catch { /* settlement must not throw */ }
    }
    this.confirmations.clear();
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

  /* ------------------------------------------------------------------ dispatch */

  #dispatch(message, parsedPayload, permissionDecision, needsConfirmation, payloadFacts) {
    const startedAt = this.now();
    const remainingSession = Math.max(0, Date.parse(this.session.expiresAt) - this.now());
    const timeoutMs = Math.min(AI_ASSIST_TIMEOUT_MS, remainingSession);
    return new Promise((resolve) => {
      const pending = {
        message, permissionDecision, startedAt, resolve,
        timer: null, settled: false, needsConfirmation,
        recordExtras: { ...payloadFacts, timeoutBudgetSource: "method-registry-pilot" }
      };
      pending.timer = this.setTimer(() => {
        this.#resolveConfirmation(message.requestId, { kind: "cancel" });
        this.#finishPending(pending, this.#errorPendingResponse(message, "request-timeout"));
      }, timeoutMs);
      this.pending.set(message.requestId, pending);
      this.#record(pending, "allow", "pending-confirmation", 0, permissionDecision, pending.recordExtras);
      const flow = needsConfirmation
        ? this.#runConfirmationFlow(message, parsedPayload, pending)
        : this.#issueTicket(message, parsedPayload, pending, permissionDecision, false);
      flow.catch((error) => {
        this.#finishPending(pending, this.#errorPendingResponse(message, publicFailureCode(error)));
      });
    });
  }

  async #runConfirmationFlow(message, parsedPayload, pending) {
    let effectiveDecision = pending.permissionDecision;
    let oneShot = false;
    const outcome = await this.#requestConfirmation(message, parsedPayload).catch(() => ({ kind: "cancel" }));
    if (pending.settled || this.closed) return;
    if (!outcome || outcome.kind === "cancel") {
      this.#finishPending(pending, this.#errorPendingResponse(message, "assist-confirmation-required"));
      return;
    }
    if (outcome.kind === "reject") {
      pending.recordExtras.outcome = "user-rejected";
      this.#finishPending(pending, this.#errorPendingResponse(message, "assist-rejected-by-user"));
      return;
    }
    if (outcome.kind === "session") {
      this.sessionGrants.set(AI_ASSIST_SCENE, Object.freeze({ state: "session-grant", grantedAt: this.now() }));
      effectiveDecision = this.#authorize(AI_ASSIST_SCENE);
      if (!this.#pilotEffective(effectiveDecision)) {
        pending.recordExtras.outcome = "grant-re-evaluated-denied";
        this.#finishPending(pending, this.#errorPendingResponse(message, effectiveDecision.publicErrorCode || "permission-denied"));
        return;
      }
      pending.permissionDecision = effectiveDecision;
    } else if (outcome.kind === "send") {
      oneShot = true;
      effectiveDecision = this.#authorize(AI_ASSIST_SCENE, true);
      if (!this.#pilotEffective(effectiveDecision)) {
        pending.recordExtras.outcome = "grant-re-evaluated-denied";
        this.#finishPending(pending, this.#errorPendingResponse(message, effectiveDecision.publicErrorCode || "permission-denied"));
        return;
      }
      pending.permissionDecision = effectiveDecision;
    } else {
      this.#finishPending(pending, this.#errorPendingResponse(message, "assist-confirmation-required"));
      return;
    }
    if (!await this.#issueTicket(message, parsedPayload, pending, effectiveDecision, oneShot)) return;
  }

  /* Host-owned confirmation card. Returns nothing through this channel; the resolution is
   * registered here so close()/timeout/cancel can settle the card deterministically. */
  #requestConfirmation(message, parsedPayload) {
    if (!this.onConfirmation) throw capabilityFailure("assist-confirmation-required");
    const summary = buildAssistConfirmationSummary(parsedPayload.summary, message.params.payload);
    const appName = (typeof this.manifest?.name === "string" && this.manifest.name)
      ? this.manifest.name
      : (typeof this.manifest?.id === "string" ? this.manifest.id : "未知应用");
    const requestId = message.requestId;
    return new Promise((resolve) => {
      this.confirmations.set(requestId, { resolve });
      this.#runCard(this.onConfirmation, Object.freeze({
        requestId,
        appId: typeof this.manifest?.id === "string" ? this.manifest.id : null,
        appName,
        scene: AI_ASSIST_SCENE,
        methodName: AI_ASSIST_METHOD_ID,
        summary
      }), resolve);
    });
  }

  async #runCard(onConfirmation, request, resolve) {
    try {
      resolve(await onConfirmation(request));
    } catch {
      resolve({ kind: "cancel" });
    }
  }

  #resolveConfirmation(requestId, outcome) {
    const confirmation = this.confirmations.get(requestId);
    if (!confirmation) return false;
    this.confirmations.delete(requestId);
    try { confirmation.resolve(outcome); } catch { /* ignore */ }
    return true;
  }

  async #issueTicket(message, parsedPayload, pending, permissionDecision, oneShot) {
    const expiresAtMs = Math.max(0, Math.min(this.now() + AI_ASSIST_TIMEOUT_MS, Date.parse(this.session.expiresAt)));
    const ticket = Object.freeze({
      ticketId: createOpaqueIdentity("assist-ticket"),
      channel: "desktalk",
      expiresAtMs,
      status: "accepted"
    });
    if (!validateAiTicketResult(ticket)) {
      this.#finishPending(pending, this.#errorPendingResponse(message, "internal-error"));
      return false;
    }
    pending.recordExtras.ticketId = ticket.ticketId;
    pending.recordExtras.outcome = oneShot ? "accepted-one-shot" : "accepted";
    this.#finishPending(pending, this.#successResponse(message, ticket));
    this.#routeProposals(message, parsedPayload, ticket, permissionDecision).catch(() => {});
    return true;
  }

  async #routeProposals(message, parsedPayload, ticket, permissionDecision) {
    this.routesInFlight += 1;
    try {
      return await this.#runRoute(message, parsedPayload, ticket, permissionDecision);
    } finally {
      this.routesInFlight -= 1;
    }
  }

  async #runRoute(message, parsedPayload, ticket, permissionDecision) {
    const routeStartedAt = this.now();
    const routeExtras = { timeoutBudgetSource: "method-registry-pilot" };
    let outcome = null;
    try {
      const source = this.assistanceSource;
      if (!source?.isAvailable?.()) throw capabilityFailure("desktalk-unavailable");
      outcome = await source.requestAssist({ attribution: "desktalk-assist", scene: AI_ASSIST_SCENE, summary: parsedPayload.summary });
    } catch (error) {
      this.#recordEventOutcome(message.requestId, routeStartedAt, permissionDecision, {
        ...routeExtras,
        ticketId: ticket.ticketId,
        resultCategory: error?.code === "desktalk-unavailable" ? "desktalk-unavailable" : "ai-provider-unavailable",
        decision: "allow"
      });
      return;
    }
    if (this.closed) {
      /* the session ended while the source was generating: no event may reach a dead sandbox */
      this.#recordEventOutcome(message.requestId, routeStartedAt, permissionDecision, {
        ...routeExtras,
        ticketId: ticket.ticketId,
        proposalCount: Array.isArray(outcome?.proposals) ? outcome.proposals.length : 0,
        resultCategory: "request-cancelled",
        decision: "allow"
      });
      return;
    }
    const proposals = Array.isArray(outcome?.proposals) ? outcome.proposals : [];
    const detail = Object.freeze({
      ticketId: ticket.ticketId,
      attribution: "desktalk-assist",
      proposals: proposals.map((proposal) => structuredClone(proposal))
    });
    if (!validateAssistEventDetail(detail) || !this.onEvent) {
      this.#recordEventOutcome(message.requestId, routeStartedAt, permissionDecision, {
        ...routeExtras,
        ticketId: ticket.ticketId,
        proposalCount: proposals.length,
        resultCategory: this.onEvent ? "internal-error" : "ai-provider-unavailable",
        decision: "allow"
      });
      return;
    }
    const frame = Object.freeze({
      protocol: PREVIEW_ASSIST_EVENT_PROTOCOL,
      version: 1,
      type: "event",
      event: AI_ASSIST_EVENT_ID,
      sessionId: this.session.sessionId,
      snapshotId: this.session.snapshotId,
      channelId: this.channelId,
      requestId: createOpaqueIdentity("assist-event"),
      method: AI_ASSIST_EVENT_ID,
      detail
    });
    try {
      this.onEvent(frame);
      this.#recordEventOutcome(message.requestId, routeStartedAt, permissionDecision, {
        ...routeExtras,
        ticketId: ticket.ticketId,
        proposalCount: proposals.length,
        resultCategory: "event-delivered",
        decision: "allow"
      });
    } catch {
      this.#recordEventOutcome(message.requestId, routeStartedAt, permissionDecision, {
        ...routeExtras,
        ticketId: ticket.ticketId,
        proposalCount: proposals.length,
        resultCategory: "internal-error",
        decision: "allow"
      });
    }
  }

  #guardCancel(message) {
    if (!validateEnvelope(message)) return null;
    const pending = this.pending.get(message.requestId);
    if (!pending || pending.message.method !== message.method) return null;
    this.#resolveConfirmation(pending.message.requestId, { kind: "cancel" });
    this.#finishPending(pending, this.#errorPendingResponse(pending.message, "request-cancelled"));
    return null;
  }

  #finishPending(pending, response) {
    if (pending.settled) return;
    pending.settled = true;
    this.clearTimer(pending.timer);
    if (this.pending.get(pending.message.requestId) === pending) {
      this.pending.delete(pending.message.requestId);
    }
    if (response.ok) this.#resolveConfirmation(pending.message.requestId, { kind: "settled" });
    this.#record(
      pending,
      response.ok ? "allow" : decisionForCategory(response.error.code),
      response.ok ? "success" : response.error.code,
      this.now() - pending.startedAt,
      pending.permissionDecision,
      pending.recordExtras
    );
    pending.resolve(response);
  }

  /* ------------------------------------------------------------------ responses */

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

  /* pending-path failure: response object only; the ledger entry is written by #finishPending */
  #errorPendingResponse(message, code) {
    return {
      protocol: this.contracts.brokerPolicy.protocol,
      version: this.contracts.brokerPolicy.protocolVersion,
      type: "response",
      sessionId: this.session.sessionId,
      snapshotId: this.session.snapshotId,
      channelId: this.channelId,
      requestId: typeof message?.requestId === "string" && message.requestId ? message.requestId : "invalid-request",
      method: typeof message?.method === "string" && message.method ? message.method : AI_ASSIST_METHOD_ID,
      ok: false,
      error: this.#publicError(code)
    };
  }

  #errorResponse(message, code, facts = {}) {
    const permissionDecision = facts.permissionDecision ?? null;
    this.#record(
      { message: { requestId: typeof message?.requestId === "string" ? message.requestId : null } },
      facts.decision ?? "deny", facts.category ?? code, 0, permissionDecision, facts.extras ?? {}
    );
    return {
      protocol: this.contracts.brokerPolicy.protocol,
      version: this.contracts.brokerPolicy.protocolVersion,
      type: "response",
      sessionId: this.session.sessionId,
      snapshotId: this.session.snapshotId,
      channelId: this.channelId,
      requestId: typeof message?.requestId === "string" && message.requestId ? message.requestId : "invalid-request",
      method: typeof message?.method === "string" && message.method ? message.method : AI_ASSIST_METHOD_ID,
      ok: false,
      error: this.#publicError(code)
    };
  }

  #publicError(code) {
    const definition = AI_ASSIST_PILOT_ERRORS.get(code)
      || this.stableErrors.get(code)
      || this.stableErrors.get("internal-error");
    return { code: definition.code, message: definition.message, retryable: definition.retryable };
  }

  /* ------------------------------------------------------------------ authorization */

  #authorize(scene, oneShot = false) {
    return evaluatePermissionDecision({
      manifest: this.manifest,
      method: this.method,
      decisionContract: this.contracts.permissionDecision,
      platformPolicyAllowed: () => typeof this.platformPolicyPermits === "function"
        ? this.platformPolicyPermits(this.method, this.manifest, this.session) === true
        : this.platformPolicyPermits === true,
      hostGrant: () => {
        if (oneShot) return { allowed: true, state: "session-grant" };
        const granted = this.sessionGrants.get(scene);
        return granted ? { allowed: true, state: granted.state } : { allowed: false, state: "denied" };
      },
      capabilitySupported: () => this.assistanceSource?.isAvailable?.() === true
    });
  }

  #pilotMethodEligible() {
    return Boolean(this.method
      && this.method.invocation === "request-response"
      && this.auditMode
      && this.method.previewAvailability === "proposed-enabled");
  }

  /* ------------------------------------------------------------------ ledger */

  #matchesSession(message) {
    return isPlainObject(message)
      && message.sessionId === this.session.sessionId
      && message.snapshotId === this.session.snapshotId
      && message.channelId === this.channelId;
  }

  #recordEventOutcome(requestId, routeStartedAt, permissionDecision, extras) {
    this.#record({ message: { requestId } }, extras.decision, extras.resultCategory,
      this.now() - routeStartedAt, permissionDecision, extras);
  }

  #record(pending, decision, category, latencyMs, permissionDecision, extras = {}) {
    const requestId = pending?.message?.requestId ?? null;
    const entry = Object.freeze({
      timestamp: new Date(this.now()).toISOString(),
      mode: "preview-audit",
      appIdentity: typeof this.manifest?.id === "string" ? this.manifest.id : null,
      projectIdentity: this.session.projectUuid,
      sessionId: this.session.sessionId,
      snapshotId: this.session.snapshotId,
      requestId,
      method: this.method?.id || AI_ASSIST_METHOD_ID,
      permission: this.method?.requiredPermission || AI_ASSIST_PERMISSION_ID,
      decision,
      resultCategory: category,
      latencyMs,
      scene: extras.scene ?? null,
      payloadBytes: extras.payloadBytes ?? null,
      payloadChars: extras.payloadChars ?? null,
      ticketId: extras.ticketId ?? null,
      proposalCount: extras.proposalCount ?? null,
      attribution: extras.ticketId ? "desktalk-assist" : null,
      outcome: extras.outcome ?? null,
      timeoutBudgetSource: extras.timeoutBudgetSource ?? null
    });
    this.audit.push(entry);
    const diagnostic = Object.freeze({
      timestamp: entry.timestamp,
      sessionId: entry.sessionId,
      snapshotId: entry.snapshotId,
      projectIdentity: entry.projectIdentity,
      appIdentity: entry.appIdentity,
      requestId,
      method: entry.method,
      permission: entry.permission,
      declared: permissionDecision?.declared ?? null,
      policyDecision: permissionDecision?.policy || "not-evaluated",
      consentMode: permissionDecision?.consentMode || this.method?.consent || null,
      grantState: permissionDecision?.grantState ?? extras.grantState ?? null,
      capabilityState: permissionDecision?.capability || "not-evaluated",
      methodPolicy: permissionDecision?.methodPolicy || "not-evaluated",
      finalDecision: decision,
      resultCategory: category,
      publicError: this.stableErrors.has(category) || AI_ASSIST_PILOT_ERRORS.has(category) ? category : null,
      denialReason: permissionDecision?.denialReason ?? null,
      latencyMs,
      scene: entry.scene,
      payloadBytes: entry.payloadBytes,
      proposalCount: entry.proposalCount,
      auditAllowance: this.#pilotMethodEligible(),
      methodPreviewAvailability: this.method?.previewAvailability || null,
      mode: "preview-audit",
      policyVersion: this.contracts.permissionDecision.policyVersion
    });
    this.diagnostics.push(diagnostic);
    try { this.onDiagnostic?.({ ...diagnostic }); } catch { /* diagnostics must not affect dispatch */ }
  }

  #pruneRateWindow() {
    const threshold = this.now() - 60_000;
    this.requestTimes = this.requestTimes.filter((time) => time > threshold);
  }
}

function decisionForCategory(category) {
  return REQUEST_LEVEL_DENIAL_CATEGORIES.includes(category) ? "deny" : "allow";
}

function publicFailureCode(error) {
  return error?.code ? error.code : "internal-error";
}

function textByteLength(text) {
  try { return new TextEncoder().encode(text).byteLength; }
  catch { return null; }
}
