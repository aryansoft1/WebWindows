(function installWebWindowsStorageProvider(global) {
  "use strict";

  const DB_NAME = "webwindows-device-storage";
  const STORE_NAME = "directory-handles";
  const MAX_FILE_BYTES = 8 * 1024 * 1024;
  const MAX_BASE64_LENGTH = Math.ceil(MAX_FILE_BYTES / 3) * 4;
  const PERMISSION_STATES = new Set(["granted", "prompt", "denied", "revoked", "unknown", "unsupported"]);
  const ENTRY_KINDS = new Set(["file", "directory", "unknown"]);
  const memoryHandles = new Map();

  function unsupported(reason) {
    return { supported: false, source: "unsupported", reason: reason || "unsupported" };
  }

  function storageError(code) {
    const error = new Error(code);
    error.code = code;
    return error;
  }

  function isStructuredObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function isSafePathPart(value) {
    return typeof value === "string" && Boolean(value) && value !== "." && value !== ".."
      && !value.includes("/") && !value.includes("\\") && !value.includes("\0")
      && !/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value);
  }

  function normalizePath(path) {
    if (path == null || path === "") return [];
    if (typeof path === "string" && (path.startsWith("/") || path.endsWith("/") || path.includes("\\"))) {
      throw storageError("invalid-storage-path");
    }
    const parts = Array.isArray(path) ? path : (typeof path === "string" ? path.split("/") : null);
    if (!parts) throw storageError("invalid-storage-path");
    return parts.map((part) => {
      if (!isSafePathPart(part)) {
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
    if (!isStructuredObject(value) || !PERMISSION_STATES.has(value.state)
        || typeof value.readable !== "boolean" || typeof value.writable !== "boolean"
        || typeof value.persisted !== "boolean" || typeof value.revoked !== "boolean") {
      throw storageError("invalid-response");
    }
    return {
      state: value.state,
      readable: value.readable,
      writable: value.writable,
      persisted: value.persisted,
      revoked: value.revoked
    };
  }

  function validateNativeVolume(value) {
    if (!isStructuredObject(value)
        || typeof value.id !== "string" || !/^saf-[A-Za-z0-9-]{8,}$/.test(value.id)
        || value.id.includes("://") || typeof value.name !== "string" || !value.name
        || value.kind !== "directory" || value.source !== "android-saf") {
      throw storageError("invalid-response");
    }
    return {
      id: value.id,
      name: value.name,
      kind: "directory",
      permission: validatePermission(value.permission),
      source: "android-saf"
    };
  }

  function validateFiniteInteger(value, nullable) {
    if (nullable && value === null) return null;
    if (!Number.isSafeInteger(value) || value < 0) throw storageError("invalid-response");
    return value;
  }

  function validateNativeMetadata(value, path, expectedKind) {
    if (!isStructuredObject(value) || value.supported !== true || !isSafePathPart(value.name)
        || (path.length > 0 && value.name !== path[path.length - 1])
        || !ENTRY_KINDS.has(value.kind) || (expectedKind && value.kind !== expectedKind)
        || (value.type !== null && (typeof value.type !== "string" || !value.type))
        || typeof value.readable !== "boolean" || typeof value.writable !== "boolean"
        || value.source !== "android-saf") {
      throw storageError("invalid-response");
    }
    const size = validateFiniteInteger(value.size, true);
    const lastModified = validateFiniteInteger(value.lastModified, true);
    if (value.kind !== "file" && (size !== null || value.type !== null)) throw storageError("invalid-response");
    return {
      supported: true,
      name: value.name,
      kind: value.kind,
      size,
      type: value.type,
      lastModified,
      readable: value.readable,
      writable: value.writable,
      path: [...path],
      source: "android-saf"
    };
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
      records.forEach((record) => {
        if (isStructuredObject(record) && typeof record.id === "string"
            && /^browser-dir-[A-Za-z0-9-]{8,}$/.test(record.id)
            && record.handle?.kind === "directory" && typeof record.handle.name === "string"
            && record.handle.name) memoryHandles.set(record.id, record);
      });
    } catch (_) {}
    return [...memoryHandles.values()];
  }

  async function permissionFor(handle, mode, persisted) {
    if (!handle) return { state: "revoked", readable: false, writable: false, persisted: false, revoked: true };
    const descriptor = { mode: mode === "readwrite" ? "readwrite" : "read" };
    let state = "unknown";
    try { state = await handle.queryPermission(descriptor); } catch (_) {}
    if (!PERMISSION_STATES.has(state)) state = "unknown";
    let writeState = state;
    if (descriptor.mode === "read") {
      try { writeState = await handle.queryPermission({ mode: "readwrite" }); } catch (_) { writeState = "unknown"; }
      if (!PERMISSION_STATES.has(writeState)) writeState = "unknown";
    }
    return {
      state,
      readable: state === "granted",
      writable: writeState === "granted",
      persisted: Boolean(persisted),
      revoked: state === "denied" || state === "revoked"
    };
  }

  async function browserRecord(id) {
    await loadHandles();
    const record = memoryHandles.get(id);
    if (!record?.handle) throw storageError("storage-volume-not-found");
    if (record.handle.kind !== "directory" || typeof record.handle.name !== "string" || !record.handle.name) {
      throw storageError("storage-unavailable");
    }
    return record;
  }

  async function resolveBrowserHandle(volumeId, path) {
    const record = await browserRecord(volumeId);
    const permission = await permissionFor(record.handle, "read");
    if (!permission.readable) throw storageError(permission.revoked ? "storage-permission-revoked" : "storage-permission-required");
    const parts = normalizePath(path);
    let handle = record.handle;
    for (let index = 0; index < parts.length; index += 1) {
      const name = parts[index];
      if (index === parts.length - 1) {
        try { handle = await handle.getFileHandle(name); continue; } catch (_) {}
      }
      try { handle = await handle.getDirectoryHandle(name); }
      catch (_) { throw storageError("storage-entry-not-found"); }
    }
    return { record, handle, parts };
  }

  function browserMetadata(handle, file, permission, path) {
    if (!handle || !isSafePathPart(handle.name) || !ENTRY_KINDS.has(handle.kind)) {
      throw storageError("storage-unavailable");
    }
    if (path.length > 0 && path[path.length - 1] !== handle.name) throw storageError("storage-unavailable");
    return {
      supported: true,
      name: handle.name,
      kind: handle.kind,
      size: file ? validateFiniteInteger(file.size, false) : null,
      type: file ? (file.type || "application/octet-stream") : null,
      lastModified: file ? validateFiniteInteger(file.lastModified, false) : null,
      readable: permission.readable,
      writable: permission.writable,
      path: [...path],
      source: "file-system-access-api"
    };
  }

  function decodeBase64(value) {
    if (typeof value !== "string" || value.length > MAX_BASE64_LENGTH || value.length % 4 !== 0) {
      throw storageError("invalid-response");
    }
    let padding = 0;
    if (value.endsWith("==")) padding = 2;
    else if (value.endsWith("=")) padding = 1;
    const contentLength = value.length - padding;
    if ((padding === 1 && contentLength % 4 !== 3) || (padding === 2 && contentLength % 4 !== 2)) {
      throw storageError("invalid-response");
    }
    for (let index = 0; index < contentLength; index += 1) {
      const code = value.charCodeAt(index);
      const valid = code >= 65 && code <= 90 || code >= 97 && code <= 122
        || code >= 48 && code <= 57 || code === 43 || code === 47;
      if (!valid) throw storageError("invalid-response");
    }
    for (let index = contentLength; index < value.length; index += 1) {
      if (value.charCodeAt(index) !== 61) throw storageError("invalid-response");
    }
    function base64Value(code) {
      if (code >= 65 && code <= 90) return code - 65;
      if (code >= 97 && code <= 122) return code - 71;
      if (code >= 48 && code <= 57) return code + 4;
      return code === 43 ? 62 : 63;
    }
    if (padding === 2 && (base64Value(value.charCodeAt(contentLength - 1)) & 15) !== 0) {
      throw storageError("invalid-response");
    }
    if (padding === 1 && (base64Value(value.charCodeAt(contentLength - 1)) & 3) !== 0) {
      throw storageError("invalid-response");
    }
    let binary;
    try { binary = global.atob(value); }
    catch (_) { throw storageError("invalid-response"); }
    if (binary.length > MAX_FILE_BYTES) throw storageError("invalid-response");
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
          name: record.name || record.handle.name,
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
        if (!handle || handle.kind !== "directory" || !isSafePathPart(handle.name)) throw storageError("storage-unavailable");
        const id = replacementId || randomId("browser-dir");
        await persistHandle({ id, name: handle.name, handle });
        const record = memoryHandles.get(id);
        const result = { id, name: handle.name, kind: "directory", permission: await permissionFor(handle, "read", record?.persisted), source: "file-system-access-api" };
        emit?.("webwindows:storage-change", { reason: "directory-picked", volume: result });
        return result;
      },
      async requestPermission(volumeId, mode) {
        const record = await browserRecord(volumeId);
        if (mode != null && mode !== "read" && mode !== "readwrite") throw storageError("invalid-storage-params");
        const requestedMode = mode === "readwrite" ? "readwrite" : "read";
        let state;
        try {
          state = await record.handle.queryPermission({ mode: requestedMode });
          if (state === "prompt") state = await record.handle.requestPermission({ mode: requestedMode });
        } catch (_) {
          state = "unknown";
        }
        const permission = await permissionFor(record.handle, requestedMode, record.persisted);
        emit?.("webwindows:storage-change", { reason: "permission", volumeId, permission });
        return permission;
      },
      async listDirectory(volumeId, path) {
        const resolved = await resolveBrowserHandle(volumeId, path);
        if (resolved.handle.kind !== "directory") throw storageError("storage-not-a-directory");
        const entries = [];
        for await (const [name, handle] of resolved.handle.entries()) {
          let file = null;
          if (handle.kind === "file") file = await handle.getFile();
          if (name !== handle.name || !isSafePathPart(name)) throw storageError("storage-unavailable");
          entries.push(browserMetadata(handle, file, resolved.permission, [...resolved.parts, name]));
        }
        return entries.sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "directory" ? -1 : 1));
      },
      async openFile(volumeId, path) {
        const resolved = await resolveBrowserHandle(volumeId, path);
        if (resolved.handle.kind !== "file") throw storageError("storage-not-a-file");
        const file = await resolved.handle.getFile();
        if (file.size > MAX_FILE_BYTES) throw storageError("storage-file-too-large");
        let data;
        try { data = await file.arrayBuffer(); }
        catch (_) { throw storageError("storage-read-failed"); }
        if (!(data instanceof ArrayBuffer) || data.byteLength > MAX_FILE_BYTES || data.byteLength !== file.size) {
          throw storageError("storage-read-failed");
        }
        return { metadata: browserMetadata(resolved.handle, file, resolved.permission, resolved.parts), data };
      },
      async getMetadata(volumeId, path) {
        const resolved = await resolveBrowserHandle(volumeId, path);
        const file = resolved.handle.kind === "file" ? await resolved.handle.getFile() : null;
        return browserMetadata(resolved.handle, file, resolved.permission, resolved.parts);
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
        result = validateNativeVolume(result);
        emit?.("webwindows:storage-change", { reason: "directory-picked", volume: result });
        return result;
      },
      requestPermission: async (volumeId) => {
        requireNativeVolumeId(volumeId);
        const volumes = await call("storageListVolumes");
        if (!Array.isArray(volumes)) throw storageError("invalid-response");
        const validated = volumes.map(validateNativeVolume);
        const volume = validated.find((candidate) => candidate.id === volumeId);
        if (!volume) throw storageError("storage-volume-not-found");
        return volume.permission;
      },
      async listDirectory(volumeId, path) {
        requireNativeVolumeId(volumeId);
        const basePath = normalizePath(path);
        const entries = await call("storageListDirectory", { volumeId, path: basePath });
        if (!Array.isArray(entries)) throw storageError("invalid-response");
        return entries.map((entry) => validateNativeMetadata(entry, [...basePath, entry?.name]));
      },
      async openFile(volumeId, path) {
        requireNativeVolumeId(volumeId);
        const normalizedPath = normalizePath(path);
        const result = await call("storageOpenFile", { volumeId, path: normalizedPath });
        if (!isStructuredObject(result)) throw storageError("invalid-response");
        const metadata = validateNativeMetadata(result.metadata, normalizedPath, "file");
        if (metadata.size !== null && metadata.size > MAX_FILE_BYTES) throw storageError("invalid-response");
        const data = decodeBase64(result.base64);
        if (metadata.size !== null && metadata.size !== data.byteLength) throw storageError("invalid-response");
        return { metadata, data };
      },
      async getMetadata(volumeId, path) {
        const normalizedPath = normalizePath(path);
        const result = await call("storageGetMetadata", { volumeId: requireNativeVolumeId(volumeId), path: normalizedPath });
        return validateNativeMetadata(result, normalizedPath);
      }
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
