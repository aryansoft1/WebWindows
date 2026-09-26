import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * 事故回归：后台外壳 SystemManager/index.html 原来引用 ../assets/css/tailwind.min.css，
 * 而线上 /assets/css/tailwind.min.css 只有 201 字节（4 条规则的 fallback），
 * 于是外壳的 Tailwind 工具类全部落空 —— 深色侧栏没了、导航挤成顶部一行、
 * 用户看到的就是「后台首页样式丢失」。同一缺陷也存在于 SystemManager/datacenter.html。
 * 后台页现在使用本地样式，避免 CDN 不可用时外壳布局消失。
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(path.join(root, "deploy/ftp-manifest.json"), "utf8"));
const STUB = "assets/css/tailwind.min.css";
const LOCAL_UTILITIES = "SystemManager/assets/css/admin-utilities.css";

const offenders = [];
for (const relative of manifest.requiredFiles) {
  if (!/\.html?$/i.test(relative)) continue;
  const source = await readFile(path.join(root, ...relative.split("/")), "utf8");
  for (const [, reference] of source.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const clean = String(reference).split(/[?#]/)[0];
    if (!clean || /^(?:https?:|data:|\/\/|javascript:|#)/i.test(clean)) continue;
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(relative), clean));
    if (resolved === STUB) offenders.push(relative);
  }
}
assert.deepEqual(offenders, [],
  `deployed pages must not reference the Tailwind stub ${STUB}: ${offenders.join(", ")}`);

const shell = await readFile(path.join(root, "SystemManager/index.html"), "utf8");
assert.match(shell, /assets\/css\/admin-utilities\.css/,
  "the admin shell must load its local utility stylesheet");
// 外壳保留原有工具类，并由本地样式实现。
assert.doesNotMatch(shell, /cdn\.tailwindcss\.com|cdn\.jsdelivr\.net/,
  "the admin shell must not depend on a CDN");
for (const utility of ["flex", "h-screen", "overflow-hidden", "w-64", "bg-gray-800", "flex-shrink-0", "flex-1", "overflow-y-auto"]) {
  assert.ok(shell.includes(utility), `the admin shell must keep its layout utility class: ${utility}`);
}

const localSize = (await stat(path.join(root, LOCAL_UTILITIES))).size;
assert.ok(localSize > 2048, "the admin utility stylesheet must contain real layout and color rules");
const stubSize = (await stat(path.join(root, STUB))).size;
assert.ok(stubSize < 4096,
  `${STUB} is still the ${stubSize}-byte fallback stub, not a Tailwind build; never point a deployed page at it`);

console.log(`admin console style smoke test passed: no deployed page references the ${stubSize}-byte stub; the shell loads local utilities`);
