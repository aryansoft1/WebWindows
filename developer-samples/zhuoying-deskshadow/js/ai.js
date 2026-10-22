/* 桌影 ai.js：
 * 1) 诊断抽屉：window.WebWindows 与桌面端能力的真实检测结果（不伪造成功）。
 * 2) 桌讯 AI 抽屉：L1 本地确定性分析（资产报告 assetReport：抽帧场景/运动/响度/静音，
 *    全在页内计算、零网络零外发）+ L2 发送按钮置灰（依赖 ai.desktalk-assist 契约）。
 * L1 schema 对齐 docs/WEBWINDOWS_MEDIA_EDITING_APP_SUPPORT_V1.md §7.4（16 KiB 内）：
 * 导入摘要（结构统计，毋需解码）与素材扫描报告（需 WebCodecs 管线）二级分开呈现。
 * 诚实边界：不传帧画面、不传音频内容；扫描为估算（0.5s 抽样车道/luma 柱状图/RMS 窗），
 * 不谎称"看懂视频"；数组一律下采样封顶，序列化超过 16 KiB 自动加密抽样。 */
(function () {
  "use strict";
  var ZY = window.ZY;

  var diagBody = null;
  var aiBody = null;
  var lastSummary = null;   /* 结构摘要（纯工程数据，同步） */
  var lastReport = null;    /* L1 assetReport（含抽帧/响度扫描，异步） */
  var scanning = false;
  var scanStatus = "";

  /* L1 扫描车道参数（写死为保守车道，属可评审的确定性参数） */
  var SCAN_CanvasW = 64;       /* 抽帧降采样到 64px 宽做柱状图 */
  var SCAN_STEP_MS = 500;      /* 采样步长 0.5s：`summary.scenes` 与 motion 车道一致 */
  var SCENE_CUT_TH = 0.55;     /* luma 柱状图归一化差 > 该值记为场景切换（估算） */
  var SILENCE_DB = -50;        /* RMS dB 低于该值 = 静音（估算） */
  var SILENCE_MIN_MS = 300;    /* 静音段最短时长 */
  var LOUD_MIN_DB = -96;
  var MAX_POINTS = 64;         /* schema 数组下采样上限 */

  /* ---------------- 诊断 ---------------- */

  function badge(ok) {
    return '<span class="zy-badge ' + (ok ? "ok" : "no") + '">' + (ok ? "有" : "无") + "</span>";
  }

  /* 三态徽章：true=具备 / false=不具备 / null=存在命名空间但功能未接入 */
  function badge3(v) {
    if (v === true) return '<span class="zy-badge ok">具备</span>';
    if (v === false) return '<span class="zy-badge no">不具备</span>';
    return '<span class="zy-badge mid">契约未接入</span>';
  }

  function renderDiag() {
    if (!diagBody) return;
    var caps = ZY.env.detect();

    /* fileDialog 整体能力态：命名空间在但方法未接入 => “契约未接入”；命名空间都不在 => “不具备” */
    var fd = caps.fileDialogOpen === true || caps.fileDialogSaveBlob === true
      ? true
      : (caps.fileDialogNamespace ? null : false);

    var rows = [
      ["WebWindows Host 命名空间", badge(caps.hostDetected)],
      ["沙箱 iframe 环境（相对顶层窗口）", badge(caps.isIframed)],
      ["运行来源", "<span>" + String(caps.origin) + "</span>"],
      ["device 命名空间（device.getCapabilities 等）", badge(caps.deviceNamespace)],
      ["dialog 命名空间", badge(caps.dialogNamespace)],
      ["fileDialog.open（宿主文件选择）", badge3(fd)],
      ["fileDialog.saveBlob（宿主保盘）", badge3(fd)],
      ["ai 命名空间（ai.requestAssist）", caps.aiNamespace ? badge3(caps.aiRequestAssist) : badge(false)],
      ["预览管线（WebCodecs+MP4Box）", (function () {
        var pc = window.ZY && ZY.pipeline ? ZY.pipeline.detect() : null;
        if (pc && pc.ready) return badge(true);
        if (pc && pc.secure && !pc.mp4box) return "<span>判定中</span>";
        return badge(false);
      })()],
      ["localStorage", badge(caps.localStorage)],
      ["MediaRecorder", badge(caps.mediaRecorder)],
      ["WebCodecs VideoEncoder / VideoDecoder", badge(caps.webCodecsVideoEncoder && caps.webCodecsVideoDecoder)],
      ["WebCodecs AudioEncoder", badge(caps.webCodecsAudioEncoder)],
      ["Canvas.captureStream", badge(caps.captureStream)]
    ];

    var html = "<table class='zy-diag-table'>";
    var i;
    for (i = 0; i < rows.length; i++) {
      html += "<tr><td>" + rows[i][0] + "</td><td>" + rows[i][1] + "</td></tr>";
    }
    html += "</table>";
    html += "<p class='zy-hint'>以上是本运行环境的真实检测结果，不代表能力已授权；未检测到 Host 时按普通浏览器降级（file input / a[download]）。</p>";
    html += "<p class='zy-hint'>沙箱警戒线（docs/WEBWINDOWS_MEDIA_EDITING_APP_SUPPORT_V1.md §5，2026-10-21 实测）：Production 沙箱 CSP 为 media-src data:/connect-src 'none'——blob:/https 媒体的 <code>&lt;video&gt;</code> 预览会被元素层拒绝（含云资料 readUrl），V2 预览必须切 WebCodecs→canvas 管线；当前浏览器降级模式不受此限。</p>";
    html += "<p class='zy-hint'>沙箱警戒线（同上 §5）：opaque origin 下 localStorage/IndexedDB 均 SecurityError——本骨架的 localStorage 草稿仅在浏览器降级模式可用；Production 持久化已定案走<b>云端工程文件</b>（云资料写权限），骨架会在诊断中如实降级并提示。</p>";
    html += "<p class='zy-warn-hint'>诚实边界：本骨架尚未接入任何 Broker 调用；fileDialog/ai 依赖的权限契约（见 manifest 命名空间 plannedPermissions）在 data/sdk/permissions-v1.json 登记前 manifest.permissions 必须为空。</p>";
    diagBody.innerHTML = html;
  }

  /* ---------------- 工程结构摘要（同步，纯工程数据） ---------------- */

  /* 视频轨时间线的空隙（同轨相邻片段间 >5ms 的间隙数与总秒数） */
  function videoTrackGaps(clips) {
    var segs = [];
    for (var i = 0; i < clips.length; i++) {
      if (clips[i].track === "video" && clips[i].mediaId) segs.push({ s: clips[i].start, e: clips[i].start + clips[i].duration });
    }
    segs.sort(function (a, b) { return a.s - b.s; });
    var gaps = [];
    for (i = 0; i < segs.length; i++) {
      var prevE = i > 0 ? segs[i - 1].e : segs[i].s;
      if (segs[i].s - prevE > 0.005) gaps.push(segs[i].s - prevE);
    }
    return gaps;
  }

  function buildSummary() {
    var d = ZY.project.data;
    var i;
    var clipCount = d.clips.length;
    var total = 0;
    var fastest = 1;
    var slowest = 1;
    var filters = {};
    var transitions = {};
    var caps0 = d.captions || [];
    for (i = 0; i < d.clips.length; i++) {
      total += d.clips[i].duration;
      fastest = Math.min(fastest, d.clips[i].speed);
      slowest = Math.max(slowest, d.clips[i].speed);
      if (d.clips[i].filter !== "none") filters[d.clips[i].filter] = (filters[d.clips[i].filter] === undefined ? 0 : filters[d.clips[i].filter]) + 1;
      if (d.clips[i].transitionOut !== "none") transitions[d.clips[i].transitionOut] = (transitions[d.clips[i].transitionOut] === undefined ? 0 : transitions[d.clips[i].transitionOut]) + 1;
    }
    /* 字幕轨统计（契约 §6"字幕轨统计"）：条数/覆盖总时长/平均字数，缺字段按 0 处理 */
    var capCount = caps0.length;
    var capCover = 0;
    var capChars = 0;
    for (i = 0; i < capCount; i++) {
      capCover += Math.max(0, (caps0[i].end || 0) - (caps0[i].start || 0));
      capChars += String(caps0[i].text || "").length;
    }
    var capAvg = capCount ? Math.round(capChars / capCount * 10) / 10 : 0;
    var gaps = videoTrackGaps(d.clips);
    return {
      scene: "video-edit",
      mediaCount: d.media.length,
      clipCount: clipCount,
      captionCount: capCount,
      captionCoverSec: Math.round(capCover * 100) / 100,
      captionAvgChars: capAvg,
      videoGapCount: gaps.length,
      videoGapTotalSec: Math.round(gaps.reduce(function (a, b) { return a + b; }, 0) * 100) / 100,
      totalDurationSec: Math.round(total * 100) / 100,
      speedRange: fastest > slowest ? [fastest, slowest] : total > 0 ? [1, 1] : null,
      filtersUsed: filters,
      transitionsUsed: transitions,
      aspectRatio: (d.settings && d.settings.aspectRatio) || "16:9"
    };
  }

  /* ---------------- L1 assetReport（抽帧/响度扫描，零外发） ---------------- */

  function round2(x) { return Math.round(x * 100) / 100; }

  /* 确定性下采样：等步长取点，保首尾 */
  function downsample(arr, max) {
    if (arr.length <= max) return arr;
    var out = [];
    for (var i = 0; i < max; i++) {
      out.push(arr[Math.min(arr.length - 1, Math.round(i * (arr.length - 1) / Math.max(1, max - 1)))]);
    }
    return out;
  }

  /* luma 16-bin 柱状图（0..255 亮度分箱，归一化 0..1） */
  function lumaHist(img) {
    var bins = new Array(16).fill(0);
    var d = img.data;
    var n = d.length / 4;
    for (var i = 0; i < d.length; i += 4) {
      var l = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000;
      bins[Math.min(15, Math.floor(l / 16))] += 1;
    }
    for (var b = 0; b < 16; b++) bins[b] /= n; /* 归一化 0..1 */
    return bins;
  }

  async function scanMedia(noteList, mediaId, onProgress) {
    var prov = ZY.session.mediaProviders && ZY.session.mediaProviders[mediaId];
    if (!prov) {
      noteList.push("素材 " + mediaId + " 无可读取来源（可能来自旧工程，需重新导入）——跳过扫描");
      return null;
    }
    var pl;
    try {
      pl = ZY.pipeline.create({
        provider: prov,
        canvas: null,
        onError: function (m) { noteList.push("素材 " + mediaId + " 扫描告警：" + m); }
      });
    } catch (e) {
      noteList.push("素材 " + mediaId + " 管线创建失败：" + (e && e.message || e));
      return null;
    }
    try {
      await pl.ingest();
      var durMs = pl.durationMs || 0;
      var vT = pl.vTrack;         /* {id,codec,width,height,timescale,duration}（ingest 归一化） */
      var aT = pl.aTrack;         /* {id,codec,timescale,audio:{sample_rate,channel_count}} */
      var out = {
        mediaId: mediaId,
        width: vT ? vT.width : null,
        height: vT ? vT.height : null,
        codec: vT ? vT.codec : null,
        audioCodec: aT ? aT.codec : null,
        fps: (vT && pl.vS && durMs) ? round2(pl.vS.length / (durMs / 1000)) : null,
        videoSamples: (vT && pl.vS) ? pl.vS.length : 0,
        audioChannels: (aT && aT.audio) ? aT.audio.channel_count : null,
        durationMs: durMs,
        sceneCutsLocal: [],
        motionLocal: [],
        loudnessLocal: [],
        silenceLocal: []
      };

      /* 抽帧车道：t 从 0 到 durMs；步长自适应（>30s 素材拉大步长，采样点 ≤64+1，
       * 确定性车道；0.5s 基准步长在短视频保持）。每帧用完即 close（帧纪律，
       * frameAt 内部已全释放其余帧，在飞 ≤1） */
      var stepMs = durMs > 30000 ? Math.max(SCAN_STEP_MS, Math.ceil(durMs / 64)) : SCAN_STEP_MS;
      var scanCanvas = document.createElement("canvas");
      var lastHist = null;
      var lastT = null;
      for (var t = 0; t <= durMs; t += stepMs) {
        var fr = null;
        try {
          fr = await pl.frameAt(Math.min(t, Math.max(0, durMs - 1)));
          if (fr) {
            var W = SCAN_CanvasW;
            var H = Math.max(8, Math.round(W * fr.displayHeight / fr.displayWidth) || 36);
            scanCanvas.width = W;
            scanCanvas.height = H;
            var sctx = scanCanvas.getContext("2d");
            sctx.drawImage(fr, 0, 0, W, H);
            var hist = lumaHist(sctx.getImageData(0, 0, W, H));
            if (lastHist && lastT != null) {
              var diff = histDiff(lastHist, hist);
              out.motionLocal.push({ t: t / 1000, v: round2(diff) });
              if (diff >= SCENE_CUT_TH) out.sceneCutsLocal.push({ t: round2(t / 1000), score: round2(diff) });
            }
            lastHist = hist;
            lastT = t;
          }
        } finally {
          if (fr) { try { fr.close(); } catch (e1) {} }
        }
        if (onProgress) onProgress("素材 " + mediaId + " 抽帧 " + Math.min(t + stepMs, durMs) / 1000 + "s / " + durMs / 1000 + "s");
      }
      out.stepMs = stepMs;

      /* 响度/静音车道：decodeAudioRange 离线解码全轨（失败/无音轨如实标注）。
       * AAC 单块 ~1024 样本（≈21ms）远小于窗口：按 pts 顺序拼接全部块后开窗，
       * 左声道确定性车道（立体声取 CH0），窗口=扫描步长。 */
      try {
        var bufCtx = new OfflineAudioContext(1, 128, 44100);
        var chunks = await pl.decodeAudioRange(0, durMs, bufCtx);
        if (chunks && chunks.length) {
          chunks.sort(function (a, b) { return a.ptsMs - b.ptsMs; });
          var sr = chunks[0].buffer.sampleRate;
          var pts0 = Math.round(chunks[0].ptsMs);
          var nAll = 0;
          var chans = new Array(chunks.length);
          for (var aq = 0; aq < chunks.length; aq++) {
            chans[aq] = chunks[aq].buffer.getChannelData(0);
            nAll += chans[aq].length;
          }
          var merged = new Float32Array(nAll);
          var po = 0;
          for (aq = 0; aq < chans.length; aq++) {
            merged.set(chans[aq], po);
            po += chans[aq].length;
          }
          var win = Math.max(1, Math.floor(sr * stepMs / 1000));
          var nWin = Math.floor(merged.length / win);
          var acc1 = null;
          for (var qw = 0; qw < nWin; qw++) {
            var sumA = 0;
            for (var jw = 0; jw < win; jw += 4) { /* 抽 1/4 样本积分（确定性车道） */
              var vw = merged[qw * win + jw];
              sumA += vw * vw;
            }
            var rmsA = Math.sqrt(sumA / Math.max(1, Math.ceil(win / 4)));
            var dbA = Math.max(LOUD_MIN_DB, Math.min(0, round2(20 * Math.log10(rmsA || 1e-8))));
            var tS = (pts0 + qw * stepMs) / 1000;
            out.loudnessLocal.push({ t: round2(tS), db: dbA });
            if (dbA <= SILENCE_DB) {
              if (!acc1) acc1 = { t0: round2(tS) };
            } else if (acc1) {
              var t1v = round2(tS);
              if ((t1v - acc1.t0) * 1000 >= SILENCE_MIN_MS) out.silenceLocal.push({ t0: acc1.t0, t1: t1v });
              acc1 = null;
            }
          }
          if (acc1) { /* 尾部静音段封边 */
            var endA = round2((pts0 + nWin * stepMs) / 1000);
            if ((endA - acc1.t0) * 1000 >= SILENCE_MIN_MS) out.silenceLocal.push({ t0: acc1.t0, t1: endA });
          }
        } else if (durMs > 0) {
          noteList.push("素材 " + mediaId + " 无音轨：响度/静音车道跳过（非静音=无声）");
        }
      } catch (e2) {
        noteList.push("素材 " + mediaId + " 音频解码失败：" + (e2 && e2.message || e2) + "——响度/静音车道跳过");
      }
      return out;
    } finally {
      try { pl.destroy(); } catch (e3) {}
    }
  }

  /* 柱状图差异（L1 距离归一化 0..1） */
  function histDiff(h1, h2) {
    var s = 0;
    for (var i = 0; i < 16; i++) s += Math.abs(h1[i] - h2[i]);
    return s / 2;
  }

  /* 汇总 assetReport：schema §7.4 字段 + 元数据备注；>16KiB 确定性加密抽样。
   * 车道轴约定：V1 模型片段一律从素材 0 起播 → 素材轴 t 即工程轴 t + clip.start，
   * silence/scene 车道按片段所在 clip.start 平移后聚合到工程轴。 */
  function assembleReport(project, clips, scans, noteList, ms) {
    var clipsOut = [];
    var sceneCuts = [];
    var motionHistogram = [];
    var loudnessDownsample = [];
    var silenceAll = [];
    for (var i = 0; i < clips.length; i++) {
      var c = clips[i];
      var sc = scans[c.mediaId] || null;
      var motion = null;
      var silenceRatio = null;
      var loudness = null;
      var scenes = null;
      /* V1 片段模型：从素材 0 起播 → 素材轴帧窗 [0, duration×speed)，工程轴回放 = */
      /* clip.start + 素材秒/speed。素材窗按 speed 修正（修掉用 duration 直比的轴错）。 */
      var speed = c.speed || 1;
      var srcDur = c.duration * speed;
      if (sc) {
        var inClip = sc.motionLocal.filter(function (p) { return p.t >= 0 && p.t < srcDur; });
        if (inClip.length) motion = round2(inClip.reduce(function (a, p) { return a + p.v; }, 0) / inClip.length);
        var s2 = sc.silenceLocal.filter(function (p) { return p.t1 > 0 && p.t0 < srcDur; });
        var sSec = 0;
        for (var k = 0; k < s2.length; k++) sSec += Math.min(s2[k].t1, srcDur) - Math.max(s2[k].t0, 0);
        silenceRatio = srcDur > 0 ? round2(sSec / srcDur) : null;
        var ld = sc.loudnessLocal.filter(function (p) { return p.t >= 0 && p.t < srcDur; });
        if (ld.length) loudness = round2(ld.reduce(function (a, p) { return a + p.db; }, 0) / ld.length);
        var cuts = sc.sceneCutsLocal.filter(function (p) { return p.t >= 0 && p.t < srcDur; });
        scenes = cuts.length + 1;
        for (k = 0; k < cuts.length; k++) {
          sceneCuts.push({ t: round2(c.start + cuts[k].t / speed), score: cuts[k].score });
        }
        for (k = 0; k < sc.silenceLocal.length; k++) {
          /* 静音段按片段窗裁剪→素材秒/speed 平移到工程轴（重叠窗如实截断） */
          var t0c = Math.max(sc.silenceLocal[k].t0, 0);
          var t1c = Math.min(sc.silenceLocal[k].t1, srcDur);
          if (t1c > t0c) {
            silenceAll.push({ t0: round2(c.start + t0c / speed), t1: round2(c.start + t1c / speed) });
          }
        }
        for (k = 0; k < inClip.length; k++) motionHistogram.push(inClip[k].v);
        for (k = 0; k < ld.length; k++) loudnessDownsample.push(ld[k].db);
      }
      clipsOut.push({
        id: String(c.id),
        mediaId: c.mediaId ? String(c.mediaId) : null,
        duration: round2(c.duration),
        speed: c.speed || 1,
        scenes: scenes,
        motion: motion,
        silenceRatio: silenceRatio,
        loudness: loudness,
        resolution: sc && sc.width ? [sc.width, sc.height] : null
      });
    }
    sceneCuts.sort(function (a, b) { return a.t - b.t; });
    /* 窗口短于采样步长的片段：运动/响度车道无采样点 → 诚实 notes（不虚构 0 值） */
    for (i = 0; i < clips.length && noteList.length < 16; i++) {
      var cN = clips[i];
      var scN = scans[cN.mediaId];
      if (scN && cN.duration * (cN.speed || 1) > 0 && scN.motionLocal.length) {
        var hasM = scN.motionLocal.some(function (p) { return p.t >= 0 && p.t < cN.duration * (cN.speed || 1); });
        if (!hasM) noteList.push("片段 " + cN.id + " 素材窗短于一个采样步长：运动/响度车道无采样点（如实缺值，不虚构 0）");
      }
    }

    var report = {
      scene: "video-edit",
      generatedAt: new Date().toISOString(),
      elapsedMs: ms,
      summary: {
        project: {
          duration: round2(project.durationSec),
          resolution: project.resolution,
          fps: project.fps,
          tracks: 3,
          aspectRatio: project.aspectRatio
        },
        clips: clipsOut,
        analysis: {
          sceneCuts: sceneCuts.slice(0, MAX_POINTS),
          silenceSpans: silenceAll.slice(0, MAX_POINTS),
          motionHistogram: downsample(motionHistogram, MAX_POINTS),
          loudnessDownsample: downsample(loudnessDownsample, MAX_POINTS)
        },
        notes: noteList.slice(0, 16)
      }
    };

    /* 16KiB 上限（契约 §6）：超限时按 2 的幂确定性加强下采样 */
    var json = JSON.stringify(report);
    var factor = 2;
    while (json.length > 16 * 1024 && factor <= 64) {
      report.summary.clips = clipsOut.slice(0, Math.max(1, Math.floor(clipsOut.length / factor)));
      report.summary.analysis.sceneCuts = downsample(sceneCuts, Math.max(4, Math.floor(MAX_POINTS / factor)));
      report.summary.analysis.silenceSpans = downsample(silenceAll, Math.max(2, Math.floor(MAX_POINTS / (2 * factor))));
      report.summary.analysis.motionHistogram = downsample(motionHistogram, Math.max(4, Math.floor(MAX_POINTS / factor)));
      report.summary.analysis.loudnessDownsample = downsample(loudnessDownsample, Math.max(4, Math.floor(MAX_POINTS / factor)));
      json = JSON.stringify(report);
      factor *= 2;
    }
    report.summary.sizeBytes = json.length;
    report.summary.withinLimit = json.length <= 16 * 1024;
    return report;
  }

  async function runL1Scan(onProgress) {
    if (scanning) throw new Error("已有扫描在进行，请等待");
    var pc = ZY.pipeline.detect();
    var d = ZY.project.data;
    if (!pc.ready) return { report: null, skipped: true, reason: "预览管线不可用（需 secure context + WebCodecs 解码 + mp4box）：媒质扫描跳过" };
    /* 复用同一媒质只扫一次（clips → 去重 mediaId 清单） */
    var ids = [];
    var seen = {};
    for (var i = 0; i < d.clips.length; i++) {
      var mid = d.clips[i].mediaId;
      if (mid && !seen[mid]) { seen[mid] = true; ids.push(mid); }
    }
    var summaryLast = buildSummary();
    if (!ids.length) {
      return { report: null, skipped: false, noteOnly: true, reason: "工程无媒质片段：无需抽帧/响度扫描（工程结构摘要已覆盖）" };
    }
    scanning = true;
    var notes = [];
    var scans = {};
    var t0 = Date.now();
    var hadErr = null;
    try {
      for (i = 0; i < ids.length; i++) {
        try {
          var sc = await scanMedia(notes, ids[i], onProgress);
          if (sc) scans[ids[i]] = sc;
        } catch (e) {
          notes.push("素材扫描失败（" + ids[i] + "）：" + (e && e.message || e));
        }
      }
      var proj = {
        durationSec: summaryLast.totalDurationSec,
        resolution: ZY.export && ZY.export.outSizeFor ? ZY.export.outSizeFor(summaryLast.aspectRatio) : null,
        fps: (d.settings && d.settings.fps) || 30,
        aspectRatio: summaryLast.aspectRatio
      };
      var report = assembleReport(proj, d.clips, scans, notes, Date.now() - t0);
      /* 诊断快照（不进 16KiB 摘要、不上报；供面板/回归追车道数据） */
      ZY.ai.__lastScanDiagnostic = { ids: ids, notes: notes.slice(), lanes: (function () {
        var lanes = {};
        for (var mId in scans) {
          lanes[mId] = {
            motionHead: scans[mId].motionLocal.slice(0, 6).map(function (p) { return [p.t, p.v]; }),
            motionCount: scans[mId].motionLocal.length,
            loudnessHead: scans[mId].loudnessLocal.slice(0, 6).map(function (p) { return [p.t, p.db]; }),
            loudnessCount: scans[mId].loudnessLocal.length,
            width: scans[mId].width, height: scans[mId].height, durationMs: scans[mId].durationMs,
            audioCodec: scans[mId].audioCodec, fps: scans[mId].fps
          };
        }
        return lanes;
      })() };
      scanStatus = "";
      return { report: report, skipped: false };
    } catch (e2) {
      hadErr = e2;
      throw e2;
    } finally {
      scanning = false;
      if (hadErr) scanStatus = "扫描出错：" + (hadErr.message || hadErr);
    }
  }

  /* ---------------- 桌讯 AI 抽屉渲染 ---------------- */

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderAi() {
    if (!aiBody) return;
    var caps = ZY.env.detect();
    var html = "";
    html += "<div class='zy-ai-card zy-ai-disabled'>";
    html += "<strong>桌影 · 桌讯 AI 剪辑助手（契约评审中）</strong>";
    html += "<p class='zy-hint'>L2 桌讯编排需 ai.desktalk-assist 契约评审通过并登记权限后才会启用；下面 L1 本地分析已可用（零外发）。当前运行环境检测结果：";
    html += caps.hostDetected ? "检测到 WebWindows Host；" : "未检测到 WebWindows Host（浏览器直开，降级）；";
    html += "ai.requestAssist " + (caps.aiRequestAssist ? "存在（仍待契约评审放行）" : "不存在") + "。</p>";
    html += "</div>";

    /* L1 工程结构摘要（同步，纯工程数据） */
    html += "<div class='zy-field' style='margin-top:10px'><strong>工程结构摘要（L1-结构，纯工程数据）</strong>" +
      "<button data-act='l1-summary'>生成结构摘要</button></div>";
    if (lastSummary) {
      html += "<div class='zy-ai-summary'>" + esc(JSON.stringify(lastSummary, null, 2)) + "</div>";
    }

    /* L1 assetReport（异步：抽帧场景/运动/响度/静音车道，全部页内计算零外发） */
    html += "<div class='zy-field'><strong>素材扫描报告（L1-扫描，抽帧+响度车道）</strong>" +
      "<button data-act='l1-scan'" + (scanning ? " disabled" : "") + ">" + (scanning ? "扫描中…" : "生成本地素材报告") + "</button>" +
      "<span data-act='l1-scan-status' class='zy-hint'>" + esc(scanStatus) + "</span></div>";
    html += "<p class='zy-hint'>L1 扫描在页内完成：WebCodecs 抽帧（0.5s 车道）→ 场景切换/运动强度（luma 柱状图 L1 距离，估算）；decodeAudioRange → 响度包络/静音段（RMS 窗，估算）。不读取、不发送任何帧画面或音频内容；数组确定性下采样，序列化 >16KiB 自动加密抽样（转正仍待 L2 契约评审）。无帧画面都明示（不谎称看懂视频）。</p>";
    if (lastReport) {
      html += "<div class='zy-ai-summary'>" + esc(JSON.stringify(lastReport, null, 2)) + "</div>";
    }

    /* L2 按钮：置灰（未接入能力不给假动作） */
    html += "<div class='zy-field'><button data-act='l2-send' disabled>发送剪辑摘要到桌讯（L2，拟走 ai.requestAssist）</button></div>";
    html += "<p class='zy-warn-hint'>L2 按钮在 ai.desktalk-assist 权限与 ai.requestAssist API 从契约评审中落地并登记后才会启用；现在点按无效（disabled）。</p>";

    /* 隐私边界（docs/WEBWINDOWS_DESKTALK_AI_ASSIST_V1.md 的纪律原文要点） */
    html += "<div class='zy-ai-privacy'>隐私边界（依据 docs/WEBWINDOWS_DESKTALK_AI_ASSIST_V1.md 的纪律原文）：";
    html += "<ul>" +
      "<li>用户主动点击后才发起；应用不静默、不循环、不在后台自动触发。</li>" +
      "<li>只传递结构化摘要（scene=video-edit 的数值统计），不传帧画面、不传媒体内容或坐标轨迹。</li>" +
      "<li>每次发送在 Host 侧渲染可信确认卡（本应用无法伪造授权），单次摘要上限 16 KiB。</li>" +
      "<li>桌讯依据既有纪律回答：依据 Knowledge 回答，不知道时明确说明。</li>" +
      "<li>回复经 ai.assist.received 事件回流应用。</li>" +
      "</ul></div>";
    aiBody.innerHTML = html;

    var b1 = aiBody.querySelector("[data-act='l1-summary']");
    if (b1) {
      b1.addEventListener("click", function () {
        lastSummary = buildSummary();
        renderAi();
      });
    }
    var b2 = aiBody.querySelector("[data-act='l1-scan']");
    if (b2) {
      b2.addEventListener("click", function () {
        var st = aiBody.querySelector("[data-act='l1-scan-status']");
        var tick = function (m) { scanStatus = m || ""; if (st) st.textContent = m || ""; };
        scanning = true;
        b2.disabled = true;
        b2.textContent = "扫描中…";
        tick("准备扫描…");
        runL1Scan(tick).then(function (r) {
          scanning = false;
          if (r.skipped || r.noteOnly) {
            scanStatus = r.reason;
            tick(r.reason);
          } else {
            lastReport = r.report;
            scanStatus = "完成（" + r.report.elapsedMs + "ms，" + (r.report.summary.withinLimit ? "≤16KiB" : "超限已下采样") + "）";
            tick(scanStatus);
          }
          renderAi();
        }, function (e) {
          scanning = false;
          scanStatus = "扫描失败：" + (e && e.message || e);
          tick(scanStatus);
          renderAi();
        });
      });
    }
    /* l2-send 保持 disabled，无监听 */
  }

  /* ---------------- 抽屉切换 ---------------- */

  function openDrawer(which) {
    var diagPanel = document.getElementById("drawer-diag");
    var aiPanel = document.getElementById("drawer-ai");
    diagPanel.hidden = which !== "diag";
    aiPanel.hidden = which !== "ai";
    if (which === "diag") renderDiag();
    if (which === "ai") renderAi();
  }

  function closeDrawers() {
    document.getElementById("drawer-diag").hidden = true;
    document.getElementById("drawer-ai").hidden = true;
    Array.prototype.forEach.call(document.querySelectorAll("[data-close-drawer]"), function (b) {
      b.addEventListener("click", closeDrawers);
    });
  }

  function init() {
    diagBody = document.getElementById("diag-body");
    aiBody = document.getElementById("ai-body");
    document.getElementById("btn-diag").addEventListener("click", function () { openDrawer("diag"); });
    document.getElementById("btn-ai").addEventListener("click", function () { openDrawer("ai"); });
    closeDrawers();
    renderDiag();
    renderAi();
  }

  init(); /* 自启动：抽屉 DOM 就在 index.html 内，无外部入口依赖 */

  ZY.ai = {
    init: init,
    renderDiag: renderDiag,
    renderAi: renderAi,
    buildSummary: buildSummary,
    runL1Scan: runL1Scan
  };
})();
