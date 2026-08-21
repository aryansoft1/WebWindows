import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile(new URL("../cloud/browser/device-locations.js", import.meta.url), "utf8");
const page = await fs.readFile(new URL("../cloud/browser/files.asp", import.meta.url), "utf8");
const styles = await fs.readFile(new URL("../cloud/browser/styles.css", import.meta.url), "utf8");

const document = {
  readyState: "loading",
  body: { dataset: { language: "zh" } },
  addEventListener() {},
  getElementById() { return null; }
};
const window = {
  window: null,
  parent: null,
  document,
  localStorage: { getItem() { return "zh"; } },
  Set,
  Object,
  Array,
  String,
  Boolean,
  Number,
  Math,
  Promise,
  console
};
window.window = window;
window.parent = window;
vm.runInNewContext(source, window, { filename: "device-locations.js" });
const model = window.WebWindowsDeviceLocations;

const unsupported = await model.availability({
  getCapabilities: () => ({ estimate: { supported: true }, directoryPicker: { supported: false }, read: { supported: false } }),
  listVolumes: async () => { throw new Error("must-not-list"); }
});
assert.equal(unsupported.state, "unsupported");

const empty = await model.availability({
  getCapabilities: () => ({ directoryPicker: { supported: true }, read: { supported: true } }),
  listVolumes: async () => []
});
assert.equal(empty.state, "empty");

const volumes = await model.availability({
  getCapabilities: () => ({ directoryPicker: { supported: true }, read: { supported: true } }),
  listVolumes: async () => [
    { id: "read", permission: { state: "granted", readable: true, writable: false, persisted: true } },
    { id: "write", permission: { state: "granted", readable: true, writable: true, persisted: true } },
    { id: "revoked", permission: { state: "revoked", readable: false, writable: false, persisted: false, revoked: true } }
  ]
});
assert.equal(volumes.state, "volumes");
assert.equal(model.permissionState(volumes.volumes[0].permission), "readonly");
assert.equal(model.permissionState(volumes.volumes[1].permission), "readwrite");
assert.equal(model.permissionState(volumes.volumes[2].permission), "revoked");
assert.equal(model.permissionState({ state: "unknown" }), "unknown");
assert.equal(model.deviceUrl("opaque-id", ["folder name", "note.txt"]), "device://opaque-id/folder%20name/note.txt");

assert.match(page, /id="device-root-button"[^>]*hidden/);
assert.match(page, /If Not pickerMode Then[\s\S]*device-root-button/);
assert.match(page, /device-storage-provider\.js/);
assert.match(page, /device-locations\.js/);
assert.match(styles, /\.device-panel/);
assert.match(source, /storage\.listVolumes\(\)/);
assert.match(source, /storage\.pickDirectory\(/);
assert.match(source, /storage\.listDirectory\(/);
assert.match(source, /storage\.openFile\(/);
assert.match(source, /global\.parent\.openResource\(resource\)/);
assert.match(source, /scope:\s*"device"/);
assert.match(source, /protocol:\s*"webwindows-cloud-resource"/);
assert.doesNotMatch(source, /WebWindowsNative|showDirectoryPicker|ACTION_OPEN_DOCUMENT_TREE|content:\/\//);
assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|private-resource\.asp|openResource\.asp/);

console.log("device cloud integration smoke tests passed");
