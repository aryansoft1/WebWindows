import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [migration, collectorApi, collector, adminApi, adminPage, adminScript, adminIndex, home, environmentConfigText,
  adminCharts, adminCss, geoConfigExample] = await Promise.all([
  read("database/migrations/002_webwindows_visitor_analytics.sql"),
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
  read("api/visitor-analytics.config.example.asp")
]);
const environmentConfig = JSON.parse(environmentConfigText);

assert.match(migration, /CREATE TABLE IF NOT EXISTS webwindows_visitor_sessions/);
assert.match(migration, /CREATE TABLE IF NOT EXISTS webwindows_visitor_feature_stats/);
assert.match(migration, /UNIQUE KEY uk_visitor_session_key/);
assert.match(migration, /FOREIGN KEY \(visitor_session_id\)/);

assert.match(collectorApi, /Request\.ServerVariables\("REMOTE_ADDR"\)/);
assert.match(collectorApi, /WEBWINDOWS_ANALYTICS_TRUST_IIS_GEO/);
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

// 地区解析：IIS GeoIP 优先，其次同 IP 历史缓存，最后才是外部 API。
assert.match(collectorApi, /Sub ResolveVisitorGeo/);
assert.match(collectorApi, /ResolveVisitorGeo ipAddress/);
assert.match(collectorApi, /Function IsPublicAddress/);
assert.match(collectorApi, /If Left\(address, 3\) = "10\." Then Exit Function/);
assert.match(collectorApi, /If Left\(address, 8\) = "192\.168\." Then Exit Function/);
assert.match(collectorApi, /secondOctet >= 16 And secondOctet <= 31/);
assert.match(collectorApi, /Sub ApplyCachedGeo/);
assert.match(collectorApi, /WHERE ip_address=\? AND \(country_code<>'' OR city_name<>''\)/);
assert.match(collectorApi, /Function GeoApiBudgetAvailable/);
assert.match(collectorApi, /geoDailyCap/);
assert.match(collectorApi, /MSXML2\.ServerXMLHTTP\.6\.0/);
assert.match(collectorApi, /http\.setTimeouts 2500, 2500, 3000, 3000/);
assert.match(collectorApi, /LCase\(Left\(geoApiBase, 8\)\) <> "https:\/\/"/);
assert.match(collectorApi, /If LCase\(Left\(geoApiBase, 8\)\) <> "https:\/\/" Then geoApiBase = ""/);
assert.match(collectorApi, /geoResolvedBy = "external-api"/);
assert.match(collectorApi, /visitor-analytics\.config\.asp/);
assert.doesNotMatch(collectorApi, /ipwho\.is|ipapi\.co|db-ip/,
  "provider endpoints belong in the server-side config file, never in tracked source");

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
