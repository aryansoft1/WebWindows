import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * 事故回归：2026-09-26 线上 adminAuth.asp?action=captcha 恒 500（ASP 0126
 * 「找不到包含文件 ../inc/admin-security.asp」），而 inc/admin-security.asp
 * 从未进入 requiredFiles、从未上传；登录页又把 IIS 的 HTML 错误页当 JSON 解析，
 * 于是用户只看到 "Unexpected token '<'"。同类事故此前已发生过一次
 * （inc/trust-schema.asp 漏登记，见 T-031），因此把「已部署 ASP 的每一个
 * SHTML include 目标都必须被清单纳管」固化成门禁。
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(path.join(root, "deploy/ftp-manifest.json"), "utf8"));
const managed = new Set(manifest.requiredFiles);

/*
 * 服务端配置由主机本地创建、带真实凭据，既不允许从仓库上传（T-033：
 * 生产 web.config / inc/conn.asp 含真实 DB 凭据，仓库副本是占位版），
 * 也不在仓库里存在（*.config.asp 被 .gitignore 覆盖，只入库 example 模板）。
 * 它们可以合法地被 include，但必须逐个显式列出，不允许通配豁免整个 inc/。
 */
const serverSideConfig = [
  "inc/conn.asp",
  "inc/validator-deployment-config.asp"
];
const isServerSideConfig = (relative) =>
  serverSideConfig.includes(relative) || relative.endsWith(".config.asp");

const unmanagedIncludes = [];
let audited = 0;
for (const relative of manifest.requiredFiles) {
  if (!relative.endsWith(".asp")) continue;
  let source;
  try {
    source = await readFile(path.join(root, ...relative.split("/")), "utf8");
  } catch {
    continue; // 线上比本分支更新的文件（记录侧漂移）由清单对账负责，不在此处断言
  }
  audited += 1;
  for (const [, target] of source.matchAll(/<!--#include\s+file="([^"]+)"\s*-->/gi)) {
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(relative), target));
    if (managed.has(resolved) || isServerSideConfig(resolved)) continue;
    unmanagedIncludes.push(`${relative} -> ${resolved}`);
  }
}
assert.ok(audited > 0, "deployment manifest must list classic ASP endpoints");
assert.deepEqual(unmanagedIncludes, [],
  `every SHTML include of a deployed ASP must be recorded in the deployment manifest: ${unmanagedIncludes.join("; ")}`);

// 后台登录整条链（服务端 include + 登录页 + 客户端 + 样式）必须成套纳管。
for (const relative of [
  "admin_api/adminAuth.asp",
  "inc/admin-security.asp",
  "SystemManager/login.html",
  "SystemManager/assets/js/admin-login.js",
  "SystemManager/assets/css/admin-login.css"
]) {
  assert.ok(managed.has(relative), `admin login stack must remain managed: ${relative}`);
  assert.ok(manifest.integrity?.[relative]?.sha256, `admin login stack needs an integrity record: ${relative}`);
}

const [authApi, loginPage, loginClient] = await Promise.all([
  readFile(path.join(root, "admin_api/adminAuth.asp"), "utf8"),
  readFile(path.join(root, "SystemManager/login.html"), "utf8"),
  readFile(path.join(root, "SystemManager/assets/js/admin-login.js"), "utf8")
]);

assert.match(authApi, /include file="\.\.\/inc\/admin-security\.asp"/);
assert.match(authApi, /AdminSecurityRequirePreAuthMutation "admin-auth", "login"/);
assert.match(loginPage, /id="adminLoginForm"/);
assert.match(loginPage, /assets\/js\/admin-login\.js\?v=/,
  "the login page must cache-stamp the login client so a fix is not shadowed by a stale script");
assert.match(loginClient, /payload\.csrfToken/);
assert.match(loginClient, /"X-WebWindows-CSRF": csrfToken/);
// 非 JSON 响应（IIS HTML 错误页、网关错误页）必须变成可读中文提示，而不是 SyntaxError。
assert.match(loginClient, /readJsonPayload/);
assert.doesNotMatch(loginClient, /await response\.json\(\)/);
assert.match(loginClient, /ADMIN_RESPONSE_NOT_JSON/);

const adminSecurity = await readFile(path.join(root, "inc/admin-security.asp"), "utf8");
assert.equal(createHash("sha256").update(Buffer.from(adminSecurity, "utf8")).digest("hex"),
  manifest.integrity["inc/admin-security.asp"].sha256,
  "the managed admin security include must be the tracked repository copy, not a hand-edited variant");

/*
 * inc/admin-security.asp 自带中文字符串却没有 <%@ Language %> 声明（与
 * inc/conn.asp、inc/trust-schema.asp 一致，都是纯 include 片段）。
 * 它依赖宿主页面声明 CodePage=65001：IIS 按系统 ANSI（本机 936）读取无 BOM 的
 * UTF-8 源文件会把中文多字节拆坏，编译期报「未结束的字符串常量」（同 T-032
 * longdistance-proxy 事故）。因此这里钉住「每个 includer 都必须显式声明码页」。
 */
const includers = [];
const skipDirectories = new Set(["node_modules", "dist", "deploy"]);
async function collectAspFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || skipDirectories.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await collectAspFiles(full));
    else if (entry.name.toLowerCase().endsWith(".asp")) found.push(full);
  }
  return found;
}
for (const file of await collectAspFiles(root)) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  const source = await readFile(file, "utf8");
  if (!/<!--#include\s+file="\.\.\/inc\/admin-security\.asp"\s*-->/i.test(source)) continue;
  includers.push(relative);
  const [directive] = source.split(/\r?\n/);
  assert.match(directive, /CodePage\s*=\s*"?65001"?/i,
    `${relative} includes inc/admin-security.asp and must declare CodePage=65001 on its first line`);
}
assert.ok(includers.length >= 7, `expected the full admin endpoint set, found ${includers.length}: ${includers.join(", ")}`);

console.log(`deployment ASP include smoke test passed: ${audited} ASP endpoints audited, ` +
  `${includers.length} admin endpoints keep the CodePage=65001 codepage precondition`);
