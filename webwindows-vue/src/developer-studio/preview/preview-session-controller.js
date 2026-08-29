import { validateProjectSnapshot } from "../validation/project-validator.js";
import { createPreviewDocument } from "./preview-snapshot-runtime.js";
import {
  PREVIEW_SESSION_CONTRACT,
  createOpaqueIdentity
} from "./preview-protocol.js";

export const DEFAULT_PREVIEW_TTL_MS = 30 * 60 * 1000;

export class PreviewSessionController {
  constructor({ hostClient, ttlMs = DEFAULT_PREVIEW_TTL_MS, now = () => Date.now() }) {
    if (!hostClient) throw new TypeError("PreviewHostClient is required.");
    this.hostClient = hostClient;
    this.ttlMs = ttlMs;
    this.now = now;
    this.sessions = new Map();
    this.activeSessionId = null;
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
      const documentHtml = createPreviewDocument(snapshot, session, { domParser });
      await this.hostClient.start(session, documentHtml);
      session.state = "running";
      session.expiryTimer = setTimeout(() => this.stop(session.sessionId).catch(() => {}), this.ttlMs);
      return { started: true, validationReport, session: publicSession(session) };
    } catch (error) {
      session.state = "failed";
      session.failure = error?.message || String(error);
      this.#revoke(session);
      throw error;
    }
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
      failure: null
    };
  }

  #revoke(session) {
    clearTimeout(session.expiryTimer);
    session.expiryTimer = null;
    session.token = null;
    session.snapshot = null;
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
    ...(session.failure ? { failure: session.failure } : {})
  });
}
