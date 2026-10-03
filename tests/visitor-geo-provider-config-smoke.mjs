import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * 端点配置门禁。
 *
 * 2026-09-26 事故：我配的「降级链」里三个端点有两个根本不能用 ——
 *   restapi.ip-api.com  连接失败；
 *   ipapi.co/json/{IP}  路径写错，返回 404 的 HTML（正确的 /{IP}/json/ 很快限流）。
 * 也就是说主端点一旦不可用，整条降级链等于不存在，而这件事静态检查看不出来、
 * 也不会在本地复现（要等生产出口网络）。所以把「实测结论」写成断言钉住。
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const example = readFileSync(path.join(root, "api/visitor-analytics.config.example.asp"), "utf8");
const include = readFileSync(path.join(root, "inc/visitor-geo.asp"), "utf8");

const endpoints = [...example.matchAll(/geoApiBase\s*=\s*"([^"]*)"/g)].map((m) => m[1]);
assert.equal(endpoints.length, 1, "the template must configure exactly one geoApiBase line");
const chain = endpoints[0].split(";").map((item) => item.trim()).filter(Boolean);

assert.ok(chain.length >= 2, "configure at least two endpoints so one provider outage degrades instead of failing");
for (const endpoint of chain) {
  assert.match(endpoint, /^https:\/\//, `plain http endpoints are rejected: ${endpoint}`);
  assert.ok(endpoint.includes("{IP}"), `every endpoint needs the {IP} placeholder: ${endpoint}`);
}

// 已实测不可用的端点：写回配置里等于让降级链再次形同虚设
const knownBad = [
  ["restapi.ip-api.com", "连接失败（2026-09-26 实测）"],
  ["ipapi.co/json/", "路径错误返回 404 HTML（2026-09-26 实测）"],
  ["api.ipquery.io", "字段结构不同，取不到国家（2026-09-26 实测）"],
  ["iphub.info", "需要 API key（2026-09-26 实测）"],
];
for (const [needle, why] of knownBad) {
  assert.ok(!chain.some((endpoint) => endpoint.includes(needle)),
    `${needle} must not be configured again: ${why}`);
}

// 世界地图按 ISO A2 代码着色：字段别名里必须保留 country_code 这一类
assert.match(include, /country_code\|countryCode\|code/,
  "the field aliases must accept country_code so the world map can colour a country");

// 供应商域名只允许出现在配置模板里，共享模块代码里不得写死
assert.doesNotMatch(
  include.replace(/^\s*'.*$/gm, ""),
  /ipwho\.is|ip\.sb|freeipapi|ip-api|ipapi\.co|ipquery|iphub/,
  "provider endpoints belong in the server-side config, never in tracked module code"
);

console.log(`visitor geo provider config smoke test passed: ${chain.length} endpoints, ${knownBad.length} known-bad entries rejected`);
