(function () {
  "use strict";

  if (navigator.globalPrivacyControl === true || ["1", "yes"].includes(String(navigator.doNotTrack).toLowerCase())) return;

  const ENDPOINT = "/api/visitor-analytics.asp";
  const VISITOR_KEY = "webwindows.analytics.visitor.v1";
  const SESSION_KEY = "webwindows.analytics.session.v1";
  const PULSE_MS = 30000;
  const IDLE_MS = 60000;

  function uuid() {
    if (crypto?.randomUUID) return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function stored(storage, key) {
    try {
      const existing = storage.getItem(key);
      if (/^[a-f0-9-]{36}$/i.test(existing || "")) return existing;
      const created = uuid();
      storage.setItem(key, created);
      return created;
    } catch (_) {
      return uuid();
    }
  }

  const visitorKey = stored(localStorage, VISITOR_KEY);
  const sessionKey = stored(sessionStorage, SESSION_KEY);
  let lastInteraction = Date.now();
  let lastSample = Date.now();
  let pendingSeconds = 0;
  let activeFeature = { key: "desktop", name: "桌面" };
  let featureOpened = 1;
  let started = false;
  let featureRefreshScheduled = false;

  function deviceType() {
    if (matchMedia("(max-width: 700px)").matches) return "mobile";
    if (matchMedia("(max-width: 1100px)").matches) return "tablet";
    return "desktop";
  }

  function currentFeature() {
    const active = document.querySelector(".window.active");
    if (!active || getComputedStyle(active).display === "none") return { key: "desktop", name: "桌面" };
    const rawId = (active.id || "window").replace(/^win-/, "");
    const title = active.querySelector(".title,.window-title")?.textContent?.trim() || rawId;
    const safeKey = rawId.toLowerCase().replace(/[^a-z0-9._:-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
    return { key: safeKey || "window", name: title.slice(0, 160) || "窗口" };
  }

  function sampleActiveTime() {
    const now = Date.now();
    const elapsed = Math.min(30, Math.max(0, Math.round((now - lastSample) / 1000)));
    lastSample = now;
    if (document.visibilityState === "visible" && now - lastInteraction <= IDLE_MS) pendingSeconds += elapsed;
  }

  function params(action) {
    const body = new URLSearchParams();
    body.set("action", action);
    body.set("visitorKey", visitorKey);
    body.set("sessionKey", sessionKey);
    body.set("featureKey", activeFeature.key);
    body.set("featureName", activeFeature.name);
    body.set("featureOpened", String(featureOpened));
    body.set("activeSeconds", String(Math.min(300, pendingSeconds)));
    body.set("entryPath", `${location.pathname}${location.search}`.slice(0, 500));
    body.set("referrer", document.referrer.slice(0, 1000));
    body.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "");
    body.set("language", navigator.language || "");
    body.set("deviceType", deviceType());
    return body;
  }

  function send(action, beacon) {
    sampleActiveTime();
    const body = params(action);
    pendingSeconds = 0;
    featureOpened = 0;
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, body);
      return;
    }
    fetch(ENDPOINT, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: body.toString(),
      keepalive: action === "end"
    }).catch(() => {});
  }

  function refreshFeature() {
    sampleActiveTime();
    const next = currentFeature();
    if (next.key === activeFeature.key) return;
    if (pendingSeconds > 0 || featureOpened) send(started ? "pulse" : "start", false);
    started = true;
    activeFeature = next;
    featureOpened = 1;
    lastSample = Date.now();
  }

  function scheduleFeatureRefresh() {
    if (featureRefreshScheduled) return;
    featureRefreshScheduled = true;
    requestAnimationFrame(() => {
      featureRefreshScheduled = false;
      refreshFeature();
    });
  }

  ["pointerdown", "keydown", "wheel", "touchstart"].forEach((name) => {
    addEventListener(name, () => { lastInteraction = Date.now(); }, { passive: true, capture: true });
  });

  const observer = new MutationObserver((records) => {
    const windowStateChanged = records.some((record) => {
      if (record.type === "attributes") return record.target.matches?.(".window") === true;
      return [...record.addedNodes, ...record.removedNodes].some((node) =>
        node.nodeType === Node.ELEMENT_NODE && (node.matches?.(".window") || node.querySelector?.(".window"))
      );
    });
    if (windowStateChanged) scheduleFeatureRefresh();
  });
  observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style"] });
  addEventListener("focus", scheduleFeatureRefresh);
  addEventListener("webwindows:login", () => send("pulse", false));
  addEventListener("webwindows:logout", () => send("pulse", false));
  addEventListener("pagehide", () => send("end", true));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") send("pulse", true);
    else lastSample = Date.now();
  });

  send("start", false);
  started = true;
  setInterval(() => {
    refreshFeature();
    send("pulse", false);
  }, PULSE_MS);
})();
