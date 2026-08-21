import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const parse5 = require("parse5");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const parseErrors = [];
const document = parse5.parse(html, { onParseError: (error) => parseErrors.push(error) });

function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes || []) walk(child, visit);
  if (node.content) walk(node.content, visit);
}

function attribute(node, name) {
  return node.attrs?.find((item) => item.name === name)?.value;
}

const operationNodes = [];
const volumeNodes = [];
walk(document, (node) => {
  if (attribute(node, "data-device-operation")) operationNodes.push(node);
  if (attribute(node, "id") === "volume-btn") volumeNodes.push(node);
});

// index.html intentionally contains the existing Vue SFC-style <WindowManager />
// and <Taskbar /> placeholders. parse5 reports those two self-closing custom tags,
// so reject every other HTML parse error and validate the device DOM explicitly.
const unexpectedParseErrors = parseErrors.filter((error) => error.code !== "non-void-html-element-start-tag-with-trailing-solidus");
assert.equal(unexpectedParseErrors.length, 0, `index.html parse errors: ${unexpectedParseErrors.map((error) => error.code).join(", ")}`);
assert.equal(parseErrors.length, 2, "only the two existing Vue custom-element self-closing warnings are allowed");
assert.deepEqual(
  operationNodes.map((node) => attribute(node, "data-device-operation")),
  ["lock", "sleep", "shutdown", "restart"]
);
for (const node of operationNodes) {
  assert.equal(node.tagName, "button", `${attribute(node, "data-device-operation")} must be a button`);
  assert.equal(attribute(node, "type"), "button");
}
assert.equal(volumeNodes.length, 1, "#volume-btn must be unique");
assert.equal(volumeNodes[0].tagName, "div", "#volume-btn must use matching div markup");
assert.match(html, /assets\/css\/context_menu\.css\?v=20260802-device-1/);

const languageSource = fs.readFileSync(path.join(root, "assets/js/tw.js"), "utf8");
const languageContext = {
  document: { addEventListener() {} },
  window: { addEventListener() {} },
  localStorage: { getItem() { return "zh"; }, setItem() {} },
  CustomEvent: class {},
  Node: { ELEMENT_NODE: 1, TEXT_NODE: 3 },
  WeakMap,
  WeakSet,
  Map,
  Set
};
vm.runInNewContext(languageSource + ";globalThis.__deviceLanguageCatalog = languageCatalog;", languageContext, { filename: "tw.js" });

const expectedTranslations = {
  tw: {
    "关闭 WebWindows 会话": "關閉 WebWindows 工作階段",
    "WebWindows 已锁定": "WebWindows 已鎖定",
    "这是会话级隐私遮罩，并非宿主设备锁屏；继续时无需设备密码。": "這是工作階段層級的隱私遮罩，並非主機裝置鎖定畫面；繼續時不需要裝置密碼。",
    "下载速度测试": "下載速度測試",
    "任务视图": "工作檢視"
  },
  en: {
    "关闭 WebWindows 会话": "Close WebWindows session",
    "WebWindows 已锁定": "WebWindows locked",
    "这是会话级隐私遮罩，并非宿主设备锁屏；继续时无需设备密码。": "This is a session privacy cover, not the host device lock screen. No device password is required to continue.",
    "下载速度测试": "Download speed test",
    "任务视图": "Task view",
    "调节 WebWindows 页面视觉亮度，不代表屏幕背光。": "Adjusts WebWindows visual brightness, not display backlight."
  },
  jp: {
    "关闭 WebWindows 会话": "WebWindows セッションを閉じる",
    "WebWindows 已锁定": "WebWindows はロックされています",
    "这是会话级隐私遮罩，并非宿主设备锁屏；继续时无需设备密码。": "これはセッション用のプライバシー画面であり、ホストデバイスのロック画面ではありません。続行にデバイスのパスワードは不要です。",
    "下载速度测试": "ダウンロード速度テスト",
    "任务视图": "タスクビュー",
    "调节 WebWindows 页面视觉亮度，不代表屏幕背光。": "WebWindows ページの見た目の明るさを調整します。画面バックライトではありません。"
  }
};

for (const [language, entries] of Object.entries(expectedTranslations)) {
  for (const [source, expected] of Object.entries(entries)) {
    assert.equal(languageContext.__deviceLanguageCatalog[language][source], expected);
  }
}

console.log("device operations DOM and language smoke tests passed");
