import { validateProjectSnapshot } from "../validation/project-validator.js";
import { createPreviewDocument } from "./preview-snapshot-runtime.js";
import { getSnapshotFile } from "../snapshot/project-snapshot.js";
import { PreviewBatteryBroker } from "../broker/preview-battery-broker.js";
import { PreviewAiBroker } from "../broker/preview-ai-broker.js";
import { PreviewDeskTalkSimulator } from "./preview-desktalk-simulator.js";
import {
  PREVIEW_SESSION_CONTRACT,
  createOpaqueIdentity
} from "./preview-protocol.js";

export const DEFAULT_PREVIEW_TTL_MS = 30 * 60 * 1000;

export class PreviewSessionController {
  constructor({
    hostClient,
    ttlMs = DEFAULT_PREVIEW_TTL_MS,
    now = () => Date.now(),
    publicApiProvider = defaultPublicApiProvider,
    platformPolicyPermits = true,
    grantResolver,
    onBrokerDiagnostic,
    onAiConfirmation,
    aiAuditPilot = true,
    assistanceSource = null
  }) {
    if (!hostClient) throw new TypeError("PreviewHostClient is required.");
    this.hostClient = hostClient;
    this.ttlMs = ttlMs;
    this.now = now;
    this.publicApiProvider = publicApiProvider;
    this.platformPolicyPermits = platformPolicyPermits;
    this.grantResolver = grantResolver;
    this.onBrokerDiagnostic = typeof onBrokerDiagnostic === "function" ? onBrokerDiagnostic : null;
    this.onAiConfirmation = typeof onAiConfirmation === "function" ? onAiConfirmation : null;
    this.aiAuditPilot = aiAuditPilot;
    this.assistanceSource = assistanceSource || new PreviewDeskTalkSimulator({ now });
    this.sessions = new Map();
    this.activeSessionId = null;
    this.hostClient.onBroker = (message) => this.#handleBroker(message);
  }

  get activeSession() {
    return this.activeSessionId ? this.sessions.get(this.activeSessionId) || null : null;
  }

  async run(snapshot, { contracts, domParser } = {}) {
    const validationReport = await validateProjectSnapshot(snapshot, { contracts });
    if (!validationReport.passed) return { started: false, validationReport, session: null };
    if (this.activeSession) await this.stop(this.activeSession.sessionId);
    const session = this.#createSession(snapshot);
    this.sessions.set(session.sessionId, session);
    this.activeSessionId = session.sessionId;
    try {
      const manifest = JSON.parse(getSnapshotFile(snapshot, "manifest.json").content);
      session.broker = new PreviewBatteryBroker({
        session,
        manifest,
        contracts,
        publicApi: this.publicApiProvider(),
        platformPolicyPermits: this.platformPolicyPermits,
        grantResolver: this.grantResolver,
        onDiagnostic: this.onBrokerDiagnostic,
        now: this.now
      });
      session.brokerLaunch = await session.broker.createLaunchDescriptor();
      session.aiBroker = this.#createAiBroker(session, manifest, contracts);
      if (session.aiBroker) {
        const aiLaunch = await session.aiBroker.createLaunchDescriptor();
        if (aiLaunch.facadeEnabled) {
          session.aiLaunch = aiLaunch;
          session.brokerLaunch = Object.freeze({ ...session.brokerLaunch, ai: aiLaunch });
        } else {
          session.aiBroker = null;
          session.aiLaunch = null;
        }
      }
      const documentHtml = createPreviewDocument(snapshot, session, { domParser, sdkLaunch: session.brokerLaunch });
      await this.hostClient.start(session, documentHtml, session.brokerLaunch);
      session.state = "running";
      session.expiryTimer = setTimeout(() => this.#expire(session.sessionId).catch(() => {}), this.ttlMs);
      return { started: true, validationReport, session: publicSession(session) };
    } catch (error) {
      session.state = "failed";
      session.failure = error?.message || String(error);
      this.#revoke(session);
      throw error;
    }
  }

  #createAiBroker(session, manifest, contracts) {
    if (!this.aiAuditPilot) return null;
    return new PreviewAiBroker({
      session,
      manifest,
      contracts,
      auditMode: true,
      channelId: session.broker?.channelId || null,
      assistanceSource: this.assistanceSource,
      onConfirmation: this.onAiConfirmation,
      onEvent: (frame) => {
        try { this.hostClient.notifyBrokerEvent(frame); } catch { /* delivery must not throw */ }
      },
      onDiagnostic: this.onBrokerDiagnostic,
      now: this.now
    });
  }

  async reload(snapshot, options = {}) {
    const previous = this.activeSession;
    if (previous) previous.state = "reloading";
    const validationReport = await validateProjectSnapshot(snapshot, { contracts: options.contracts });
    if (!validationReport.passed) {
      if (previous) previous.state = "running";
      return { started: false, validationReport, session: previous ? publicSession(previous) : null };
    }
    if (previous) await this.stop(previous.sessionId);
    return this.run(snapshot, options);
  }

  async stop(sessionId = this.activeSessionId) {
    const session = sessionId ? this.sessions.get(sessionId) : null;
    if (!session) return null;
    session.broker?.close("request-cancelled");
    session.aiBroker?.close("request-cancelled");
    try { await this.hostClient.stop(session); } finally {
      session.state = "closed";
      this.#revoke(session);
    }
    return publicSession(session);
  }

  async dispose() {
    const ids = [...this.sessions.keys()];
    for (const id of ids) await this.stop(id).catch(() => {});
    this.hostClient.disconnect?.();
    this.hostClient.onBroker = null;
  }

  getBrokerAudit(sessionId = this.activeSessionId) {
    const session = sessionId ? this.sessions.get(sessionId) : null;
    if (!session) return [];
    return [
      ...(session.broker?.getAudit() || []),
      ...(session.aiBroker?.getAudit() || [])
    ];
  }

  getBrokerDiagnostics(sessionId = this.activeSessionId) {
    const session = sessionId ? this.sessions.get(sessionId) : null;
    if (!session) return [];
    return [
      ...(session.broker?.getDiagnostics() || []),
      ...(session.aiBroker?.getDiagnostics() || [])
    ];
  }

  clearBrokerDiagnostics(sessionId = this.activeSessionId) {
    if (!sessionId) return;
    const session = this.sessions.get(sessionId);
    session?.broker?.clearDiagnostics();
    session?.aiBroker?.clearDiagnostics();
  }

  #createSession(snapshot) {
    const created = this.now();
    return {
      contract: PREVIEW_SESSION_CONTRACT,
      sessionId: createOpaqueIdentity("session"),
      projectUuid: snapshot.projectUuid,
      snapshotId: snapshot.snapshotId,
      token: createOpaqueIdentity("token"),
      createdAt: new Date(created).toISOString(),
      expiresAt: new Date(created + this.ttlMs).toISOString(),
      state: "created",
      snapshot,
      expiryTimer: null,
      failure: null,
      broker: null,
      brokerLaunch: null,
      aiBroker: null,
      aiLaunch: null
    };
  }

  #handleBroker(message) {
    const session = message?.sessionId ? this.sessions.get(message.sessionId) : null;
    if (typeof message?.method === "string" && message.method.startsWith("ai.")) {
      if (session?.aiBroker) return session.aiBroker.handleEnvelope(message);
    }
    if (!session?.broker) return Promise.resolve(null);
    return session.broker.handleEnvelope(message);
  }

  async #expire(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.broker?.close("session-expired");
    session.aiBroker?.close("session-expired");
    try { await this.hostClient.stop(session); } finally {
      session.state = "closed";
      this.#revoke(session);
    }
  }

  #revoke(session) {
    clearTimeout(session.expiryTimer);
    session.expiryTimer = null;
    session.token = null;
    session.snapshot = null;
    session.broker?.close("request-cancelled");
    session.broker = null;
    session.brokerLaunch = null;
    session.aiBroker?.close("request-cancelled");
    session.aiBroker = null;
    session.aiLaunch = null;
    this.sessions.delete(session.sessionId);
    if (this.activeSessionId === session.sessionId) this.activeSessionId = null;
  }
}

function publicSession(session) {
  return Object.freeze({
    contract: session.contract,
    sessionId: session.sessionId,
    projectUuid: session.projectUuid,
    snapshotId: session.snapshotId,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    state: session.state,
    brokerEnabled: session.brokerLaunch?.facadeEnabled === true,
    aiFacadeEnabled: session.aiLaunch?.facadeEnabled === true,
    ...(session.failure ? { failure: session.failure } : {})
  });
}

function defaultPublicApiProvider() {
  return globalThis.top?.WebWindows || globalThis.WebWindows || null;
}
