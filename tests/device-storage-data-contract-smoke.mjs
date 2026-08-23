import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile(new URL("../assets/js/device-storage-provider.js", import.meta.url), "utf8");
const MAX_BYTES = 8 * 1024 * 1024;

const permission = (state = "granted") => ({
  state,
  readable: state === "granted",
  writable: state === "granted",
  persisted: state === "granted" || state === "revoked",
  revoked: state === "revoked"
});
const volume = () => ({
  id: "saf-12345678", name: "Documents", kind: "directory",
  permission: permission(), source: "android-saf"
});
const metadata = (overrides = {}) => ({
  supported: true, name: "note.bin", kind: "file", size: 3,
  type: "application/octet-stream", lastModified: 123,
  readable: true, writable: true, source: "android-saf", ...overrides
});

const responses = {
  volumes: [volume()], picked: volume(), entries: [], metadata: metadata(),
  opened: { metadata: metadata(), base64: "AAEC" }
};
const bridge = {
  storageListVolumes: async () => responses.volumes,
  storagePickDirectory: async () => responses.picked,
  storageListDirectory: async () => responses.entries,
  storageGetMetadata: async () => responses.metadata,
  storageOpenFile: async () => responses.opened
};
const window = {
  window: null, navigator: {},
  atob: (value) => Buffer.from(value, "base64").toString("binary"),
  Uint8Array, ArrayBuffer, Promise, Object, Map, Set, Math, Date, String, Error, console
};
window.window = window;
vm.runInNewContext(source, window, { filename: "device-storage-provider.js" });
const storage = window.WebWindowsStorageProvider.create({ bridge });

assert.equal(storage.getCapabilities().read.supported, true);
assert.equal(storage.getCapabilities().write.supported, false);
const sanitizedVolume = (await storage.listVolumes())[0];
assert.deepEqual(Object.keys(sanitizedVolume).sort(), ["id", "kind", "name", "permission", "source"]);
for (const state of ["granted", "prompt", "denied", "revoked", "unknown", "unsupported"]) {
  responses.volumes = [{ ...volume(), permission: permission(state) }];
  assert.equal((await storage.listVolumes())[0].permission.state, state);
}
for (const malformed of [
  { ...volume(), id: "content://provider/root" },
  { ...volume(), id: "/storage/root" },
  { ...volume(), name: "" },
  { ...volume(), kind: "file" },
  { ...volume(), permission: { ...permission(), readable: 1 } },
  { ...volume(), source: "unknown-native" }
]) {
  responses.volumes = [malformed];
  await assert.rejects(() => storage.listVolumes(), (error) => error.code === "invalid-response");
}
responses.volumes = [volume()];
await assert.rejects(() => storage.requestPermission("saf-unknown00"), (error) => error.code === "storage-volume-not-found");
responses.volumes = [{ ...volume(), permission: permission("revoked") }];
assert.equal((await storage.requestPermission("saf-12345678")).revoked, true);

responses.entries = [];
assert.deepEqual(await storage.listDirectory("saf-12345678", []), []);
responses.entries = [
  metadata({ name: "empty.txt", size: 0 }),
  metadata({ name: "Folder", kind: "directory", size: null, type: null, lastModified: null }),
  metadata({ name: "Mystery", kind: "unknown", size: null, type: null, lastModified: null })
];
const entries = await storage.listDirectory("saf-12345678", ["Nested"]);
assert.deepEqual([...entries[0].path], ["Nested", "empty.txt"]);
assert.equal(entries[1].size, null);
assert.equal(entries[2].kind, "unknown");
for (const malformed of [
  metadata({ name: "bad/name" }), metadata({ kind: "symlink" }),
  metadata({ size: -1 }), metadata({ size: "3" }),
  metadata({ lastModified: Infinity }), metadata({ readable: "yes" })
]) {
  responses.entries = [malformed];
  await assert.rejects(() => storage.listDirectory("saf-12345678", []), (error) => error.code === "invalid-response");
}

responses.metadata = metadata({ size: 0, lastModified: null, contentUri: "private-value" });
const zeroMetadata = await storage.getMetadata("saf-12345678", ["note.bin"]);
assert.equal(zeroMetadata.size, 0);
assert.equal(zeroMetadata.lastModified, null);
assert.equal("contentUri" in zeroMetadata, false);
for (const malformed of [
  metadata({ size: NaN }), metadata({ size: -1 }), metadata({ size: "0" }),
  metadata({ lastModified: -1 }), metadata({ type: 7 })
]) {
  responses.metadata = malformed;
  await assert.rejects(() => storage.getMetadata("saf-12345678", []), (error) => error.code === "invalid-response");
}

async function rejectsOpen(opened) {
  responses.opened = opened;
  await assert.rejects(() => storage.openFile("saf-12345678", ["note.bin"]), (error) => error.code === "invalid-response");
}

responses.opened = { metadata: metadata({ size: 0 }), base64: "" };
assert.equal((await storage.openFile("saf-12345678", ["note.bin"])).data.byteLength, 0);
responses.opened = { metadata: metadata({ size: 1 }), base64: "AA==" };
assert.deepEqual([...new Uint8Array((await storage.openFile("saf-12345678", ["note.bin"])).data)], [0]);
responses.opened = { metadata: metadata({ name: "utf8.txt", size: 6, type: "text/plain" }), base64: Buffer.from("你好").toString("base64") };
assert.equal(new TextDecoder().decode((await storage.openFile("saf-12345678", ["utf8.txt"])).data), "你好");
responses.opened = { metadata: metadata({ size: 3 }), base64: "AAEC" };
assert.deepEqual([...new Uint8Array((await storage.openFile("saf-12345678", ["note.bin"])).data)], [0, 1, 2]);

for (const invalidBase64 of ["A", "AAA", "A===", "AA=A", "AB==", "AAB=", "AA E=", "data:;base64,AA==", "雪山"])
  await rejectsOpen({ metadata: metadata({ size: null }), base64: invalidBase64 });
await rejectsOpen({ metadata: metadata({ size: null }), base64: null });
await rejectsOpen({ metadata: metadata({ size: 2 }), base64: "AAEC" });
await rejectsOpen({ metadata: metadata({ name: "other.bin", size: 3 }), base64: "AAEC" });
await rejectsOpen({ metadata: metadata({ kind: "directory", size: null }), base64: "" });
await rejectsOpen({ metadata: metadata({ size: MAX_BYTES + 1 }), base64: "" });

const maximumBase64 = Buffer.alloc(MAX_BYTES, 0xa5).toString("base64");
responses.opened = { metadata: metadata({ name: "maximum.bin", size: MAX_BYTES }), base64: maximumBase64 };
assert.equal((await storage.openFile("saf-12345678", ["maximum.bin"])).data.byteLength, MAX_BYTES);
await rejectsOpen({ metadata: metadata({ size: null }), base64: `${maximumBase64}AAAA` });

const revoked = new Error("storage-permission-revoked");
revoked.code = "storage-permission-revoked";
bridge.storageOpenFile = async () => { throw revoked; };
await assert.rejects(() => storage.openFile("saf-12345678", ["note.bin"]), (error) => error.code === "storage-permission-revoked");

console.log("device storage data contract smoke tests passed");
