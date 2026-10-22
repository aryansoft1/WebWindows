/* 桌影 export.js：V2 导出管线（真实导出，诚实边界）。
 * 主力格式锁定 MP4（H.264 avc1.640028 + AAC mp4a.40.2）：
 *   时间线冻结快照 → 导出专用解码管线（与预览缓存隔离）→ 逐帧合成
 *   （黑底 → 片段帧（变速取帧）→ 滤镜 ctx.filter → 过渡
 *     （crossfade/fadeBlack/flashWhite，窗口=min(1s, 片段时长/2)）→ 字幕烧录
 *     （底部居中，outline=strokeText，fontSize 按 H/720 缩放））
 *   → VideoFrame→VideoEncoder(avc1.640028)（backpressure + 定期让出主线程）
 *   → OfflineAudioContext 混音（playbackRate=speed 不保音调=一期拍板；GainNode=volume）
 *   → AudioEncoder(AAC 128k, 48k×2ch) → mp4box.js addTrack/addSample 封装 → Blob 下载。
 * WebM 原型档已按用户拍板（2026-10-22）从面板移除：实时 1× 速与 webm 时长元数据
 *   缺省两项技术债不因转正文案而消失，故不保留半成品档位（拍板记录见
 *   docs/ZHUOYING_DESKSHADOW_REVIEW_PACK_V1.md §B-1）。无 VideoEncoder 宿主下
 *   导出按钮诚实置灰+提示（不做坏产物）——审核环境实测无 VD/VE 的情况属宿主能力
 *   事实，诊断面板如实呈现。
 * 诚实降级：无 AudioEncoder/OfflineAudioContext → MP4 导出无音轨版本并如实提示；
 *           无 VideoEncoder → 按钮置灰 + 提示（不做坏产物）。
 * 写盘分流：检测到 Production fileDialog.saveBlob 先走宿主写盘（检测到≠放行，
 *   失败回退）；浏览器降级走 downloadBlob。 */
(function () {
  "use strict";
  var ZY = window.ZY;

  var body = null;
  var lastChoice = null;

  /* 导出画幅 → 输出分辨率（MP4 主档 WebCodecs 编码路径；720p 基准） */
  var OUT_SIZE = {
    "16:9": [1280, 720],
    "9:16": [720, 1280],
    "1:1": [960, 960],
    "4:5": [896, 1120]
  };

  var ENC_BACKPRESSURE = 8;   /* encodeQueueSize 上限，超过则等待（帧预算纪律） */
  var UI_YIELD_EVERY = 8;     /* 每 N 帧让出主线程一次，进度条不冻结 */
  var AAC_FRAME = 1024;       /* AAC 一次编码帧（样本数） */
  var AUDIO_SR = 48000;       /* MP4 导出音频统一重排到 48kHz×2ch */

  /* 导出运行态（UI 与 ZY.export.state 同源） */
  var state = {
    active: false,
    cancel: false,
    pct: 0,
    phase: ""
  };

  /* ---------------- 小工具 ---------------- */

  function status(msg, isWarn) {
    ZY.util.statusMessage(msg, isWarn);
  }

  function fmtBytes(n) {
    if (n >= 1048576) return (n / 1048576).toFixed(2) + " MB";
    if (n >= 1024) return (n / 1024).toFixed(1) + " KB";
    return n + " B";
  }

  function stamp() {
    var d = new Date();
    function p(x) { return (x < 10 ? "0" : "") + x; }
    return "" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) +
      "-" + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
  }

  function setUI() {
    if (!body) return;
    var bar = body.querySelector("[data-e='export-bar']");
    var label = body.querySelector("[data-e='export-progress']");
    var btn = body.querySelector("[data-e='do-export']");
    var cbtn = body.querySelector("[data-e='cancel-export']");
    if (bar) bar.style.width = state.pct + "%";
    if (label) label.textContent = state.active ? (state.phase + " " + state.pct + "%") : "";
    if (btn) btn.disabled = state.active || !capabilityOk();
    if (cbtn) cbtn.hidden = !state.active;
  }

  /* MP4 主档可用：WebCodecs VideoEncoder + 管线就绪 */
  function capabilityOk() {
    return !!(window.VideoEncoder && ZY.pipeline.detect().ready);
  }

  /* ---------------- 快照：导出为开始时刻的工程冻结版本 ---------------- */

  function snapshotPlan(aspect) {
    var d = ZY.project.data;
    var i;
    var clips = [];
    for (i = 0; i < d.clips.length; i++) {
      var c0 = d.clips[i];
      clips.push({
        id: c0.id, track: c0.track, mediaId: c0.mediaId,
        start: c0.start, duration: c0.duration,
        speed: c0.speed || 1,
        volume: c0.volume == null ? 1 : c0.volume,
        filter: c0.filter || "none",
        transitionOut: c0.transitionOut || "none"
      });
    }
    var captions = [];
    for (i = 0; i < (d.captions || []).length; i++) {
      var cap = d.captions[i];
      captions.push({
        start: cap.start, end: cap.end, text: cap.text || "",
        fontSize: cap.fontSize || 24, outline: !!cap.outline
      });
    }
    var dur = 0;
    for (i = 0; i < clips.length; i++) dur = Math.max(dur, clips[i].start + clips[i].duration);
    for (i = 0; i < captions.length; i++) dur = Math.max(dur, captions[i].end);
    var size = OUT_SIZE[aspect] || OUT_SIZE["16:9"];
    return {
      clips: clips,
      captions: captions,
      duration: dur,
      width: size[0],
      height: size[1],
      fps: (d.settings && d.settings.fps) || 30,
      aspect: size === OUT_SIZE[aspect] ? aspect : "16:9"
    };
  }

  function videoClipAt(plan, t) {
    var best = null;
    for (var i = 0; i < plan.clips.length; i++) {
      var c = plan.clips[i];
      if (c.track !== "video" || !c.mediaId) continue;
      if (t >= c.start && t < c.start + c.duration) best = c;
    }
    return best;
  }

  /* 过渡窗口内的"下一条同轨片段"（只在衔接点 ±1ms 容差内找） */
  function nextVideoClipAt(plan, boundarySec) {
    for (var i = 0; i < plan.clips.length; i++) {
      var c = plan.clips[i];
      if (c.track !== "video" || !c.mediaId) continue;
      if (Math.abs(c.start - boundarySec) < 0.001) return c;
    }
    return null;
  }

  /* ---------------- 导出专用解码管线（与预览 session.mediaPipelines 隔离） ---------------- */

  async function pipeForMedia(run, mediaId) {
    run.pipes = run.pipes || {};
    if (run.pipes[mediaId]) return run.pipes[mediaId];
    var prov = ZY.session.mediaProviders && ZY.session.mediaProviders[mediaId];
    if (!prov) throw new Error("素材无可读取来源（可能来自旧工程，需重新导入）：" + mediaId);
    var pl = ZY.pipeline.create({
      provider: prov,
      canvas: null, /* 不绘预览画布，只作为取帧器 */
      onError: function (m) { status("导出解码：" + m, true); }
    });
    run.pipes[mediaId] = pl;
    await pl.ingest();
    return pl;
  }

  /* ---------------- 逐帧合成 ---------------- */

  function filterCss(clip) {
    var p = ZY.clips.FILTER_PRESETS[clip.filter];
    return p ? (p.css || "") : "";
  }

  function drawCaptions(ctx, plan, t) {
    var W = plan.width, H = plan.height;
    for (var i = 0; i < plan.captions.length; i++) {
      var c = plan.captions[i];
      if (!(c.start <= t && t < c.end)) continue;
      var fs = Math.max(8, (c.fontSize || 24) * (H / 720));
      ctx.font = "bold " + fs.toFixed(0) + "px 'Segoe UI','Microsoft YaHei',sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      var y = H - Math.round(fs * 0.6);
      if (c.outline) {
        ctx.lineWidth = Math.max(2, fs / 12);
        ctx.strokeStyle = "rgba(0,0,0,0.85)";
        ctx.strokeText(c.text, W / 2, y);
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillText(c.text, W / 2, y);
    }
  }

  /* 单输出时刻合成：黑底 → 片段帧（含滤镜 / 过渡）→ 字幕。 */
  async function compositeFrame(run, ctx, plan, t) {
    var W = plan.width, H = plan.height;
    ctx.globalAlpha = 1;
    ctx.filter = "none";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    var clip = videoClipAt(plan, t);
    var trKind = "none";
    var trR = 0;
    var nextClip = null;
    if (clip && clip.transitionOut !== "none" && clip.duration > 0) {
      var trWin = Math.min(1, clip.duration / 2);
      var trT0 = clip.start + clip.duration - trWin;
      if (t >= trT0) {
        trKind = clip.transitionOut;
        trR = (t - trT0) / Math.max(0.001, trWin);
        nextClip = (trKind === "crossfade") ?
          nextVideoClipAt(plan, clip.start + clip.duration) : null;
      }
    }

    if (clip) {
      var pl = await pipeForMedia(run, clip.mediaId);
      var srcMs = (t - clip.start) * clip.speed * 1000;
      var frame = await pl.frameAt(srcMs);
      if (frame) {
        if (trKind === "fadeBlack") ctx.globalAlpha = Math.max(0, 1 - trR);
        ctx.filter = filterCss(clip) || "none";
        try { ctx.drawImage(frame, 0, 0, W, H); }
        finally {
          try { frame.close(); } catch (e) {}
          ctx.filter = "none";
          ctx.globalAlpha = 1;
        }
      }
      if (trKind === "crossfade" && nextClip) {
        /* 叠化的 B 画面取 B.start 首帧（防重播语义）；跨帧复用缓存 */
        run.cachedB = run.cachedB || {};
        var bCache = run.cachedB[nextClip.id];
        if (!bCache) {
          var pl2 = await pipeForMedia(run, nextClip.mediaId);
          var f2 = await pl2.frameAt(0);
          if (f2) bCache = run.cachedB[nextClip.id] = { frame: f2, filter: filterCss(nextClip) || "none" };
        }
        if (bCache) {
          ctx.globalAlpha = Math.min(1, Math.max(0, trR));
          ctx.filter = bCache.filter;
          try { ctx.drawImage(bCache.frame, 0, 0, W, H); }
          finally {
            ctx.filter = "none";
            ctx.globalAlpha = 1;
          }
        }
      }
      if (trKind === "flashWhite") {
        ctx.globalAlpha = Math.min(1, Math.max(0, trR));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
    }

    drawCaptions(ctx, plan, t);
  }

  /* ---------------- 音频：离线混音 + AAC 编码（MP4 主档） ---------------- */

  /* 返回 mixed AudioBuffer；null = 全程无音频（调用方按"视频-only"处理） */
  async function renderAudioMix(run, plan) {
    var OfflineCtor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OfflineCtor) return null;
    var sr = AUDIO_SR;
    var oc = new OfflineCtor(2, Math.max(1, Math.ceil((plan.duration + 0.4) * sr)), sr);
    var scheduled = 0;
    var i;
    for (i = 0; i < plan.clips.length; i++) {
      if (run.cancel) throw new Error("已取消");
      var c = plan.clips[i];
      if (!c.mediaId) continue;
      var pl;
      var chunks = null;
      try {
        pl = await pipeForMedia(run, c.mediaId);
        /* 源取材范围：V1 模型片段从素材 0 起、取 duration×speed 秒 */
        chunks = await pl.decodeAudioRange(0, c.duration * c.speed * 1000, oc);
      } catch (e) {
        status("媒质音频跳过：" + (e && e.message || e), true);
        continue;
      }
      if (!chunks) continue; /* 无音轨（decodeAudioRange null）如实跳过 */
      for (var k = 0; k < chunks.length; k++) {
        var ch = chunks[k];
        var src = oc.createBufferSource();
        src.buffer = ch.buffer;
        src.playbackRate.value = c.speed; /* 一期拍板：变速不保音调 */
        var g = oc.createGain();
        g.gain.value = c.volume;
        src.connect(g);
        g.connect(oc.destination);
        var when = c.start + ch.ptsMs / 1000 / c.speed;
        try { src.start(when); scheduled++; }
        catch (ee) {
          try { src.start(0); scheduled++; } catch (e2) { /* 越界小偏移如实丢弃 */ }
        }
      }
    }
    if (!scheduled) return null;
    return oc.startRendering();
  }

  async function encodeAac(mixed, run) {
    var samples = [];
    var asc = null;
    var ab = new AudioEncoder({
      output: function (chunk, meta) {
        if (!asc && meta && meta.decoderConfig && meta.decoderConfig.description) {
          var d0 = meta.decoderConfig.description;
          if (ArrayBuffer.isView(d0)) {
            asc = new Uint8Array(d0.buffer.slice(d0.byteOffset, d0.byteOffset + d0.byteLength));
          } else if (d0 instanceof ArrayBuffer) {
            asc = new Uint8Array(d0);
          }
        }
        var u8 = new Uint8Array(chunk.byteLength);
        chunk.copyTo(u8);
        samples.push({ data: u8, durMs: chunk.duration || 0 });
      },
      error: function (e) { run.encErr = e; }
    });
    ab.configure({
      codec: "mp4a.40.2",
      sampleRate: AUDIO_SR,
      numberOfChannels: mixed.numberOfChannels >= 2 ? 2 : 1,
      bitrate: 128000
    });
    var N = mixed.length;
    var ch0 = mixed.getChannelData(0);
    var stereo = mixed.numberOfChannels >= 2;
    var ch1 = stereo ? mixed.getChannelData(1) : ch0;
    for (var off = 0; off < N; off += AAC_FRAME) {
      if (run.cancel) throw new Error("已取消");
      if (run.encErr) throw run.encErr;
      var n = Math.min(AAC_FRAME, N - off);
      var a0 = ch0.subarray(off, off + n);
      var a1 = ch1.subarray(off, off + n);
      /* OfflineAudioContext 输出经 getChannelData 已按平面取好；planar 布局要求
       * data 为单块连续缓冲（平面依次拼接），不是平面数组 */
      var planes = stereo ? new Float32Array(n * 2) : new Float32Array(n);
      planes.set(a0, 0);
      if (stereo) planes.set(a1, n);
      var ad = new AudioData({
        format: stereo ? "f32-planar" : "f32",
        sampleRate: AUDIO_SR,
        numberOfFrames: n,
        numberOfChannels: stereo ? 2 : 1,
        timestamp: Math.round(off / AUDIO_SR * 1e6),
        data: planes
      });
      ab.encode(ad);
      ad.close();
    }
    await ab.flush();
    try { ab.close(); } catch (e) {}
    return { samples: samples, asc: asc };
  }

  /* ---------------- mp4box.js 封装（MP4 主档） ---------------- */

  /* 手工拼 esds fullbox（ES(3) > DecoderConfig(4) > ASC(5) > SLConfig(6)），
   * 用 MP4Box 空文件 appendBuffer 解析出 Box 实例喂 addTrack(description)。
   * 用编码器输出的全新 ASC（保证与本次 48kHz 编码一致），不用源 esds 防采样率错配。 */
  function craftEsdsBox(ascBytes) {
    if (!window.MP4Box || !window.DataStream) return null;
    var asc = [];
    var i;
    for (i = 0; i < ascBytes.length; i++) asc.push(ascBytes[i] & 255);
    var L = asc.length;
    var dcLen = 13;                 /* objectType+streamType+bufferSizeDB3+max4+avg4 */
    var dLen = dcLen + (2 + L) + 3; /* DC body + ASC(tag+len+data) + SL(tag+len+data) */
    var eLen = 3 + (2 + dLen);      /* ES_ID2 + flags1 + DC(tag+len+body) */
    var total = 4 /*size*/ + 4 /*esds*/ + 4 /*version+flags*/ + 2 + eLen;
    var u8 = new Uint8Array(total);
    var p = 0;
    u8[p++] = (total >>> 24) & 255;
    u8[p++] = (total >>> 16) & 255;
    u8[p++] = (total >>> 8) & 255;
    u8[p++] = total & 255;
    u8[p++] = 0x65; u8[p++] = 0x73; u8[p++] = 0x64; u8[p++] = 0x73; /* "esds" */
    u8[p++] = 0; u8[p++] = 0; u8[p++] = 0; u8[p++] = 0;            /* version/flags */
    u8[p++] = 3; u8[p++] = eLen;                                   /* ES_Descriptor */
    u8[p++] = 0; u8[p++] = 1;                                      /* ES_ID=1 */
    u8[p++] = 0;                                                   /* flags */
    u8[p++] = 4; u8[p++] = dLen;                                   /* DecoderConfig */
    u8[p++] = 0x40;                                                /* AAC-LC */
    u8[p++] = 0x15;                                                /* audio streamType */
    u8[p++] = 0; u8[p++] = 0; u8[p++] = 0;                         /* bufferSizeDB */
    for (i = 0; i < 8; i++) u8[p++] = 0;                           /* max/avg bitrate */
    u8[p++] = 5; u8[p++] = L;                                      /* AudioSpecificConfig */
    for (i = 0; i < L; i++) u8[p++] = asc[i];
    u8[p++] = 6; u8[p++] = 1; u8[p++] = 0x02;                      /* SLConfig */
    try {
      var f2 = window.MP4Box.createFile();
      var ab2 = u8.buffer;
      ab2.fileStart = 0;
      f2.appendBuffer(ab2);
      if (f2.flush) f2.flush();
      var boxes = f2.boxes || [];
      for (i = 0; i < boxes.length; i++) {
        if (boxes[i] && boxes[i].type === "esds") return boxes[i];
      }
    } catch (e) {}
    return null;
  }

  function muxMp4(opts, vSamples, aSamples, vDesc, ascBytes) {
    if (!window.MP4Box || !window.DataStream) throw new Error("mp4box 封装库不可用");
    var mux = window.MP4Box.createFile();
    /* MP4BoxStream 只吃 ArrayBuffer：把 avcC 记录折成整体 ArrayBuffer */
    function toAB(u8) {
      if (u8 instanceof ArrayBuffer) return u8;
      if (u8.byteOffset === 0 && u8.buffer.byteLength === u8.byteLength) return u8.buffer;
      return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
    }
    var i;
    if (vSamples.length && vDesc) {
      var vTrackId = mux.addTrack({
        type: "avc1",
        timescale: opts.fps,
        width: opts.width,
        height: opts.height,
        duration: vSamples.length,
        avcDecoderConfigRecord: toAB(vDesc),
        language: "und"
      });
      for (i = 0; i < vSamples.length; i++) {
        mux.addSample(vTrackId, vSamples[i].data, {
          duration: 1,
          cts: i,
          dts: i,
          is_sync: vSamples[i].key
        });
      }
    }
    if (aSamples && aSamples.length) {
      var esds = craftEsdsBox(ascBytes);
      var aTrackId = mux.addTrack({
        type: "mp4a",
        timescale: AUDIO_SR,
        samplerate: AUDIO_SR,
        channel_count: 2,
        samplesize: 16,
        description: esds,
        language: "und"
      });
      var cts = 0;
      for (i = 0; i < aSamples.length; i++) {
        var durS = Math.max(1, Math.round(aSamples[i].durMs / 1000 * AUDIO_SR));
        mux.addSample(aTrackId, aSamples[i].data, {
          duration: durS,
          cts: cts,
          dts: cts,
          is_sync: true
        });
        cts += durS;
      }
    }
    var ds = new DataStream();
    ds.endianness = DataStream.BIG_ENDIAN;
    mux.write(ds);
    return new Blob([ds.buffer.slice(0, ds.position)], { type: "video/mp4" });
  }

  /* ---------------- 主流程：MP4 主档 ---------------- */

  async function runExport(opts) {
    if (state.active) { status("已有导出在进行，请等待或取消", true); return null; }
    var aspect = (opts && opts.aspect) || (ZY.project.data.settings && ZY.project.data.settings.aspectRatio) || "16:9";
    var pcaps = ZY.pipeline.detect();
    if (!pcaps.ready) {
      status("环境不支持导出：需要 secure context + WebCodecs 视频解码 + mp4box 解析器", true);
      return null;
    }
    if (!window.VideoEncoder) {
      status("宿主缺少 WebCodecs VideoEncoder：MP4 主档暂不可用（诚实置灰，不产出坏文件）", true);
      return null;
    }
    var plan = snapshotPlan(aspect);
    if (plan.duration <= 0) {
      status("时间线为空：没有可导出的内容", true);
      return null;
    }

    var run = { cancel: false, pipes: null, cachedB: null, encErr: null };
    state.active = true;
    state.cancel = false;
    state.pct = 0;
    state.phase = "准备中";
    setUI();

    var canvas = document.createElement("canvas");
    canvas.width = plan.width;
    canvas.height = plan.height;
    var ctx = canvas.getContext("2d");
    var totalFrames = Math.max(1, Math.ceil(plan.duration * plan.fps));
    var result = null;

    try {
      /* ---- 视频：逐帧合成 + H.264 编码（0→70） ---- */
      var vSamples = [];
      var vDesc = null;
      var veErr = null;
      var ve = new VideoEncoder({
        output: function (chunk, meta) {
          if (!vDesc && meta && meta.decoderConfig && meta.decoderConfig.description) {
            var d0 = meta.decoderConfig.description;
            if (ArrayBuffer.isView(d0)) {
              vDesc = new Uint8Array(d0.buffer.slice(d0.byteOffset, d0.byteOffset + d0.byteLength));
            } else if (d0 instanceof ArrayBuffer) {
              vDesc = new Uint8Array(d0);
            }
          }
          var u8 = new Uint8Array(chunk.byteLength);
          chunk.copyTo(u8);
          vSamples.push({ data: u8, key: chunk.type === "key" });
        },
        error: function (e) { veErr = e; }
      });
      ve.configure({
        codec: "avc1.640028",
        width: plan.width,
        height: plan.height,
        bitrate: plan.width >= 1280 ? 8000000 : 4000000,
        framerate: plan.fps,
        latencyMode: "quality"
      });

      var kfEvery = Math.max(1, plan.fps * 2);
      for (var i = 0; i < totalFrames; i++) {
        if (state.cancel) throw new Error("已取消");
        if (veErr) throw new Error("编码器错误：" + (veErr.message || veErr));
        var t = i / plan.fps;
        await compositeFrame(run, ctx, plan, t);
        var vf = new VideoFrame(canvas, {
          timestamp: Math.round(i / plan.fps * 1e6),
          duration: Math.round(1e6 / plan.fps)
        });
        ve.encode(vf, { keyFrame: i % kfEvery === 0 });
        vf.close();
        /* backpressure：防止编码队列在飞堆积 */
        while (ve.encodeQueueSize > ENC_BACKPRESSURE && !state.cancel) {
          await new Promise(function (r) { setTimeout(r, 8); });
        }
        if (i % UI_YIELD_EVERY === 0 && !state.cancel) {
          await new Promise(function (r) { setTimeout(r, 0); });
        }
        state.pct = Math.round(i / totalFrames * 70);
        state.phase = "视频合成";
        if (i % UI_YIELD_EVERY === 0) setUI();
      }
      await ve.flush();
      try { ve.close(); } catch (e1) {}
      if (!vDesc) throw new Error("编码器未给出 avcC 描述符（无法封装）");
      if (state.cancel) throw new Error("已取消");

      /* ---- 音频：混音 + AAC（70→88），无能力时诚实降级为无音轨 ---- */
      var aSamples = null;
      var ascBytes = null;
      if (window.AudioEncoder && (window.OfflineAudioContext || window.webkitOfflineAudioContext)) {
        state.pct = 70;
        state.phase = "音频混音";
        setUI();
        var mixed = await renderAudioMix(run, plan);
        if (mixed && mixed.length > 0) {
          state.pct = 78;
          state.phase = "音频编码";
          setUI();
          var aEnc = await encodeAac(mixed, run);
          aSamples = aEnc.samples;
          ascBytes = aEnc.asc;
        } else {
          status("素材无音轨：导出无音轨版本（如实降级）", true);
        }
      } else {
        status("宿主缺少 AudioEncoder/OfflineAudioContext：导出无音轨版本（如实降级）", true);
      }

      /* ---- 封装 + 下载（88→100） ---- */
      state.pct = 88;
      state.phase = "封装 MP4";
      setUI();
      var blob = muxMp4({
        fps: plan.fps,
        width: plan.width,
        height: plan.height
      }, vSamples, aSamples, vDesc, ascBytes);
      state.pct = 100;
      state.phase = "完成";
      setUI();
      result = {
        blob: blob,
        frames: totalFrames,
        bytes: blob.size,
        width: plan.width,
        height: plan.height,
        fps: plan.fps,
        hasAudio: !!(aSamples && aSamples.length),
        realtime: false
      };
    } finally {
      var ps = run.pipes;
      if (ps) {
        for (var k in ps) {
          try { ps[k].destroy(); } catch (e2) {}
        }
      }
      run.pipes = null;
      run.cachedB = null;
      state.active = false;
      state.cancel = false;
      setUI();
      setTimeout(function () {
        if (!state.active) {
          state.pct = 0;
          state.phase = "";
          setUI();
        }
      }, 2500);
    }
    return result;
  }

  function cancelExport() {
    if (state.active) {
      state.cancel = true;
      status("已请求取消导出，正在收尾", true);
    }
  }

  /* 写盘分流（诚实探测）：检测到 Production fileDialog.saveBlob 则先走宿主写盘
   * （检测到≠放行：失败自动回退浏览器 downloadBlob）；浏览器降级模式直接下载。 */
  function saveOrDownload(blob, filename) {
    var envInfo = ZY.env.info;
    var canSave = !!(envInfo && envInfo.fileDialogSaveBlob &&
      window.WebWindows && window.WebWindows.fileDialog &&
      typeof window.WebWindows.fileDialog.saveBlob === "function");
    if (canSave) {
      try {
        var pr = window.WebWindows.fileDialog.saveBlob(blob, filename);
        if (pr && typeof pr.then === "function") {
          pr.then(function () {
            status("导出完成：已写入宿主（fileDialog.saveBlob）——" + filename + "（" + fmtBytes(blob.size) + "）");
          }, function () {
            ZY.util.downloadBlob(blob, filename);
            status("宿主写盘未放行（探测可用≠契约放行），已回退浏览器下载：" + filename + "（" + fmtBytes(blob.size) + "）", true);
          });
          return;
        }
      } catch (e) { /* 探测可用但同步拒绝 → 回退 */ }
      status("宿主写盘不可用（探测可用≠放行），已回退浏览器下载：" + filename, true);
      ZY.util.downloadBlob(blob, filename);
      return;
    }
    ZY.util.downloadBlob(blob, filename);
    status("导出完成：" + filename + "（浏览器降级写盘，" + fmtBytes(blob.size) + "）");
  }

  /* ---------------- 面板 ---------------- */

  function row(label, ok) {
    return "<tr><td>" + label + "</td><td><span class='zy-badge " + (ok ? "ok" : "no") + "'>" + (ok ? "可" : "否") + "</span></td></tr>";
  }

  function render() {
    if (!body) return;
    var caps = ZY.env.detect();
    var cur = (ZY.project.data.settings && ZY.project.data.settings.aspectRatio) || "16:9";

    var html = "";
    html += "<table class='zy-diag-table'>" +
      row("WebCodecs VideoEncoder", caps.webCodecsVideoEncoder) +
      row("WebCodecs VideoDecoder", caps.webCodecsVideoDecoder) +
      row("WebCodecs AudioEncoder", caps.webCodecsAudioEncoder) +
      row("MediaRecorder", caps.mediaRecorder) +
      row("Canvas.captureStream", caps.captureStream) +
      "</table>";

    html += "<div class='zy-field'><label>目标画幅</label><select data-e='aspect'>";
    var ratios = ZY.clips.ASPECT_RATIOS;
    for (var i = 0; i < ratios.length; i++) {
      html += "<option value='" + ratios[i] + "'" + (cur === ratios[i] ? " selected" : "") + ">" + ratios[i] + "</option>";
    }
    html += "</select></div>";

    html += "<div class='zy-field'><label>目标格式</label><select data-e='format'>" +
      "<option value='mp4' selected>MP4 主档（H.264 avc1.640028 + AAC，WebCodecs + mp4box.js）</option>" +
      "</select></div>";

    html += "<div class='zy-field' style='display:flex;gap:8px;border:none'>" +
      "<button data-e='do-export'>开始导出</button>" +
      "<button data-e='cancel-export' hidden>取消导出</button></div>";

    html += "<div class='zy-export-progress'><div class='zy-export-bar' data-e='export-bar' style='width:0%'></div></div>" +
      "<div data-e='export-progress' class='zy-export-status'></div>";

    html += "<p class='zy-warn-hint'>导出按开始时刻的工程快照逐帧渲染（导出期间请勿改动时间线）；" +
      "变速音频按一期拍板不保音调。MP4 主档：宿主缺 AudioEncoder 时自动导出无音轨版本并如实提示，" +
      "缺 VideoEncoder 时导出按钮置灰（不做坏产物；WebM 原型档已按 2026-10-22 拍板移除）。" +
      "写盘：检测到 Production fileDialog.saveBlob 先走宿主写盘（检测到≠放行，失败回退），浏览器降级走 downloadBlob。</p>";

    body.innerHTML = html;

    var aspect = body.querySelector("[data-e='aspect']");
    if (aspect) {
      aspect.value = cur;
      aspect.addEventListener("change", function () {
        ZY.project.data.settings.aspectRatio = aspect.value;
        ZY.state.persist();
        ZY.player.applyAspectRatio();
        lastChoice = { aspect: aspect.value };
      });
    }

    var fmt = body.querySelector("[data-e='format']");
    if (fmt) fmt.value = lastChoice && lastChoice.format ? lastChoice.format : "mp4";
    if (fmt) fmt.addEventListener("change", function () { lastChoice = { format: fmt.value }; });

    var btn = body.querySelector("[data-e='do-export']");
    if (btn) {
      btn.disabled = state.active || !capabilityOk();
      btn.addEventListener("click", function () {
        if (state.active) return;
        if (!capabilityOk()) {
          status("MP4 主档需 WebCodecs VideoEncoder（当前宿主缺失，无法导出）", true);
          return;
        }
        var a = aspect && aspect.value ? aspect.value : "16:9";
        runExport({ aspect: a }).then(function (res) {
          if (!res || !res.blob) return; /* 失败/取消已在内部如实上报 */
          var safeName = (ZY.project.data.name || "deskshadow").replace(/[\\/:*?"<>|]/g, "_");
          var filename = safeName + "-" + stamp() + ".mp4";
          saveOrDownload(res.blob, filename);
        }, function (e) {
          status("导出失败：" + (e && e.message || e), true);
        });
      });
    }

    var cbtn = body.querySelector("[data-e='cancel-export']");
    if (cbtn) {
      cbtn.hidden = !state.active;
      cbtn.addEventListener("click", cancelExport);
    }

    (function syncStats() {
      var w = body.querySelector("[data-e='export-bar']");
      var l = body.querySelector("[data-e='export-progress']");
      if (w) w.style.width = state.pct + "%";
      if (l) l.textContent = state.active ? (state.phase + " " + state.pct + "%") : "";
    })();
  }

  function init() {
    body = document.getElementById("panel-export-body");
    render();
    ZY.export = ZY.export || {};
    /* 扩展运行态属性（保留 init/render 指针） */
    ZY.export.run = function (opts) {
      /* WebM 原型档已移除（2026-10-22 拍板）：API 稳定保留，webm 参数如实回退 MP4 主档 */
      if (opts && opts.format === "webm") {
        status("WebM 原型档已按拍板移除：按 MP4 主档执行", true);
      }
      return runExport(opts);
    };
    /* L1 分析也用主档画幅口径（导出分辨率表原样暴露，两处不漂移） */
    ZY.export.outSizeFor = function (aspect) {
      var s = OUT_SIZE[aspect] || OUT_SIZE["16:9"];
      return [s[0], s[1]];
    };
    ZY.export.cancel = cancelExport;
    ZY.export.state = {
      get active() { return state.active; },
      get cancel() { return state.cancel; },
      get pct() { return state.pct; },
      get phase() { return state.phase; }
    };
  }

  init();
  /* 对外暴露（幂等：init 内已挂 run/cancel/state） */
  ZY.export.init = init;
  ZY.export.render = render;
})();
