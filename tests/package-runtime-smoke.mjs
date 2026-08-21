import assert from "node:assert/strict";
import fs from "node:fs/promises";

const page = await fs.readFile(new URL("../package-runtime.html", import.meta.url), "utf8");
const script = await fs.readFile(
  new URL("../assets/js/package-runtime.js", import.meta.url), "utf8"
);
const style = await fs.readFile(
  new URL("../assets/css/package-runtime.css", import.meta.url), "utf8"
);
const adminScript = await fs.readFile(
  new URL("../SystemManager/assets/js/developer-platform-admin.js", import.meta.url), "utf8"
);

assert.match(page, /jszip@3\.10\.1/);
assert.match(page, /sandbox="allow-scripts allow-forms allow-modals allow-downloads"/);
assert.doesNotMatch(page, /allow-same-origin/);
assert.match(script, /MAX_FILES = 500/);
assert.match(script, /MAX_UNCOMPRESSED_BYTES = 30 \* 1024 \* 1024/);
assert.match(script, /checkCRC32: true/);
assert.match(script, /功能包不能包含符号链接/);
assert.match(script, /当前沙箱版本暂不支持 ES Module/);
assert.match(script, /connect-src 'none'/);
assert.match(script, /frame\.srcdoc/);
assert.match(script, /api\/function-package\.asp/);
assert.match(style, /runtime-state/);
assert.match(adminScript, /browser-zip-sandbox-v1/);
assert.match(adminScript, /sameOrigin: false/);
assert.match(adminScript, /network: "none"/);

console.log("package runtime smoke test passed");
