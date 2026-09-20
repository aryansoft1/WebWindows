import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [migration, collectorApi, collector, adminApi, adminPage, adminStyle, adminScript, adminShell, home, environmentConfigText] = await Promise.all([
  read("database/migrations/002_webwindows_visitor_analytics.sql"),
  read("api/visitor-analytics.asp"),
  read("assets/js/visitor-analytics.js"),
  read("admin_api/visitorAnalytics.asp"),
  read("SystemManager/visitor-analytics.html"),
  read("SystemManager/assets/css/visitor-analytics.css"),
  read("SystemManager/assets/js/visitor-analytics.js"),
  read("SystemManager/index.html"),
  read("index.html"),
  Promise.resolve('{"forwardedHeadersTrustedByApplication":false,"settings":[]}')
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

assert.match(adminApi, /include file="adminGuard\.asp"/);
assert.match(adminApi, /HTTP_X_WEBWINDOWS_ADMIN_REQUEST/);
assert.match(adminApi, /Session\("webwindows_admin"\) <> True/);
assert.match(adminApi, /COALESCE\(SUM\(visitor_type='registered'\),0\)/);
assert.match(adminApi, /COUNT\(DISTINCT visitor_key\)/);
assert.match(adminApi, /GROUP BY HOUR\(started_at\)/);
assert.match(adminApi, /SUM\(f\.active_seconds\)/);
assert.match(adminApi, /""sessionFeatures""/);

assert.match(adminPage, /访客统计/);
assert.match(adminPage, /请求 IP/);
assert.match(adminPage, /功能停留/);
assert.match(adminPage, /assets\/css\/visitor-analytics\.css/);
assert.doesNotMatch(adminPage, /tailwind\.min\.css/);
assert.match(adminStyle, /\.lg\\:grid-cols-6/);
assert.match(adminStyle, /\.bg-green-50/);
assert.match(adminScript, /X-WebWindows-Admin-Request/);
assert.doesNotMatch(adminScript, /innerHTML\s*=/);
assert.match(adminShell, /href="visitor-analytics\.html"[^>]*target="mainFrame"/);
assert.match(home, /assets\/js\/visitor-analytics\.js/);
assert.equal(environmentConfig.forwardedHeadersTrustedByApplication, false);
assert.match(collectorApi, /WEBWINDOWS_ANALYTICS_TRUST_IIS_GEO/);

console.log("visitor analytics smoke test passed");
