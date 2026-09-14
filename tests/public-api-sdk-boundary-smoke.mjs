import assert from "node:assert/strict";
import fs from "node:fs/promises";

const sdk = await fs.readFile(
  new URL("../data/sdk/webwindows-public-api-v1.d.ts", import.meta.url), "utf8"
);

for (const forbidden of [
  "WebWindowsNative",
  "NativeAdapter",
  "getRuntimeInfo",
  "getBatteryStatus",
  "getNetworkStatus",
  "getScreenBrightness",
  "setScreenBrightness",
  "getMediaVolume",
  "setMediaVolume",
  "storageListVolumes",
  "storagePickDirectory",
  "storageListDirectory",
  "storageOpenFile",
  "storageGetMetadata"
]) {
  assert.equal(sdk.includes(forbidden), false, `private ABI member leaked into SDK: ${forbidden}`);
}

assert.match(sdk, /interface WebWindowsNamespace\s*{\s*readonly device: DeviceAPI;\s*readonly fileDialog: CloudFileDialogAPI;\s*readonly dialog: SystemDialogAPI;\s*}/);
assert.doesNotMatch(sdk, /readonly apps:|\bAppRegistry\b|\bopenWindow\b|WebWindowsDeviceOperations/);
assert.doesNotMatch(sdk, /\[key:\s*string\]:\s*unknown/);

for (const group of ["system", "runtime", "network", "battery", "display", "audio", "storage", "power"]) {
  assert.match(sdk, new RegExp(`readonly ${group}: Device`, "m"), `missing device group ${group}`);
}
for (const method of ["getAdapter", "getCapabilities", "on", "ready"]) {
  assert.match(sdk, new RegExp(`\\b${method}\\(`), `missing Device API method ${method}`);
}
for (const method of ["open", "save", "write", "read", "saveBlob"]) {
  assert.match(sdk, new RegExp(`\\b${method}\\(`), `missing fileDialog method ${method}`);
}

assert.match(sdk, /alert\(message: string, options\?: SystemDialogAlertOptions\): Promise<void>/);
assert.match(sdk, /confirm\(message: string, options\?: SystemDialogConfirmOptions\): Promise<boolean>/);
for (const option of ["title", "confirmLabel", "cancelLabel"]) {
  assert.match(sdk, new RegExp("\\b" + option + "\\?: string"), "missing dialog option " + option);
}
assert.doesNotMatch(sdk, /\bprompt\s*\(/);

console.log("public API SDK boundary smoke test passed");
