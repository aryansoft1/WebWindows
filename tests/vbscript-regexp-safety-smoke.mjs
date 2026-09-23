import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/*
 * VBScript RegExp 安全冒烟：
 *   VBScript 的 RegExp 只有 Global / IgnoreCase / MultiLine / Pattern 四个可写属性，
 *   且不支持 lookbehind（(?<= / (?<!）与命名分组（(?<name>）。
 *   误用 JavaScript 侧属性（例如 re.SingleLine）在编译期不报错，
 *   运行时抛 800A01B6 → HTTP 500——api/railway-proxy.asp 曾因此
 *   让全部 leftTicket/schedule 查票请求 100% 失败，而 cscript 语法冒烟
 *   （只查编译期 800A03xx）完全测不到。
 *   本测试扫描所有被 git 跟踪的 .asp 的服务端代码块（工作区字节），杜绝回归。
 */

const BAD_PROPERTY = /\.(SingleLine|dotAll|sticky|hasIndices|unicodeSets|unicode|lastIndex|source)\s*=/;
const BAD_PATTERN = /\(\?<[=!]|\(\?<[A-Za-z_]/;

const files = execFileSync("git", ["ls-files", "*.asp"], { encoding: "utf8" })
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

assert.ok(files.length >= 10, `expected tracked asp files, got ${files.length}`);

let scannedBlocks = 0;

for (const relative of files) {
  const asp = readFileSync(relative, "utf8");
  const serverBlocks = [...asp.matchAll(/<%(?![@=])([\s\S]*?)%>/g)].map((match) => match[1]);
  for (const block of serverBlocks) {
    scannedBlocks += 1;
    assert.doesNotMatch(
      block,
      BAD_PROPERTY,
      `${relative} 使用了 VBScript RegExp 不存在的属性（运行时 800A01B6 → HTTP 500）`
    );
    assert.doesNotMatch(
      block,
      BAD_PATTERN,
      `${relative} 的正则含 VBScript 不支持的 lookbehind/命名分组（运行时 5017 → HTTP 500）`
    );
  }
}

assert.ok(scannedBlocks >= 50, `expected to scan many server blocks, got ${scannedBlocks}`);

console.log(`vbscript regexp safety smoke test passed: ${files.length} asp files, ${scannedBlocks} server blocks`);
