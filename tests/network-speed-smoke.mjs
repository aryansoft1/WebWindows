import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [source, html, css] = await Promise.all([
  read("assets/js/network-speed.js"),
  read("settings.html"),
  read("assets/css/settings.css")
]);

const context = { console, URL, AbortController, DOMException, setTimeout, clearTimeout, globalThis: null };
context.globalThis = context;
vm.runInNewContext(source, context, { filename: "network-speed.js" });
const core = context.WebWindowsNetworkSpeedCore;

assert.equal(core.classifySpeed(0).key, "slow");
assert.equal(core.classifySpeed(3).key, "fair");
assert.equal(core.classifySpeed(10).key, "good");
assert.equal(core.classifySpeed(50).key, "fast");
assert.equal(core.classifySpeed(200).key, "excellent");
assert.equal(core.classifyExperience(80, 2).key, "fair");
assert.equal(core.classifyExperience(80, 30).key, "fast");
assert.equal(core.summarizeTransfer([{ bytes: 1_000_000, durationMs: 1000 }]).averageMbps, 8);

assert.match(html, /id="networkSpeedRating"/);
assert.match(html, /慢、一般、良好、快或极快/);
assert.match(html, /network-chart-download-area/);
assert.match(html, /network-chart-upload-area/);
assert.match(html, /network-chart-download-point/);
assert.match(html, /network-chart-upload-point/);
assert.match(source, /SAMPLE_INTERVAL_MS\s*=\s*250/);
assert.match(source, /appendChartPoint/);
assert.match(source, /setInterval/);
assert.match(css, /network-speed-rating\.is-excellent/);
assert.match(css, /network-chart-download-area/);

console.log("network speed smoke test passed");
