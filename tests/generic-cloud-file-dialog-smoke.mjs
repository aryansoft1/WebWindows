import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

for (const relative of [
  "worker_SheetCreater.html",
  "worker_WriteEditor.html",
  "worker_SlideEditor.html"
]) {
  const html = read(relative);
  const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1]).filter((script) => script.trim());
  assert.ok(inlineScripts.length, `${relative} should contain application code`);
  inlineScripts.forEach((script, index) => {
    new vm.Script(script, { filename: `${relative}#inline-${index + 1}` });
  });
  assert.match(html, /assets\/js\/cloud-file-dialog\.js/, `${relative} should load the common dialog API`);
  assert.match(html, /WebWindows\.fileDialog/, `${relative} should use the WebWindows API namespace`);
  assert.doesNotMatch(html, /showOpenFilePicker|showSaveFilePicker|type\s*=\s*["']file["']/i);
}

const api = read("assets/js/cloud-file-dialog.js");
new vm.Script(api, { filename: "cloud-file-dialog.js" });
assert.match(api, /WebWindowsCloudFiles/);
assert.match(api, /open:/);
assert.match(api, /save:/);
assert.match(api, /saveBlob:/);
assert.match(api, /requestId/);
assert.match(api, /resources/);
assert.match(api, /X-WebWindows-Request/);
assert.doesNotMatch(api, /developer-package/);
assert.doesNotMatch(api, /application\/zip/);

const publicPicker = read("cloud/browser/files.asp");
const privatePicker = read("cloud/browser/private-files.asp");
const privateApi = read("cloud/browser/private-resource.asp");
const publicContent = read("cloud/browser/openResource.asp");
const toolbar = read("cloud/browser/toolbar.js");
const nodeConfig = read("cloud/browser/node-config.asp");
const developer = read("assets/js/developer-center.js");
const index = read("index.html");

assert.match(publicPicker, /NormalizePickerAccept/);
assert.match(publicPicker, /data-picker-multiple/);
assert.match(publicPicker, /data-picker-request-id/);
assert.match(publicPicker, /PickerAccepts\(extension, pickerAccept\)/);
assert.match(privatePicker, /pickerAction === "save"/);
assert.match(privatePicker, /writeUrl/);
assert.match(privatePicker, /message\.resources/);
assert.match(privateApi, /mode = "save-as"/);
assert.match(privateApi, /private_upload_overwrite_/);
assert.doesNotMatch(publicContent, /PICKER_TYPE_NOT_ALLOWED/);
assert.match(toolbar, /scope: "public"/);
assert.match(toolbar, /message\.resources = resources/);
assert.match(toolbar, /icons: \{ zh: "图标", jp: "アイコン", en: "Icons" \}/);
assert.match(toolbar, /wallpapers: \{ zh: "壁纸", jp: "壁紙", en: "Wallpapers" \}/);
assert.match(nodeConfig, /Case "icons"/);
assert.match(nodeConfig, /CloudDisplayName = "图标"/);
assert.match(nodeConfig, /Case "wallpapers"/);
assert.match(nodeConfig, /CloudDisplayName = "壁纸"/);
assert.match(toolbar, /public-cloud-save-copy/);
assert.doesNotMatch(toolbar, /searchParams\.set\("download"/);
assert.match(toolbar, /保存副本到私人云资料/);
assert.doesNotMatch(publicContent, /attachment|downloadRequested/);
assert.match(developer, /WebWindows\.fileDialog\.open/);
assert.doesNotMatch(developer, /cloudPackagePicker/);
assert.match(index, /assets\/js\/cloud-file-dialog\.js/);

console.log("generic cloud file dialog smoke test passed");
