import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { assertAsciiOutsideStrings, splitAspCode } from "./lib/asp-script.mjs";

/*
 * api/region-geo.asp 的运行门禁。
 *
 * 这是一个**对外可访问**的接口。adcode 校验一旦写松，它立刻变成「让服务器替我请求
 * 任意 URL」的开放代理（SSRF）。所以这里把安全边界钉死，并且**真的把代码跑起来**：
 *
 *   1) adcode 白名单：只接受 1..6 位纯数字 —— 拒绝空、超长、含字母、路径穿越、
 *      完整 URL、负数、全角数字（`０` 的 charCode 不是 0x30，逐位比较能挡住）。
 *   2) 不接受任何 url/host/href/target 类参数；上游地址写死。
 *   3) JsonEscape 必须真的产出合法 JSON 转义 —— 写这个文件时我把引号数错，
 *      字符串没闭合、后面整段代码被吞进字符串，**只有编译期才暴露**。所以这里
 *      用真实样本断言它的输出，而不是只检查它「存在」。
 *
 * 抽取方式：只取 Const / Sub / Function 定义（顶层的可执行代码依赖 ASP 内建对象，
 * VBScript 无法用类桩接 `Application` 的默认成员），配上 Request 桩后调用。
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(path.join(root, "api/region-geo.asp"), "utf8");
const body = source.replace(/^<%@[^%]*%>\s*/, "").replace(/^<%\s*/, "").replace(/%>\s*$/, "");

// 代码部分必须纯 ASCII（中文只允许出现在注释与字符串字面量里）
assertAsciiOutsideStrings(body, "non-ASCII text must stay inside comments and string literals");

// 只抽定义
const lines = body.split(/\r?\n/);
const definitions = [];
for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  if (/^\s*Const\s+\w+\s*=/.test(line)) { definitions.push(line); continue; }
  if (/^\s*(Sub|Function)\s+\w+/.test(line)) {
    const terminator = /^\s*(Sub|Function)/.test(line) ? null : null;
    let j = i;
    while (j < lines.length) {
      definitions.push(lines[j]);
      if (/^\s*End (Sub|Function)\b/.test(lines[j])) break;
      j += 1;
    }
    i = j;
  }
}
const code = definitions.join("\n");
assert.match(code, /Function SafeAdcode/, "SafeAdcode must be part of the extracted definitions");
assert.match(code, /Function JsonEscape/, "JsonEscape must be part of the extracted definitions");
assert.match(code, /Function FetchUpstream/);
// Sub/Function 内部当然会碰 Response（例如 Fail），所以只检查「顶格」的可执行语句
assert.doesNotMatch(code, /^Response\./m,
  "the extracted definitions must not contain top-level executable statements");

// 上游地址写死：内容断言必须用原文（词法扫描后的 code 里字符串字面量已被移除）
assert.match(body, /Const UPSTREAM_BASE = "https:\/\/geo\.datav\.aliyun\.com\/areas_v3\/bound\/"/,
  "the upstream host must be hard-coded, never taken from the request");
assert.doesNotMatch(body, /Request\.(QueryString|Form)\("(url|uri|host|href|src|target|proxy|path)"/i,
  "the endpoint must not accept a caller-supplied URL of any kind");
assert.doesNotMatch(body, /include file="\.\.\/inc\/conn\.asp"/,
  "the endpoint must not depend on the database connection");
assert.match(body, /UPSTREAM_BASE & adcode & "_full\.json"/,
  "the upstream URL must be built from the validated adcode only");
assert.match(body, /InStr\(1, body, """features""", vbTextCompare\) = 0 Then Exit Function/,
  "a non-GeoJSON upstream answer must be rejected instead of relayed to the page");
// 日期运算陷阱：CStr(Now()) 是本地化字符串，Now() - 字符串 在非 en-US 区域抛类型不匹配，
// 缓存命中路径会直接 500（2026-09-26 上线后立刻暴露）。只允许整数比较。
assert.doesNotMatch(body, /Now\(\)\s*-\s*CStr|CStr\(stamp\)|CDate\(/,
  "never do date arithmetic on localized date strings; compare integers instead");
assert.match(body, /Function GeoCacheFresh/);
assert.match(body, /CLng\(dayNo\) <> CLng\(Day\(Now\(\)\)\) Then Exit Function/);
assert.match(body, /Fail "502 Bad Gateway", "UPSTREAM_UNAVAILABLE"/,
  "upstream failures must surface as an explicit error code");

const scratch = mkdtempSync(path.join(os.tmpdir(), "ww-region-geo-"));
const script = `Option Explicit

Dim Report
Report = ""
Function Say(ByVal key, ByVal value)
  Report = Report & key & "=" & value & vbCrLf
End Function

Class FakeRequest
  Public Adcode
  Public Function QueryString(ByVal name)
    If LCase(CStr(name)) = "adcode" Then
      QueryString = Adcode
    Else
      QueryString = ""
    End If
  End Function
End Class
Class FakeResponse
  Public Status
  Public Written
  Public Sub AddHeader(ByVal key, ByVal value)
  End Sub
  Public Sub Write(ByVal value)
    Written = Written & CStr(value)
  End Sub
  Public Sub End_()
  End Sub
End Class
Class FakeServer
  Public Function CreateObject(ByVal name)
    Set CreateObject = VBScript.CreateObject(CStr(name))
  End Function
End Class

Dim Request
Dim Response
Dim Server
Set Request = New FakeRequest
Set Response = New FakeResponse
Set Server = New FakeServer

${code.replace(/Const UPSTREAM_BASE = "[^"]*"/, 'Const UPSTREAM_BASE = "stub"').replace(/Response\.End\b/g, "Response.End_")}

' ---- adcode 白名单 ----
Request.Adcode = "100000"
Say "ok_national", SafeAdcode(Request.QueryString("adcode"))
Request.Adcode = "320000"
Say "ok_province", SafeAdcode(Request.QueryString("adcode"))
Request.Adcode = "0"
Say "ok_zero", SafeAdcode(Request.QueryString("adcode"))
Request.Adcode = ""
Say "reject_empty", CStr(Len(SafeAdcode(Request.QueryString("adcode"))))
Request.Adcode = "1234567"
Say "reject_too_long", CStr(Len(SafeAdcode(Request.QueryString("adcode"))))
Request.Adcode = "10000a"
Say "reject_trailing_letter", CStr(Len(SafeAdcode(Request.QueryString("adcode"))))
Request.Adcode = "../inc/conn.asp"
Say "reject_traversal", CStr(Len(SafeAdcode(Request.QueryString("adcode"))))
Request.Adcode = "http://evil.example/x"
Say "reject_url", CStr(Len(SafeAdcode(Request.QueryString("adcode"))))
Request.Adcode = "100000%20"
Say "reject_encoded_space", CStr(Len(SafeAdcode(Request.QueryString("adcode"))))
Request.Adcode = "-1"
Say "reject_negative", CStr(Len(SafeAdcode(Request.QueryString("adcode"))))
Request.Adcode = "100000" & Chr(65296)
Say "reject_fullwidth", CStr(Len(SafeAdcode(Request.QueryString("adcode"))))
Request.Adcode = "1 00000"
Say "reject_inner_space", CStr(Len(SafeAdcode(Request.QueryString("adcode"))))
Request.Adcode = "00000000001"
Say "reject_padded_long", CStr(Len(SafeAdcode(Request.QueryString("adcode"))))

' ---- JsonEscape 必须真的产出合法转义 ----
Say "escape_quote", JsonEscape("a" & Chr(34) & "b")
Say "escape_backslash", JsonEscape("a\\b")
Say "escape_newline", JsonEscape("a" & vbCrLf & "b")
Say "escape_plain", JsonEscape("plain")
Say "escape_quote_then_backslash", JsonEscape(Chr(34) & "\\")

' ---- 缓存新鲜度：纯整数比较，不能依赖日期字符串 ----
Request.Adcode = "100000"
Say "cache_fresh_now", CStr(GeoCacheFresh(Day(Now()), CLng(Hour(Now())) * 60 + CLng(Minute(Now())), 10080))
Say "cache_fresh_60min", CStr(GeoCacheFresh(Day(Now()), (CLng(Hour(Now())) * 60 + CLng(Minute(Now()))) - 60, 10080))
Say "cache_stale_20000min", CStr(GeoCacheFresh(Day(Now()), (CLng(Hour(Now())) * 60 + CLng(Minute(Now()))) - 20000, 10080))
Say "cache_other_day", CStr(GeoCacheFresh(Day(Now()) - 1, CLng(Hour(Now())) * 60 + CLng(Minute(Now())), 10080))
Say "cache_garbage_stamp", CStr(GeoCacheFresh("x", "y", 10080))

WScript.Echo Report
`;
const scriptPath = path.join(scratch, "region-geo.vbs");
writeFileSync(scriptPath, script.replace(/\r?\n/g, "\r\n"), "utf8");

let stdout = "";
let failed = false;
try {
  stdout = execFileSync("cscript.exe", ["//nologo", scriptPath], { encoding: "utf8", timeout: 60000, windowsHide: true });
} catch (error) {
  failed = true;
  stdout = `${error.stdout || ""}\n${error.stderr || ""}`.trim() || "(no output)";
  stdout += `\n(harness kept at ${scriptPath})`;
}
if (!process.env.WW_KEEP_HARNESS) rmSync(scratch, { recursive: true, force: true });
assert.ok(!failed, `the region-geo harness must execute cleanly:\n${stdout}`);

const values = new Map();
for (const line of stdout.split(/\r?\n/)) {
  const at = line.indexOf("=");
  if (at > 0) values.set(line.slice(0, at).trim(), line.slice(at + 1).trim());
}

assert.equal(values.get("ok_national"), "100000", "a national adcode must be accepted");
assert.equal(values.get("ok_province"), "320000", "a province adcode must be accepted");
assert.equal(values.get("ok_zero"), "0", "0 is a syntactically valid adcode");
for (const key of [
  "reject_empty", "reject_too_long", "reject_trailing_letter", "reject_traversal", "reject_url",
  "reject_encoded_space", "reject_negative", "reject_fullwidth", "reject_inner_space", "reject_padded_long",
]) {
  assert.equal(values.get(key), "0", `SafeAdcode must reject this input: ${key}`);
}

// JSON 转义：这是本轮真实踩过的坑（引号数错 → 字符串未闭合 → 整段代码被吞）
assert.equal(values.get("cache_fresh_now"), "True", "a stamp from this minute must be fresh");
assert.equal(values.get("cache_fresh_60min"), "True", "an hour-old stamp is still fresh with a 7-day TTL");
assert.equal(values.get("cache_stale_20000min"), "False", "a stamp older than the TTL must be stale");
assert.equal(values.get("cache_other_day"), "False", "a stamp from another day must be stale");
assert.equal(values.get("cache_garbage_stamp"), "False", "a non-numeric stamp must be treated as stale, not throw");

const bs = String.fromCharCode(92);
const dq = String.fromCharCode(34);
assert.equal(values.get("escape_quote"), `a${bs}${dq}b`, "a double quote must become backslash + quote");
assert.equal(values.get("escape_backslash"), `a${bs}${bs}b`, "a backslash must be doubled");
assert.equal(values.get("escape_newline"), "a b", "newlines must collapse to a single space");
assert.equal(values.get("escape_plain"), "plain", "plain text must pass through unchanged");
assert.equal(values.get("escape_quote_then_backslash"), `${bs}${dq}${bs}${bs}`,
  "a quote followed by a backslash must escape in the right order");

console.log(`region geo proxy smoke test passed: ${values.size} runtime cases, upstream host hard-coded`);
