import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * 行为门禁：把 inc/visitor-geo.asp 里 GeoSafeAddress / GeoIsPublicAddress 的判定
 * 规则搬到 JS 里跑真实样本。
 *
 * 2026-09-26 线上事故：GeoSafeAddress 的白名单写成 ^[0-9a-f:]{3,45}$，漏了小数点，
 * 于是每一个 IPv4 地址都被判为非法，GeoResolve 在读配置之前就退出 ——
 * 访客记录有真实 IP、地图却永远没有地区。要靠 debugGeo=1 自诊断返回
 * no-client-address 才暴露，静态检查与编译期检查全都测不到。
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(path.join(root, "inc/visitor-geo.asp"), "utf8");

const safePattern = /matcher\.Pattern = "(\^[^"]+)"/.exec(source);
assert.ok(safePattern, "GeoSafeAddress must declare a whitelist pattern");
const addressPattern = new RegExp(safePattern[1]);

// 公开 IPv4 / IPv6 必须被接受
for (const address of [
  "59.137.225.151", "42.81.251.36", "8.8.8.8", "114.114.114.114",
  "203.0.113.9", "1.1.1.1", "2001:4860:4860::8888", "::1", "fe80::1"
]) {
  assert.ok(addressPattern.test(address), `GeoSafeAddress must accept a real address: ${address}`);
}

// 非地址文本必须被拒绝（这是它存在的唯一理由）
for (const value of [
  "", "abc", "deadbeef", "<script>", "1.2.3.4; DROP TABLE", "../../etc/passwd",
  "1.2.3.4\r\nX-Injected: 1", "' OR 1=1 --", "0.0.0.0.0"
]) {
  assert.ok(!addressPattern.test(value), `GeoSafeAddress must reject: ${JSON.stringify(value)}`);
}

// 端口/掩码等常见的“看起来像地址但不是”的形态也要拒绝
for (const value of ["1.2.3.4:8080", "1.2.3.4/24", "1.2.3.4%eth0"]) {
  assert.ok(!addressPattern.test(value), `GeoSafeAddress must reject: ${value}`);
}

// 私网判定规则（与 VBScript 实现逐条对应）
const privateChecks = [
  ["10.0.0.1", true], ["127.0.0.1", true], ["192.168.1.1", true],
  ["172.16.0.1", true], ["172.31.255.255", true], ["169.254.1.1", true],
  ["172.32.0.1", false], ["172.15.0.1", false], ["59.137.225.151", false],
  ["8.8.8.8", false], ["203.0.113.9", false]
];
for (const [address, isPrivate] of privateChecks) {
  assert.equal(isPrivateAddress(address), isPrivate, `private-range verdict changed for ${address}`);
}

function isPrivateAddress(address) {
  if (address === "::1" || address === "0:0:0:0:0:0:0:1" || address === "0.0.0.0") return true;
  if (address.startsWith("127.")) return true;
  if (address.startsWith("10.")) return true;
  if (address.startsWith("192.168.")) return true;
  if (address.startsWith("169.254")) return true;
  if (address.startsWith("172.")) {
    const second = Number(address.split(".")[1]);
    if (Number.isFinite(second) && second >= 16 && second <= 31) return true;
  }
  if (address.startsWith("fc") || address.startsWith("fd")) return true;
  for (const prefix of ["fe8", "fe9", "fea", "feb"]) if (address.startsWith(prefix)) return true;
  return false;
}

// 断言 VBScript 侧与这份参考实现保持一致（规则一旦分叉，这里会立刻发现）
assert.match(source, /If Left\(address, 3\) = "10\." Then Exit Function/);
assert.match(source, /If Left\(address, 8\) = "192\.168\." Then Exit Function/);
assert.match(source, /secondOctet >= 16 And secondOctet <= 31/);
assert.match(source, /If Left\(address, 7\) = "169\.254" Then Exit Function/);

console.log(`visitor geo address guard smoke test passed: pattern ${safePattern[1]}, ${privateChecks.length} range cases`);
