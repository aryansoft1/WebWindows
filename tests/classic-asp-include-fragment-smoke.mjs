import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

/*
 * 纯 include 片段门禁。
 *
 * 2026-09-26 线上事故：inc/visitor-geo.asp 的注释里写了 Language 码页指令的样子，
 * 那个 ASP 定界符提前结束了 include 的脚本块，于是该文件剩余的源码被当成正文
 * 回显 —— 公共采集接口 /api/visitor-analytics.asp 的响应变成 11 KB 源码而不是
 * {"ok":true}。cscript 编译期检查测不到（VBScript 侧完全合法），只有真实响应才能
 * 发现，因此固化成门禁。
 *
 * 检查两件事：
 *   1) 任何被 <!--#include --> 引用的文件必须是「单一脚本块片段」：以定界符开头、
 *      以配对定界符结尾、块内不得再出现任何定界符；
 *   2) 任何 tracked .asp 的注释行都不得出现定界符（哪怕文件不是片段）——
 *      这是同一个事故的通用形态。
 */
const root = process.cwd();
const files = execFileSync("git", ["ls-files", "*.asp"], { encoding: "utf8" })
  .split(/\r?\n/).filter(Boolean);

const included = new Set();
for (const relative of files) {
  const text = readFileSync(relative, "utf8");
  for (const [, target] of text.matchAll(/<!--#include\s+file="([^"]+)"\s*-->/gi)) {
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(relative), target));
    included.add(resolved);
  }
}

assert.ok(included.size >= 5, `expected several include targets, got ${included.size}`);

let audited = 0;
for (const relative of [...included].sort()) {
  if (!existsSync(path.join(root, relative))) continue;
  const text = readFileSync(path.join(root, relative), "utf8").replace(/^<%@[^%]*%>\s*/, "");
  audited += 1;
  assert.ok(/^<%[\s\S]*%>\s*$/.test(text.trim()),
    `${relative} is included by other pages, so it must be exactly one script block`);
  const inner = text.trim().slice(2, -2);
  assert.doesNotMatch(inner, /<%|%>/,
    `${relative} must not contain ASP delimiters inside the block — an extra delimiter (even inside a comment) ends the block early and leaks the remaining source as response body`);
}

let commentHits = 0;
for (const relative of files) {
  const lines = readFileSync(relative, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.trim().startsWith("'") && /<%|%>/.test(line)) {
      commentHits += 1;
      console.log(`${relative}:${index + 1}  ${line.trim().slice(0, 120)}`);
    }
  });
}
assert.equal(commentHits, 0,
  "ASP comment lines must not contain ASP delimiters (an extra delimiter ends the script block early)");

assert.ok(audited >= 4, `expected to audit several include fragments, got ${audited}`);
console.log(`classic ASP include fragment smoke test passed: ${audited} included fragments, ${files.length} asp files scanned`);
