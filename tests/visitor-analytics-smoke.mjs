import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [migration, collectorApi, collector, adminApi, adminPage, adminScript, adminIndex, home, environmentConfigText,
  adminCharts, adminCss, geoConfigExample, geoInclude] = await Promise.all([  read("database/migrations/002_webwindows_visitor_analytics.sql"),
  read("api/visitor-analytics.asp"),
  read("assets/js/visitor-analytics.js"),
  read("admin_api/visitorAnalytics.asp"),
  read("SystemManager/visitor-analytics.html"),
  read("SystemManager/assets/js/visitor-analytics.js"),
  read("SystemManager/index.html"),
  read("index.html"),
  read("data/deploy/production-environment-config-v1.json"),
  read("SystemManager/assets/js/visitor-analytics-charts.js"),
  read("SystemManager/assets/css/visitor-analytics.css"),
  read("api/visitor-analytics.config.example.asp"),
  read("inc/visitor-geo.asp")
]);
const environmentConfig = JSON.parse(environmentConfigText);
const geoExample = geoConfigExample;

assert.match(migration, /CREATE TABLE IF NOT EXISTS webwindows_visitor_sessions/);
assert.match(migration, /CREATE TABLE IF NOT EXISTS webwindows_visitor_feature_stats/);
assert.match(migration, /UNIQUE KEY uk_visitor_session_key/);
assert.match(migration, /FOREIGN KEY \(visitor_session_id\)/);

assert.match(collectorApi, /Request\.ServerVariables\("REMOTE_ADDR"\)/);
assert.match(collectorApi, /Session\("webwindows_user_id"\)/);
assert.match(collectorApi, /webwindows_developers WHERE user_id=\? AND status='approved'/);
assert.match(collectorApi, /ON DUPLICATE KEY UPDATE/);
assert.match(collectorApi, /webwindows_analytics_visitor_type/);
assert.match(collectorApi, /HTTP_SEC_FETCH_SITE/);
assert.doesNotMatch(collectorApi, /HTTP_X_FORWARDED_FOR|HTTP_FORWARDED|HTTP_CF_|HTTP_X_GEO/i);

assert.match(collector, /navigator\.globalPrivacyControl/);
assert.match(collector, /document\.visibilityState === "visible"/);
assert.match(collector, /\.window\.active/);
assert.match(collector, /navigator\.sendBeacon/);
assert.match(collector, /webwindows:login/);

assert.match(adminApi, /include file="\.\.\/inc\/admin-security\.asp"/);
assert.match(adminApi, /HTTP_X_WEBWINDOWS_ADMIN_REQUEST/);
assert.match(adminApi, /Session\("webwindows_admin"\) <> True/);
assert.match(adminApi, /AdminSecurityTokenShape/);
assert.match(adminApi, /COALESCE\(SUM\(visitor_type='registered'\),0\)/);
assert.match(adminApi, /COUNT\(DISTINCT visitor_key\)/);
assert.match(adminApi, /GROUP BY HOUR\(started_at\)/);
assert.match(adminApi, /SUM\(f\.active_seconds\)/);
assert.match(adminApi, /""sessionFeatures""/);

assert.match(adminPage, /访客统计/);
assert.match(adminPage, /请求 IP/);
assert.match(adminPage, /功能停留/);
assert.match(adminScript, /X-WebWindows-Admin-Request/);
assert.doesNotMatch(adminScript, /innerHTML\s*=/);
assert.match(adminIndex, /visitor-analytics\.html/);
assert.match(home, /assets\/js\/visitor-analytics\.js/);
assert.equal(environmentConfig.forwardedHeadersTrustedByApplication, false);
assert.ok(environmentConfig.settings.some((setting) => setting.name === "WEBWINDOWS_ANALYTICS_TRUST_IIS_GEO"));

// 地区解析：实现抽到共享 include（采集端 + 管理端补全历史地区共用，避免两份漂移）
assert.match(collectorApi, /include file="\.\.\/inc\/visitor-geo\.asp"/);
assert.match(adminApi, /include file="\.\.\/inc\/visitor-geo\.asp"/);
assert.match(collectorApi, /GeoResolve ipAddress/);
assert.match(geoInclude, /Sub ResolveVisitorGeo|Sub GeoResolve/);
assert.match(geoInclude, /WEBWINDOWS_ANALYTICS_TRUST_IIS_GEO/);
assert.match(geoInclude, /Function GeoIsPublicAddress/);
assert.match(geoInclude, /If Left\(address, 3\) = "10\." Then Exit Function/);
assert.match(geoInclude, /If Left\(address, 8\) = "192\.168\." Then Exit Function/);
assert.match(geoInclude, /secondOctet >= 16 And secondOctet <= 31/);
assert.match(geoInclude, /Sub GeoApplyCached/);
assert.match(geoInclude, /WHERE ip_address=\? AND \(country_code<>'' OR city_name<>''\)/);
assert.match(geoInclude, /Function GeoApiBudgetAvailable/);
assert.match(geoInclude, /Function GeoApiBudgetRemaining/);
assert.match(geoInclude, /GeoDailyCap/);
assert.match(geoInclude, /MSXML2\.ServerXMLHTTP\.6\.0/);
assert.match(geoInclude, /\.setTimeouts 2500, 2500, 3000, 3000/);
assert.match(geoInclude, /If LCase\(Left\(GeoApiBase, 8\)\) <> "https:\/\/" Then GeoApiBase = ""/);
assert.match(geoInclude, /GeoResolvedBy = "external-api"/);
assert.match(geoInclude, /visitor-analytics\.config\.asp/);
assert.match(geoInclude, /Function GeoIisTrusted/);
assert.match(geoInclude, /Function GeoExternalConfigured/);

// 2026-09-26 同一批查出的四个「静默失效」缺陷，全部锁死。
// 行为层面的验证在 tests/visitor-geo-runtime-smoke.mjs（那里真的把 VBScript 跑起来），
// 这里只负责防止把明显的错误写法再写回去。
// 只看可执行代码：注释里会刻意写出被禁用的写法（说明为什么禁用），不算命中。
const geoIncludeCode = geoInclude.split(/\r?\n/).filter((line) => !line.trim().startsWith("'")).join("\n");
assert.match(geoInclude, /If GeoIisTrusted\(\) Then/,
  "GeoResolve must read the IIS GeoIP switch through the module's own helper");
assert.doesNotMatch(geoIncludeCode, /SubMatches\((?:[5-9]|\d{2,})\)/,
  "no pattern in this module has more than four capture groups");
assert.match(geoIncludeCode, /Function GeoFailureSummary[\s\S]{0,4000}SubMatches\(3\)/,
  "GeoFailureSummary must read the result group too — that string is what the admin actually sees");
assert.match(geoInclude, /quoteMark & "\(" & aliasCsv & "\)" & quoteMark/,
  "the JSON field pattern must keep the key's closing quote (a missing one parses nothing while still returning 200)");
assert.match(geoInclude, /GeoAddDebug "cache"/,
  "the diagnostic must probe the same-IP session cache (a read-only SELECT, no budget) so we can tell \"resolved\" from \"actually persisted\"");
assert.match(geoInclude, /GeoAddDebug "budget"/,
  "the diagnostic must report the remaining daily budget");
for (const stage of ["stage-1", "stage-2", "stage-3", "stage-4", "stage-end"]) {
  assert.ok(geoInclude.includes(`"${stage}"`),
    `the self-diagnosing log must record ${stage} so a production stall points at itself`);
}
assert.match(geoInclude, /On Error Resume Next[\s\S]{0,400}Sub GeoDiagnoseSelf|Sub GeoDiagnoseSelf[\s\S]{0,400}On Error Resume Next/,
  "the diagnostic must fail open: it can never turn the public collector into a 500");
const loadExits = (geoInclude.match(/Exit Function/g) || []).length;
const loadResets = (geoInclude.match(/On Error GoTo 0/g) || []).length;
assert.ok(loadResets >= loadExits - 1,
  `every early exit in GeoLoadApiConfig must restore error handling (exits=${loadExits}, resets=${loadResets}); a leaked On Error Resume Next silently swallows later failures`);

// 多供应商降级链：单个供应商可能因出口网络/限流不可用
assert.match(geoInclude, /Function GeoApiEndpointCount/);
// 降级链必须有时间总预算：逐端点 2.5–3s 超时叠加起来会让访客等 8 秒以上
assert.match(geoInclude, /GeoTotalBudgetMs = 4000/);
assert.match(geoIncludeCode, /startedAt = Timer[\s\S]{0,200}>= GeoTotalBudgetMs Then Exit For/,
  "GeoResolve must stop walking the fallback chain once the total time budget is spent");

// 自愈式修复历史地址：IP 一直有记录，地区是后加的字段，地图不该依赖管理员记得点按钮。
// 硬约束：限频（20 分钟）、限量（3 个）、走同一份每日额度、fail-open，
// 以及 2026-09-26 补上的三条现实约束：单进程触发（web garden）、坏地址冷却、内网跳过。
assert.match(geoInclude, /Sub GeoRepairPending/);
assert.match(geoIncludeCode, /- lastRun < 20 Then/,
  "the automatic repair must be rate-limited, otherwise every page view would hammer the provider");
assert.match(geoIncludeCode, /Or attempted >= GeoRepairBatchMax/,
  "the automatic repair must stay bounded per run");
assert.match(geoIncludeCode, /Sub GeoRepairPending[\s\S]{0,900}GeoApiBudgetAvailable\(\)/,
  "the automatic repair must consume the same daily budget as every other lookup");
assert.match(geoIncludeCode, /Sub GeoRepairPending[\s\S]{0,400}On Error Resume Next/,
  "the automatic repair must be fail-open");
// web garden：每个工作进程各有 Application 变量表，只判重不锁内复查会按进程数重复消耗额度
assert.match(geoIncludeCode, /Application\.Lock[\s\S]{0,400}Application\(slotKey\) = nowMinutes[\s\S]{0,120}Application\.UnLock/,
  "the repair tick must be claimed under Application.Lock and re-checked inside the lock, or every worker process repairs");
// 坏地址冷却：解析不出来的地址不能每 20 分钟重试一次，否则真正的历史地址永远轮不到
assert.match(geoInclude, /Function GeoAddressOnCooldown/);
assert.match(geoIncludeCode, /nowMinutes - touchedAt < 360 Then/,
  "an address the provider cannot resolve must cool down for hours, not be retried every tick");
assert.match(geoIncludeCode, /GeoAddressTouched targetAddress/);
// 内网地址永远解析不出成功，不该每轮白占名额
assert.match(geoInclude, /Sub GeoSkipAddress/);
assert.match(geoIncludeCode, /Not GeoIsPublicAddress\(targetAddress\) Then\s*\n\s*GeoSkipAddress targetAddress/);
// 候选要多取一些，否则跳过内网/冷却后凑不满 3 个
assert.match(geoIncludeCode, /LIMIT 40/);
// 时间陷阱：VBScript 的 Date() 不含时间部分，Hour(Date()) 恒为 0。
// 2026-09-26 因此让「20 分钟闸门」变成永真 —— 自愈一次都没跑，
// 而闸门之前的额度检查每次页面访问白扣 1 次，额度就这样漏光。
assert.doesNotMatch(geoIncludeCode, /Hour\(Date\(\)\)|Minute\(Date\(\)\)/,
  "never take the time of day from Date(): it carries no time part, so a rate limit built on it is always true");
assert.match(geoInclude, /Function GeoMinuteOfDay/);
assert.match(geoIncludeCode, /Function GeoMinuteOfDay[\s\S]{0,200}Hour\(Now\(\)\)/);
// 诊断要能看到自愈结果，但**绝不能带地址**（诊断回显在公开接口上）
assert.match(geoInclude, /Function GeoRepairLastReport/);
assert.match(collectorApi, /GeoRepairLastReport\(\)/);
assert.doesNotMatch(geoInclude, /Sub GeoRepairReport[\s\S]{0,1200}?targetAddress/,
  "the repair report must never contain a visitor address");
assert.match(geoIncludeCode, /repaired-candidates=/);
const flushAt = collectorApi.indexOf("Response.Flush");
const repairAt = collectorApi.indexOf("GeoRepairPending");
assert.ok(flushAt > 0 && repairAt > flushAt,
  "the repair must run after Response.Flush so a visitor never waits for external lookups");
assert.match(collectorApi, /GeoRepairPending/);
// GET 自诊断：只用自己的地址，不能变成 IP 查询代理
const getDiagAt = collectorApi.indexOf("If isGetDiag Then");
const actionGuardAt = collectorApi.indexOf("ACTION_INVALID");
assert.ok(getDiagAt > 0 && getDiagAt < actionGuardAt,
  "the GET self-diagnosis must run before the action validation, or it is rejected with ACTION_INVALID");
assert.match(collectorApi, /If isGetDiag Then[\s\S]{0,200}GeoConfigureSub/,
  "the GET self-diagnosis must configure the config path itself (the POST path does it later, after the early exit)");
assert.match(collectorApi, /And Not isGetDiag Then/,
  "GET must be allowed only for the self-diagnosis, and only when debugGeo=1");
assert.match(collectorApi, /If isGetDiag Then[\s\S]{0,1200}GeoDiagnoseSelf/,
  "the GET self-diagnosis must run the diagnosis");
assert.match(collectorApi, /If isGetDiag Then[\s\S]{0,2400}Response\.End/,
  "the GET self-diagnosis must answer and stop before any session is written");
assert.match(geoInclude, /GeoRepairBatchMax = 6/);
assert.match(geoIncludeCode, /Or attempted >= GeoRepairBatchMax/);
assert.match(collectorApi, /Request\.QueryString\("debugGeo"\)/);
assert.doesNotMatch(collectorApi, /Request\.(QueryString|Form)\("(ip|target|addr|address)"\)/,
  "the collector must never accept a caller-supplied address to resolve");

// 补全失败必须逐条回报原因：只给「失败 N 个」等于让人猜。
assert.match(geoInclude, /Function GeoFailureSummary/);
assert.match(adminApi, /GeoFailureSummary\(\)/);
assert.match(adminApi, /""failures"":\[/);
assert.match(adminApi, /If failureCount < 5 Then/,
  "the backfill must cap how many per-address reasons it returns");
assert.match(adminScript, /payload\.failures/,
  "the analytics page must render the per-address failure reasons");
assert.match(adminScript, /whiteSpace = "pre-line"/,
  "the status line must be able to show one address per line");
assert.match(geoInclude, /Function GeoApiEndpointTemplate/);
assert.match(geoInclude, /Split\(GeoApiBase, ";"\)/);
assert.match(geoInclude, /Sub GeoApiAttempt/);
assert.match(geoInclude, /Sub GeoResetResult/);
assert.match(geoExample, /geoApiBase = "https:[^"]*;https:/,
  "the shipped template must configure more than one endpoint so a single provider outage degrades instead of failing");
assert.doesNotMatch(geoIncludeCode, /ipwho\.is|ip-api|ipapi\.co|db-ip|ip\.sb|freeipapi/,
  "provider endpoints belong in the server-side config file, never in tracked module code");

// 受限诊断：只回显调用者自己 IP 的解析过程，且必须仍然消耗每日额度
assert.match(geoInclude, /Sub GeoDiagnoseSelf/);
assert.match(geoInclude, /Request\.ServerVariables\("REMOTE_ADDR"\)/);
assert.match(geoInclude, /If Not GeoApiBudgetAvailable\(\) Then/);
assert.match(collectorApi, /debugGeo/);
assert.match(collectorApi, /GeoDiagnoseSelf/);
assert.match(collectorApi, /""geoDebug""/);

// 配置路径必须由调用方显式传入：Server.MapPath 的相对路径在 include 片段里
// 解析到 /inc/ 而不是调用方目录，2026-09-26 因此导致外部解析从未发起。
assert.match(geoInclude, /Sub GeoConfigureSub/);
assert.match(geoInclude, /configPath = GeoConfigPath/);
// 只看可执行代码：注释里会刻意写出被禁用的写法（说明为什么禁用），不算命中。
assert.doesNotMatch(geoIncludeCode, /EnvironmentFlag/,
  "EnvironmentFlag is defined neither in the repository nor on the server; the module must use its own GeoIisTrusted()");
const loadConfigBody = /Function GeoLoadApiConfig\(\)([\s\S]*?)\nEnd Function/.exec(geoIncludeCode)?.[1] ?? "";
assert.ok(loadConfigBody.includes("GeoApiBase"), "GeoLoadApiConfig must be found for the capture-group guard");
assert.doesNotMatch(loadConfigBody, /SubMatches\((?!0\))/,
  "GeoLoadApiConfig's patterns each have a single capture group, so only SubMatches(0) is valid — SubMatches(1) throws and the config is never read");
assert.doesNotMatch(geoIncludeCode, /Server\.MapPath\("visitor-analytics\.config\.asp"\)/,
  "the shared module must not resolve the config path itself; callers pass the resolved path");
assert.match(collectorApi, /GeoConfigureSub Server\.MapPath\("visitor-analytics\.config\.asp"\)/);
assert.match(adminApi, /GeoConfigureSub Server\.MapPath\("\.\.\/api\/visitor-analytics\.config\.asp"\)/);
assert.doesNotMatch(geoIncludeCode, /ipwho\.is|ipapi\.co|db-ip/,
  "provider endpoints belong in the server-side config file, never in tracked source");
assert.doesNotMatch(geoInclude, /HTTP_X_FORWARDED_FOR|HTTP_FORWARDED|HTTP_CF_|HTTP_X_GEO/i,
  "geolocation must never trust forwarded headers");

// 补全历史地区：管理员一键回填，让启用之前产生的会话也能上地图
assert.match(adminApi, /actionName = "backfill-geo"/);
assert.match(adminApi, /补全历史地区仅支持 POST/);
assert.match(adminApi, /AdminSecurityRequireMutation "visitor-analytics", "visitor-geo-backfill"/);
assert.match(adminApi, /GEO_NOT_CONFIGURED/);
assert.match(adminApi, /GROUP BY ip_address ORDER BY sessions DESC LIMIT/);
assert.match(adminApi, /UPDATE webwindows_visitor_sessions SET country_code=\?/);
assert.match(adminApi, /WHERE ip_address=\? AND \(country_code='' OR country_name='' OR city_name=''\)/);
assert.match(adminApi, /GeoApiBudgetRemaining\(\)/);
assert.match(adminApi, /""pendingAddresses""/);
assert.match(adminPage, /id="geoBackfill"/);
assert.match(adminPage, /id="geoBackfillStatus"/);
assert.match(adminPage, /admin-security\.js/);
assert.match(adminScript, /backfill-geo/);
assert.match(adminScript, /WebWindowsAdminSecurity\.authorize/);
assert.match(adminScript, /text-amber-800/);
assert.match(adminCss, /\.text-amber-800 \{/);

// 管理端聚合：地区来源 + 设备 + 停留时间 + 每日趋势 + 国家 + 中国省市
assert.match(adminApi, /""geo"":\{""source""/);
assert.match(adminApi, /SUM\(\(country_code<>'' OR city_name<>''\)\)/);
assert.match(adminApi, /GROUP BY device_type/);
assert.match(adminApi, /active_seconds<30/);
assert.match(adminApi, /DATE_FORMAT\(started_at,'%Y-%m-%d'\)/);
assert.match(adminApi, /GROUP BY country_code,country_name/);
assert.match(adminApi, /GROUP BY region_name,city_name/);
assert.match(adminApi, /country_code='CN' OR country_name='中国'/);
assert.match(adminApi, /""devices"":/);
assert.match(adminApi, /""dwell"":/);
assert.match(adminApi, /""daily"":/);
assert.match(adminApi, /""countries"":/);
assert.match(adminApi, /""chinaRegions"":/);

// 页面与图表：世界地图 + 中国下钻 + 设备/停留/趋势
assert.match(adminPage, /id="geoMap"/);
assert.match(adminPage, /id="geoBreadcrumb"/);
assert.match(adminPage, /id="deviceChart"/);
assert.match(adminPage, /id="dwellChart"/);
assert.match(adminPage, /id="trendChart"/);

// 每个窗口停留时间：必须是 KPI 之后的第一块，而不是被地图和图表挤到页面末尾
// （2026-09-26 用户反馈「每个窗口的停留时间看不到了」的根因就是区块顺序）。
assert.match(adminPage, /id="featureChart"/);
assert.match(adminPage, /id="featureSummary"/);
assert.match(adminPage, /每个窗口停留时间/);
assert.match(adminPage, /<th class="p-3">平均每次<\/th>/);
assert.match(adminPage, /<th class="p-3">停留占比<\/th>/);
assert.ok(adminPage.indexOf('id="featureChart"') < adminPage.indexOf('id="geoMap"'),
  "the per-window dwell section must stay above the map section");
assert.equal(adminPage.match(/id="featureRows"/g).length, 1,
  "the per-window dwell table must exist exactly once");
assert.match(adminCharts, /function renderFeatureDwell/);
assert.match(adminCharts, /\.slice\(0, 12\)/);
assert.match(adminCharts, /平均每次/);
assert.match(adminScript, /平均每次|perOpen/);
assert.match(adminScript, /停留占比|share/);
assert.match(adminCss, /\.h-feature \{/);
assert.match(adminCss, /\.h-2 \{/);
assert.match(adminCss, /\.bg-sky-500 \{/);
assert.match(adminPage, /echarts@5\.5\.1\/dist\/echarts\.min\.js/);
assert.match(adminPage, /visitor-analytics-charts\.js/);
assert.match(adminPage, /访客地区分布/);
assert.match(adminCharts, /natural-earth-vector/);
assert.match(adminCharts, /geo\.datav\.aliyun\.com\/areas_v3\/bound\//);
assert.match(adminCharts, /ISO_A2_EH/);
assert.match(adminCharts, /echarts\.registerMap/);
assert.match(adminCharts, /normalizePlace/);
assert.doesNotMatch(adminCharts, /innerHTML\s*=/, "charts must not assign innerHTML");
assert.match(adminCharts, /textContent/);
assert.match(adminScript, /WebWindowsVisitorCharts/);
assert.match(adminScript, /地区来源/);
assert.match(adminCss, /\.h-map \{/);
assert.match(geoConfigExample, /geoApiBase = "https/);
assert.match(geoConfigExample, /geoDailyCap/);
assert.match(geoConfigExample, /\{IP\}/);

console.log("visitor analytics smoke test passed");
