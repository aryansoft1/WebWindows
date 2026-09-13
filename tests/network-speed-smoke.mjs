import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const clientSource = await fs.readFile(new URL("assets/js/network-speed.js", root), "utf8");
const endpointDirective = await fs.readFile(new URL("api/network-speed.ashx", root), "utf8");
const endpointSource = await fs.readFile(new URL("App_Code/WebWindowsNetworkSpeed.cs", root), "utf8");
const settingsSource = await fs.readFile(new URL("settings.html", root), "utf8");
const languageSource = await fs.readFile(new URL("assets/js/tw.js", root), "utf8");

const context = {
  console,
  URL,
  AbortController,
  DOMException,
  setTimeout,
  clearTimeout
};
context.globalThis = context;
vm.runInNewContext(clientSource, context, { filename: "network-speed.js" });
const core = context.WebWindowsNetworkSpeedCore;

assert.equal(core.bytesToMbps(1_000_000, 1000), 8, "1 MB in one second must be 8 Mbps");
assert.equal(core.mbpsToMBps(80), 10, "Mbps to MB/s must divide by eight");
assert.deepEqual(
  { ...core.formatRate(16) },
  { mbps: "16.0 Mbps", megabytes: "2.00 MB/s" }
);

const transfer = core.summarizeTransfer([
  { bytes: 9_000_000, durationMs: 10, stable: false },
  { bytes: 1_000_000, durationMs: 1000, stable: true },
  { bytes: 2_000_000, durationMs: 1000, stable: true },
  { bytes: -1, durationMs: 1000, stable: true },
  { bytes: 1, durationMs: 0, stable: true }
]);
assert.equal(transfer.sampleCount, 2, "warm-up and invalid samples must be excluded");
assert.equal(transfer.averageMbps, 12, "average must use stable total bytes over stable total duration");
assert.equal(transfer.currentMbps, 16);
assert.equal(transfer.peakMbps, 16);

const latency = core.summarizeLatency([20, 30, 25]);
assert.equal(latency.averageMs, 25);
assert.equal(latency.jitterMs, 7.5, "jitter is mean absolute difference between stable pings");
assert.equal(core.adaptiveSize(0, 262144, 4194304, 1800), 262144);
assert.equal(core.adaptiveSize(10000, 262144, 4194304, 1800), 4194304);

const urlOne = core.cacheBustedUrl("api/network-speed.ashx", "download", 1024, "one", "https://example.test/settings.html");
const urlTwo = core.cacheBustedUrl("api/network-speed.ashx", "download", 1024, "two", "https://example.test/settings.html");
assert.notEqual(urlOne, urlTwo, "every request needs a distinct cache-busting nonce");
assert.match(urlOne, /action=download/);
assert.match(urlOne, /size=1024/);

const parent = new AbortController();
const timed = core.createTimedSignal(parent.signal, 5000);
parent.abort(new DOMException("cancelled", "AbortError"));
assert.equal(timed.signal.aborted, true, "user cancellation must propagate to request signals");
timed.dispose();
const expiring = core.createTimedSignal(null, 5);
await new Promise((resolve) => setTimeout(resolve, 15));
assert.equal(expiring.signal.aborted, true, "request timeout must abort stalled requests");
assert.match(String(expiring.signal.reason?.message), /超时/);
expiring.dispose();

assert.match(clientSource, /cache:\s*"no-store"/);
assert.match(clientSource, /overallTimeoutMs/);
assert.match(clientSource, /downloadWarmupBytes/);
assert.match(clientSource, /uploadWarmupBytes/);
assert.match(clientSource, /hardwareConcurrency/);
assert.doesNotMatch(clientSource, /wall4\.jpg|networkSpeedResult/);

assert.match(endpointSource, /MaxDownloadBytes\s*=\s*4\s*\*\s*1024\s*\*\s*1024/);
assert.match(endpointDirective, /Class="WebWindowsNetworkSpeed"/);
assert.match(endpointSource, /MaxUploadBytes\s*=\s*2\s*\*\s*1024\s*\*\s*1024/);
assert.match(endpointSource, /MaxRequestsPerMinute\s*=\s*40/);
assert.match(endpointSource, /MaxConcurrentTransfers\s*=\s*12/);
assert.match(endpointSource, /X-WebWindows-Speed-Test/);
assert.match(endpointSource, /SetNoStore\(\)/);
assert.match(endpointSource, /DiscardUpload/);
assert.match(endpointSource, /stored\\\":false/);
assert.doesNotMatch(endpointSource, /SaveAs|File\.Write|WriteAllBytes/);
assert.doesNotMatch(endpointSource, /UserHostAddress[^\n]+Response|Remote_ADDR[^\n]+Response/i);

for (const id of [
  "networkSpeedChart", "networkSpeedDownloadCurrent", "networkSpeedDownloadAverage",
  "networkSpeedDownloadPeak", "networkSpeedUploadCurrent", "networkSpeedUploadAverage",
  "networkSpeedUploadPeak", "networkSpeedLatency", "networkSpeedJitter", "networkSpeedCancel"
]) {
  assert.match(settingsSource, new RegExp(`id=["']${id}["']`), `missing UI element ${id}`);
}
assert.match(settingsSource, /WebWindows 服务节点/);
assert.doesNotMatch(settingsSource, /公网带宽|运营商带宽/);
for (const phrase of ["到 WebWindows 服务节点的链路速度", "测速已取消，已停止所有请求。", "测速完成。平均值仅统计预热后的稳定采样区间。重测可观察不同时间的波动。"]) {
  assert.equal((languageSource.match(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length >= 3, true, `missing multilingual coverage: ${phrase}`);
}

console.log("network speed statistics, units, cancellation, cache and endpoint limit tests passed");
