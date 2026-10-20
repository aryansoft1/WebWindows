/* 桌影 player.js：预览播放器。
 * V1 诚实范围：按“播放头切片段”逐段播放 — 找到播放头所在的（视频轨优先、其次音频轨）
 * 片段，播放其媒质并把时间线播放头与其相对时间同步。不做多轨混音/多片段同时播放、
 * 不过渡实渲染、变速在预览层用 playbackRate 近似（保音调重采样属导出管线 V3）。
 * CSP 警戒线（docs/WEBWINDOWS_MEDIA_EDITING_APP_SUPPORT_V1.md §5 G5 实测）：Production
 * 沙箱 media-src data: 会拒绝 blob:/https 的 <video>（MediaError.code=4，零网络请求）。
 * V1 的 objectURL 预览仅在浏览器降级模式下成立；V2 预览管线必须切 WebCodecs 解码→canvas 绘制。 */
(function () {
  "use strict";
  var ZY = window.ZY;

  var videoEl = null;    /* 预览画框内的 <video>（也能播 audio 媒质，只是无画面） */
  var frameEl = null;
  var emptyEl = null;
  var playing = false;   /* “走表”模式：时间线播放头推进，但无媒质可播 */
  var playheadBase = 0;  /* 走表起点 */
  var playedMs = 0;
  var rafHandle = 0;

  function el(id) { return document.getElementById(id); }

  function videoElGetter() { return videoEl; }

  /* 当前片段：播放头所在的最上层视频轨片段，其次音频轨片段 */
  function activeClip(t) {
    var clips = ZY.project.data.clips;
    var i;
    var best = null;
    for (i = 0; i < clips.length; i++) {
      if (clips[i].track !== "video") continue;
      if (t >= clips[i].start && t < clips[i].start + clips[i].duration) best = clips[i];
    }
    if (!best) {
      for (i = 0; i < clips.length; i++) {
        if (clips[i].track !== "audio") continue;
        if (t >= clips[i].start && t < clips[i].start + clips[i].duration) best = clips[i];
      }
    }
    return best;
  }

  function mediaUrl(clip) {
    if (!clip || !clip.mediaId) return null;
    return ZY.session.mediaUrls[clip.mediaId] || null;
  }

  function applyFilterPreview() {
    if (!videoEl || !ZY.clips) return;
    var clip = activeClip(ZY.ui.playhead);
    var preset = clip ? ZY.clips.FILTER_PRESETS[clip.filter] : null;
    var css = preset ? preset.css : "";
    videoEl.style.filter = css || "";
  }

  /* 播放头变动（含拖标尺）时：把媒质对齐到播放头（未播放时也有“当前帧”）。 */
  function syncToPlayhead() {
    if (!videoEl || playing || rafHandle) return;
    var clip = activeClip(ZY.ui.playhead);
    var url = mediaUrl(clip);
    applyFilterPreview();
    if (!clip || !url) {
      if (videoEl.getAttribute("src")) {
        videoEl.pause();
        videoEl.removeAttribute("src");
      }
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    if (videoEl.getAttribute("src") !== url) videoEl.src = url;
    var rel = ZY.util.clamp(ZY.ui.playhead - clip.start, 0, Math.max(0.01, clip.duration));
    try { videoEl.currentTime = rel / (clip.speed || 1); } catch (e) { /* 元数据未就绪，忽略 */ }
    videoEl.playbackRate = ZY.util.clamp(clip.speed || 1, 0.25, 4);
  }

  function play() {
    if (playing || rafHandle) return;
    var clip = activeClip(ZY.ui.playhead);
    playing = true;
    playheadBase = ZY.ui.playhead;
    playedMs = performance.now();
    var url = mediaUrl(clip);
    applyFilterPreview();
    if (clip && url) {
      videoEl.src = url;
      videoEl.currentTime = ZY.util.clamp(ZY.ui.playhead - clip.start, 0, Math.max(0.01, clip.duration));
      videoEl.playbackRate = ZY.util.clamp(clip.speed || 1, 0.25, 4);
      videoEl.play().catch(function () {
        ZY.util.statusMessage("预览播放未启动（浏览器策略或媒质不可用）", true);
      });
    }
    tick();
  }

  function stopPlayer() {
    playing = false;
    if (rafHandle) { cancelAnimationFrame(rafHandle); rafHandle = 0; }
    /* 只在确有媒质源时调用 pause（走表模式从未设过 src，避免无谓的 media 元素操作） */
    if (videoEl && videoEl.getAttribute("src")) videoEl.pause();
  }

  function pause() {
    stopPlayer();
    ZY.timeline.updatePlayhead();
  }

  /* 走表 / 媒质推进统一由 rAF 驱动：媒质播放时以 media.currentTime 回写播放头；
     无媒质时按真实时间推进播放头。到片段末尾自动停（V1 逐段播放，不自动接力）。 */
  function tick() {
    if (!playing) return;
    rafHandle = requestAnimationFrame(function () {
      rafHandle = 0;
      if (!playing) return;
      var clip = activeClip(ZY.ui.playhead);
      if (mediaUrl(clip) && !videoEl.paused) {
        ZY.ui.playhead = clip.start + videoEl.currentTime * (clip.speed || 1) * (videoEl.paused ? 1 : 1);
        var end = clip.start + clip.duration;
        if (clip.start + videoEl.currentTime * (clip.speed || 1) >= end - 0.02) {
          stopPlayer();
          ZY.ui.playhead = end;
          ZY.timeline.updatePlayhead();
          ZY.state.updateStatusfields();
          return;
        }
      } else {
        ZY.ui.playhead = playheadBase + (performance.now() - playedMs) / 1000;
      }
      /* 走表无上界：交子循环继续 */
      if (ZY.ui.playhead > timelineEnd() + 60) {
        stopPlayer();
        return;
      }
      ZY.timeline.updatePlayhead();
      ZY.state.updateStatusfields();
      rafHandle = requestAnimationFrame(tickLoop);
    });
  }

  function tickLoop() { tick(); }

  function timelineEnd() {
    var d = ZY.project.data;
    var max = 0;
    var i;
    for (i = 0; i < d.clips.length; i++) max = Math.max(max, d.clips[i].start + d.clips[i].duration);
    return max;
  }

  function seekTo(sec) {
    ZY.ui.playhead = Math.max(0, Math.round(sec * 100) / 100);
    ZY.timeline.updatePlayhead();
    syncToPlayhead();
    ZY.state.updateStatusfields();
  }

  /* 逐帧步进（±1 帧 @settings.fps） */
  function frameStep(dir) {
    stopPlayer();
    var fps = (ZY.project.data.settings && ZY.project.data.settings.fps) || ZY.FPS;
    seekTo(ZY.ui.playhead + dir / fps);
  }

  function applyAspectRatio() {
    if (!frameEl) frameEl = el("zy-frame");
    var ratio = (ZY.project.data.settings && ZY.project.data.settings.aspectRatio) || "16:9";
    frameEl.setAttribute("data-ratio", ratio);
  }

  function toggleAspect() {
    var order = ["16:9", "9:16", "1:1", "4:5"];
    var ratio = ZY.project.data.settings.aspectRatio || "16:9";
    var i = order.indexOf(ratio);
    ZY.project.data.settings.aspectRatio = order[(i + 1) % order.length];
    applyAspectRatio();
    ZY.state.persist();
    if (ZY.clips) ZY.clips.render();
  }

  function init() {
    videoEl = el("zy-video");
    frameEl = el("zy-frame");
    emptyEl = el("zy-frame-empty");

    el("btn-play").addEventListener("click", play);
    el("btn-pause").addEventListener("click", pause);
    el("btn-frame-back").addEventListener("click", function () { frameStep(-1); });
    el("btn-frame-fwd").addEventListener("click", function () { frameStep(1); });
    el("btn-go-start").addEventListener("click", function () { stopPlayer(); seekTo(0); });

    /* 空格：播放/暂停（输入元件聚焦时由 timeline 的键盘守卫跳过——这里同样守卫） */
    document.addEventListener("keydown", function (ev) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (ev.key === " ") {
        ev.preventDefault();
        if (playing) pause(); else play();
      }
      /* 左右方向键 = 逐帧 */
      if (ev.key === "ArrowLeft") frameStep(-1);
      if (ev.key === "ArrowRight") frameStep(1);
    });

    videoEl.addEventListener("ended", function () {
      stopPlayer();
      ZY.timeline.updatePlayhead();
    });

    applyAspectRatio();
  }

  ZY.player = {
    init: init,
    play: play,
    pause: pause,
    seekTo: seekTo,
    frameStep: frameStep,
    syncToPlayhead: syncToPlayhead,
    applyAspectRatio: applyAspectRatio,
    toggleAspect: toggleAspect,
    activeClip: activeClip,
    mediaUrl: mediaUrl,
    videoEl: videoElGetter,
    isPlaying: function () { return playing; }
  };
})();
