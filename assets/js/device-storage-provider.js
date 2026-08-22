(function installWebWindowsStorageProvider(global) {
  "use strict";

  const DB_NAME = "webwindows-device-storage";
  const STORE_NAME = "directory-handles";
  const memoryHandles = new Map();

  function unsupported(reason) {
    return { supported: false, source: "unsupported", reason: reason || "unsupported" };
  }

  function storageError(code) {
    const error = new Error(code);
    error.code = code;
    return error;
  }

  function normalizePath(path) {
    if (path == null || path === "") return [];
    if (typeof path === "string" && (path.startsWith("/") || path.endsWith("/") || path.includes("\\"))) {
      throw storageError("invalid-storage-path");
    }
    const parts = Array.isArray(path) ? path : (typeof path === "string" ? path.split("/") : null);
    if (!parts) throw storageError("invalid-storage-path");
    return parts.map((part) => {
      if (typeof part !== "string" || !part || part === "." || part === ".." || part.includes("/")
          || part.includes("\\") || part.includes("\0") || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(part)) {
        throw storageError("invalid-storage-path");
      }
      return part;
    });
  }

  function normalizePickerOptions(options) {
    if (options == null) return {};
    if (typeof options !== "object" || Array.isArray(options)) throw storageError("invalid-storage-params");
    if (Object.prototype.hasOwnProperty.call(options, "writable") && typeof options.writable !== "boolean") {
      throw storageError("invalid-storage-params");
    }
    if (Object.prototype.hasOwnProperty.call(options, "replaceVolumeId")
        && options.replaceVolumeId != null && typeof options.replaceVolumeId !== "string") {
      throw storageError("invalid-storage-params");
    }
    return options;
  }

  function normalizeCancellation(error) {
    if (error?.name === "AbortError" || error?.code === "storage-picker-cancelled"
        || error?.message === "storage-picker-cancelled") return storageError("user-cancelled");
    return error;
  }

  function validatePermission(value) {
    const states = new Set(["granted", "prompt", "denied", "revoked", "unsupported"]);
    if (!value || typeof value !== "object" || !states.has(value.state)
        || typeof value.readable !== "boolean" || typeof value.writable !== "boolean"
        || typeof value.persisted !== "boolean" || typeof value.revoked !== "boolean") {
      throw storageError("invalid-response");
    }
    return value;
  }

  function validateNativeVolume(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)
        || typeof value.id !== "string" || !/^saf-[A-Za-z0-9-]{8,}$/.test(value.id)
        || value.id.includes("://") || typeof value.name !== "string" || !value.name
        || value.kind !== "directory" || value.source !== "android-saf") {
      throw storageError("invalid-response");
    }
    validatePermission(value.permission);
    return value;
  }

  function requireNativeVolumeId(value) {
    if (typeof value !== "string" || !/^saf-[A-Za-z0-9-]{8,}$/.test(value)) {
      throw storageError("storage-volume-not-found");
    }
    return value;
  }

  function randomId(prefix) {
    const value = global.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${prefix}-${value}`;
  }

  function openDatabase() {
    if (!global.indexedDB) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const request = global.indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("storage-database-error"));
    });
  }

  async function databaseRequest(mode, operation) {
    const database = await openDatabase();
    if (!database) return null;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const request = operation(transaction.objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("storage-database-error"));
      transaction.oncomplete = () => database.close();
    });
  }

  async function persistHandle(record) {
    record.persisted = Boolean(global.indexedDB);
    memoryHandles.set(record.id, record);
    try {
      if (await databaseRequest("readwrite", (store) => store.put(record)) === null) record.persisted = false;
    } catch (_) { record.persisted = false; }
  }

  async function loadHandles() {
    if (memoryHandles.size) return [...memoryHandles.values()];
    try {
      const records = await databaseRequest("readonly", (store) => store.getAll()) || [];
      records.forEach((record) => memoryHandles.set(record.id, record));
    } catch (_) {}
    return [...memoryHandles.values()];
  }

  async function permissionFor(handle, mode, persisted) {
    if (!handle) return { state: "revoked", readable: false, writable: false, persisted: false, revoked: true };
    const descriptor = { mode: mode === "readwrite" ? "readwrite" : "read" };
    let state = "prompt";
    try { state = await handle.queryPermission(descriptor); } catch (_) {}
    let writeState = state;
    if (descriptor.mode === "read") {
      try { writeState = await handle.queryPermission({ mode: "readwrite" }); } catch (_) { writeState = "prompt"; }
    }
    return {
      state,
      readable: state === "granted",
      writable: writeState === "granted",
      persisted: Boolean(persisted),
      revoked: state === "denied"
    };
  }

  async function browserRecord(id) {
    await loadHandles();
    const record = memoryHandles.get(id);
    if (!record?.handle) throw new Error("storage-volume-not-found");
    return record;
  }

  async function resolveBrowserHandle(volumeId, path) {
    const record = await browserRecord(volumeId);
    const permission = await permissionFor(record.handle, "read");
    if (!permission.readable) throw new Error(permission.revoked ? "storage-permission-revoked" : "storage-permission-required");
    const parts = normalizePath(path);
    let handle = record.handle;
    for (let index = 0; index < parts.length; index += 1) {
      const name = parts[index];
      if (index === parts.length - 1) {
        try { handle = await handle.getFileHandle(name); continue; } catch (_) {}
      }
      handle = await handle.getDirectoryHandle(name);
    }
    return { record, handle, parts };
  }

  function browserMetadata(handle, file) {
    return {
      supported: true,
      name: handle.name,
      kind: handle.kind,
      size: file ? file.size : null,
      type: file ? (file.type || "application/octet-stream") : null,
      lastModified: file ? file.lastModified : null,
      source: "file-system-access-api"
    };
  }

  function decodeBase64(value) {
    const binary = global.atob(String(value || ""));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes.buffer;
  }

  function createBrowserAdapter(emit) {
    const pickerSupported = typeof global.showDirectoryPicker === "function";
    return {
      id: "browser-storage",
      getCapabilities() {
        return {
          estimate: { supported: typeof navigator.storage?.estimate === "function", source: typeof navigator.storage?.estimate === "function" ? "storage-manager-api" : "unsupported" },
          directoryPicker: { supported: pickerSupported, source: pickerSupported ? "file-system-access-api" : "unsupported" },
          persistentHandles: { supported: pickerSupported && Boolean(global.indexedDB), source: "indexeddb" },
          read: { supported: pickerSupported, source: pickerSupported ? "file-system-access-api" : "unsupported" },
          write: { supported: false, source: "unsupported" }
        };
      },
      async listVolumes() {
        if (!pickerSupported) return [];
        const records = await loadHandles();
        return Promise.all(records.map(async (record) => ({
          id: record.id,
          name: record.name || record.handle?.name || "已授权目录",
          kind: "directory",
          permission: await permissionFor(record.handle, "read", record.persisted),
          source: "file-system-access-api"
        })));
      },
      async pickDirectory(options) {
        if (!pickerSupported) return unsupported("directory-picker-unavailable");
        const normalizedOptions = normalizePickerOptions(options);
        const replacementId = normalizedOptions.replaceVolumeId || "";
        await loadHandles();
        if (replacementId && !memoryHandles.has(replacementId)) throw storageError("storage-volume-not-found");
        let handle;
        try {
          handle = await global.showDirectoryPicker({ mode: normalizedOptions.writable ? "readwrite" : "read" });
        } catch (error) {
          throw normalizeCancellation(error);
        }
        const id = replacementId || randomId("browser-dir");
        await persistHandle({ id, name: handle.name, handle });
        const record = memoryHandles.get(id);
        const result = { id, name: handle.name, kind: "directory", permission: await permissionFor(handle, "read", record?.persisted), source: "file-system-access-api" };
        emit?.("webwindows:storage-change", { reason: "directory-picked", volume: result });
        return result;
      },
      async requestPermission(volumeId, mode) {
        const record = await browserRecord(volumeId);
        const requestedMode = mode === "readwrite" ? "readwrite" : "read";
        let state = await record.handle.queryPermission({ mode: requestedMode });
        if (state === "prompt") state = await record.handle.requestPermission({ mode: requestedMode });
        const permission = await permissionFor(record.handle, requestedMode, record.persisted);
        emit?.("webwindows:storage-change", { reason: "permission", volumeId, permission });
        return permission;
      },
      async listDirectory(volumeId, path) {
        const resolved = await resolveBrowserHandle(volumeId, path);
        if (resolved.handle.kind !== "directory") throw new Error("storage-not-a-directory");
        const entries = [];
        for await (const [name, handle] of resolved.handle.entries()) {
          let file = null;
          if (handle.kind === "file") file = await handle.getFile();
          entries.push(Object.assign(browserMetadata(handle, file), { path: [...resolved.parts, name] }));
        }
        return entries.sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "directory" ? -1 : 1));
      },
      async openFile(volumeId, path) {
        const resolved = await resolveBrowserHandle(volumeId, path);
        if (resolved.handle.kind !== "file") throw new Error("storage-not-a-file");
        const file = await resolved.handle.getFile();
        return { metadata: browserMetadata(resolved.handle, file), data: await file.arrayBuffer() };
      },
      async getMetadata(volumeId, path) {
        const resolved = await resolveBrowserHandle(volumeId, path);
        const file = resolved.handle.kind === "file" ? await resolved.handle.getFile() : null;
        return browserMetadata(resolved.handle, file);
      }
    };
  }

  function createAndroidAdapter(bridge, emit) {
    const call = (name, payload) => bridge[name](payload || {});
    return {
      id: "android-saf",
      getCapabilities: () => ({
        estimate: { supported: typeof navigator.storage?.estimate === "function", source: "storage-manager-api" },
        directoryPicker: { supported: true, source: "android-saf" },
        persistentHandles: { supported: true, source: "android-saf" },
        read: { supported: true, source: "android-saf" },
        write: { supported: false, source: "unsupported" }
      }),
      async listVolumes() {
        const result = await call("storageListVolumes");
        if (!Array.isArray(result)) throw storageError("invalid-response");
        return result.map(validateNativeVolume);
      },
      async pickDirectory(options) {
        const normalizedOptions = normalizePickerOptions(options);
        const replacementId = normalizedOptions.replaceVolumeId == null ? null : requireNativeVolumeId(normalizedOptions.replaceVolumeId);
        let result;
        try {
          result = await call("storagePickDirectory", {
            writable: normalizedOptions.writable !== false,
            replaceVolumeId: replacementId
          });
        } catch (error) {
          throw normalizeCancellation(error);
        }
        validateNativeVolume(result);
        emit?.("webwindows:storage-change", { reason: "directory-picked", volume: result });
        return result;
      },
      requestPermission: async (volumeId) => {
        requireNativeVolumeId(volumeId);
        const volumes = await call("storageListVolumes");
        if (!Array.isArray(volumes)) throw storageError("invalid-response");
        volumes.forEach(validateNativeVolume);
        return volumes.find((volume) => volume.id === volumeId)?.permission || { state: "revoked", readable: false, writable: false, persisted: false, revoked: true };
      },
      async listDirectory(volumeId, path) {
        requireNativeVolumeId(volumeId);
        const basePath = normalizePath(path);
        const entries = await call("storageListDirectory", { volumeId, path: basePath });
        if (!Array.isArray(entries)) throw storageError("invalid-response");
        return entries.map((entry) => Object.assign({}, entry, { path: [...basePath, entry.name] }));
      },
      async openFile(volumeId, path) {
        requireNativeVolumeId(volumeId);
        const result = await call("storageOpenFile", { volumeId, path: normalizePath(path) });
        return { metadata: result.metadata, data: decodeBase64(result.base64) };
      },
      getMetadata: (volumeId, path) => call("storageGetMetadata", { volumeId: requireNativeVolumeId(volumeId), path: normalizePath(path) })
    };
  }

  global.WebWindowsStorageProvider = Object.freeze({
    create(options) {
      const bridge = options?.bridge;
      const hasSaf = bridge && ["storageListVolumes", "storagePickDirectory", "storageListDirectory", "storageOpenFile", "storageGetMetadata"]
        .every((name) => typeof bridge[name] === "function");
      return hasSaf ? createAndroidAdapter(bridge, options?.emit) : createBrowserAdapter(options?.emit);
    }
  });
})(window);
