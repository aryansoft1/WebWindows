import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile(new URL("../assets/js/device-storage-provider.js", import.meta.url), "utf8");

function fileHandle(name, text, type = "text/plain") {
  return {
    kind: "file",
    name,
    async getFile() {
      const bytes = new TextEncoder().encode(text);
      return { name, size: bytes.length, type, lastModified: 123, arrayBuffer: async () => bytes.buffer };
    }
  };
}

function directoryHandle(name, entries) {
  const map = new Map(entries.map((entry) => [entry.name, entry]));
  return {
    kind: "directory",
    name,
    queryPermission: async ({ mode }) => mode === "readwrite" ? "prompt" : "granted",
    requestPermission: async () => "granted",
    async *entries() { for (const entry of map) yield entry; },
    async getDirectoryHandle(child) { const value = map.get(child); if (value?.kind !== "directory") throw new Error("not-found"); return value; },
    async getFileHandle(child) { const value = map.get(child); if (value?.kind !== "file") throw new Error("not-found"); return value; }
  };
}

const note = fileHandle("note.txt", "hello");
const emptyFolder = directoryHandle("Empty", []);
const nestedNote = fileHandle("nested.txt", "inside");
const nestedFolder = directoryHandle("Nested", [nestedNote]);
const root = directoryHandle("Documents", [note, emptyFolder, nestedFolder]);
const events = [];
const window = {
  window: null,
  navigator: { storage: { estimate: async () => ({ usage: 1, quota: 10 }) } },
  showDirectoryPicker: async () => root,
  crypto: { randomUUID: () => "test-volume" },
  TextEncoder,
  Uint8Array,
  ArrayBuffer,
  Map,
  Set,
  Promise,
  Object,
  Math,
  Date,
  String,
  Error,
  console
};
window.window = window;
vm.runInNewContext(source, window, { filename: "device-storage-provider.js" });
const storage = window.WebWindowsStorageProvider.create({ emit: (type, detail) => events.push({ type, detail }) });

assert.equal(storage.getCapabilities().directoryPicker.supported, true);
const volume = await storage.pickDirectory({ writable: false });
assert.equal(volume.id, "browser-dir-test-volume");
assert.equal(volume.permission.readable, true);
assert.equal((await storage.listVolumes()).length, 1);
const entries = await storage.listDirectory(volume.id);
assert.equal(entries.find((entry) => entry.name === "note.txt").size, 5);
assert.equal(entries.find((entry) => entry.name === "note.txt").readable, true);
assert.equal((await storage.listDirectory(volume.id, ["Empty"])).length, 0);
assert.equal((await storage.listDirectory(volume.id, ["Nested"]))[0].path.join("/"), "Nested/nested.txt");
assert.equal((await storage.getMetadata(volume.id, ["note.txt"])).type, "text/plain");
const opened = await storage.openFile(volume.id, ["note.txt"]);
assert.equal(new TextDecoder().decode(opened.data), "hello");
const replacementRoot = directoryHandle("Replacement", [fileHandle("new.txt", "new")]);
window.showDirectoryPicker = async () => replacementRoot;
const replacement = await storage.pickDirectory({ replaceVolumeId: volume.id, writable: true });
assert.equal(replacement.id, volume.id);
assert.equal((await storage.listDirectory(volume.id))[0].name, "new.txt");
await assert.rejects(() => storage.getMetadata(volume.id, [".."]), /invalid-storage-path/);
replacementRoot.queryPermission = async () => "denied";
await assert.rejects(() => storage.listDirectory(volume.id), /storage-permission-revoked/);
await assert.rejects(() => storage.openFile(volume.id, ["new.txt"]), /storage-permission-revoked/);
assert.equal(events.some((event) => event.type === "webwindows:storage-change"), true);

const unsupportedWindow = { window: null, navigator: {}, Promise, Object, Map, Set, Math, Date, String, Error, console };
unsupportedWindow.window = unsupportedWindow;
vm.runInNewContext(source, unsupportedWindow, { filename: "device-storage-provider.js" });
const unsupported = unsupportedWindow.WebWindowsStorageProvider.create({});
assert.equal(unsupported.getCapabilities().directoryPicker.supported, false);
assert.equal((await unsupported.pickDirectory()).supported, false);

const androidBridge = {
  storageListVolumes: async () => [{ id: "saf-12345678", name: "Documents", permission: { state: "granted" } }],
  storagePickDirectory: async () => ({ id: "saf-12345678", name: "Documents" }),
  storageListDirectory: async () => [{ name: "note.txt", kind: "file", size: 5 }],
  storageGetMetadata: async () => ({ name: "note.txt", kind: "file", size: 5 }),
  storageOpenFile: async () => ({ metadata: { name: "note.txt", size: 5 }, base64: "aGVsbG8=" })
};
const androidWindow = { window: null, navigator: {}, atob: (value) => Buffer.from(value, "base64").toString("binary"), Uint8Array, ArrayBuffer, Promise, Object, Map, Set, Math, Date, String, Error, console };
androidWindow.window = androidWindow;
vm.runInNewContext(source, androidWindow, { filename: "device-storage-provider.js" });
const androidStorage = androidWindow.WebWindowsStorageProvider.create({ bridge: androidBridge });
assert.equal(androidStorage.id, "android-saf");
assert.deepEqual([...(await androidStorage.listDirectory("saf-12345678", ["folder"]))[0].path], ["folder", "note.txt"]);
assert.equal(new TextDecoder().decode((await androidStorage.openFile("saf-12345678", ["note.txt"])).data), "hello");

console.log("device storage provider smoke tests passed");
