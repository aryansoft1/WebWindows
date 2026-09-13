import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [coreSource, appSource, html, registrySource, endpoint, migration, design, cameraCss, windowItem, legacyWindow] = await Promise.all([
  read("assets/js/camera-core.js"), read("assets/js/camera-app.js"), read("camera.html"),
  read("data/apps/system-apps.json"), read("api/camera-login.asp"),
  read("database/migrations/002_camera_login_challenges.sql"), read("docs/CAMERA_VERTICAL_SLICE_V1.md"),
  read("assets/css/camera.css"), read("webwindows-vue/src/desktop/WindowItem.vue"), read("webwindows-vue/src/stores/legacyWindow.js")
]);

const context = { console, TextEncoder, Blob, Uint8Array, URL, atob, globalThis: null };
context.globalThis = context;
vm.runInNewContext(coreSource, context, { filename: "camera-core.js" });
const core = context.WebWindowsCameraCore;

assert.equal(core.classifyQrPayload("javascript:alert(1)").risk, "blocked");
assert.equal(core.classifyQrPayload("data:text/html,x").risk, "blocked");
assert.equal(core.classifyQrPayload("intent://scan/#Intent;scheme=https;end").risk, "blocked");
assert.equal(core.classifyQrPayload("https://user:pass@example.com/").risk, "blocked");
assert.equal(core.classifyQrPayload("https://example.com/path").risk, "confirm");
assert.equal(core.classifyQrPayload("hello").kind, "text");
assert.equal(core.detectTextLanguage("中文资料"), "zh");
assert.equal(core.detectTextLanguage("これは日本語です"), "ja");
assert.equal(core.detectTextLanguage("English document"), "en");

const synthetic = { width: 100, height: 100, data: new Uint8ClampedArray(100 * 100 * 4) };
for (let y = 20; y <= 80; y += 1) for (let x = 20; x <= 80; x += 1) {
  const index = (y * 100 + x) * 4;
  synthetic.data[index] = synthetic.data[index + 1] = synthetic.data[index + 2] = 240;
  synthetic.data[index + 3] = 255;
}
const corners = core.detectDocumentCorners(synthetic);
assert.ok(corners[0].x < 30 && corners[0].y < 30);
assert.ok(corners[2].x > 70 && corners[2].y > 70);

const qrRects = [];
const qrCanvas = { width: 240, height: 240, getContext: () => ({ set fillStyle(_) {}, fillRect: (...args) => qrRects.push(args) }) };
core.renderQrCode(qrCanvas, "https://www.y0.hk/camera.html?loginChallenge=" + "a".repeat(48));
assert.equal(qrCanvas.width, qrCanvas.height);
assert.ok(qrRects.length > 250, "QR renderer should create a dense module matrix");

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9]).toString("base64");
const pdf = core.createPdfFromCanvases([
  { width: 100, height: 150, toDataURL: () => `data:image/jpeg;base64,${jpeg}` },
  { width: 100, height: 150, toDataURL: () => `data:image/jpeg;base64,${jpeg}` }
]);
assert.equal(pdf.type, "application/pdf");
assert.match(await pdf.text(), /^%PDF-1\.4/);

const registry = JSON.parse(registrySource);
const camera = registry.apps.find((app) => app.id === "webwindows.system.camera");
assert.ok(camera && camera.type === "system" && camera.install.uninstallable === false);
assert.match(html, /Content-Security-Policy/);
assert.match(html, /图像默认只在此设备处理/);
assert.match(html, /assets\/js\/tw\.js/);
assert.match(html, /assets\/js\/cloud-file-dialog\.js/);
assert.match(html, /id="openCloudImage"/);
assert.match(html, /id="cameraExit"/);
assert.doesNotMatch(html, /type="file"/);
assert.match(appSource, /getUserMedia/);
assert.match(appSource, /enumerateDevices/);
assert.match(appSource, /devicechange/);
assert.match(appSource, /BarcodeDetector/);
assert.match(appSource, /TextDetector/);
assert.match(appSource, /Translator/);
assert.match(appSource, /WebWindowsCameraProviders/);
assert.match(appSource, /OCR 提供方响应超时/);
assert.match(appSource, /state\.stream = previousStream/);
assert.match(appSource, /fileDialog/);
assert.match(appSource, /api\.open/);
assert.match(appSource, /api\.read/);
assert.match(appSource, /requestFullscreen/);
assert.match(appSource, /exitFullscreen/);
assert.match(appSource, /camera-capture-mode/);
assert.doesNotMatch(appSource, /showOpenFilePicker|showDirectoryPicker/);
assert.match(cameraCss, /:fullscreen/);
assert.match(cameraCss, /object-fit:\s*cover/);
assert.match(cameraCss, /safe-area-inset-bottom/);
assert.match(windowItem, /camera; fullscreen/);
assert.match(legacyWindow, /camera; fullscreen/);
assert.doesNotMatch(appSource, /https?:\/\/(?:api\.|translate\.|ocr\.)/i);

assert.match(endpoint, /challenge = RandomHex\(24\)/i);
assert.match(endpoint, /DATE_ADD\(NOW\(\),INTERVAL 2 MINUTE\)/i);
assert.match(endpoint, /CREATE_RATE_LIMIT/i);
assert.match(endpoint, /initiator_binding_hash=LOWER\(SHA2\(\?,256\)\)/i);
assert.match(endpoint, /FOR UPDATE/i);
assert.match(endpoint, /status='approved'/i);
assert.match(endpoint, /status='consumed'/i);
assert.match(endpoint, /Session\.Abandon/i);
assert.match(endpoint, /HttpOnly; SameSite=Strict/i);
assert.match(endpoint, /exchange_token_hash=NULL/i);
assert.doesNotMatch(appSource.match(/qrPayload[^;]+/)[0], /cookie|token|password/i);
assert.match(migration, /PRIMARY KEY \(challenge\)/i);
assert.match(migration, /UNIQUE KEY uk_camera_login_exchange/i);
assert.match(appSource, /LOGIN_BACKEND_ENABLED\s*=\s*false/);
assert.match(appSource, /数据库迁移完成前不会发送登录请求/);
assert.match(html, /扫码登录后端未启用/);
assert.match(html, /id="createLoginQr"[^>]+disabled/);
assert.match(html, /id="approveLogin"[^>]+disabled/);
assert.match(design, /does not claim WebXR/i);

console.log("camera vertical slice smoke test passed");
