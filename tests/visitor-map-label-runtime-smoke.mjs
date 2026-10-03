import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * 世界地图显示名的**行为**门禁。
 *
 * 2026-09-26 线上事故：显示名覆盖只写在「命中访客数据」的分支里，于是
 *   - 有记录的国家：CN → ROC（正确）
 *   - 没记录的国家：回退成 GeoJSON 的英文名，用户看到的是 "Mongolia" 而不是 ROC-MN
 * 而且地图上的**悬停标签**也用同一份 display，所以标签与 tooltip 一起错。
 *
 * 静态断言看不出这类「分支覆盖不全」的错误 —— 只有把函数抽出来跑真实场景才能发现。
 * 这里抽取 aggregateWorld / toSeriesData 两个纯函数，配最小桩（state / mapMeta）执行。
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(path.join(root, "SystemManager/assets/js/visitor-analytics-charts.js"), "utf8");

function extractFunction(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start > 0, `${name} not found`);
  let depth = 0;
  let index = source.indexOf("{", start);
  for (let i = index; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    else if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`${name}: unbalanced braces`);
}

const aggregateWorld = extractFunction("aggregateWorld");
const toSeriesData = extractFunction("toSeriesData");

// 覆盖表也用真实源码里的那份，避免门禁和产品各写一份
const tableMatch = /const COUNTRY_DISPLAY_NAMES = \{([^}]*)\}/.exec(source);
assert.ok(tableMatch, "COUNTRY_DISPLAY_NAMES not found");
const displayTable = `{${tableMatch[1]}}`;

// 静态：覆盖必须在 toSeriesData 里、且与 hit 无关；世界地图必须传覆盖表
assert.doesNotMatch(aggregateWorld, /COUNTRY_DISPLAY_NAMES/,
  "the override must live in toSeriesData only, otherwise the two places drift apart");
assert.match(toSeriesData, /const override = table \? table\[key\] : "";/,
  "the override must be resolved from the feature key, not from the matched record");
assert.match(toSeriesData, /display: override \|\| \(hit && hit\.display\)/,
  "the override must win over both the provider name and the GeoJSON fallback name");
assert.match(source, /toSeriesData\(aggregateWorld\(\), features, null, COUNTRY_DISPLAY_NAMES\)/,
  "the world map must pass the override table");
const drillCalls = source.match(/toSeriesData\(\s*aggregateChina/g) || [];
assert.equal(drillCalls.length, 2, "both China drill-down calls must exist");
assert.doesNotMatch(source, /toSeriesData\(\s*aggregateChina[^;]*COUNTRY_DISPLAY_NAMES/,
  "the China drill-down must not use the country override table — its keys are Chinese place names");

const scratch = mkdtempSync(path.join(os.tmpdir(), "ww-map-label-"));
const script = `
const COUNTRY_DISPLAY_NAMES = ${displayTable};
const state = { payload: null };
const mapMeta = new Map();
const normalizePlace = (value) => String(value || "").trim();

${aggregateWorld}
${toSeriesData}

// 场景：JP 有数据、CN 有数据、MN 无数据、FR 无数据、DE 无数据
state.payload = {
  countries: [
    { code: "jp", name: "日本", sessions: 5, visitors: 3 },
    { code: "cn", name: "中国", sessions: 7, visitors: 2 }
  ]
};
const features = [
  { properties: { name: "JP", NAME: "Japan" } },
  { properties: { name: "CN", NAME: "China" } },
  { properties: { name: "MN", NAME: "Mongolia" } },
  { properties: { name: "FR", NAME: "France" } },
  { properties: { name: "DE", NAME: "Germany" } },
  { properties: { name: "X-UNKNOWN", NAME: "Nowhere" } }
];
const { series, covered } = toSeriesData(aggregateWorld(), features, null, COUNTRY_DISPLAY_NAMES);
const out = { covered, series: {}, display: {} };
for (const item of series) out.series[item.name] = item.value;
for (const key of mapMeta.keys()) out.display[key] = mapMeta.get(key).display;

// 中国下钻：键是中文区划名，不能套用国家覆盖表
const cnFeatures = [{ properties: { name: "江苏省", NAME: "江苏省" } }];
const { series: cnSeries } = toSeriesData(
  new Map([["江苏省", { value: 3, visitors: 2, display: "江苏省" }]]), cnFeatures, normalizePlace
);
out.drill = cnSeries[0].name + "=" + cnSeries[0].value;

console.log(JSON.stringify(out));
`;
const scriptPath = path.join(scratch, "label-check.mjs");
writeFileSync(scriptPath, script.replace(/\r?\n/g, "\n"), "utf8");

let stdout = "";
let failed = false;
try {
  stdout = execFileSync(process.execPath, [scriptPath], { encoding: "utf8", timeout: 60000, windowsHide: true });
} catch (error) {
  failed = true;
  stdout = `${error.stdout || ""}\n${error.stderr || ""}`.trim() || "(no output)";
  stdout += `\n(harness kept at ${scriptPath})`;
}
if (!process.env.WW_KEEP_HARNESS) rmSync(scratch, { recursive: true, force: true });
assert.ok(!failed, `the map label harness must run cleanly:\n${stdout}`);

const out = JSON.parse(stdout.trim());

// 有记录 → 覆盖名生效
assert.equal(out.display.CN, "ROC", "CN with data must display as ROC");
assert.equal(out.display.JP, "日本", "a country without an override keeps the provider name");
// **没记录也必须是覆盖名**（这就是线上事故）
assert.equal(out.display.MN, "ROC-MN", "MN without data must still display as ROC-MN, not Mongolia");
assert.equal(out.display.FR, "France", "a country with neither override nor data falls back to the GeoJSON name");
assert.equal(out.display.DE, "France".replace("France", "Germany"), "fallback name for DE");
assert.equal(out.display["X-UNKNOWN"], "Nowhere", "features without an ISO code keep their NAME");

// 数值与覆盖无关：着色仍按会话数
assert.equal(out.series.CN, 7, "CN must keep its session count");
assert.equal(out.series.MN, 0, "MN must stay 0 — the label is presentational only");
assert.equal(out.covered, 2, "only countries with records count as covered");

// 中国下钻不受影响
assert.equal(out.drill, "江苏省=3", "the China drill-down must be unaffected");

console.log(`map label runtime smoke test passed: display=${JSON.stringify(out.display)}`);
