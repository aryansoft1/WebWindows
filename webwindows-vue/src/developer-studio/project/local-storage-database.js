const FALLBACK_SCHEMA_VERSION = 1;

export class LocalStorageProjectDatabase {
  constructor(storage, key) {
    this.storage = storage;
    this.key = key;
    this.onversionchange = null;
  }

  transaction(storeNames, mode = "readonly") {
    return new LocalStorageTransaction(this, storeNames, mode);
  }

  close() {}

  readDocument() {
    const serialized = this.storage.getItem(this.key);
    if (!serialized) return createEmptyDocument();
    const value = JSON.parse(serialized);
    if (value?.schemaVersion !== FALLBACK_SCHEMA_VERSION
      || !Array.isArray(value.projects)
      || !Array.isArray(value.files)) {
      throw new DOMException("Developer Studio fallback storage is invalid.", "DataError");
    }
    return structuredClone(value);
  }

  writeDocument(document) {
    this.storage.setItem(this.key, JSON.stringify(document));
  }
}

class LocalStorageTransaction {
  constructor(database, storeNames, mode) {
    this.database = database;
    this.storeNames = new Set(Array.isArray(storeNames) ? storeNames : [storeNames]);
    this.mode = mode;
    this.document = database.readDocument();
    this.error = null;
    this.oncomplete = null;
    this.onerror = null;
    this.onabort = null;
    this.pending = 0;
    this.failed = false;
    this.completionTimer = 0;
  }

  objectStore(name) {
    if (!this.storeNames.has(name)) throw new DOMException(`Store ${name} is not in this transaction.`, "NotFoundError");
    return new LocalStorageObjectStore(this, name);
  }

  request(operation) {
    const request = { result: undefined, error: null, onsuccess: null, onerror: null };
    this.pending += 1;
    clearTimeout(this.completionTimer);
    queueMicrotask(() => {
      try {
        if (this.failed) throw this.error;
        request.result = operation();
        request.onsuccess?.({ target: request });
      } catch (error) {
        request.error = error;
        this.error = error;
        this.failed = true;
        request.onerror?.({ target: request });
        this.onerror?.({ target: this });
        this.onabort?.({ target: this });
      } finally {
        this.pending -= 1;
        this.scheduleCompletion();
      }
    });
    return request;
  }

  scheduleCompletion() {
    if (this.failed || this.pending > 0) return;
    clearTimeout(this.completionTimer);
    this.completionTimer = setTimeout(() => {
      if (this.failed || this.pending > 0) return;
      try {
        if (this.mode === "readwrite") this.database.writeDocument(this.document);
        this.oncomplete?.({ target: this });
      } catch (error) {
        this.error = error;
        this.failed = true;
        this.onerror?.({ target: this });
        this.onabort?.({ target: this });
      }
    }, 0);
  }
}

class LocalStorageObjectStore {
  constructor(transaction, name) {
    this.transaction = transaction;
    this.name = name;
  }

  get(key) {
    return this.transaction.request(() => cloneRecord(this.records().find((record) => matchesKey(this.name, record, key))));
  }

  getAll() {
    return this.transaction.request(() => this.records().map(cloneRecord));
  }

  add(record) {
    return this.transaction.request(() => {
      this.requireWritable();
      if (this.records().some((candidate) => matchesKey(this.name, candidate, recordKey(this.name, record)))) {
        throw new DOMException("The key already exists.", "ConstraintError");
      }
      this.records().push(cloneRecord(record));
      return recordKey(this.name, record);
    });
  }

  put(record) {
    return this.transaction.request(() => {
      this.requireWritable();
      const key = recordKey(this.name, record);
      const index = this.records().findIndex((candidate) => matchesKey(this.name, candidate, key));
      if (index >= 0) this.records()[index] = cloneRecord(record);
      else this.records().push(cloneRecord(record));
      return key;
    });
  }

  delete(key) {
    return this.transaction.request(() => {
      this.requireWritable();
      const index = this.records().findIndex((record) => matchesKey(this.name, record, key));
      if (index >= 0) this.records().splice(index, 1);
    });
  }

  index(name) {
    if (this.name !== "files" || name !== "projectId") {
      throw new DOMException(`Index ${name} does not exist.`, "NotFoundError");
    }
    return {
      getAll: (projectId) => this.transaction.request(() => this.records()
        .filter((record) => record.projectId === projectId)
        .map(cloneRecord))
    };
  }

  records() {
    return this.name === "projects" ? this.transaction.document.projects : this.transaction.document.files;
  }

  requireWritable() {
    if (this.transaction.mode !== "readwrite") {
      throw new DOMException("The transaction is read-only.", "ReadOnlyError");
    }
  }
}

function createEmptyDocument() {
  return { schemaVersion: FALLBACK_SCHEMA_VERSION, projects: [], files: [] };
}

function recordKey(storeName, record) {
  return storeName === "projects" ? record.uuid : [record.projectId, record.path];
}

function matchesKey(storeName, record, key) {
  if (storeName === "projects") return record.uuid === key;
  return Array.isArray(key) && record.projectId === key[0] && record.path === key[1];
}

function cloneRecord(value) {
  return value === undefined ? undefined : structuredClone(value);
}
