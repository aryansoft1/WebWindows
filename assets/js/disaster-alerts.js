(function (global) {
  "use strict";

  const PREF_KEY = "webwindows.disaster-alerts.preferences.v1";
  const DISMISSED_KEY = "webwindows.disaster-alerts.dismissed.v1";
  const API_URL = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/events4app";
  const POLL_MS = 6 * 60 * 1000;
  let audioContext = null;
  let simulationRegion = "JP";
  const simulationStorage = new Map();
  const SIMULATION = (() => { try { return new URL(global.location.href).searchParams.get("ww-disaster-simulator") === "1"; } catch (_) { return false; } })();
  const TEXT = {
    zh: { heading: "防灾提醒", red: "重大灾害风险", orange: "灾害风险提醒", dismiss: "关闭", source: "来源：GDACS 全球灾害信息（非本地官方实时预警）", magnitude: "震级", depth: "震源深度", epicenter: "震源地", waveHeight: "预计最大沿岸浪高", unavailable: "数据源未提供", severity: "强度/影响", sound: "防灾提醒音", show: "显示灾害提醒", showHelp: "显示所选地区的全球重大灾害风险信息。数据来自 GDACS，不替代当地政府警报。", soundToggle: "播放高等级提醒音", soundHelp: "仅在页面打开且收到红色等级事件时播放短提示音。默认关闭；浏览器可能要求先与页面交互。", preview: "试听提示音", status: "全球灾害信息源：GDACS", updated: "已更新", failed: "灾害信息暂时无法获取", limit: "此功能目前仅在 WebWindows 页面运行时检查全球重大事件；紧急避险请以当地政府和手机官方警报为准。" },
    tw: { heading: "防災提醒", red: "重大災害風險", orange: "災害風險提醒", dismiss: "關閉", source: "來源：GDACS 全球災害資訊（非本地官方即時警報）", magnitude: "規模", depth: "震源深度", epicenter: "震央位置", waveHeight: "預計最大沿岸浪高", unavailable: "資料來源未提供", severity: "強度/影響", sound: "防災提醒音", show: "顯示災害提醒", showHelp: "顯示所選地區的全球重大災害風險資訊。資料來自 GDACS，不取代當地政府警報。", soundToggle: "播放高等級提醒音", soundHelp: "僅在頁面開啟且收到紅色等級事件時播放短提示音。預設關閉；瀏覽器可能要求先與頁面互動。", preview: "試聽提示音", status: "全球災害資訊來源：GDACS", updated: "已更新", failed: "暫時無法取得災害資訊", limit: "此功能目前僅在 WebWindows 頁面執行時檢查全球重大事件；緊急避難請以當地政府和手機官方警報為準。" },
    en: { heading: "Disaster alerts", red: "Major disaster risk", orange: "Disaster risk notice", dismiss: "Dismiss", source: "Source: GDACS global disaster information (not a local official real-time warning)", magnitude: "Magnitude", depth: "Focal depth", epicenter: "Epicenter", waveHeight: "Estimated maximum coastal wave", unavailable: "Not provided by source", severity: "Intensity / impact", sound: "Disaster alert tone", show: "Show disaster alerts", showHelp: "Shows major global disaster risk information for your selected region. GDACS data does not replace local government alerts.", soundToggle: "Play high-level alert tone", soundHelp: "Plays a brief tone only while this page is open when a red-level event arrives. Off by default; your browser may require a page interaction first.", preview: "Preview tone", status: "Global disaster source: GDACS", updated: "Updated", failed: "Disaster information is temporarily unavailable", limit: "This feature checks major global events only while WebWindows is running. Follow local authorities and official phone alerts for urgent protective action." },
    jp: { heading: "防災通知", red: "重大な災害リスク", orange: "災害リスクのお知らせ", dismiss: "閉じる", source: "情報源：GDACS 世界災害情報（地域の公式リアルタイム警報ではありません）", magnitude: "マグニチュード", depth: "震源の深さ", epicenter: "震源地", waveHeight: "沿岸の予想最大波高", unavailable: "情報源にデータなし", severity: "強度・影響", sound: "防災通知音", show: "防災通知を表示", showHelp: "選択した地域の世界的な重大災害リスクを表示します。GDACS の情報は現地政府の警報に代わるものではありません。", soundToggle: "高レベル通知音を再生", soundHelp: "ページを開いている間に赤レベルの事象を受信した場合のみ短い音を再生します。初期設定はオフです。ブラウザーの操作が必要な場合があります。", preview: "通知音を試聴", status: "世界災害情報源：GDACS", updated: "更新済み", failed: "災害情報を取得できません", limit: "この機能は WebWindows の実行中のみ世界的な重大事象を確認します。緊急時は地域当局と携帯電話の公式警報に従ってください。" }
  };
  const COUNTRY = {
    CN: ["china", "people's republic of china", "中国", "中国大陆"],
    JP: ["japan", "日本"], TW: ["taiwan", "taiwan, china", "台湾"],
    US: ["united states", "united states of america", "usa", "us"]
  };
  const COUNTRY_LABELS = {
    CN: { zh: "中国", tw: "中國", en: "China", jp: "中国" },
    JP: { zh: "日本", tw: "日本", en: "Japan", jp: "日本" },
    TW: { zh: "台湾", tw: "台灣", en: "Taiwan", jp: "台湾" },
    US: { zh: "美国", tw: "美國", en: "United States", jp: "アメリカ" }
  };
  const EVENT_TYPE_LABELS = {
    EQ: { zh: "地震", tw: "地震", en: "Earthquake", jp: "地震" },
    TS: { zh: "海啸", tw: "海嘯", en: "Tsunami", jp: "津波" },
    TC: { zh: "热带气旋（台风）", tw: "熱帶氣旋（颱風）", en: "Tropical cyclone", jp: "台風・熱帯低気圧" },
    FL: { zh: "洪水", tw: "洪水", en: "Flood", jp: "洪水" },
    DR: { zh: "干旱", tw: "乾旱", en: "Drought", jp: "干ばつ" },
    WF: { zh: "野火", tw: "野火", en: "Wildfire", jp: "山火事" },
    VO: { zh: "火山", tw: "火山", en: "Volcano", jp: "火山" }
  };

  function hostWindow() {
    try { return global.parent && global.parent !== global ? global.parent : global; }
    catch (_) { return global; }
  }
  function storage() {
    if (SIMULATION) return { getItem: (key) => simulationStorage.get(key) ?? null, setItem: (key, value) => simulationStorage.set(key, String(value)), removeItem: (key) => simulationStorage.delete(key) };
    try { return hostWindow().localStorage; } catch (_) { return null; }
  }
  function readJson(key, fallback) {
    try { return JSON.parse(storage()?.getItem(key) || "null") || fallback; } catch (_) { return fallback; }
  }
  function preferences() {
    const value = readJson(PREF_KEY, {});
    return { enabled: value.enabled !== false, sound: value.sound === true };
  }
  function savePreferences(next) {
    try { storage()?.setItem(PREF_KEY, JSON.stringify({ enabled: next.enabled !== false, sound: next.sound === true })); } catch (_) {}
  }
  function language() {
    if (SIMULATION) {
      try { return (new URL(global.location.href).searchParams.get("ww-disaster-simulator-lang") || "zh").toLowerCase(); }
      catch (_) { return "zh"; }
    }
    try { return (hostWindow().localStorage.getItem("lang") || global.document.documentElement.lang || "zh").toLowerCase(); }
    catch (_) { return "zh"; }
  }
  function words() { return TEXT[language()] || TEXT.zh; }
  function getRegion() {
    if (SIMULATION) return simulationRegion;
    try { return (hostWindow().localStorage.getItem("webwindows.region") || "CN").toUpperCase(); } catch (_) { return "CN"; }
  }
  function eventSignature(item) { return `${item.id}:${item.episode || item.start || ""}:${item.level}`; }
  function normalizeFeature(feature) {
    const p = feature?.properties || {};
    const level = String(p.alertlevel || p.alertLevel || "").toLowerCase();
    if (level !== "red" && level !== "orange") return null;
    const id = String(feature.id || p.eventid || p.id || "").trim();
    if (!id) return null;
    const country = String(p.country || p.countryname || p.countryName || "").trim();
    const eventType = String(p.eventtype || p.eventType || "").toUpperCase();
    const title = String(p.name || p.eventname || p.eventName || p.description || eventType || "Disaster event").trim();
    const severityData = p.severitydata || p.severityData || {};
    const severityText = String(p.severitytext || p.severityText || severityData.severitytext || severityData.severityText || "").trim();
    const coordinates = feature.geometry?.type === "Point" && Array.isArray(feature.geometry.coordinates) ? feature.geometry.coordinates : [];
    const parseNumber = (value) => {
      if (value === null || value === undefined || value === "") return null;
      const match = typeof value === "string" ? value.match(/-?\d+(?:\.\d+)?/) : null;
      const number = Number(match ? match[0] : value);
      return Number.isFinite(number) ? number : null;
    };
    const magnitudeText = severityText.match(/(?:magnitude\s*)?m\s*([0-9]+(?:\.[0-9]+)?)/i) || severityText.match(/magnitude[^0-9]*([0-9]+(?:\.[0-9]+)?)/i) || title.match(/\bm\s*([0-9]+(?:\.[0-9]+)?)/i);
    const magnitude = parseNumber(p.magnitude ?? p.mag ?? p.severity?.value ?? (eventType === "EQ" ? severityData.severity : null) ?? magnitudeText?.[1]);
    const depthText = severityText.match(/depth\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)\s*km/i);
    const depth = parseNumber(p.depth ?? severityData.depth ?? (eventType === "EQ" ? coordinates[2] : null) ?? depthText?.[1]);
    const latitude = parseNumber(p.latitude ?? p.lat ?? (coordinates.length >= 2 ? coordinates[1] : null));
    const longitude = parseNumber(p.longitude ?? p.lon ?? p.lng ?? (coordinates.length >= 2 ? coordinates[0] : null));
    const epicenter = String(p.epicenter || p.location || p.place || p.region || p.geoname || "").trim() || (eventType === "EQ" ? (title.match(/\bin\s+(.+)$/i)?.[1] || "") : "");
    const waveText = severityText.match(/(?:maximum\s+)?wave\s*height[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*m/i);
    const severityUnit = String(severityData.severityunit || severityData.severityUnit || "").toLowerCase();
    const waveHeightFromSeverity = eventType === "TS" && (severityUnit === "m" || severityUnit.includes("meter") || /wave\s*height/i.test(severityText)) ? severityData.severity : null;
    const waveHeight = parseNumber(p.maxwaveheight ?? p.maxWaveHeight ?? p.maximumwaveheight ?? p.maximumWaveHeight ?? p.tsunami?.maxwaveheight ?? p.tsunami?.maxWaveHeight ?? severityData.maxwaveheight ?? severityData.maxWaveHeight ?? waveHeightFromSeverity ?? waveText?.[1]);
    const tsunamiFlag = p.tsunami ?? p.tsunamiwarning ?? p.tsunamiWarning;
    const tsunami = eventType === "TS" || (tsunamiFlag !== undefined && tsunamiFlag !== null && tsunamiFlag !== false && String(tsunamiFlag) !== "0") || waveHeight !== null;
    const updated = String(p.datetime || p.dateModified || p.datemodified || p.updated || p.toDate || p.todate || "");
    return { id, level, country, title, updated, episode: String(p.episodeid || p.episodeId || ""), start: String(p.fromdate || p.fromDate || ""), eventType, magnitude, depth, latitude, longitude, epicenter, waveHeight, tsunami, severityText };
  }
  function belongsToRegion(item, region) {
    const names = COUNTRY[region];
    if (!names || !item.country) return false;
    const country = item.country.toLowerCase();
    return names.some((name) => country === name || (name.length > 3 && country.includes(name)));
  }
  function displayCountry(value) {
    const country = String(value || "").trim();
    const normalized = country.toLowerCase();
    const code = Object.keys(COUNTRY).find((key) => COUNTRY[key].some((name) => normalized === name || (name.length > 3 && normalized.includes(name))));
    return COUNTRY_LABELS[code]?.[language()] || country;
  }
  function displayEventType(value) {
    return EVENT_TYPE_LABELS[String(value || "").toUpperCase()]?.[language()] || "";
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }
  function formatCoordinate(value, positive, negative) {
    if (value === null) return "";
    return `${Math.abs(value).toFixed(2)}°${value >= 0 ? positive : negative}`;
  }
  function eventDetails(item) {
    const t = words();
    const details = [];
    if (item.eventType === "EQ") {
      const coordinates = item.latitude !== null && item.longitude !== null
        ? `${formatCoordinate(item.latitude, "N", "S")}, ${formatCoordinate(item.longitude, "E", "W")}` : "";
      const epicenter = [item.epicenter, coordinates].filter(Boolean).join(" · ");
      if (epicenter) details.push([t.epicenter, epicenter]);
      if (item.magnitude !== null) details.push([t.magnitude, `M ${item.magnitude.toFixed(1)}`]);
      if (item.depth !== null && item.depth >= 0 && item.depth <= 800) details.push([t.depth, `${item.depth.toFixed(0)} km`]);
    }
    if (item.tsunami) details.push([t.waveHeight, item.waveHeight === null ? t.unavailable : `${item.waveHeight.toFixed(1)} m`]);
    if (!details.length && item.severityText) details.push([t.severity, item.severityText]);
    return details;
  }
  function dismissedSet() { return new Set(readJson(DISMISSED_KEY, [])); }
  function rememberDismissed(signature) {
    const values = [...dismissedSet(), signature].slice(-200);
    try { storage()?.setItem(DISMISSED_KEY, JSON.stringify(values)); } catch (_) {}
  }
  function playTone() {
    const AudioContext = global.AudioContext || global.webkitAudioContext;
    if (!AudioContext) return;
    try {
      audioContext ||= new AudioContext();
      const context = audioContext;
      if (context.state === "suspended") context.resume().catch(() => {});
      const now = context.currentTime;
      [660, 880].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, now + index * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.07, now + index * 0.22 + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.22 + 0.16);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(now + index * 0.22); oscillator.stop(now + index * 0.22 + 0.17);
      });
    } catch (_) {}
  }
  function unlockAudio() {
    const AudioContext = global.AudioContext || global.webkitAudioContext;
    if (!AudioContext) return;
    try { audioContext ||= new AudioContext(); audioContext.resume().catch(() => {}); } catch (_) {}
  }
  function render(items, newlyArrived) {
    const doc = global.document;
    if (!doc || !doc.body) return;
    let root = doc.getElementById("ww-disaster-alerts");
    if (!root) { root = doc.createElement("div"); root.id = "ww-disaster-alerts"; root.setAttribute("aria-live", "assertive"); root.setAttribute("aria-label", words().heading); doc.body.appendChild(root); }
    const dismissed = dismissedSet();
    const visible = items.filter((item) => !dismissed.has(eventSignature(item))).slice(0, 3);
    root.innerHTML = visible.map((item) => {
      const signature = eventSignature(item);
      const title = item.level === "red" ? words().red : words().orange;
      const levelIcon = item.level === "red"
        ? '<svg viewBox="0 0 24 24" focusable="false"><path d="M7 18h10l1-5.5a6 6 0 0 0-12 0L7 18Z"/><path d="M5 21h14M12 2v2M4.9 5l1.4 1.4M19.1 5l-1.4 1.4"/></svg>'
        : '<svg viewBox="0 0 24 24" focusable="false"><path d="m10.3 3.9-8.5 14A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-3.1l-8.5-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>';
      const event = escapeHtml(item.title);
      const eventType = displayEventType(item.eventType);
      const details = eventDetails(item).map(([label, value]) => `<div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span></div>`).join("");
      return `<article class="ww-disaster-alert" data-level="${item.level}" data-signature="${escapeHtml(signature)}"><div class="ww-disaster-alert-head"><span class="ww-disaster-alert-level" data-level="${item.level}"><span class="ww-disaster-alert-level-icon" aria-hidden="true">${levelIcon}</span>${title}</span><button class="ww-disaster-alert-dismiss" type="button" aria-label="${words().dismiss}" title="${words().dismiss}">×</button></div><div class="ww-disaster-alert-body"><span class="ww-disaster-alert-event">${event}</span>${eventType ? `<span class="ww-disaster-alert-type">${escapeHtml(eventType)}</span>` : ""}${item.country ? `<span class="ww-disaster-alert-country">${escapeHtml(displayCountry(item.country))}</span>` : ""}</div>${details ? `<div class="ww-disaster-alert-details">${details}</div>` : ""}<div class="ww-disaster-alert-meta">${words().source}</div></article>`;
    }).join("");
    root.querySelectorAll(".ww-disaster-alert-dismiss").forEach((button) => button.addEventListener("click", () => {
      const article = button.closest("[data-signature]");
      rememberDismissed(article.dataset.signature);
      article.remove();
    }));
    if (newlyArrived && preferences().sound && newlyArrived.some((item) => item.level === "red")) playTone();
  }
  function requestUrl() {
    return API_URL;
  }
  async function poll() {
    if (!global.document || global.document.getElementById("disasterAlertsToggle")) return;
    if (!preferences().enabled) { render([], null); return; }
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timeout = global.setTimeout(() => controller?.abort(), 12000);
    try {
      const response = await global.fetch(requestUrl(), { headers: { Accept: "application/geo+json, application/json" }, signal: controller?.signal, cache: "no-store" });
      if (!response.ok) throw new Error(`GDACS HTTP ${response.status}`);
      const payload = await response.json();
      const features = Array.isArray(payload.features) ? payload.features : Array.isArray(payload) ? payload : [];
      const items = features.map(normalizeFeature).filter((item) => item && belongsToRegion(item, getRegion()));
      const seenKey = "webwindows.disaster-alerts.seen.v1";
      const previous = new Set(readJson(seenKey, []));
      const current = items.map(eventSignature);
      const newlyArrived = previous.size ? items.filter((item) => !previous.has(eventSignature(item))) : [];
      try { storage()?.setItem(seenKey, JSON.stringify(current.slice(-300))); } catch (_) {}
      render(items, newlyArrived);
      global.dispatchEvent(new global.CustomEvent("webwindows:disaster-alerts-updated", { detail: { count: items.length, source: "GDACS", at: Date.now() } }));
      updateSettingsStatus(`${words().status} · ${words().updated}`);
    } catch (_) {
      updateSettingsStatus(`${words().status} · ${words().failed}`);
    } finally { global.clearTimeout(timeout); }
  }
  function updateSettingsStatus(text) {
    const target = global.document?.getElementById("disasterAlertSourceStatus");
    if (target) target.textContent = text;
  }
  function installSettings() {
    const doc = global.document;
    const enabled = doc.getElementById("disasterAlertsToggle");
    const sound = doc.getElementById("disasterAlertSoundToggle");
    if (!enabled || !sound) return false;
    const updateLabel = (input, labelText, helpText) => {
      const span = input.closest("label")?.querySelector("span");
      if (!span) return;
      const help = span.querySelector(".settings-help");
      [...span.childNodes].filter((node) => node.nodeType === 3).forEach((node) => node.remove());
      span.insertBefore(doc.createTextNode(labelText), help || null);
      if (help) help.textContent = helpText;
    };
    const preview = doc.getElementById("disasterAlertSoundPreview");
    const applyLanguage = () => {
      const t = words();
      const heading = doc.getElementById("disasterAlertHeading");
      if (heading) heading.textContent = t.heading;
      updateLabel(enabled, t.show, t.showHelp);
      updateLabel(sound, t.soundToggle, t.soundHelp);
      if (preview) preview.textContent = t.preview;
      const limitation = doc.getElementById("disasterAlertLimitations");
      if (limitation) limitation.textContent = t.limit;
      updateSettingsStatus(t.status);
    };
    applyLanguage();
    const saved = preferences();
    enabled.checked = saved.enabled;
    sound.checked = saved.sound;
    enabled.addEventListener("change", () => { const next = preferences(); next.enabled = enabled.checked; savePreferences(next); });
    sound.addEventListener("change", () => { const next = preferences(); next.sound = sound.checked; savePreferences(next); if (sound.checked) unlockAudio(); });
    preview?.addEventListener("click", playTone);
    doc.getElementById("langSelect")?.addEventListener("change", () => global.setTimeout(applyLanguage, 0));
    global.addEventListener("storage", (event) => { if (event.key === "lang") applyLanguage(); });
    return true;
  }
  function start() {
    if (installSettings()) return;
    if (SIMULATION) return;
    if (!global.fetch) return;
    poll();
    global.setInterval(poll, POLL_MS);
    global.addEventListener("storage", (event) => { if (event.key === PREF_KEY || event.key === "webwindows.region" || event.key === "lang") poll(); });
    global.document.addEventListener("visibilitychange", () => { if (!global.document.hidden) poll(); });
  }
  const api = { poll, normalizeFeature, belongsToRegion, displayCountry, displayEventType, requestUrl, playTone, getPreferences: preferences, savePreferences, keys: { preferences: PREF_KEY, dismissed: DISMISSED_KEY } };
  if (SIMULATION) {
    api.simulate = (features) => {
      const items = (features || []).map(normalizeFeature).filter((item) => item && belongsToRegion(item, simulationRegion));
      const visible = preferences().enabled ? items.filter((item) => !dismissedSet().has(eventSignature(item))) : [];
      render(visible, null);
      return visible;
    };
    api.setSimulationRegion = (region) => { simulationRegion = String(region || "JP").toUpperCase(); };
    api.setSimulationPreferences = (next) => savePreferences({ ...preferences(), ...next });
    api.clearSimulationDismissals = () => storage()?.removeItem(DISMISSED_KEY);
  }
  global.WebWindowsDisasterAlerts = api;
  if (global.document) {
    if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }
})(window);
