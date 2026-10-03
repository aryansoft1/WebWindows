#!/usr/bin/env node
/**
 * 换行符归一化 —— 让工作区符合 .gitattributes 的 SHA-256 可移植性契约。
 *
 * 背景：.gitattributes 声明 `*.html/*.js/*.json/*.asp/... text eol=lf`，
 * 意思是「干净检出恒为 LF」。但历史上以 CRLF 落盘、之后从未被重新检出的文件，
 * 工作区仍是 CRLF，git 因为归一化后内容相同而认为它 clean，于是：
 *   工作区 CRLF != 干净检出的 LF
 * 凡是钉住工作区字节哈希/字节数的地方（deploy/ftp-manifest.json 的 uploadFiles、
 * data/deploy/production-rehearsal-manifest-v1.json 的 artifacts）都会在干净检出对不上。
 *
 * 本工具只做两件事，**不生成、不修改任何 manifest**（规则 6：manifest 必须用官方工具重生成）：
 *   1. 给 .gitattributes 补自规则 `.gitattributes text eol=lf` ——
 *      它的规则清单原本漏了自己，导致干净检出被 core.autocrlf=true 反向转成 CRLF。
 *   2. 把「内容与 HEAD 逐行等价、仅换行符不同」的已跟踪文件改写为 HEAD 字节。
 *
 * 安全约束（硬性）：
 *   - 只碰 norm(worktree) === norm(HEAD) 的文件，即纯换行符差异。
 *     内容有任何实质差异（用户 WIP）一律跳过，绝不覆盖。
 *   - 只碰被 .gitattributes eol=lf 规则覆盖的扩展名。
 *     未覆盖的文件干净检出同样是 CRLF，不存在漂移，改它反而制造差异。
 *   - 改写后内容与 HEAD 归一化等价，git status 依然 clean，不产生待提交内容。
 *   - 若本次部署的 uploadFiles 仍是脏的，直接拒绝运行：此时重新生成 manifest
 *     会把未提交内容钉进去，干净检出必然哈希对不上。
 *
 * 用法：node tools/normalize-line-endings.mjs
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, lstatSync } from "node:fs";

const isFile = (p) => { try { return lstatSync(p).isFile(); } catch { return false; } };
/** 与 .gitattributes 中 text eol=lf 的覆盖面保持一致。 */
const LF_RULES = [/\.asp$/i, /\.config$/i, /\.css$/i, /\.d\.ts$/i, /\.html?$/i, /\.js$/i,
  /\.json$/i, /\.md$/i, /\.mjs$/i, /\.ps1$/i, /\.sql$/i, /\.vue$/i, /\.xml$/i];
const coveredByEolLf = (f) => LF_RULES.some((re) => re.test(f));
/** CRLF -> LF，用于判断「仅换行符不同」。 */
const normalize = (b) => Buffer.from(b.toString("binary").replace(/\r\n/g, "\n"), "binary");
const head = (f) => execSync(`git show HEAD:${f}`, { maxBuffer: 1e8, stdio: ["ignore", "pipe", "ignore"] });
const porcelain = (f) => execSync(`git status --porcelain -- "${f}"`, { encoding: "utf8", maxBuffer: 1e8 }).trim();

const fatal = (msg) => { console.error(`\n[normalize-line-endings] 拒绝执行：${msg}`); process.exit(1); };

// ---- 守卫：本次 uploadFiles 若仍脏，重新生成 manifest 会钉住未提交内容 ----
const manifestPath = "deploy/ftp-manifest.json";
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const dirtyUploads = (manifest.uploadFiles || [])
    .filter((f) => f !== manifestPath && existsSync(f) && porcelain(f) !== "");
  if (dirtyUploads.length) {
    fatal([
      "以下 uploadFiles 仍是脏的（manifest 必须描述已提交状态，否则干净检出对不上）：",
      ...dirtyUploads.map((f) => `      ${porcelain(f)}  ${f}`),
      "      先提交它们，再用 tools/update-deployment-manifest.mjs 重生成 manifest，然后才跑本工具。"
    ].join("\n"));
  }
}

// ---- 1. .gitattributes 自规则 ----
let gaPath = ".gitattributes";
if (existsSync(gaPath)) {
  const before = readFileSync(gaPath);
  const text = before.toString("utf8");
  if (!/^\s*\.gitattributes\s+text\s+eol=lf\s*$/m.test(text)) {
    const patched = /(^# Deployment artifacts[^\n]*\n)/m.test(text)
      ? text.replace(/(^# Deployment artifacts[^\n]*\n)/m, "$1.gitattributes text eol=lf\n")
      : ".gitattributes text eol=lf\n" + text;
    writeFileSync(gaPath, patched, "utf8");
    console.log(`[normalize-line-endings] .gitattributes: 已补自规则 ${before.length}B -> ${readFileSync(gaPath).length}B`);
  } else {
    console.log("[normalize-line-endings] .gitattributes: 自规则已存在");
  }
} else {
  console.log("[normalize-line-endings] .gitattributes: 不存在，跳过");
}

// ---- 2. 纯换行符差异 -> 改写为 HEAD 字节 ----
const files = execSync("git ls-files -z", { maxBuffer: 1e8 }).toString().split("\0").filter(Boolean);
const rewritten = [];
const skippedWip = [];
const skippedUncovered = [];
let alreadyConsistent = 0;

for (const f of files) {
  if (!existsSync(f) || !isFile(f)) continue;   // 跳过目录 / gitlink / 已删除
  let base;
  try { base = head(f); } catch { continue; }    // 不在 HEAD（新增未提交），不碰
  const wt = readFileSync(f);
  if (wt.equals(base)) { alreadyConsistent++; continue; }
  if (!normalize(wt).equals(normalize(base))) { skippedWip.push(f); continue; }   // 内容实质不同：用户 WIP
  if (!coveredByEolLf(f)) { skippedUncovered.push(f); continue; }                 // 不受 eol=lf 约束
  writeFileSync(f, base);                                                          // 纯换行符等价
  rewritten.push({ f, from: wt.length, to: base.length });
}

console.log(`[normalize-line-endings] 与 HEAD 已一致 : ${alreadyConsistent}`);
rewritten.forEach(({ f, from, to }) => console.log(`[normalize-line-endings]   改写 ${f}  ${from}B -> ${to}B`));
console.log(`[normalize-line-endings] 改写为 LF      : ${rewritten.length}`);
console.log(`[normalize-line-endings] 内容不同跳过   : ${skippedWip.length}（用户 WIP，一律不动）`);
console.log(`[normalize-line-endings] 未被 eol=lf 覆盖: ${skippedUncovered.length}（干净检出同样是 CRLF，无漂移）`);

if (skippedWip.length) {
  console.log("[normalize-line-endings] 跳过的内容差异文件：");
  skippedWip.forEach((f) => console.log(`[normalize-line-endings]   - ${f}`));
}

console.log("\n[normalize-line-endings] 完成。");
console.log("[normalize-line-endings] 下一步（必须用官方工具，本工具不碰 manifest）：");
console.log("  1) node tools/update-deployment-manifest.mjs <版本> --files ... # 重生成 deploy/ftp-manifest.json");
console.log("  2) node tools/build-production-rehearsal-manifest.mjs            # 重生成 rehearsal");
console.log("  3) node --test \"tests/*.mjs\"                                      # 本地");
console.log("  4) git worktree 干净检出复验（先给 node_modules 挂 junction）");
