import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const runtimeSource = await fs.readFile(
  new URL("../assets/js/package-runtime.js", import.meta.url), "utf8"
);
const runtimePage = await fs.readFile(
  new URL("../package-runtime.html", import.meta.url), "utf8"
);

const hook = '  document.addEventListener("DOMContentLoaded", () => start().catch((error) => setError(error.message)));';
assert.ok(runtimeSource.includes(hook), "package runtime test hook location changed");
const instrumented = runtimeSource.replace(hook, `
  globalThis.__packageRuntimePolicy = Object.freeze({
    MAX_FILES,
    MAX_UNCOMPRESSED_BYTES,
    ALLOWED_EXTENSIONS,
    MIME_TYPES,
    extension,
    normalizePath,
    resolvePath,
    createDataUrl,
    rewriteCss,
    rewriteHtml,
    start
  });
${hook}`);

class FakeNode {
  constructor(tagName, attributes = {}, textContent = "") {
    this.tagName = tagName;
    this.attributes = new Map(Object.entries(attributes));
    this.textContent = textContent;
    this.replacement = null;
  }
  hasAttribute(name) { return this.attributes.has(name); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
  replaceWith(node) { this.replacement = node; }
}

class FakeParsedDocument {
  constructor(html) {
    this.moduleScript = /<script[^>]+type=["']module["']/i.test(html);
    const scriptSource = html.match(/<script[^>]+src=["']([^"']+)["']/i)?.[1] || null;
    const stylesheet = html.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || null;
    const imageSource = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || null;
    const sourceSet = html.match(/srcset=["']([^"']+)["']/i)?.[1] || null;
    this.script = scriptSource ? new FakeNode("script", { src: scriptSource }) : null;
    this.link = stylesheet ? new FakeNode("link", { rel: "stylesheet", href: stylesheet }) : null;
    this.image = imageSource ? new FakeNode("img", { src: imageSource }) : null;
    this.sourceSet = sourceSet ? new FakeNode("img", { srcset: sourceSet }) : null;
    this.styles = [];
    this.csp = null;
    this.head = { prepend: (node) => { this.csp = node; } };
    this.documentElement = {};
    Object.defineProperty(this.documentElement, "outerHTML", {
      get: () => JSON.stringify({
        cspHttpEquiv: this.csp?.httpEquiv || "",
        csp: this.csp?.content || "",
        scriptSource: this.script?.getAttribute("src"),
        scriptText: this.script?.textContent || "",
        styles: this.styles.map((style) => style.textContent),
        imageSource: this.image?.getAttribute("src"),
        sourceSet: this.sourceSet?.getAttribute("srcset")
      })
    });
  }
  querySelector(selector) {
    return selector === 'script[type="module"]' && this.moduleScript ? {} : null;
  }
  createElement(tagName) {
    const node = new FakeNode(tagName);
    if (tagName === "style") this.styles.push(node);
    return node;
  }
  querySelectorAll(selector) {
    if (selector === "script[src]") return this.script ? [this.script] : [];
    if (selector === 'link[rel~="stylesheet"][href]') return this.link ? [this.link] : [];
    if (selector === "style") return this.styles;
    if (selector === "[src],[href],[poster]") return [this.script, this.image].filter(Boolean);
    if (selector === "[srcset]") return this.sourceSet ? [this.sourceSet] : [];
    return [];
  }
}

const frame = { srcdoc: "", hidden: true };
const runtimeState = { hidden: false, classList: { add() {} }, querySelector: () => ({ textContent: "" }) };
let loadOptions = null;
let currentArchive = null;
const context = {
  console,
  URLSearchParams,
  TextDecoder,
  TextEncoder,
  Uint8Array,
  Map,
  Set,
  Object,
  Array,
  String,
  Number,
  RegExp,
  Error,
  Promise,
  btoa,
  location: { search: "?appId=com.example.test&version=1.0.0&entry=index.html" },
  fetch: async () => ({ ok: true, status: 200, arrayBuffer: async () => new ArrayBuffer(8) }),
  JSZip: {
    loadAsync: async (_buffer, options) => {
      loadOptions = options;
      return currentArchive;
    }
  },
  DOMParser: class { parseFromString(html) { return new FakeParsedDocument(html); } },
  document: {
    addEventListener() {},
    getElementById(id) {
      if (id === "packageFrame") return frame;
      if (id === "runtimeState") return runtimeState;
      if (id === "runtimeMessage") return { textContent: "" };
      return null;
    }
  }
};
context.globalThis = context;
context.window = context;
vm.runInNewContext(instrumented, context, { filename: "package-runtime.js" });
const policy = context.__packageRuntimePolicy;

assert.equal(policy.MAX_FILES, 500);
assert.equal(policy.MAX_UNCOMPRESSED_BYTES, 30 * 1024 * 1024);
assert.equal(policy.normalizePath("./scripts\\app.js"), "scripts/app.js");
for (const unsafe of ["", "/index.html", "C:/index.html", "../index.html", "a/../index.html", "a//b.js", "a/./b.js", `a${String.fromCharCode(0)}b.js`, "a".repeat(241)]) {
  assert.throws(() => policy.normalizePath(unsafe), /无效路径|路径不安全|过长路径/, unsafe);
}
assert.equal(policy.resolvePath("styles/app.css", "../assets/icon.png"), "assets/icon.png");
for (const external of ["https://example.test/a.js", "//example.test/a.js", "data:text/plain,a", "blob:test", "#local"]) {
  assert.equal(policy.resolvePath("index.html", external), null, external);
}
assert.equal(policy.ALLOWED_EXTENSIONS.has(".html"), true);
assert.equal(policy.ALLOWED_EXTENSIONS.has(".exe"), false);

const cssUrls = new Map([["assets/icon.png", "data:image/png;base64,AA=="]]);
assert.equal(
  policy.rewriteCss(".icon{background:url('../assets/icon.png')}", "styles/app.css", cssUrls),
  '.icon{background:url("data:image/png;base64,AA==")}'
);

const rewritten = policy.rewriteHtml(
  '<!doctype html><script src="scripts/app.js"></script><link rel="stylesheet" href="styles/app.css"><img src="assets/icon.png" srcset="assets/icon.png 1x">',
  "index.html",
  new Map([["assets/icon.png", "data:image/png;base64,AA=="]]),
  new Map([
    ["scripts/app.js", "globalThis.started = true;"],
    ["styles/app.css", ".icon{background:url(../assets/icon.png)}"]
  ])
);
assert.match(rewritten, /Content-Security-Policy/);
assert.match(rewritten, /connect-src 'none'/);
assert.match(rewritten, /script-src 'unsafe-inline'/);
assert.match(rewritten, /globalThis\.started = true/);
assert.match(rewritten, /data:image\/png;base64,AA==/);
assert.throws(
  () => policy.rewriteHtml('<script type="module">export default 1</script>', "index.html", new Map(), new Map()),
  /暂不支持 ES Module/
);
assert.throws(
  () => policy.rewriteHtml('<script src="https://example.test/app.js"></script>', "index.html", new Map(), new Map()),
  /脚本必须包含在功能包内/
);

const bytes = (text) => new TextEncoder().encode(text);
function archive(files) {
  return {
    files: Object.fromEntries(files.map((file, index) => [file.key || `${index}-${file.name}`, {
      dir: false,
      unixPermissions: file.unixPermissions || 0,
      name: file.name,
      async: async (format) => {
        assert.equal(format, "uint8array");
        return file.data || bytes("");
      }
    }]))
  };
}

async function runWith(files, entry = "index.html") {
  context.location.search = `?appId=com.example.test&version=1.0.0&entry=${encodeURIComponent(entry)}`;
  currentArchive = archive(files);
  frame.srcdoc = "";
  frame.hidden = true;
  runtimeState.hidden = false;
  return policy.start();
}

await assert.rejects(
  () => runWith(Array.from({ length: 501 }, (_, index) => ({ name: `f${index}.txt`, data: bytes("x") }))),
  /文件数量无效/
);
await assert.rejects(
  () => runWith([{ name: "index.html", data: new Uint8Array(30 * 1024 * 1024 + 1) }]),
  /解压后超过 30 MB/
);
await assert.rejects(
  () => runWith([{ name: "index.html", data: bytes("ok") }, { name: "run.exe", data: bytes("x") }]),
  /不允许的文件类型/
);
await assert.rejects(
  () => runWith([{ name: "index.html", data: bytes("ok") }, { name: "link.js", unixPermissions: 0xa000, data: bytes("x") }]),
  /不能包含符号链接/
);
await assert.rejects(
  () => runWith([{ name: "../index.html", data: bytes("ok") }]),
  /路径不安全/
);
await assert.rejects(
  () => runWith([{ name: "readme.txt", data: bytes("ok") }]),
  /HTML 入口不存在/
);
await assert.rejects(
  () => runWith([{ name: "readme.txt", data: bytes("ok") }], "readme.txt"),
  /HTML 入口不存在/
);
await assert.rejects(
  () => runWith([{ name: "index.html", data: bytes('<script type="module">export default 1</script>') }]),
  /暂不支持 ES Module/
);

await runWith([
  { name: "manifest.json", data: bytes("{}") },
  { name: "index.html", data: bytes('<script src="scripts/app.js"></script><link rel="stylesheet" href="styles/app.css"><img src="assets/icon.png">') },
  { name: "scripts/app.js", data: bytes("globalThis.started = true;") },
  { name: "styles/app.css", data: bytes("body{background:url(../assets/icon.png)}") },
  { name: "assets/icon.png", data: new Uint8Array([0]) }
]);
assert.equal(loadOptions.checkCRC32, true);
assert.equal(loadOptions.createFolders, false);
assert.equal(frame.hidden, false);
assert.equal(runtimeState.hidden, true);
assert.match(frame.srcdoc, /connect-src 'none'/);
assert.match(frame.srcdoc, /globalThis\.started = true/);

assert.match(runtimePage, /sandbox="allow-scripts allow-forms allow-modals allow-downloads"/);
assert.doesNotMatch(runtimePage, /allow-same-origin/);
assert.match(runtimePage, /referrerpolicy="no-referrer"/);
assert.match(runtimePage, /default-src 'self'/);

console.log("package runtime policy smoke test passed");
