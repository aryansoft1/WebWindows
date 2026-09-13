(function installNetworkSpeedTest(global) {
  "use strict";

  const API_URL = "api/network-speed.ashx";
  const SAMPLE_INTERVAL_MS = 250;
  const PROFILES = Object.freeze({
    light: Object.freeze({ label: "轻量", pingCount: 5, downloadWarmupBytes: 131072, downloadMinBytes: 262144, downloadMaxBytes: 786432, uploadWarmupBytes: 65536, uploadMinBytes: 131072, uploadMaxBytes: 393216, rounds: 2, concurrency: 1, requestTimeoutMs: 12000, overallTimeoutMs: 40000 }),
    standard: Object.freeze({ label: "标准", pingCount: 7, downloadWarmupBytes: 262144, downloadMinBytes: 786432, downloadMaxBytes: 4194304, uploadWarmupBytes: 131072, uploadMinBytes: 393216, uploadMaxBytes: 2097152, rounds: 3, concurrency: 1, requestTimeoutMs: 18000, overallTimeoutMs: 70000 })
  });

  function clamp(value, minimum, maximum) { return Math.min(maximum, Math.max(minimum, value)); }
  function bytesToMbps(bytes, durationMs) {
    if (!Number.isFinite(bytes) || !Number.isFinite(durationMs) || bytes < 0 || durationMs <= 0) return 0;
    return (bytes * 8) / (durationMs / 1000) / 1_000_000;
  }
  function mbpsToMBps(mbps) { return Number.isFinite(mbps) && mbps > 0 ? mbps / 8 : 0; }
  function formatRate(mbps) {
    const safe = Number.isFinite(mbps) && mbps > 0 ? mbps : 0;
    const digits = safe >= 100 ? 0 : safe >= 10 ? 1 : 2;
    return { mbps: `${safe.toFixed(digits)} Mbps`, megabytes: `${mbpsToMBps(safe).toFixed(safe >= 80 ? 1 : 2)} MB/s` };
  }
  function summarizeTransfer(samples) {
    const stable = (samples || []).filter((sample) => sample && sample.stable !== false && Number.isFinite(sample.bytes) && sample.bytes >= 0 && Number.isFinite(sample.durationMs) && sample.durationMs > 0);
    const bytes = stable.reduce((total, sample) => total + sample.bytes, 0);
    const durationMs = stable.reduce((total, sample) => total + sample.durationMs, 0);
    const rates = stable.map((sample) => bytesToMbps(sample.bytes, sample.durationMs));
    return { sampleCount: stable.length, bytes, durationMs, currentMbps: rates.length ? rates[rates.length - 1] : 0, averageMbps: bytesToMbps(bytes, durationMs), peakMbps: rates.length ? Math.max(...rates) : 0 };
  }
  function summarizeLatency(samples) {
    const stable = (samples || []).filter((value) => Number.isFinite(value) && value >= 0);
    const averageMs = stable.length ? stable.reduce((sum, value) => sum + value, 0) / stable.length : 0;
    const differences = stable.slice(1).map((value, index) => Math.abs(value - stable[index]));
    return { sampleCount: stable.length, currentMs: stable.length ? stable[stable.length - 1] : 0, averageMs, peakMs: stable.length ? Math.max(...stable) : 0, jitterMs: differences.length ? differences.reduce((sum, value) => sum + value, 0) / differences.length : 0 };
  }
  function adaptiveSize(mbps, minimum, maximum, targetMs) {
    const estimate = Number.isFinite(mbps) && mbps > 0 ? (mbps * 1_000_000 / 8) * ((targetMs || 1800) / 1000) : minimum;
    return Math.round(clamp(estimate, minimum, maximum) / 16384) * 16384;
  }
  function classifySpeed(mbps) {
    const value = Number.isFinite(mbps) && mbps > 0 ? mbps : 0;
    if (value < 3) return { key: "slow", label: "慢", detail: "网页和视频可能需要等待。" };
    if (value < 10) return { key: "fair", label: "一般", detail: "网页与标清视频基本可用。" };
    if (value < 50) return { key: "good", label: "良好", detail: "高清视频和常规云资料传输较顺畅。" };
    if (value < 200) return { key: "fast", label: "快", detail: "4K 视频与大文件传输较顺畅。" };
    return { key: "excellent", label: "极快", detail: "当前链路适合高码率和大型传输任务。" };
  }
  function classifyExperience(downloadMbps, uploadMbps) {
    const effective = Math.min(Number(downloadMbps) || 0, (Number(uploadMbps) || 0) * 2);
    return classifySpeed(effective);
  }
  function cacheBustedUrl(base, action, size, nonce, locationHref) {
    const url = new URL(base, locationHref || "https://webwindows.invalid/");
    url.searchParams.set("action", action);
    if (size) url.searchParams.set("size", String(size));
    url.searchParams.set("nonce", String(nonce));
    return url.href;
  }
  function abortError(message) {
    try { return new DOMException(message || "测速已取消", "AbortError"); }
    catch (_) { const error = new Error(message || "测速已取消"); error.name = "AbortError"; return error; }
  }
  function createTimedSignal(parentSignal, timeoutMs) {
    const controller = new AbortController();
    const abortFromParent = () => controller.abort(parentSignal?.reason || abortError());
    if (parentSignal?.aborted) abortFromParent();
    else parentSignal?.addEventListener("abort", abortFromParent, { once: true });
    const timer = setTimeout(() => controller.abort(new Error("请求超时")), timeoutMs);
    return { signal: controller.signal, dispose() { clearTimeout(timer); parentSignal?.removeEventListener("abort", abortFromParent); } };
  }

  const core = Object.freeze({ PROFILES, bytesToMbps, mbpsToMBps, formatRate, summarizeTransfer, summarizeLatency, adaptiveSize, classifySpeed, classifyExperience, cacheBustedUrl, createTimedSignal });
  global.WebWindowsNetworkSpeedCore = core;
  if (!global.document) return;

  let activeController = null;
  let chartState = { download: [], upload: [] };
  let chartSeries = { download: [], upload: [] };
  let chartTicker = 0;
  let activeKind = null;
  const liveRates = { download: 0, upload: 0 };
  let runStartedAt = 0;
  function elements() {
    return {
      card: document.querySelector(".network-speed-test"), start: document.getElementById("networkSpeedStart"), cancel: document.getElementById("networkSpeedCancel"), profile: document.getElementById("networkSpeedProfile"), progress: document.getElementById("networkSpeedProgress"), status: document.getElementById("networkSpeedStatus"), chart: document.getElementById("networkSpeedChart"), chartFallback: document.getElementById("networkSpeedChartFallback"), phase: document.getElementById("networkSpeedPhase"), latency: document.getElementById("networkSpeedLatency"), jitter: document.getElementById("networkSpeedJitter"), rating: document.getElementById("networkSpeedRating"), ratingLabel: document.getElementById("networkSpeedRatingLabel"), ratingDetail: document.getElementById("networkSpeedRatingDetail"), downloadCurrent: document.getElementById("networkSpeedDownloadCurrent"), downloadAverage: document.getElementById("networkSpeedDownloadAverage"), downloadPeak: document.getElementById("networkSpeedDownloadPeak"), uploadCurrent: document.getElementById("networkSpeedUploadCurrent"), uploadAverage: document.getElementById("networkSpeedUploadAverage"), uploadPeak: document.getElementById("networkSpeedUploadPeak"), summary: document.getElementById("networkSpeedSummary")
    };
  }
  function t(value) { return global.WebWindowsI18n?.translate(String(value)) || String(value); }
  function setRunning(running) {
    const ui = elements();
    if (!ui.start) return;
    ui.start.disabled = running; ui.profile.disabled = running; ui.cancel.hidden = !running; ui.progress.hidden = !running; ui.card?.classList.toggle("is-running", running);
    if (!running) ui.progress.removeAttribute("value");
  }
  function setStatus(message, error) { const ui = elements(); ui.status.textContent = message; ui.status.classList.toggle("is-error", Boolean(error)); }
  function setMetric(element, mbps) {
    if (!element) return;
    const rate = formatRate(mbps);
    element.replaceChildren(Object.assign(document.createElement("strong"), { textContent: rate.mbps }), Object.assign(document.createElement("small"), { textContent: rate.megabytes }));
  }
  function renderStats(kind, samples) {
    const stats = summarizeTransfer(samples); const ui = elements();
    setMetric(ui[`${kind}Current`], stats.currentMbps); setMetric(ui[`${kind}Average`], stats.averageMbps); setMetric(ui[`${kind}Peak`], stats.peakMbps);
    return stats;
  }
  function setRating(quality) {
    const ui = elements(); if (!ui.rating || !ui.ratingLabel || !ui.ratingDetail) return;
    ["waiting", "slow", "fair", "good", "fast", "excellent"].forEach((key) => ui.rating.classList.remove(`is-${key}`));
    ui.rating.classList.add(`is-${quality.key}`); ui.ratingLabel.textContent = t(quality.label); ui.ratingDetail.textContent = t(quality.detail);
  }
  function coordinatesFor(points, width, height, maximum, duration) {
    return points.map((point) => ({
      x: 8 + (point.timeMs / Math.max(duration, 1)) * (width - 16),
      y: height - 10 - (point.mbps / Math.max(maximum, 1)) * (height - 24)
    }));
  }
  function pathFor(points, width, height, maximum, duration) {
    return coordinatesFor(points, width, height, maximum, duration).map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  }
  function areaFor(points, width, height, maximum, duration) {
    const coordinates = coordinatesFor(points, width, height, maximum, duration); if (!coordinates.length) return "";
    const line = coordinates.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
    return `${line} L${coordinates.at(-1).x.toFixed(1)},${height - 10} L${coordinates[0].x.toFixed(1)},${height - 10} Z`;
  }
  function renderChart() {
    const ui = elements(); if (!ui.chart) return;
    const width = 720; const height = 220; const all = chartSeries.download.concat(chartSeries.upload);
    const duration = Math.max(1000, ...all.map((point) => point.timeMs)); const maximum = Math.max(1, ...all.map((point) => point.mbps));
    ui.chart.setAttribute("viewBox", `0 0 ${width} ${height}`);
    ["download", "upload"].forEach((kind) => {
      const points = chartSeries[kind];
      ui.chart.querySelector(`.network-chart-${kind}`).setAttribute("d", pathFor(points, width, height, maximum, duration));
      ui.chart.querySelector(`.network-chart-${kind}-area`).setAttribute("d", areaFor(points, width, height, maximum, duration));
      const marker = ui.chart.querySelector(`.network-chart-${kind}-point`); const last = coordinatesFor(points.slice(-1), width, height, maximum, duration)[0];
      marker.hidden = !last; if (last) { marker.setAttribute("cx", last.x.toFixed(1)); marker.setAttribute("cy", last.y.toFixed(1)); }
    });
    ui.chart.querySelector(".network-chart-max").textContent = formatRate(maximum).mbps;
    ui.chart.querySelector(".network-chart-duration").textContent = `${(duration / 1000).toFixed(1)} s`;
    ui.chartFallback.textContent = `${t("时间")} ${(duration / 1000).toFixed(1)} ${t("秒")} · ${t("当前下载")} ${formatRate(chartSeries.download.at(-1)?.mbps || 0).mbps} · ${t("当前上传")} ${formatRate(chartSeries.upload.at(-1)?.mbps || 0).mbps}`;
  }
  function appendChartPoint(kind, mbps, timeMs) {
    const series = chartSeries[kind]; series.push({ mbps: Math.max(0, Number(mbps) || 0), timeMs: Math.max(0, Number(timeMs) || 0) });
    const limit = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2 ? 80 : 240;
    if (series.length > limit) series.splice(0, series.length - limit); renderChart();
  }
  function startChartTicker() {
    clearInterval(chartTicker); chartTicker = setInterval(() => {
      if (activeController && activeKind) appendChartPoint(activeKind, liveRates[activeKind], performance.now() - runStartedAt);
    }, SAMPLE_INTERVAL_MS);
  }
  function stopChartTicker() { clearInterval(chartTicker); chartTicker = 0; activeKind = null; }
  function recordSample(kind, sample, stable) {
    sample.stable = stable; sample.mbps = bytesToMbps(sample.bytes, sample.durationMs); chartState[kind].push(sample); liveRates[kind] = sample.mbps; appendChartPoint(kind, sample.mbps, sample.timeMs);
    const limit = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2 ? 48 : 120;
    if (chartState[kind].length > limit) chartState[kind].splice(0, chartState[kind].length - limit);
    const stats = renderStats(kind, chartState[kind]); if (stats.sampleCount) setRating(classifySpeed(stats.averageMbps));
  }
  function endpoint(action, size) { return cacheBustedUrl(API_URL, action, size, `${Date.now()}-${Math.random().toString(36).slice(2)}`, location.href); }
  async function ping(signal, profile) {
    const samples = [];
    for (let index = 0; index < profile.pingCount; index += 1) {
      const timed = createTimedSignal(signal, profile.requestTimeoutMs); const started = performance.now();
      try {
        const response = await fetch(endpoint("ping"), { cache: "no-store", credentials: "same-origin", headers: { "X-WebWindows-Speed-Test": "1" }, signal: timed.signal });
        if (!response.ok) throw new Error(`延迟端点返回 HTTP ${response.status}`);
        await response.arrayBuffer(); if (index > 0) samples.push(performance.now() - started);
        elements().progress.value = 5 + Math.round(((index + 1) / profile.pingCount) * 15);
      } finally { timed.dispose(); }
    }
    const stats = summarizeLatency(samples); elements().latency.textContent = `${stats.averageMs.toFixed(0)} ms`; elements().jitter.textContent = `${stats.jitterMs.toFixed(0)} ms`; return stats;
  }
  async function downloadOnce(bytes, signal, profile, stable) {
    const timed = createTimedSignal(signal, profile.requestTimeoutMs); const started = performance.now(); let received = 0; let sampledBytes = 0; let sampledAt = started;
    try {
      const response = await fetch(endpoint("download", bytes), { cache: "no-store", credentials: "same-origin", headers: { "X-WebWindows-Speed-Test": "1" }, signal: timed.signal });
      if (!response.ok) throw new Error(`下载端点返回 HTTP ${response.status}`);
      if (!response.body?.getReader) { const body = await response.arrayBuffer(); received = body.byteLength; recordSample("download", { bytes: received, durationMs: performance.now() - started, timeMs: performance.now() - runStartedAt }, stable); return received; }
      const reader = response.body.getReader();
      while (true) {
        const result = await reader.read(); if (result.done) break; received += result.value.byteLength; const now = performance.now();
        if (now - sampledAt >= SAMPLE_INTERVAL_MS) { recordSample("download", { bytes: received - sampledBytes, durationMs: now - sampledAt, timeMs: now - runStartedAt }, stable); sampledBytes = received; sampledAt = now; }
      }
      const finished = performance.now(); if (received > sampledBytes) recordSample("download", { bytes: received - sampledBytes, durationMs: finished - sampledAt, timeMs: finished - runStartedAt }, stable);
      return received;
    } finally { timed.dispose(); }
  }
  function randomPayload(bytes) {
    const chunks = []; let remaining = bytes;
    while (remaining > 0) { const chunk = new Uint8Array(Math.min(remaining, 65536)); global.crypto?.getRandomValues?.(chunk); chunks.push(chunk); remaining -= chunk.byteLength; }
    return new Blob(chunks, { type: "application/octet-stream" });
  }
  function uploadOnce(bytes, signal, profile, stable) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest(); const started = performance.now(); let sampledBytes = 0; let sampledAt = started; let lastLoaded = 0; let uploadSampled = false;
      const stop = () => signal?.removeEventListener("abort", onAbort); const onAbort = () => xhr.abort(); signal?.addEventListener("abort", onAbort, { once: true });
      xhr.open("POST", endpoint("upload", bytes), true); xhr.timeout = profile.requestTimeoutMs; xhr.setRequestHeader("Content-Type", "application/octet-stream"); xhr.setRequestHeader("X-WebWindows-Speed-Test", "1");
      xhr.upload.onprogress = (event) => { const now = performance.now(); lastLoaded = event.loaded; if (now - sampledAt >= SAMPLE_INTERVAL_MS) { recordSample("upload", { bytes: event.loaded - sampledBytes, durationMs: now - sampledAt, timeMs: now - runStartedAt }, stable); sampledBytes = event.loaded; sampledAt = now; } };
      xhr.upload.onload = () => { const finished = performance.now(); lastLoaded = Math.max(lastLoaded, bytes); if (lastLoaded > sampledBytes) recordSample("upload", { bytes: lastLoaded - sampledBytes, durationMs: finished - sampledAt, timeMs: finished - runStartedAt }, stable); uploadSampled = true; };
      xhr.onload = () => { stop(); const finished = performance.now(); const loaded = Math.max(lastLoaded, bytes); if (!uploadSampled && loaded > sampledBytes) recordSample("upload", { bytes: loaded - sampledBytes, durationMs: finished - sampledAt, timeMs: finished - runStartedAt }, stable); if (xhr.status >= 200 && xhr.status < 300) resolve(loaded); else reject(new Error(`上传端点返回 HTTP ${xhr.status}`)); };
      xhr.onerror = () => { stop(); reject(new Error("上传请求失败")); }; xhr.ontimeout = () => { stop(); reject(new Error("上传请求超时")); }; xhr.onabort = () => { stop(); reject(abortError()); }; xhr.send(randomPayload(bytes));
    });
  }
  async function runTransfer(kind, signal, profile, startProgress, span) {
    const isDownload = kind === "download"; const warmup = isDownload ? profile.downloadWarmupBytes : profile.uploadWarmupBytes; const minimum = isDownload ? profile.downloadMinBytes : profile.uploadMinBytes; const maximum = isDownload ? profile.downloadMaxBytes : profile.uploadMaxBytes; const execute = isDownload ? downloadOnce : uploadOnce;
    activeKind = kind; liveRates[kind] = 0; appendChartPoint(kind, 0, performance.now() - runStartedAt);
    elements().phase.textContent = t(isDownload ? "下载预热（不计入平均值）" : "上传预热（不计入平均值）"); const warmupStarted = performance.now(); await execute(warmup, signal, profile, false);
    let nextBytes = adaptiveSize(bytesToMbps(warmup, performance.now() - warmupStarted), minimum, maximum, 1800); const concurrency = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2 ? 1 : profile.concurrency;
    for (let round = 0; round < profile.rounds; round += 1) {
      if (signal.aborted) throw abortError(); elements().phase.textContent = `${t(isDownload ? "下载稳定采样" : "上传稳定采样")} ${round + 1}/${profile.rounds}`; const before = performance.now();
      await Promise.all(Array.from({ length: concurrency }, () => execute(nextBytes, signal, profile, true)));
      nextBytes = adaptiveSize(bytesToMbps(nextBytes * concurrency, performance.now() - before), minimum, maximum, 1800); elements().progress.value = startProgress + Math.round(((round + 1) / profile.rounds) * span);
    }
    return summarizeTransfer(chartState[kind]);
  }
  function resetUi() {
    chartState = { download: [], upload: [] }; chartSeries = { download: [], upload: [] }; liveRates.download = 0; liveRates.upload = 0; stopChartTicker(); const ui = elements(); [ui.downloadCurrent, ui.downloadAverage, ui.downloadPeak, ui.uploadCurrent, ui.uploadAverage, ui.uploadPeak].forEach((element) => setMetric(element, 0));
    ui.latency.textContent = "—"; ui.jitter.textContent = "—"; ui.summary.hidden = true; ui.summary.textContent = ""; setRating({ key: "waiting", label: "等待测速", detail: "完成后将明确显示慢、一般、良好、快或极快。" }); renderChart();
  }
  async function start() {
    if (activeController) return;
    if (global.WebWindows?.device?.network.getState().online === false || navigator.onLine === false) { setStatus("当前离线，无法开始测速。", true); return; }
    const ui = elements(); const profile = PROFILES[ui.profile.value] || PROFILES.light; activeController = new AbortController(); const overallTimer = setTimeout(() => activeController?.abort(new Error("整体测速超时")), profile.overallTimeoutMs);
    runStartedAt = performance.now(); resetUi(); setRunning(true); startChartTicker(); setStatus(`${t("正在使用")}${t(profile.label)}${t("档测试到 WebWindows 服务节点的链路速度。")}`.trim()); ui.progress.value = 1;
    try {
      ui.phase.textContent = "测量延迟与抖动"; const latency = await ping(activeController.signal, profile); const download = await runTransfer("download", activeController.signal, profile, 20, 40); const upload = await runTransfer("upload", activeController.signal, profile, 60, 40); ui.progress.value = 100;
      const down = formatRate(download.averageMbps); const up = formatRate(upload.averageMbps); ui.phase.textContent = "完成"; setRating(classifyExperience(download.averageMbps, upload.averageMbps));
      ui.summary.textContent = `${t("稳定区间平均")}: ${t("下载")} ${down.mbps} (${down.megabytes}) · ${t("上传")} ${up.mbps} (${up.megabytes}) · ${t("延迟")} ${latency.averageMs.toFixed(0)} ms · ${t("抖动")} ${latency.jitterMs.toFixed(0)} ms. ${t("结果仅代表当前设备到 WebWindows 服务节点的链路。")}`.trim();
      ui.summary.hidden = false; setStatus("测速完成。平均值仅统计预热后的稳定采样区间。重测可观察不同时间的波动。", false); ui.start.textContent = "重新测速";
    } catch (error) {
      if (error?.name === "AbortError" || activeController.signal.aborted) { setStatus(activeController.signal.reason?.message === "整体测速超时" ? "测速超时，已停止所有请求。" : "测速已取消，已停止所有请求。", false); ui.phase.textContent = "已停止"; }
      else { setStatus(`测速失败：${error?.message || "网络请求失败"}`, true); ui.phase.textContent = "失败"; }
    } finally { clearTimeout(overallTimer); stopChartTicker(); activeController = null; setRunning(false); }
  }
  document.addEventListener("DOMContentLoaded", () => { const ui = elements(); ui.start?.addEventListener("click", start); ui.cancel?.addEventListener("click", () => activeController?.abort(abortError())); resetUi(); }, { once: true });
})(typeof globalThis !== "undefined" ? globalThis : window);
