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
assert.equal(storage.getCapabilities().write.supported, false);
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
let oversizedReadAttempted = false;
const oversizedFile = {
  kind: "file",
  name: "oversized.bin",
  async getFile() {
    return { name: "oversized.bin", size: 8 * 1024 * 1024 + 1, type: "application/octet-stream", lastModified: 123,
      async arrayBuffer() { oversizedReadAttempted = true; return new ArrayBuffer(0); } };
  }
};
const oversizedRoot = directoryHandle("Oversized", [oversizedFile]);
window.showDirectoryPicker = async () => oversizedRoot;
await storage.pickDirectory({ replaceVolumeId: volume.id });
await assert.rejects(() => storage.openFile(volume.id, ["oversized.bin"]), /storage-file-too-large/);
assert.equal(oversizedReadAttempted, false);
await assert.rejects(() => storage.getMetadata(volume.id, [".."]), /invalid-storage-path/);
await assert.rejects(() => storage.getMetadata(volume.id, ["a\0b"]), /invalid-storage-path/);
await assert.rejects(() => storage.getMetadata(volume.id, "/absolute"), /invalid-storage-path/);
await assert.rejects(() => storage.getMetadata(volume.id, [7]), /invalid-storage-path/);
await assert.rejects(() => storage.pickDirectory({ replaceVolumeId: "missing-volume" }), /storage-volume-not-found/);
window.showDirectoryPicker = async () => { const error = new Error("cancelled"); error.name = "AbortError"; throw error; };
await assert.rejects(() => storage.pickDirectory(), (error) => error.code === "user-cancelled");
oversizedRoot.queryPermission = async () => "denied";
await assert.rejects(() => storage.listDirectory(volume.id), /storage-permission-revoked/);
await assert.rejects(() => storage.openFile(volume.id, ["oversized.bin"]), /storage-permission-revoked/);
oversizedRoot.queryPermission = async () => { throw new Error("provider unavailable"); };
assert.equal((await storage.listVolumes())[0].permission.state, "unknown");
assert.equal(events.some((event) => event.type === "webwindows:storage-change"), true);

const unsupportedWindow = { window: null, navigator: {}, Promise, Object, Map, Set, Math, Date, String, Error, console };
unsupportedWindow.window = unsupportedWindow;
vm.runInNewContext(source, unsupportedWindow, { filename: "device-storage-provider.js" });
const unsupported = unsupportedWindow.WebWindowsStorageProvider.create({});
assert.equal(unsupported.getCapabilities().directoryPicker.supported, false);
assert.equal((await unsupported.pickDirectory()).supported, false);

function indexedDbWith(records) {
  return {
    open() {
      const openRequest = {};
      queueMicrotask(() => {
        openRequest.result = {
          objectStoreNames: { contains: () => true },
          transaction() {
            const transaction = {};
            const store = {
              getAll() {
                const request = {};
                queueMicrotask(() => {
                  request.result = records.slice();
                  request.onsuccess?.();
                  transaction.oncomplete?.();
                });
                return request;
              },
              put(record) {
                const request = {};
                queueMicrotask(() => {
                  const index = records.findIndex((value) => value.id === record.id);
                  if (index >= 0) records[index] = record;
                  else records.push(record);
                  request.result = record.id;
                  request.onsuccess?.();
                  transaction.oncomplete?.();
                });
                return request;
              }
            };
            transaction.objectStore = () => store;
            return transaction;
          },
          close() {}
        };
        openRequest.onsuccess?.();
      });
      return openRequest;
    }
  };
}

const restoredId = "browser-dir-restored-volume";
const restoredRecords = [
  { id: restoredId, name: root.name, handle: root, persisted: true },
  { id: "browser-dir-malformed", name: "Bad", handle: { kind: "file", name: "bad.txt" }, persisted: true }
];
const restoredWindow = {
  ...window,
  window: null,
  indexedDB: indexedDbWith(restoredRecords),
  showDirectoryPicker: async () => replacementRoot
};
restoredWindow.window = restoredWindow;
vm.runInNewContext(source, restoredWindow, { filename: "device-storage-provider.js" });
const restoredStorage = restoredWindow.WebWindowsStorageProvider.create({});
const restoredReplacement = await restoredStorage.pickDirectory({ replaceVolumeId: restoredId });
assert.equal(restoredReplacement.id, restoredId);
assert.equal(restoredRecords.length, 2);
assert.equal((await restoredStorage.listVolumes()).length, 1);

const androidBridge = {
  storageListVolumes: async () => [{ id: "saf-12345678", name: "Documents", kind: "directory", permission: { state: "granted", readable: true, writable: true, persisted: true, revoked: false }, source: "android-saf" }],
  storagePickDirectory: async () => ({ id: "saf-12345678", name: "Documents", kind: "directory", permission: { state: "granted", readable: true, writable: true, persisted: true, revoked: false }, source: "android-saf" }),
  storageListDirectory: async () => [{ supported: true, name: "note.txt", kind: "file", size: 5, type: "text/plain", lastModified: 123, readable: true, writable: true, source: "android-saf" }],
  storageGetMetadata: async () => ({ supported: true, name: "note.txt", kind: "file", size: 5, type: "text/plain", lastModified: 123, readable: true, writable: true, source: "android-saf" }),
  storageOpenFile: async () => ({ metadata: { supported: true, name: "note.txt", kind: "file", size: 5, type: "text/plain", lastModified: 123, readable: true, writable: true, source: "android-saf" }, base64: "aGVsbG8=" })
};
const androidWindow = { window: null, navigator: {}, atob: (value) => Buffer.from(value, "base64").toString("binary"), Uint8Array, ArrayBuffer, Promise, Object, Map, Set, Math, Date, String, Error, console };
androidWindow.window = androidWindow;
vm.runInNewContext(source, androidWindow, { filename: "device-storage-provider.js" });
const androidStorage = androidWindow.WebWindowsStorageProvider.create({ bridge: androidBridge });
assert.equal(androidStorage.id, "android-saf");
assert.equal(androidStorage.getCapabilities().write.supported, false);
assert.deepEqual([...(await androidStorage.listDirectory("saf-12345678", ["folder"]))[0].path], ["folder", "note.txt"]);
assert.equal(new TextDecoder().decode((await androidStorage.openFile("saf-12345678", ["note.txt"])).data), "hello");
await assert.rejects(() => androidStorage.listDirectory(7, []), /storage-volume-not-found/);
await assert.rejects(() => androidStorage.listDirectory("saf-12345678", ["content:escape"]), /invalid-storage-path/);
androidBridge.storagePickDirectory = async () => ({ id: "saf-12345678", name: "Documents" });
await assert.rejects(() => androidStorage.pickDirectory(), (error) => error.code === "invalid-response");
androidBridge.storagePickDirectory = async () => { const error = new Error("storage-picker-cancelled"); error.code = "storage-picker-cancelled"; throw error; };
await assert.rejects(() => androidStorage.pickDirectory(), (error) => error.code === "user-cancelled");

console.log("device storage provider smoke tests passed");
