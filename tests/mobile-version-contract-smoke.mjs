import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const source = await fs.readFile(
  new URL("../api/mobile-version.asp", import.meta.url),
  "utf8"
);

assert.match(source, /ContentType\s*=\s*"application\/json"/i);
assert.match(source, /Cache-Control"\s*,\s*"no-store, no-cache, must-revalidate, max-age=0"/i);
assert.match(source, /Server\.MapPath\("\.\.\/index\.html"\)/i);
assert.match(source, /""version""/i);
assert.match(source, /""entry"":""\/""/i);
assert.doesNotMatch(source, /password|ftp|connectionstring|accept-all|trust-all/i);

const serverBlocks = [...source.matchAll(/<%(?![@=])([\s\S]*?)%>/g)]
  .map((match) => match[1])
  .join("\r\n");
const generated = path.join(os.tmpdir(), `webwindows-mobile-version-${process.pid}.vbs`);
await fs.writeFile(generated, serverBlocks, "utf8");
let compilerOutput = "";
try {
  execFileSync("cscript.exe", ["//nologo", generated], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
} catch (error) {
  compilerOutput = `${error.stdout || ""}\n${error.stderr || ""}`;
} finally {
  await fs.unlink(generated);
}
assert.doesNotMatch(compilerOutput, /800A03[0-9A-F]{2}/i, `VBScript compilation error:\n${compilerOutput}`);

console.log("mobile version contract smoke test passed");
