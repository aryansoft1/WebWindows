import {
  MAX_PREVIEW_DOCUMENT_BYTES,
  PREVIEW_CONTROL_PROTOCOL,
  isPlainObject,
  createOpaqueIdentity
} from "./preview-protocol.js";

export class PreviewHostClient {
  constructor({ onConsole, onState, onBroker } = {}) {
    this.onConsole = onConsole || (() => {});
    this.onState = onState || (() => {});
    this.onBroker = onBroker || null;
    this.port = null;
    this.hostNonce = null;
    this.requests = new Map();
  }

  async connect(frame) {
    this.disconnect();
    if (!frame?.contentWindow) throw new Error("Developer Preview Host 尚未加载。");
    this.hostNonce = createOpaqueIdentity("host");
    const channel = new MessageChannel();
    this.port = channel.port1;
    this.port.onmessage = (event) => this.#handleMessage(event.data);
    this.port.start();
    frame.contentWindow.postMessage({
      protocol: PREVIEW_CONTROL_PROTOCOL,
      version: 1,
      type: "host.connect",
      hostNonce: this.hostNonce
    }, location.origin, [channel.port2]);
    await this.#request("host.ping", {}, 5000);
  }

  async start(session, documentHtml, brokerLaunch = { facadeEnabled: false }) {
    const documentBytes = new TextEncoder().encode(documentHtml).byteLength;
    if (documentBytes > MAX_PREVIEW_DOCUMENT_BYTES) throw new Error("Preview document 超过 30 MB 上限。");
    return this.#request("preview.start", {
      session: publicSession(session),
      token: session.token,
      documentHtml,
      documentBytes,
      brokerLaunch
    }, 10000);
  }

  stop(session) {
    if (!this.port || !session) return Promise.resolve();
    return this.#request("preview.stop", { sessionId: session.sessionId, token: session.token }, 5000);
  }

  disconnect() {
    this.port?.close();
    this.port = null;
    this.hostNonce = null;
    for (const request of this.requests.values()) request.reject(new Error("Developer Preview Host 已断开。"));
    this.requests.clear();
  }

  #request(type, payload, timeout) {
    if (!this.port || !this.hostNonce) return Promise.reject(new Error("Developer Preview Host 未连接。"));
    const requestId = createOpaqueIdentity("request");
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.requests.delete(requestId);
        reject(new Error(`Developer Preview Host 请求超时：${type}`));
      }, timeout);
      this.requests.set(requestId, {
        resolve: (value) => { clearTimeout(timer); resolve(value); },
        reject: (error) => { clearTimeout(timer); reject(error); }
      });
      this.port.postMessage({
        protocol: PREVIEW_CONTROL_PROTOCOL,
        version: 1,
        type,
        hostNonce: this.hostNonce,
        requestId,
        payload
      });
    });
  }

  #handleMessage(message) {
    if (!isPlainObject(message) || message.protocol !== PREVIEW_CONTROL_PROTOCOL || message.version !== 1
        || message.hostNonce !== this.hostNonce || typeof message.type !== "string") return;
    if (message.type === "preview.console") {
      this.onConsole(message.payload);
      return;
    }
    if (message.type === "preview.state") {
      this.onState(message.payload);
      return;
    }
    if (message.type === "preview.broker") {
      const port = this.port;
      const nonce = this.hostNonce;
      Promise.resolve(this.onBroker?.(message.payload)).then((response) => {
        if (!response || this.port !== port || this.hostNonce !== nonce) return;
        port.postMessage({
          protocol: PREVIEW_CONTROL_PROTOCOL,
          version: 1,
          type: "preview.broker.response",
          hostNonce: nonce,
          payload: response
        });
      }).catch(() => {});
      return;
    }
    if (message.type !== "host.response" || typeof message.requestId !== "string") return;
    const request = this.requests.get(message.requestId);
    if (!request) return;
    this.requests.delete(message.requestId);
    if (message.ok === true) request.resolve(message.payload);
    else request.reject(new Error(message.error || "Developer Preview Host 请求失败。"));
  }
}

function publicSession(session) {
  return {
    contract: session.contract,
    sessionId: session.sessionId,
    projectUuid: session.projectUuid,
    snapshotId: session.snapshotId,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    state: session.state
  };
}
