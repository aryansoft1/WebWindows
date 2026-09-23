(function () {
  "use strict";

  // StartupManager v1（session-ready）
  // 职责边界：只负责读取启动项配置、去重排序、按 delay 调度；
  // 真正启动应用一律通过现有 AppManager（WebWindows.apps.launch），
  // 本模块不允许直接打开应用 URL、iframe 或页面路径。
  const STORAGE_PREFIX = "webwindows.startup.items.v1::";
  const SUPPORTED_TRIGGER = "session-ready";
  const STARTUP_MODES = Object.freeze(["background", "minimized", "normal"]);
  const DEFAULT_MODE = "background";
  const MAX_DELAY_MS = 60000;
  // 同一 delay 的启动项错开执行，避免桌面 ready 后出现启动风暴。
  const SAME_DELAY_STAGGER_MS = 200;
  // 与 App Registry 的应用 ID 规则保持一致。
  const APP_ID_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)+$/;

  // 幂等保护：同一页面会话中 run() 只会执行一次，重复触发返回同一 Promise。
  let runPromise = null;

  function currentSubjectId() {
    try {
      const associations = window.WebWindows && window.WebWindows.apps &&
        window.WebWindows.apps.associations;
      if (associations && typeof associations.currentSubjectId === "function") {
        return associations.currentSubjectId();
      }
    } catch (_) {
      // App Registry 尚未就绪时退回本机配置域，不影响桌面启动。
    }
    return "local";
  }

  function storageKey(subjectId) {
    return STORAGE_PREFIX + subjectId;
  }

  function readRawItems(subjectId) {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(storageKey(subjectId)) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      // 配置损坏时按空列表处理，绝不阻塞桌面。
      return [];
    }
  }

  function writeRawItems(subjectId, items) {
    window.localStorage.setItem(storageKey(subjectId), JSON.stringify(items));
  }

  // 启动项以 appId 为核心，不保存任何应用 URL。
  function normalizeItem(raw) {
    if (!raw || typeof raw !== "object") return null;
    const appId = String(raw.appId || "").trim();
    if (!APP_ID_PATTERN.test(appId)) return null;
    const delay = Number(raw.delay);
    return {
      appId,
      enabled: raw.enabled === true,
      // v1 仅执行 session-ready；未来的新 trigger 原样保留但不会被调度。
      trigger: String(raw.trigger || SUPPORTED_TRIGGER),
      mode: STARTUP_MODES.indexOf(raw.mode) >= 0 ? raw.mode : DEFAULT_MODE,
      delay: Number.isFinite(delay)
        ? Math.min(Math.max(Math.round(delay), 0), MAX_DELAY_MS)
        : 0
    };
  }

  // 相同 appId 的重复配置去重：后写入的条目生效，只保留一条。
  function readItems(subjectId) {
    const byAppId = new Map();
    for (const raw of readRawItems(subjectId)) {
      const item = normalizeItem(raw);
      if (item) byAppId.set(item.appId, item);
    }
    return byAppId;
  }

  function listForSubject(subjectId) {
    return Array.from(readItems(subjectId).values())
      .sort((left, right) => left.delay - right.delay);
  }

  function list() {
    return listForSubject(currentSubjectId());
  }

  function get(appId) {
    return readItems(currentSubjectId()).get(String(appId || "")) || null;
  }

  function upsert(item) {
    const subjectId = currentSubjectId();
    const items = readItems(subjectId);
    items.set(item.appId, item);
    writeRawItems(subjectId, Array.from(items.values()));
    return item;
  }

  function add(partial) {
    const appId = String(partial && partial.appId || "").trim();
    if (!APP_ID_PATTERN.test(appId)) {
      throw new Error(`启动项必须提供有效的 appId：${appId || "(empty)"}`);
    }
    if (partial && partial.mode != null && STARTUP_MODES.indexOf(partial.mode) < 0) {
      throw new Error(`不支持的启动模式：${partial.mode}`);
    }
    const merged = normalizeItem(Object.assign({}, get(appId) || {}, partial, { appId }));
    if (!merged) throw new Error(`启动项保存失败：${appId}`);
    return upsert(merged);
  }

  function remove(appId) {
    return removeForSubject(appId, currentSubjectId());
  }

  function removeForSubject(appId, subjectId) {
    const items = readItems(subjectId);
    if (!items.delete(String(appId || ""))) return false;
    writeRawItems(subjectId, Array.from(items.values()));
    return true;
  }

  function setEnabled(appId, enabled) {
    return add({ appId, enabled: enabled === true });
  }

  function setMode(appId, mode) {
    return add({ appId, mode });
  }

  function setDelay(appId, delay) {
    // normalizeItem 会把延迟夹取到 [0, MAX_DELAY_MS]。
    return add({ appId, delay });
  }

  async function launchItem(item, summary) {
    try {
      const apps = window.WebWindows && window.WebWindows.apps;
      if (!apps || typeof apps.launch !== "function") {
        summary.skipped += 1;
        return;
      }
      // 启动目标只有 appId；模式作为 options 交给 AppManager 处理。
      await apps.launch(item.appId, { initialState: item.mode });
      summary.launched += 1;
    } catch (error) {
      // 每个启动项独立处理失败：应用不存在、被禁用、损坏或 launch 抛异常
      // 都只跳过本项，不影响其余启动项与桌面会话。
      summary.failed += 1;
      console.warn(
        `[StartupManager] 启动项 ${item.appId} 未能启动：${(error && error.message) || error}`
      );
    }
  }

  async function executeRun() {
    const summary = { scheduled: 0, launched: 0, failed: 0, skipped: 0, reason: null };
    try {
      const apps = window.WebWindows && window.WebWindows.apps;
      if (!apps || typeof apps.launch !== "function") {
        summary.reason = "apps-unavailable";
        return summary;
      }
      try {
        await apps.ready();
      } catch (error) {
        summary.reason = "catalog-unavailable";
        console.warn("[StartupManager] 应用目录未就绪，本次会话跳过启动项。", error);
        return summary;
      }

      const items = list().filter((item) =>
        item.enabled && item.trigger === SUPPORTED_TRIGGER
      );
      items.sort((left, right) => left.delay - right.delay);

      let previousDelay = null;
      let groupIndex = 0;
      const tasks = items.map((item) => {
        if (item.delay !== previousDelay) {
          previousDelay = item.delay;
          groupIndex = 0;
        }
        const wait = item.delay + groupIndex * SAME_DELAY_STAGGER_MS;
        groupIndex += 1;
        summary.scheduled += 1;
        // 每个启动项独立计时、独立失败，互不阻塞。
        return new Promise((resolve) => {
          setTimeout(() => {
            launchItem(item, summary).then(resolve, resolve);
          }, wait);
        });
      });
      await Promise.all(tasks);
    } catch (error) {
      summary.reason = "scheduler-error";
      console.warn("[StartupManager] 启动项调度失败，桌面会话继续运行。", error);
    }
    return summary;
  }

  // session-ready 后执行；同一会话内幂等。
  function run() {
    if (!runPromise) runPromise = executeRun();
    return runPromise;
  }

  const api = Object.freeze({
    list,
    get,
    add,
    remove,
    setEnabled,
    setMode,
    setDelay,
    run,
    modes: STARTUP_MODES,
    trigger: SUPPORTED_TRIGGER
  });

  window.WebWindows = window.WebWindows || {};
  window.WebWindows.startup = api;

  // 桌面 Shell 初始化完成（main.js 派发）后执行用户启动项。
  window.addEventListener("webwindows:session-ready", () => {
    run();
  });

  // 卸载联动：应用被卸载（或关联被移除）时立即清除其启动项配置，
  // 不允许留下无效 appId。
  window.addEventListener("webwindows:installation-changed", (event) => {
    try {
      const detail = (event && event.detail) || {};
      if (!detail.appId) return;
      if (detail.state !== "uninstalled" && detail.removed !== true) return;
      removeForSubject(detail.appId, detail.subjectId || currentSubjectId());
    } catch (error) {
      console.warn("[StartupManager] 卸载联动清理失败。", error);
    }
  });
})();
