/* 桌影 timeline.js：三轨时间线（视频/音频/字幕），纯 DOM 渲染（不用 canvas，事件好处理）。
 * 左列固定轨道头（sticky），横坐标秒/帧刻度标尺；支持单击选中、同轨拖拽移动、
 * Delete 删除、拆分按钮、双击字幕轨加字幕卡、缩放与播放头联动。 */
(function () {
  "use strict";
  var ZY = window.ZY;

  var HEADER_W = 96; /* 固定轨道头宽度（px），与 CSS .zy-lane-head 一致 */
  var pps = 40; /* 每秒像素（缩放系数） */
  var MIN_PPS = 8;
  var MAX_PPS = 240;

  var rulerEl = null;
  var contentEl = null;
  var playheadEl = null;
  var laneClipEls = {};

  /* ---------------- 尺度计算 ---------------- */

  function timelineLength() {
    var d = ZY.project.data;
    var max = 30; /* 最短可视长度（秒） */
    var i;
    var clip;
    for (i = 0; i < d.clips.length; i++) {
      clip = d.clips[i];
      max = Math.max(max, clip.start + clip.duration);
    }
    for (i = 0; i < d.captions.length; i++) {
      max = Math.max(max, d.captions[i].end);
    }
    max = Math.max(max, ZY.ui.playhead + 5);
    return Math.ceil(max / 5) * 5; /* 5 秒取整，标尺整洁 */
  }

  /* ---------------- 标尺（秒 + 帧刻度 @30fps） ---------------- */

  function renderRuler() {
    var d = ZY.project.data;
    var fps = (d.settings && d.settings.fps) || ZY.FPS;
    var len = timelineLength();
    canvas.style.width = HEADER_W + len * pps + "px";
    canvas.textContent = "";
    /* 帧刻度只在放大到足够密度时画出，避免过密卡顿 */
    var frameMajorEvery = 8; /* 每 8 帧一个小刻度 */
    var showFrames = pps * fps >= 120; /* 每帧 ≥4px 起画 */
    for (var f = 0; f <= len * fps; f++) {
      var sec = f / fps;
      var x = HEADER_W + sec * pps;
      var isSecond = f % fps === 0;
      if (showFrames && f % frameMajorEvery === 0 && !isSecond) {
        var ft = document.createElement("div");
        ft.className = "zy-tick zy-tick-frame";
        ft.style.left = x + "px";
        canvas.appendChild(ft);
      }
      if (isSecond) {
        var t1 = document.createElement("div");
        t1.className = "zy-tick zy-tick-major";
        t1.style.left = x + "px";
        canvas.appendChild(t1);
        var lb = document.createElement("span");
        lb.className = "zy-tick-label";
        lb.style.left = x + "px";
        lb.textContent = String(Math.round(sec)) + "s";
        canvas.appendChild(lb);
      }
    }
  }

  var canvas = document.createElement("div");
  canvas.className = "zy-ruler-roll";

  /* ---------------- 片段渲染 ---------------- */

  function clipEl(clip) {
    var el = document.createElement("div");
    var sel = ZY.ui.selection && ZY.ui.selection.kind === "clip" && ZY.ui.selection.id === clip.id;
    el.className = "zy-clip zy-clip-" + clip.track + (sel ? " selected" : "");
    el.dataset.id = clip.id;
    el.textContent = clip.name + " · " + ZY.util.fmtTime(clip.start) + "→" + ZY.util.fmtTime(clip.start + clip.duration);
    if (clip.filter !== "none") el.textContent += " · 滤镜:" + ZY.clips.FILTER_PRESETS[clip.filter].label;
    el.style.left = clip.start * pps + "px";
    el.style.width = Math.max(6, clip.duration * pps - 2) + "px";
    return el;
  }

  function captionEl(cap) {
    var el = document.createElement("div");
    var sel = ZY.ui.selection && ZY.ui.selection.kind === "caption" && ZY.ui.selection.id === cap.id;
    el.className = "zy-caption-card" + (sel ? " selected" : "");
    el.dataset.id = cap.id;
    el.textContent = "[" + ZY.util.fmtTime(cap.start) + "→" + ZY.util.fmtTime(cap.end) + "] " + cap.text;
    el.style.left = cap.start * pps + "px";
    el.style.width = Math.max(8, (cap.end - cap.start) * pps - 2) + "px";
    return el;
  }

  function renderLanes() {
    var d = ZY.project.data;
    var buckets = { video: [], audio: [] };
    var i;
    for (i = 0; i < d.clips.length; i++) {
      buckets[d.clips[i].track].push(d.clips[i]);
    }
    ["video", "audio"].forEach(function (track) {
      var host = laneClipEls[track];
      host.textContent = "";
      host.style.width = HEADER_W + timelineLength() * pps + "px";
      var frag = document.createDocumentFragment();
      buckets[track].forEach(function (clip) { frag.appendChild(clipEl(clip)); });
      host.appendChild(frag);
    });
    /* 字幕轨 */
    var capHost = laneClipEls.caption;
    capHost.textContent = "";
    capHost.style.width = HEADER_W + timelineLength() * pps + "px";
    var capFrag = document.createDocumentFragment();
    d.captions.forEach(function (cap) { capFrag.appendChild(captionEl(cap)); });
    capHost.appendChild(capFrag);
    /* 内容宽度统一注入内容容器，保证右边界一致 */
    contentEl.style.width = HEADER_W + timelineLength() * pps + 60 + "px";
  }

  function render() {
    if (!contentEl) return;
    renderRuler();
    renderLanes();
    updatePlayhead();
  }

  /* ---------------- 播放头 ---------------- */

  function setPlayhead(sec) {
    ZY.ui.playhead = Math.max(0, Math.round(sec * 1000) / 1000);
    updatePlayhead();
    ZY.player.syncToPlayhead();
    ZY.state.updateStatusfields();
  }

  function updatePlayhead() {
    if (!playheadEl) return;
    playheadEl.style.left = HEADER_W + ZY.ui.playhead * pps + "px";
    var tc = document.getElementById("tc-main");
    var fr = document.getElementById("tc-frame");
    if (tc) tc.textContent = ZY.util.fmtTime(ZY.ui.playhead);
    if (fr) {
      var fps = (ZY.project.data.settings && ZY.project.data.settings.fps) || ZY.FPS;
      fr.textContent = "第 " + Math.round(ZY.ui.playhead * fps) + " 帧 @" + fps + "fps";
    }
  }

  /* ---------------- 拆分 ---------------- */

  function splitSelectedAtPlayhead() {
    var clip = ZY.state.selectedClip();
    if (!clip) {
      ZY.util.statusMessage("拆分需要先单击选中一个片段", true);
      return;
    }
    var t = ZY.ui.playhead;
    if (t <= clip.start + 0.05 || t >= clip.start + clip.duration - 0.05) {
      ZY.util.statusMessage("播放头不在所选片段内部，未拆分", true);
      return;
    }
    var first = {
      id: clip.id,
      track: clip.track,
      name: clip.name,
      mediaId: clip.mediaId,
      start: clip.start,
      duration: ZY.util.clamp(t - clip.start, 0.1, Math.max(0.1, clip.duration)),
      speed: clip.speed,
      volume: clip.volume,
      filter: clip.filter,
      transitionOut: "none" /* 衔接处过渡存于前段；拆分后前段与后段按“不跨拆分点”处理，过渡转移给后段 → none */
    };
    var second = {
      id: ZY.util.uid("c"),
      track: clip.track,
      name: clip.name + "（后段）",
      mediaId: clip.mediaId,
      start: clip.start + first.duration,
      duration: Math.max(0.1, clip.duration - first.duration),
      speed: clip.speed,
      volume: clip.volume,
      filter: clip.filter,
      transitionOut: clip.transitionOut
    };
    var idx = ZY.project.data.clips.indexOf(clip);
    ZY.project.data.clips.splice(idx, 1, first, second);
    ZY.state.setSelection("clip", first.id);
    ZY.state.persist();
    ZY.util.statusMessage("已拆分（变速媒体重映射属导出管线 V3，预览按来源速度播放）");
  }

  /* ---------------- 交互 ---------------- */

  function bindRuler() {
    var scrubbing = false;
    function scrub(ev) {
      var rect = rulerEl.getBoundingClientRect();
      setPlayhead((ev.clientX - rect.left - HEADER_W) / pps);
    }
    rulerEl.addEventListener("mousedown", function (ev) {
      scrubbing = true;
      scrub(ev);
    });
    window.addEventListener("mousemove", function (ev) {
      if (scrubbing) scrub(ev);
    });
    window.addEventListener("mouseup", function () {
      scrubbing = false;
    });
  }

  function bindClipEvents() {
    var drag = null;

    function elOf(id) {
      return contentEl.querySelector('.zy-clip[data-id="' + id + '"]');
    }

    contentEl.addEventListener("mousedown", function (ev) {
      var clipDiv = ev.target.closest(".zy-clip");
      if (clipDiv) {
        var id = clipDiv.dataset.id;
        var clip = ZY.state.findClipById(id);
        if (!clip) return;
        /* 选中（select 触发整体重渲染，拖拽元素通过 data-id 重新获取） */
        ZY.state.setSelection("clip", id);
        drag = {
          id: id,
          startX: ev.clientX,
          origStart: clip.start,
          dirty: false
        };
        var fresh = elOf(id);
        if (fresh) fresh.classList.add("zy-clip-dragging");
        ev.preventDefault();
        return;
      }
      /* 轨道空白与标尺：标尺自带 scrub；空白处 V1 不做点选空位定播放头 */
    });

    window.addEventListener("mousemove", function (ev) {
      if (!drag) return;
      var clip = ZY.state.findClipById(drag.id);
      if (!clip) return;
      var deltaSec = (ev.clientX - drag.startX) / pps;
      var next = ZY.util.clamp(Math.round((drag.origStart + deltaSec) * 100) / 100, 0, clip.start + clip.duration + 600);
      if (next !== clip.start) {
        clip.start = next;
        drag.dirty = true;
        var el = elOf(drag.id);
        if (el) el.style.left = clip.start * pps + "px";
      }
      /* 同轨内移动（V1 不做跨轨拖拽与碰撞吸附，属 V2+） */
    });

    window.addEventListener("mouseup", function () {
      if (!drag) return;
      var el = elOf(drag.id);
      if (el) el.classList.remove("zy-clip-dragging");
      var wasDirty = drag.dirty;
      drag = null;
      if (wasDirty) {
        ZY.state.persist();
        render();
      }
    });
  }

  function bindLaneBackground() {
    /* 字幕轨双击：新建字幕卡（起止 2 秒，走向右面板编辑） */
    var laneCaption = laneClipEls.caption;
    laneCaption.addEventListener("dblclick", function (ev) {
      if (ev.target.closest(".zy-caption-card")) return;
      var rect = laneCaption.getBoundingClientRect();
      var sec = (ev.clientX - rect.left) / pps;
      ZY.state.addCaptionAt(Math.max(0, sec));
      if (ZY.clips) ZY.clips.showEditor();
    });
    /* 自己双击已有字幕卡也打开编辑器（绑定到卡片在 render 后动态生成，故用事件委托） */
    laneCaption.addEventListener("dblclick", function (ev) {
      var card = ev.target.closest(".zy-caption-card");
      if (!card) return;
      ZY.state.setSelection("caption", card.dataset.id);
      if (ZY.clips) ZY.clips.showEditor();
    });

    /* 轨道头「＋」按钮：添加空片段（V1 无素材也能排版；有媒质的片段经“导入素材”产生） */
    contentEl.addEventListener("click", function (ev) {
      var add = ev.target.closest(".zy-lane-add");
      if (!add) return;
      var track = add.getAttribute("data-add-track");
      var clip = ZY.state.addClip(track, { start: ZY.ui.playhead, duration: 4 });
      ZY.state.setSelection("clip", clip.id);
      ZY.state.persist();
      render();
    });

    /* Ctrl + 滚轮缩放 */
    var scrollRoot = contentEl.closest(".zy-tl-scroll") || contentEl;
    scrollRoot.addEventListener("wheel", function (ev) {
      if (!ev.ctrlKey) return;
      ev.preventDefault();
      var factor = ev.deltaY < 0 ? 1.25 : 1 / 1.25;
      setPps(ZY.util.clamp(pps * factor, MIN_PPS, MAX_PPS));
    });
  }

  function setPps(next) {
    pps = next;
    render();
  }

  /* 键盘：Delete 删除选中片段/字幕卡；空格播放暂停（输入框聚焦时跳过） */
  function bindKeyboard() {
    document.addEventListener("keydown", function (ev) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (ev.key === "Delete" || ev.key === "Backspace") {
        var sel = ZY.ui.selection;
        if (!sel) return;
        ev.preventDefault();
        if (sel.kind === "clip") ZY.state.removeClip(sel.id);
        else ZY.state.removeCaption(sel.id);
      }
    });
  }

  function init() {
    rulerEl = document.getElementById("zy-ruler");
    contentEl = document.getElementById("zy-tl-content");
    playheadEl = document.getElementById("zy-playhead");
    laneClipEls = {
      video: document.getElementById("zy-lane-video"),
      audio: document.getElementById("zy-lane-audio"),
      caption: document.getElementById("zy-lane-caption")
    };
    rulerEl.appendChild(canvas);

    document.getElementById("tl-zoom-in").addEventListener("click", function () {
      setPps(ZY.util.clamp(pps * 1.25, MIN_PPS, MAX_PPS));
    });
    document.getElementById("tl-zoom-out").addEventListener("click", function () {
      setPps(ZY.util.clamp(pps / 1.25, MIN_PPS, MAX_PPS));
    });

    bindRuler();
    bindClipEvents();
    bindLaneBackground();
    bindKeyboard();
    render();
  }

  ZY.timeline = {
    init: init,
    render: render,
    updatePlayhead: updatePlayhead,
    setPlayhead: setPlayhead,
    splitSelectedAtPlayhead: splitSelectedAtPlayhead,
    getSecondsPerPixel: function () { return 1 / pps; }
  };
})();
