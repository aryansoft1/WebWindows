(function () {
  "use strict";

  function isDeviceOnline() {
    return window.WebWindows?.device?.network.getState().online !== false;
  }

  const API_URL = "api/function-associations.asp";
  const REQUEST_HEADER = { "X-WebWindows-Request": "function-sync" };
  let syncState = { status: "local", message: "未登录，仅保存在本机。" };
  let syncPromise = null;
  let pushQueue = Promise.resolve();

  function registry() {
    return window.WebWindows?.apps || null;
  }

  function currentUser() {
    try {
      const user = JSON.parse(sessionStorage.getItem("webwindows_user") || "null");
      const identifier = user?.id || user?.userId || user?.username;
      return identifier ? { ...user, identifier: String(identifier) } : null;
    } catch (_) {
      return null;
    }
  }

  function userSubjectId() {
    const user = currentUser();
    return user ? `user:${user.identifier}` : null;
  }

  function setState(status, message, error) {
    syncState = {
      status,
      message,
      changedAt: new Date().toISOString(),
      error: error ? String(error.message || error) : ""
    };
    window.dispatchEvent(new CustomEvent("webwindows:function-sync-state", {
      detail: syncState
    }));
  }

  async function parseResponse(response) {
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      const error = new Error(payload?.message || `功能同步失败（${response.status}）。`);
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  async function fetchRemote() {
    const response = await fetch(API_URL, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: REQUEST_HEADER
    });
    const payload = await parseResponse(response);
    return Array.isArray(payload.associations) ? payload.associations : [];
  }

  async function pushRecord(record) {
    const api = registry();
    const subjectId = userSubjectId();
    if (!api || !subjectId || record.subjectId !== subjectId) return record;

    const app = await api.get(record.appId);
    if (!app || app.type === "system" || app.install?.uninstallable === false) {
      return record;
    }

    const pending = {
      ...record,
      subjectId,
      syncPending: true
    };
    await api.associations.put(pending, { notify: false });

    const body = new URLSearchParams({
      appId: pending.appId,
      state: pending.state === "uninstalled" ? "uninstalled" : "installed",
      desktopVisible: pending.desktopVisible ? "1" : "0",
      retainData: pending.retainData === false ? "0" : "1",
      source: pending.source || "repository",
      changedAt: pending.changedAt || new Date().toISOString()
    });
    const response = await fetch(API_URL, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        ...REQUEST_HEADER,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: body.toString()
    });
    await parseResponse(response);

    const latest = (await api.associations.list(subjectId))
      .find((item) => item.appId === pending.appId);
    if (latest?.changedAt === pending.changedAt) {
      await api.associations.put({
        ...latest,
        syncPending: false,
        syncedAt: new Date().toISOString()
      }, { notify: false });
    }
    return pending;
  }

  function queuePush(record) {
    pushQueue = pushQueue
      .catch(() => {})
      .then(async () => {
        setState("syncing", "正在同步功能状态…");
        try {
          await pushRecord(record);
          setState("synced", "功能状态已同步。");
        } catch (error) {
          setState(
            !isDeviceOnline() ? "offline" : "error",
            !isDeviceOnline()
              ? "当前离线，登录状态将在联网后自动同步。"
              : "功能状态暂未同步，将自动重试。",
            error
          );
          throw error;
        }
      });
    return pushQueue;
  }

  async function applyRemote(subjectId, remoteRecords) {
    const api = registry();
    const remoteIds = new Set(remoteRecords.map((record) => record.appId));
    const localRecords = await api.associations.list(subjectId);

    for (const localRecord of localRecords) {
      const app = await api.get(localRecord.appId);
      if (!app || app.type === "system" || app.install?.uninstallable === false) continue;
      if (!remoteIds.has(localRecord.appId) && !localRecord.syncPending) {
        await api.associations.remove(localRecord.appId, subjectId, { notify: false });
      }
    }

    for (const remoteRecord of remoteRecords) {
      const app = await api.get(remoteRecord.appId);
      if (!app || app.type === "system" || app.install?.uninstallable === false) continue;
      await api.associations.put({
        appId: remoteRecord.appId,
        subjectId,
        repositoryId: "aryansoft-main",
        state: remoteRecord.state === "uninstalled" ? "uninstalled" : "installed",
        desktopVisible: Boolean(remoteRecord.desktopVisible),
        retainData: remoteRecord.retainData !== false,
        source: remoteRecord.source || "repository",
        changedAt: remoteRecord.changedAt || new Date().toISOString(),
        syncPending: false,
        syncedAt: new Date().toISOString()
      }, { notify: false });
    }
  }

  async function bootstrapRemote(subjectId, userRecords) {
    const api = registry();
    let sourceRecords = userRecords;
    if (!sourceRecords.length) {
      sourceRecords = await api.associations.list("local");
    }
    const transferable = [];
    for (const record of sourceRecords) {
      const app = await api.get(record.appId);
      if (!app || app.type === "system" || app.install?.uninstallable === false) continue;
      transferable.push({
        ...record,
        subjectId,
        changedAt: record.changedAt || new Date().toISOString(),
        syncPending: true
      });
    }
    for (const record of transferable) {
      await api.associations.put(record, { notify: false });
      await pushRecord(record);
    }
    return transferable.length > 0;
  }

  async function performSync() {
    const api = registry();
    const subjectId = userSubjectId();
    if (!api || !subjectId) {
      setState("local", "未登录，仅保存在本机。");
      return { mode: "local", associations: [] };
    }

    await api.ready();
    setState("syncing", "正在从账户同步功能状态…");

    let userRecords = await api.associations.list(subjectId);
    const pendingRecords = userRecords.filter((record) => record.syncPending);
    for (const record of pendingRecords) {
      await pushRecord(record);
    }

    let remoteRecords = await fetchRemote();
    if (!remoteRecords.length) {
      const bootstrapped = await bootstrapRemote(subjectId, userRecords);
      if (bootstrapped) remoteRecords = await fetchRemote();
    }

    await applyRemote(subjectId, remoteRecords);
    window.dispatchEvent(new CustomEvent("webwindows:installation-changed", {
      detail: { subjectId, syncRefresh: true }
    }));
    setState("synced", "功能状态已同步到当前账户。");
    return { mode: "account", associations: remoteRecords };
  }

  function syncNow() {
    if (syncPromise) return syncPromise;
    syncPromise = performSync()
      .catch((error) => {
        if (error.status === 401) {
          setState("local", "登录会话已失效，当前改为本机状态。", error);
        } else {
          setState(
            !isDeviceOnline() ? "offline" : "error",
            !isDeviceOnline()
              ? "当前离线，将在联网后自动同步。"
              : "账户同步暂时失败，将自动重试。",
            error
          );
        }
        throw error;
      })
      .finally(() => {
        syncPromise = null;
      });
    return syncPromise;
  }

  window.WebWindows = window.WebWindows || {};
  window.WebWindows.functionSync = {
    syncNow,
    getState: () => ({ ...syncState })
  };

  window.addEventListener("webwindows:installation-changed", (event) => {
    const record = event.detail;
    const subjectId = userSubjectId();
    if (!subjectId || !record?.appId || record.subjectId !== subjectId ||
        record.syncRefresh) return;
    queuePush(record).catch(() => {});
  });
  window.addEventListener("webwindows:login", () => {
    syncNow().catch(() => {});
  });
  window.addEventListener("webwindows:logout", () => {
    setState("local", "已退出登录，当前使用本机状态。");
  });
  window.addEventListener("online", () => {
    if (currentUser()) syncNow().catch(() => {});
  });

  Promise.resolve(registry()?.ready())
    .then(() => {
      if (currentUser()) return syncNow();
      setState("local", "未登录，仅保存在本机。");
    })
    .catch(() => {});
})();

