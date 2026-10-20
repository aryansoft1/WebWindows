/* 桌影 app.js：全局命名空间、能力探测、工程数据状态与持久化、顶栏动作。
 * 运行环境硬约束：无 ES Module、无外链；window.WebWindows 可能不存在，
 * 所有宿主 API 调用一律先能力探测，探测失败走普通浏览器降级路径。 */
(function () {
  "use strict";
  var ZY = (window.ZY = window.ZY || {});

  var STORAGE_PROJECT_KEY = "ww.deskshadow.project.v1"; /* 工程数据 localStorage 键 */
  var FPS = 30; /* 标尺帧刻度的默认帧率 */

  /* ---------------- 工具 ---------------- */

  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }

  function fmtTime(totalSeconds) {
    var s = Math.max(0, totalSeconds || 0);
    var m = Math.floor(s / 60);
    var r = s - m * 60;
    var pad = String(m);
    if (pad.length < 2) pad = "0" + pad;
    return pad + ":" + (r < 10 ? "0" : "") + r.toFixed(1);
  }

  /* ---------------- 会话级运行态 ---------------- */

  var session = {
    mediaUrls: {} /* mediaId -> 本地 objectURL；二进制不入工程文件，仅会话内可用 */
  };

  var ui = {
    selection: null /* { kind: "clip"|"caption", id } */,
    playhead: 0 /* 播放头（秒） */
  };

  /* ---------------- 工程模型 ----------------
   * 工程根对象（localStorage / 保存下载 / 打开加载三者同构）：
   *   format / formatVersion：格式标识与兼容版本号
   *   settings.aspectRatio   画幅预设（16:9|9:16|1:1|4:5），作用于预览画框与 V3 导出
   *   media[]                素材登记表（仅元数据；媒体二进制不入工程文件，见 README 诚实边界）
   *   clips[]                视频轨/音频轨片段
   *     .track     "video" | "audio"
   *     .mediaId   指向 media[]；null = 无媒质的空片段（排版占位）
   *     .start     片段在时间线上的起点（秒）
   *     .duration  片段时长（秒）
   *     .speed     变速倍率（0.25~4，暂存倍率；保持音调的重采样属导出管线 V3）
   *     .volume    音量单值（0~1.5；音量曲线关键帧属 V2+）
   *     .filter    滤镜预设键（见 clips.js ZY.clips.FILTER_PRESETS；CSS filter 字符串常量）
   *     .transitionOut 与相邻同轨片段衔接处的过渡（none|crossfade|fadeBlack|flashWhite）
   *   captions[]             字幕卡：start/end 秒、text、fontSize、outline（描边）、align（底部居中，V1 固定值）
   */
  function defaultProject() {
    return {
      format: "webwindows.zhuoying.project",
      formatVersion: 1,
      id: uid("proj"),
      name: "未命名工程",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: { fps: FPS, aspectRatio: "16:9" },
      media: [],
      clips: [],
      captions: []
    };
  }

  var project = defaultProject();

  function persist() {
    project.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_PROJECT_KEY, JSON.stringify(protect(project)));
    } catch (e) {
      statusMessage("工程未能写入 localStorage：" + e.message, true);
    }
  }

  /* objectURL 这类会话字段绝不写入持久层。 */
  function protect(root) {
    return {
      format: root.format,
      formatVersion: root.formatVersion,
      id: root.id,
      name: root.name,
      createdAt: root.createdAt,
      updatedAt: root.updatedAt,
      settings: root.settings,
      media: root.media,
      clips: root.clips,
      captions: root.captions
    };
  }

  function loadPersisted() {
    var raw = null;
    try {
      raw = localStorage.getItem(STORAGE_PROJECT_KEY);
    } catch (e) { return; }
    if (!raw) return;
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      statusMessage("既有工程数据解析失败，已使用新工程", true);
      return;
    }
    if (parsed && parsed.format === project.format) project = parsed;
  }

  function setSelection(kind, id) {
    ui.selection = kind && id ? { kind: kind, id: id } : null;
    if (ZY.clips) ZY.clips.render();
    ZY.timeline.render();
    updateStatusfields();
  }

  function selectedClip() {
    if (!ui.selection || ui.selection.kind !== "clip") return null;
    return findClipById(ui.selection.id);
  }

  function findClipById(id) {
    var i;
    for (i = 0; i < project.clips.length; i++) {
      if (project.clips[i].id === id) return project.clips[i];
    }
    return null;
  }

  function findCaptionById(id) {
    var i;
    for (i = 0; i < project.captions.length; i++) {
      if (project.captions[i].id === id) return project.captions[i];
    }
    return null;
  }

  function addClip(track, opts) {
    var clip = {
      id: uid("c"),
      track: track, /* "video" | "audio" */
      name: (opts && opts.name) || "空片段",
      mediaId: (opts && opts.mediaId) || null,
      start: (opts && typeof opts.start === "number") ? opts.start : 0,
      duration: (opts && opts.duration) || 4,
      speed: 1,
      volume: 1,
      filter: "none",
      transitionOut: "none"
    };
    project.clips.push(clip);
    persist();
    return clip;
  }

  function removeClip(id) {
    var i;
    for (i = 0; i < project.clips.length; i++) {
      if (project.clips[i].id === id) { project.clips.splice(i, 1); break; }
    }
    if (ui.selection && ui.selection.id === id) ui.selection = null;
    persist();
    if (ZY.clips) ZY.clips.render();
    ZY.timeline.render();
    updateStatusfields();
  }

  function removeCaption(id) {
    var i;
    for (i = 0; i < project.captions.length; i++) {
      if (project.captions[i].id === id) { project.captions.splice(i, 1); break; }
    }
    if (ui.selection && ui.selection.id === id) ui.selection = null;
    persist();
    ZY.clips.render();
    ZY.timeline.render();
    updateStatusfields();
  }

  function addCaptionAt(sec) {
    var cap = {
      id: uid("t"),
      start: Math.max(0, Math.round(sec * 10) / 10),
      end: Math.max(0, Math.round(sec * 10) / 10) + 2,
      text: "字幕卡",
      fontSize: 24,
      outline: true,
      align: "bottom-center" /* V1 固定底部居中 */
    };
    project.captions.push(cap);
    ui.selection = { kind: "caption", id: cap.id };
    persist();
    ZY.clips.render();
    ZY.timeline.render();
    updateStatusfields();
    return cap;
  }

  /* ---------------- 能力探测（诊断面板数据源） ---------------- */
  /* 探测结果如实记录，不做任何“乐观假设”；以下 boolean 均为真实检测结果。 */

  function detectEnvironment() {
    var ww = window.WebWindows;
    var info = {
      /* WebWindows Host 是否存在（真值仅指检测到宿主对象，不代表功能可用） */
      hostDetected: !!(ww && typeof ww === "object"),
      isIframed: false,
      origin: "",
      deviceNamespace: !!(ww && ww.device && typeof ww.device === "object"),
      fileDialogNamespace: !!(ww && ww.fileDialog && typeof ww.fileDialog === "object"),
      fileDialogOpen: !!(ww && ww.fileDialog && typeof ww.fileDialog.open === "function"),
      fileDialogSaveBlob: !!(ww && ww.fileDialog && typeof ww.fileDialog.saveBlob === "function"),
      dialogNamespace: !!(ww && ww.dialog && typeof ww.dialog === "object"),
      aiNamespace: !!(ww && ww.ai && typeof ww.ai === "object"),
      aiRequestAssist: !!(ww && ww.ai && typeof ww.ai.requestAssist === "function"),
      localStorage: (function () {
        try { localStorage.setItem("ww.deskshadow.probe", "1"); localStorage.removeItem("ww.deskshadow.probe"); return true; }
        catch (e) { return false; }
      })(),
      mediaRecorder: typeof MediaRecorder !== "undefined",
      webCodecsVideoEncoder: typeof window.VideoEncoder === "function",
      webCodecsVideoDecoder: typeof window.VideoDecoder === "function",
      webCodecsAudioEncoder: typeof window.AudioEncoder === "function",
      captureStream: typeof HTMLCanvasElement !== "undefined" && typeof HTMLCanvasElement.prototype.captureStream === "function"
    };
    try {
      info.isIframed = window.self !== window.top;
    } catch (e) {
      info.isIframed = true;
    }
    try {
      info.origin = String(location.origin || location.href || "");
    } catch (e) {
      info.origin = "unknown";
    }
    return info;
  }

  var envInfo = null;

  function env() {
    if (!envInfo) envInfo = detectEnvironment();
    return envInfo;
  }

  /* ---------------- 顶栏动作（fileDialog 探测 + 降级） ---------------- */

  function statusMessage(msg, isWarn) {
    var el = document.getElementById("status-host");
    if (el) el.textContent = msg || "";
    if (el) el.dataset.warn = isWarn ? "1" : "0";
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    /* 下载用临时 URL 稍后回收，避免与素材 URL 混淆 */
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function newProject() {
    project = defaultProject();
    session.mediaUrls = {};
    ui.playhead = 0;
    var v = ZY.player.videoEl();
    if (v) v.removeAttribute("src");
    ui.selection = null;
    persist();
    rerenderAll();
    statusMessage("已新建工程");
  }

  /* 打开工程：WebWindows.fileDialog.open 探测到则优先走宿主；否则降级 file input（.json）。 */
  function openProject() {
    var caps = env();
    if (caps.fileDialogOpen) {
      ZY.fileDialogOpenProject(function (ok, msg) {
        if (ok) statusMessage(msg || "工程已载入");
        else statusMessage(msg || "宿主文件对话框未能打开工程", true);
      });
      return;
    }
    statusMessage("环境诊断：WebWindows.fileDialog.open 未检测到，使用浏览器文件选择（降级）");
    var input = document.getElementById("file-project");
    input.onchange = function () {
      var f = input.files && input.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          loaded(JSON.parse(String(reader.result)));
          statusMessage("工程已载入：" + project.name);
        } catch (e) {
          statusMessage("工程文件解析失败：" + e.message, true);
        }
        input.value = "";
      };
      reader.onerror = function () {
        statusMessage("读取工程文件失败", true);
      };
      reader.readAsText(f);
    };
    input.click();
  }

  function loaded(data) {
    if (!data || data.format !== project.format || data.formatVersion !== 1) {
      throw new Error("不是桌影 V1 工程文件（format/formatVersion 不匹配）");
    }
    project = defaultProject();
    var keys = ["id", "name", "createdAt", "updatedAt", "settings", "media", "clips", "captions"];
    var i;
    for (i = 0; i < keys.length; i++) {
      if (data[keys[i]] !== undefined) project[keys[i]] = data[keys[i]];
    }
    /* 载入的工程不含媒体二进制：引用此工程 media 里的素材没有本地 URL，预览不可用，须重新导入 —— 如实提示 */
    session.mediaUrls = {};
    var v = ZY.player.videoEl();
    if (v) v.removeAttribute("src");
    ui.selection = null;
    ui.playhead = 0;
    if (ZY.clips) ZY.clips.render();
    ZY.timeline.render();
  }

  /* 保存工程：探测 fileDialog.saveBlob；未探测到则走 a[download] 下载。 */
  function saveProject() {
    var caps = env();
    var text = JSON.stringify(protect(project), null, 2);
    var filename = (project.name || "project").replace(/[\\/:*?"<>|]/g, "_") + ".zhuoying.json";
    if (caps.fileDialogSaveBlob) {
      ZY.fileDialogSaveProject(text, filename, function (ok, msg) {
        statusMessage(ok ? (msg || "工程已保存") : (msg || "宿主保存失败，已回退浏览器下载"), !ok);
        if (!ok) downloadBlob(new Blob([text], { type: "application/json" }), filename);
      });
      return;
    }
    statusMessage("环境诊断：WebWindows.fileDialog.saveBlob 未检测到，使用浏览器下载（降级）");
    downloadBlob(new Blob([text], { type: "application/json" }), filename);
  }

  /* 导入素材：file input multiple（V1 统一走浏览器 input；宿主 fileDialog 权限契约未接入，见 README）。 */
  function importMedia() {
    var input = document.getElementById("file-media");
    input.onchange = function () {
      var files = input.files || [];
      var i;
      var added = 0;
      for (i = 0; i < files.length; i++) {
        var f = files[i];
        var isVideo = f.type.indexOf("video/") === 0;
        var isAudio = f.type.indexOf("audio/") === 0 || /\.(mp3|wav|ogg|m4a|flac)$/i.test(f.name);
        if (!isVideo && !isAudio) continue;
        var m = {
          id: uid("m"),
          name: f.name,
          type: isVideo ? "video" : "audio",
          duration: null, /* 元数据加载后异步回填；探测失败保持 null 并如实显示“未知” */
          sizeBytes: f.size
        };
        project.media.push(m);
        session.mediaUrls[m.id] = URL.createObjectURL(f);
        /* V2 管线挂钩：WebCodecs 可用时登记素材的 readProvider（浏览器降级模式 = File.slice），
           Production 将切 G1 readChunk。管线初始化失败不影响 V1 登记路径（fail-closed 降级）。 */
        var pl = window.ZY && ZY.pipeline && ZY.pipeline.detect();
        if (pl && pl.ready) {
          session.mediaProviders = session.mediaProviders || {};
          session.mediaProviders[m.id] = ZY.pipeline.makeSliceProvider(f);
        }
        added++;
        probeDuration(m);
      }
      if (added > 0) {
        persist();
        statusMessage("素材登记 " + added + " 项（媒体仅会话内暂存；重建为 V2 存储契约）");
      } else {
        statusMessage("没有可导入的音视频文件", true);
      }
      input.value = "";
    };
    input.click();
  }

  function probeDuration(m) {
    var url = session.mediaUrls[m.id];
    if (!url || m.duration !== null) return;
    var p = document.createElement(m.type === "video" ? "video" : "audio");
    p.preload = "metadata";
    p.onloadedmetadata = function () {
      if (isFinite(p.duration) && p.duration > 0) {
        m.duration = Math.round(p.duration * 100) / 100;
        persist();
        if (ZY.clips) ZY.clips.render();
      }
    };
    p.onerror = function () {
      /* 探测失败：保持 null，UI 显示“未知”，不伪造成功 */
    };
    p.src = url;
  }

  function rerenderAll() {
    ZY.player.applyAspectRatio();
    ZY.timeline.render();
    if (ZY.clips) ZY.clips.render();
    if (ZY.export) ZY.export.render();
  }

  function updateStatusfields() {
    var host = env();
    var statusEl = document.getElementById("status-host");
    if (statusEl && !statusEl.textContent) {
      statusEl.textContent = host.hostDetected
        ? "WebWindows Host：检测到（能力矩阵见“诊断”）"
        : "WebWindows Host：未检测到（浏览器直接打开，按降级路径运行）";
    }
    var sel = document.getElementById("status-sel");
    if (sel) {
      var c = selectedClip();
      var s = null;
      if (ui.selection && ui.selection.kind === "caption") s = findCaptionById(ui.selection.id);
      sel.textContent = ui.selection
        ? "选中：" + (c ? c.name : "字幕卡")
        : "未选中（单击时间线片段或双击字幕轨）";
      if (c) sel.textContent += " · " + fmtTime(c.start) + " → " + fmtTime(c.start + c.duration);
      if (s) sel.textContent += " · " + fmtTime(s.start) + " → " + fmtTime(s.end);
    }
  }

  /* ---------------- 启动 ---------------- */

  function boot() {
    /* 语言偏好恢复（独立键，不入工程） */
    var lang = "zh";
    try { lang = localStorage.getItem("ww.deskshadow.lang") || "zh"; } catch (e) {}
    ZY.i18n.setLang(lang);
    var langSel = document.getElementById("lang");
    langSel.value = ZY.i18n.getLang();
    langSel.addEventListener("change", function () { ZY.i18n.setLang(langSel.value); });

    envInfo = detectEnvironment();
    loadPersisted();

    document.getElementById("btn-new").addEventListener("click", newProject);
    document.getElementById("btn-open").addEventListener("click", openProject);
    document.getElementById("btn-save").addEventListener("click", saveProject);
    document.getElementById("btn-import").addEventListener("click", importMedia);
    document.getElementById("btn-split").addEventListener("click", function () {
      ZY.timeline.splitSelectedAtPlayhead();
    });

    ZY.player.init();
    ZY.timeline.init();
    ZY.clips.init();
    ZY.ai.init();
    ZY.export.init();

    rerenderAll();
    updateStatusfields();
  }

  /* 对外 API */
  ZY.env = { detect: detectEnvironment };
  Object.defineProperty(ZY.env, "info", { get: function () { return env(); } });
  ZY.session = session;
  ZY.project = {};
  Object.defineProperties(ZY.project, {
    data: { get: function () { return project; } }
  });
  ZY.util = { uid: uid, clamp: clamp, fmtTime: fmtTime, downloadBlob: downloadBlob, statusMessage: statusMessage };
  ZY.ui = ui;
  Object.defineProperty(ZY, "FPS", { value: FPS });
  ZY.state = {
    persist: persist,
    setSelection: setSelection,
    selectedClip: selectedClip,
    findClipById: findClipById,
    findCaptionById: findCaptionById,
    addClip: addClip,
    removeClip: removeClip,
    removeCaption: removeCaption,
    addCaptionAt: addCaptionAt,
    updateStatusfields: updateStatusfields
  };
  /* 桌讯 fileDialog 桥接占位：V1 中宿主命名空间未接入这组 API（契约未定），
   * 这里保留回调型接口供未来对齐 fileDialog.open / saveBlob 的真实形状。 */
  ZY.fileDialogOpenProject = function (cb) {
    /* 契约未接入：如实返回“未接入”，不伪造成功 */
    cb(false, "WebWindows.fileDialog.open 契约未接入（设计待评审），本次未打开任何文件");
  };
  ZY.fileDialogSaveProject = function (_text, _filename, cb) {
    cb(false, "WebWindows.fileDialog.saveBlob 契约未接入（设计待评审），已回退浏览器下载");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
