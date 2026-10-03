import {
  joinProjectPath,
  normalizeProjectPath,
  parentProjectPath
} from "./path-policy.js";
import { LocalStorageProjectDatabase } from "./local-storage-database.js";

export const STUDIO_DATABASE_NAME = "webwindows-developer-studio-v1";
export const STUDIO_STORAGE_VERSION = 1;
export const STUDIO_SCHEMA_VERSION = 1;
export const STUDIO_FALLBACK_STORAGE_SUFFIX = "localstorage-fallback-v1";

const PROJECT_STORE = "projects";
const FILE_STORE = "files";
const PROJECT_FILE_INDEX = "projectId";

const STORAGE_STAGE_LABELS = Object.freeze({
  open: "打开",
  "open-blocked": "升级",
  "create-project": "写入",
  reset: "重建",
  "reset-blocked": "重建"
});

export class StudioStorageError extends Error {
  constructor(stage, cause, message) {
    const causeName = String(cause?.name || "StorageError");
    const causeMessage = String(cause?.message || message || "未知错误");
    const stageLabel = STORAGE_STAGE_LABELS[stage] || "访问";
    super(message || `Developer Studio 项目存储${stageLabel}失败（${causeName}: ${causeMessage}）。`);
    this.name = "StudioStorageError";
    this.code = "studio-storage-failure";
    this.stage = stage;
    this.causeName = causeName;
    this.causeMessage = causeMessage;
    this.recoverable = stage !== "open-blocked" && stage !== "reset-blocked";
    this.cause = cause;
  }
}

export function isStudioStorageError(error) {
  return error?.code === "studio-storage-failure";
}

export class ProjectRepository {
  constructor(options = {}) {
    this.indexedDB = options.indexedDB || globalThis.indexedDB;
    this.localStorage = options.localStorage || globalThis.localStorage;
    this.crypto = options.crypto || globalThis.crypto;
    this.databaseName = options.databaseName || STUDIO_DATABASE_NAME;
    this.fallbackStorageKey = `${this.databaseName}:${STUDIO_FALLBACK_STORAGE_SUFFIX}`;
    this.now = options.now || (() => new Date().toISOString());
    this.databasePromise = null;
    this.storageMode = "indexeddb";
    this.storageModeCause = null;
    if (!this.indexedDB && !this.localStorage) {
      throw new Error("IndexedDB or localStorage is required by Developer Studio.");
    }
  }

  getStorageStatus() {
    return Object.freeze({
      mode: this.storageMode,
      degraded: this.storageMode !== "indexeddb",
      causeName: this.storageModeCause?.causeName || this.storageModeCause?.name || null,
      causeMessage: this.storageModeCause?.causeMessage || this.storageModeCause?.message || null
    });
  }

  async listProjects() {
    const database = await this.open();
    const records = await requestResult(
      database.transaction(PROJECT_STORE, "readonly").objectStore(PROJECT_STORE).getAll()
    );
    return records.sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)))
      .map(cloneValue);
  }

  async createProject(options = {}) {
    return this.runStorageOperation("create-project", () => this.createProjectAttempt(options), { retry: true });
  }

  async createProjectAttempt(options = {}) {
    const uuid = secureUuid(this.crypto);
    const timestamp = this.now();
    const project = {
      uuid,
      displayName: normalizeDisplayName(options.displayName || "Untitled WebWindows Function"),
      schemaVersion: STUDIO_SCHEMA_VERSION,
      storageVersion: STUDIO_STORAGE_VERSION,
      createdAt: timestamp,
      updatedAt: timestamp,
      editorState: normalizeEditorState(options.editorState)
    };
    const entries = normalizeInitialEntries(options.files || [], uuid, timestamp);
    const database = await this.open();
    const transaction = database.transaction([PROJECT_STORE, FILE_STORE], "readwrite");
    transaction.objectStore(PROJECT_STORE).add(project);
    const fileStore = transaction.objectStore(FILE_STORE);
    entries.forEach((entry) => fileStore.add(entry));
    await transactionDone(transaction);
    return cloneValue(project);
  }

  async getProject(projectId) {
    const database = await this.open();
    const project = await requestResult(
      database.transaction(PROJECT_STORE, "readonly").objectStore(PROJECT_STORE).get(projectId)
    );
    if (!project) throw repositoryError("project-not-found", "找不到项目。");
    return cloneValue(project);
  }

  async renameProject(projectId, displayName) {
    return this.updateProject(projectId, (project) => {
      project.displayName = normalizeDisplayName(displayName);
    });
  }

  async saveEditorState(projectId, state) {
    return this.updateProject(projectId, (project) => {
      project.editorState = normalizeEditorState(state);
    });
  }

  async deleteProject(projectId) {
    const database = await this.open();
    const transaction = database.transaction([PROJECT_STORE, FILE_STORE], "readwrite");
    const projectStore = transaction.objectStore(PROJECT_STORE);
    const project = await requestResult(projectStore.get(projectId));
    if (!project) throw repositoryError("project-not-found", "找不到项目。");
    const fileStore = transaction.objectStore(FILE_STORE);
    const entries = await requestResult(fileStore.index(PROJECT_FILE_INDEX).getAll(projectId));
    entries.forEach((entry) => fileStore.delete([projectId, entry.path]));
    projectStore.delete(projectId);
    await transactionDone(transaction);
  }

  async listEntries(projectId) {
    await this.getProject(projectId);
    const database = await this.open();
    const entries = await requestResult(
      database.transaction(FILE_STORE, "readonly")
        .objectStore(FILE_STORE).index(PROJECT_FILE_INDEX).getAll(projectId)
    );
    return entries.sort(compareEntries).map(cloneValue);
  }

  async readProjectState(projectId) {
    const database = await this.open();
    const transaction = database.transaction([PROJECT_STORE, FILE_STORE], "readonly");
    const project = await requestResult(transaction.objectStore(PROJECT_STORE).get(projectId));
    if (!project) throw repositoryError("project-not-found", "找不到项目。");
    const entries = await requestResult(
      transaction.objectStore(FILE_STORE).index(PROJECT_FILE_INDEX).getAll(projectId)
    );
    await transactionDone(transaction);
    return {
      project: cloneValue(project),
      entries: entries.sort(compareEntries).map(cloneValue)
    };
  }

  async readTextFile(projectId, path) {
    const entry = await this.getEntry(projectId, path);
    if (entry.kind !== "file") throw repositoryError("not-a-file", "目标不是文本文件。");
    return entry.content;
  }

  async writeTextFile(projectId, path, content) {
    const normalizedPath = normalizeProjectPath(path);
    const database = await this.open();
    const transaction = database.transaction([PROJECT_STORE, FILE_STORE], "readwrite");
    const project = await requireProject(transaction, projectId);
    const fileStore = transaction.objectStore(FILE_STORE);
    const entry = await requestResult(fileStore.get([projectId, normalizedPath]));
    if (!entry) throw repositoryError("file-not-found", "找不到文件。");
    if (entry.kind !== "file") throw repositoryError("not-a-file", "目标不是文本文件。");
    const timestamp = this.now();
    fileStore.put({ ...entry, content: String(content), updatedAt: timestamp });
    project.updatedAt = timestamp;
    transaction.objectStore(PROJECT_STORE).put(project);
    await transactionDone(transaction);
  }

  async createFile(projectId, path, content = "") {
    return this.createEntry(projectId, path, "file", String(content));
  }

  async createDirectory(projectId, path) {
    return this.createEntry(projectId, path, "directory", undefined);
  }

  async renameEntry(projectId, sourcePath, targetPath) {
    const source = normalizeProjectPath(sourcePath);
    const target = normalizeProjectPath(targetPath);
    if (source === target) return this.getEntry(projectId, source);
    if (target.startsWith(`${source}/`)) {
      throw repositoryError("invalid-project-path", "目录不能移动到自身内部。");
    }

    const database = await this.open();
    const transaction = database.transaction([PROJECT_STORE, FILE_STORE], "readwrite");
    const project = await requireProject(transaction, projectId);
    const fileStore = transaction.objectStore(FILE_STORE);
    const allEntries = await requestResult(fileStore.index(PROJECT_FILE_INDEX).getAll(projectId));
    const moving = allEntries.filter((entry) => entry.path === source || entry.path.startsWith(`${source}/`));
    if (!moving.length) throw repositoryError("entry-not-found", "找不到文件或目录。");
    await requireParentDirectory(allEntries, target);

    const movingPaths = new Set(moving.map((entry) => entry.path));
    const targetPaths = new Set(moving.map((entry) =>
      entry.path === source ? target : `${target}${entry.path.slice(source.length)}`));
    if (allEntries.some((entry) => !movingPaths.has(entry.path) && targetPaths.has(entry.path))) {
      throw repositoryError("entry-exists", "目标路径已经存在。");
    }

    const timestamp = this.now();
    moving.forEach((entry) => {
      const nextPath = entry.path === source ? target : `${target}${entry.path.slice(source.length)}`;
      fileStore.delete([projectId, entry.path]);
      fileStore.add({ ...entry, path: nextPath, updatedAt: timestamp });
    });
    project.editorState = remapEditorState(project.editorState, source, target);
    project.updatedAt = timestamp;
    transaction.objectStore(PROJECT_STORE).put(project);
    await transactionDone(transaction);
    return this.getEntry(projectId, target);
  }

  async deleteEntry(projectId, path) {
    const normalizedPath = normalizeProjectPath(path);
    const database = await this.open();
    const transaction = database.transaction([PROJECT_STORE, FILE_STORE], "readwrite");
    const project = await requireProject(transaction, projectId);
    const fileStore = transaction.objectStore(FILE_STORE);
    const allEntries = await requestResult(fileStore.index(PROJECT_FILE_INDEX).getAll(projectId));
    const deleting = allEntries.filter((entry) =>
      entry.path === normalizedPath || entry.path.startsWith(`${normalizedPath}/`));
    if (!deleting.length) throw repositoryError("entry-not-found", "找不到文件或目录。");
    deleting.forEach((entry) => fileStore.delete([projectId, entry.path]));
    const timestamp = this.now();
    project.editorState = removeFromEditorState(project.editorState, normalizedPath);
    project.updatedAt = timestamp;
    transaction.objectStore(PROJECT_STORE).put(project);
    await transactionDone(transaction);
  }

  async getEntry(projectId, path) {
    const normalizedPath = normalizeProjectPath(path);
    await this.getProject(projectId);
    const database = await this.open();
    const entry = await requestResult(
      database.transaction(FILE_STORE, "readonly").objectStore(FILE_STORE)
        .get([projectId, normalizedPath])
    );
    if (!entry) throw repositoryError("entry-not-found", "找不到文件或目录。");
    return cloneValue(entry);
  }

  async close() {
    if (!this.databasePromise) return;
    const database = await this.databasePromise;
    database.close();
    this.databasePromise = null;
  }

  async resetStorage() {
    await this.close();
    if (this.storageMode === "localstorage-fallback") {
      try {
        this.localStorage.removeItem(this.fallbackStorageKey);
        return;
      } catch (error) {
        throw storageError("reset", error, "Developer Studio 浏览器降级存储重建失败。");
      }
    }
    await new Promise((resolve, reject) => {
      const request = this.indexedDB.deleteDatabase(this.databaseName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(storageError("reset", request.error));
      request.onblocked = () => reject(storageError(
        "reset-blocked",
        null,
        "Developer Studio 项目存储正在被其他窗口使用。请关闭其他 Developer Studio 窗口后重试。"
      ));
    });
  }

  async open() {
    if (this.databasePromise) return this.databasePromise;
    if (this.storageMode === "localstorage-fallback") return this.openFallback(this.storageModeCause);
    if (!this.indexedDB) {
      return this.openFallback(storageError("open", null, "当前浏览器不支持 IndexedDB。"));
    }
    this.databasePromise = new Promise((resolve, reject) => {
      const request = this.indexedDB.open(this.databaseName, STUDIO_STORAGE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(PROJECT_STORE)) {
          database.createObjectStore(PROJECT_STORE, { keyPath: "uuid" });
        }
        if (!database.objectStoreNames.contains(FILE_STORE)) {
          const store = database.createObjectStore(FILE_STORE, { keyPath: ["projectId", "path"] });
          store.createIndex(PROJECT_FILE_INDEX, "projectId", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(storageError("open", request.error));
      request.onblocked = () => reject(storageError(
        "open-blocked",
        null,
        "Developer Studio 项目存储升级被其他窗口阻止。请关闭其他 Developer Studio 窗口后重试。"
      ));
    });
    try {
      const database = await this.databasePromise;
      database.onversionchange = () => database.close();
      return database;
    } catch (error) {
      this.databasePromise = null;
      if (canUseLocalStorageFallback(error, this.localStorage)) return this.openFallback(error);
      throw error;
    }
  }

  async openFallback(cause) {
    if (!this.localStorage) throw cause;
    try {
      const firstActivation = this.storageMode !== "localstorage-fallback";
      const database = new LocalStorageProjectDatabase(this.localStorage, this.fallbackStorageKey);
      database.readDocument();
      this.storageMode = "localstorage-fallback";
      this.storageModeCause = cause;
      this.databasePromise = Promise.resolve(database);
      if (firstActivation) {
        console.warn("[DeveloperStudio] IndexedDB 不可用，启用受限的 localStorage 项目工作区。", cause);
      }
      return database;
    } catch (error) {
      this.databasePromise = null;
      throw storageError("open", error, "Developer Studio 的 IndexedDB 与浏览器降级存储均不可用。");
    }
  }

  async runStorageOperation(stage, operation, options = {}) {
    const attempts = options.retry ? 2 : 1;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        if (!isIndexedDbFailure(error)) throw error;
        const failure = isStudioStorageError(error) ? error : storageError(stage, error);
        if (attempt + 1 >= attempts || !isTransientStorageFailure(failure)) throw failure;
        await this.close();
      }
    }
    throw storageError(stage, null);
  }

  async updateProject(projectId, mutate) {
    const database = await this.open();
    const transaction = database.transaction(PROJECT_STORE, "readwrite");
    const store = transaction.objectStore(PROJECT_STORE);
    const project = await requestResult(store.get(projectId));
    if (!project) throw repositoryError("project-not-found", "找不到项目。");
    mutate(project);
    project.updatedAt = this.now();
    store.put(project);
    await transactionDone(transaction);
    return cloneValue(project);
  }

  async createEntry(projectId, path, kind, content) {
    const normalizedPath = normalizeProjectPath(path);
    const database = await this.open();
    const transaction = database.transaction([PROJECT_STORE, FILE_STORE], "readwrite");
    const project = await requireProject(transaction, projectId);
    const fileStore = transaction.objectStore(FILE_STORE);
    const allEntries = await requestResult(fileStore.index(PROJECT_FILE_INDEX).getAll(projectId));
    if (allEntries.some((entry) => entry.path === normalizedPath)) {
      throw repositoryError("entry-exists", "目标路径已经存在。");
    }
    await requireParentDirectory(allEntries, normalizedPath);
    const timestamp = this.now();
    const entry = {
      projectId,
      path: normalizedPath,
      kind,
      ...(kind === "file" ? { content: String(content ?? "") } : {}),
      createdAt: timestamp,
      updatedAt: timestamp
    };
    fileStore.add(entry);
    project.updatedAt = timestamp;
    transaction.objectStore(PROJECT_STORE).put(project);
    await transactionDone(transaction);
    return cloneValue(entry);
  }
}

function normalizeInitialEntries(entries, projectId, timestamp) {
  const seen = new Set();
  const normalized = entries.map((entry) => {
    const path = normalizeProjectPath(entry.path);
    if (seen.has(path)) throw repositoryError("entry-exists", `模板包含重复路径：${path}`);
    seen.add(path);
    const kind = entry.kind === "directory" ? "directory" : "file";
    return {
      projectId,
      path,
      kind,
      ...(kind === "file" ? { content: String(entry.content ?? "") } : {}),
      createdAt: timestamp,
      updatedAt: timestamp
    };
  });
  normalized.forEach((entry) => {
    const parent = parentProjectPath(entry.path);
    if (!parent) return;
    const parentEntry = normalized.find((candidate) => candidate.path === parent);
    if (!parentEntry || parentEntry.kind !== "directory") {
      throw repositoryError("parent-directory-not-found", `模板缺少父目录：${parent}`);
    }
  });
  return normalized;
}

async function requireProject(transaction, projectId) {
  const project = await requestResult(transaction.objectStore(PROJECT_STORE).get(projectId));
  if (!project) throw repositoryError("project-not-found", "找不到项目。");
  return project;
}

async function requireParentDirectory(entries, path) {
  const parent = parentProjectPath(path);
  if (!parent) return;
  const parentEntry = entries.find((entry) => entry.path === parent);
  if (!parentEntry || parentEntry.kind !== "directory") {
    throw repositoryError("parent-directory-not-found", "父目录不存在。");
  }
}

function secureUuid(cryptoObject) {
  if (typeof cryptoObject?.randomUUID === "function") return cryptoObject.randomUUID();
  if (typeof cryptoObject?.getRandomValues !== "function") {
    throw new Error("Secure random UUID generation is unavailable.");
  }
  const bytes = cryptoObject.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

function normalizeDisplayName(value) {
  const displayName = String(value || "").trim().slice(0, 120);
  if (!displayName) throw repositoryError("invalid-project-name", "项目名称不能为空。");
  return displayName;
}

function normalizeEditorState(state) {
  const value = state && typeof state === "object" ? state : {};
  const paths = (items) => [...new Set((Array.isArray(items) ? items : [])
    .map((path) => {
      try { return normalizeProjectPath(path); } catch (_) { return null; }
    }).filter(Boolean))];
  const openFiles = paths(value.openFiles);
  const activeFile = value.activeFile ? normalizeProjectPath(value.activeFile) : (openFiles[0] || null);
  return {
    openFiles,
    activeFile,
    recentFiles: paths(value.recentFiles).slice(0, 20)
  };
}

function remapEditorState(state, source, target) {
  const mapPath = (path) => path === source || path?.startsWith(`${source}/`)
    ? `${target}${path.slice(source.length)}` : path;
  return normalizeEditorState({
    openFiles: state?.openFiles?.map(mapPath),
    activeFile: mapPath(state?.activeFile),
    recentFiles: state?.recentFiles?.map(mapPath)
  });
}

function removeFromEditorState(state, deletingPath) {
  const keep = (path) => path !== deletingPath && !path.startsWith(`${deletingPath}/`);
  const openFiles = (state?.openFiles || []).filter(keep);
  return normalizeEditorState({
    openFiles,
    activeFile: state?.activeFile && keep(state.activeFile) ? state.activeFile : (openFiles[0] || null),
    recentFiles: (state?.recentFiles || []).filter(keep)
  });
}

function compareEntries(left, right) {
  if (left.path === right.path) return 0;
  return left.path.localeCompare(right.path);
}

function cloneValue(value) {
  return structuredClone(value);
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed."));
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    let transactionError = null;
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => {
      transactionError = transaction.error || transactionError;
    };
    transaction.onabort = () => reject(transaction.error || transactionError || new DOMException(
      "IndexedDB transaction was aborted.",
      "AbortError"
    ));
  });
}

function storageError(stage, cause, message) {
  return new StudioStorageError(stage, cause, message);
}

function isIndexedDbFailure(error) {
  if (isStudioStorageError(error)) return true;
  return ["UnknownError", "InvalidStateError", "AbortError", "QuotaExceededError", "SecurityError"]
    .includes(String(error?.name || "")) || /internal error/i.test(String(error?.message || ""));
}

function isTransientStorageFailure(error) {
  return ["UnknownError", "InvalidStateError", "AbortError"].includes(String(error?.causeName || error?.name || ""))
    || /internal error/i.test(String(error?.causeMessage || error?.message || ""));
}

function canUseLocalStorageFallback(error, localStorageObject) {
  if (!localStorageObject || !isIndexedDbFailure(error)) return false;
  const name = String(error?.causeName || error?.name || "");
  return ["UnknownError", "InvalidStateError", "SecurityError"].includes(name)
    || /internal error/i.test(String(error?.causeMessage || error?.message || ""));
}

function repositoryError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function childPath(parent, name) {
  return joinProjectPath(parent, name);
}
