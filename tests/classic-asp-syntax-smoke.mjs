import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "inc/sysinfo.asp",
  "api/storage-quota.asp",
  "api/dt_discovery.asp",
  "api/dt_presence_mem.asp",
  "admin_api/getDatacenters.asp",
  "admin_api/saveDatacenter.asp",
  "admin_api/deleteDatacenter.asp",
  "cloud/browser/files.asp",
  "cloud/browser/openResource.asp",
  "cloud/browser/private-files.asp",
  "cloud/browser/private-resource.asp",
  "cloud/browser/search.asp"
];

for (const relative of files) {
  const asp = fs.readFileSync(path.join(root, relative), "utf8");
  const serverBlocks = [...asp.matchAll(/<%(?![@=])([\s\S]*?)%>/g)].map((match) => match[1]).join("\r\n");
  const generated = path.join(os.tmpdir(), `webwindows-${path.basename(relative).replace(/\W/g, "-")}-${process.pid}.vbs`);
  fs.writeFileSync(generated, serverBlocks, "utf8");
  let output = "";
  try {
    execFileSync("cscript.exe", ["//nologo", generated], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    output = `${error.stdout || ""}\n${error.stderr || ""}`;
  } finally {
    fs.unlinkSync(generated);
  }
  assert.doesNotMatch(output, /800A03[0-9A-F]{2}/i, `${relative} contains a VBScript compilation error:\n${output}`);
}
console.log("classic ASP syntax smoke test passed");
