/* 桌影 media-pipeline.js — V2 预览管线（WebCodecs → canvas），第八轮：全实现。
 *
 * 能力检测（顺序固定，G3 契约基准）：isSecureContext → WebCodecs → MP4Box。
 * 勘误纪律（2026-10-21）：任何「能力缺失」结论必须先排除 secure-context 干扰
 * （about:blank 的"缺席"是假象，勿重复踩坑）。
 *
 * readProvider 抽象（素材来源，docs/ZHUOYING_DESKSHADOW_V2_SPEC.md §1）：
 *   浏览器降级模式：File.slice().arrayBuffer()
 *   Production：G1 device.storage.readChunk(offset, length)
 *     （契约 docs/WEBWINDOWS_STORAGE_MEDIA_V1_DRAFT.md；落地前 Production 内部如实报
 *      「管线待契约」，绝不静默降级）
 *
 * 解析设计（第八轮，node + 真实浏览器双验证，trailer.mp4 实测）：
 *   - MP4Box getTrackSamplesInfo 索引表（offset/size/cts/dts/duration/is_sync/
 *     description；trailer 实测 1253 视频 + 2435 音频条目）。样本 data 一律不进
 *     MP4Box 内部缓冲，物化 = provider.readRange(offset, size) —— 与 G1 readChunk
 *     语义一一对应（一次解码样本 = 一次 readChunk）。
 *   - 描述符提取（现场验证的两条路径，只在 moov 完成时做一次）：
 *       avc1: description.avcC → 跳 hdr_size 头取 box body
 *       mp4a: description.esds.data → ES(3)>DC(4)>ASC(5) 嵌套 tag 解析取 ASC
 *   - 帧内存纪律：VideoFrame/AudioData 用完必须 close()；同屏持有 ≤ 8 帧；
 *     seek/startPlay 重建解码器（reset 边界最干净），绝不跨链持握旧帧。
 *   - 音频滑窗：AudioDecoder 持续解码至 [position+10s] 领先窗 → AudioBuffer →
 *     WebAudio BufferSource 按 pts 调度（每批以"此刻 position"重定基）。
 *     AudioContext 需用户手势 resume（真实用户点「播放」即手势；无手势时音频
 *     静音排队，视频照常 —— 不阻塞视频路径，如实呈现能力边界）。
 *
 * 会审修复（2026-10-22，第九轮）：
 *   - M1 ingest 只保留尾部 ≤2 个 4MiB 分块（moov 必在尾部；描述符落在更早分块时
 *     单点重读兜底），防止大文件把整个文件堆进 _reg 造成 OOM。
 *   - M2/M3 解码器失败 fail-closed：_freshDecoder 捕获 configure 同步异常（返回
 *     null）；运行中 error / 链异常走 _failStop（playing=false + onStopped 单次
 *     通知宿主停表）——消除每 tick 重建链再炸的错误刷屏。
 *   - P1 seek 解码链上限 CHAIN_CAP=600 帧（病态单 keyframe 素材防整片解码），
 *     截断时如实提示。P3 _blockFor single-flight（同块并行复用同一 IO）。
 */
(function () {
  "use strict";
  var ZY = window.ZY = window.ZY || {};

  /* ================= 能力检测 ================= */
  var caps = null;
  function detect() {
    if (caps) return caps;
    var secure = window.isSecureContext === true;
    var hasVD = secure && ("VideoDecoder" in window);
    var hasVE = secure && ("VideoEncoder" in window);
    var hasAD = secure && ("AudioDecoder" in window);
    caps = {
      secure: secure,
      webCodecs: hasVD || hasVE || hasAD,
      videoDecode: hasVD,
      videoEncode: hasVE,
      audioDecode: hasAD,
      mp4box: false,
      ready: false
    };
    if ("MP4Box" in window) {
      try { window.MP4Box.createFile(); caps.mp4box = true; } catch (e) { caps.mp4box = false; }
    }
    caps.ready = caps.videoDecode && caps.mp4box;
    return caps;
  }

  /* ================= readProvider ================= */
  function makeSliceProvider(file) {
    return {
      size: file.size,
      readRange: function (offset, length) {
        var end = Math.min(file.size, offset + length);
        return file.slice(offset, end).arrayBuffer();
      }
    };
  }

  /* ================= 描述符提取 ================= */
  /* AAC AudioSpecificConfig：ES(tag3: ES_ID2+flags1) > DecoderConfig(tag4: 固定13字节) > ASC(tag5) */
  function extractAsc(esdsData) {
    var d = new Uint8Array(esdsData.buffer || esdsData, esdsData.byteOffset || 0, esdsData.byteLength);
    function walk(lo, hi) {
      var i = lo;
      while (i < hi - 1) {
        var tag = d[i], len = d[i + 1];
        var b0 = i + 2, b1 = Math.min(i + 2 + len, hi);
        if (tag === 0x05) return d.slice(b0, b1);
        if (tag === 0x03 && b0 + 3 <= b1) { var r = walk(b0 + 3, b1); if (r) return r; }
        else if (tag === 0x04 && b0 + 13 <= b1) { var r2 = walk(b0 + 13, b1); if (r2) return r2; }
        else { var r3 = walk(b0, b1); if (r3) return r3; }
        i = b1;
      }
      return null;
    }
    return walk(0, d.length);
  }

  /* 解析缓冲注册：moov 所在 append 块；描述符拷出后整体释放 */
  function regBytes(reg, off, len) {
    for (var i = 0; i < reg.length; i++) {
      var r = reg[i];
      if (off >= r.start && off + len <= r.start + r.len) {
        return new Uint8Array(r.buffer, off - r.start, len);
      }
    }
    return null;
  }

  /* ================= AudioData → AudioBuffer =================
   * 实测定档（trailer 现场）：copyTo 只支持单 options 签名；planar 布局用
   * format:"f32-planar" 逐平面拷（dest = Float32Array(frames)），format:"f32"
   * 会要求 dest 尺寸 frames*channels（交错的），逐平面语义只有 planar。 */
  function audioDataToBuffer(ctx, ad) {
    var ch = ad.numberOfChannels, n = ad.numberOfFrames;
    var buf = ctx.createBuffer(ch, n, ad.sampleRate);
    var p, k;
    for (p = 0; p < ch; p++) {
      var f32 = new Float32Array(n);
      var ok = false;
      try { ad.copyTo(f32, { planeIndex: p, format: "f32-planar" }); ok = true; } catch (e) {}
      if (!ok) {
        try { ad.copyTo(f32, { planeIndex: p, format: "f32" }); ok = true; } catch (e2) {}
      }
      if (!ok) {
        /* 最旧签名/布局兜底：交错 f32 取该声道 */
        try {
          var all = new Float32Array(n * ch);
          ad.copyTo(all, { planeIndex: 0, format: "f32" });
          for (k = 0; k < n; k++) f32[k] = all[k * ch + p];
          ok = true;
        } catch (e3) {}
      }
      if (ok) buf.copyToChannel(f32, p, 0);
    }
    return buf;
  }

  /* ================= 管线 ================= */
  var FEED_LEAD_MS = 260;      /* 视频解码领先窗（≈6 帧@24fps）。
                                  实测纪律：LEAD 必须落在持有窗（MAX_FRAMES 帧时长
                                  = 8/24s ≈ 333ms）之内，否则持有帧恒在将来时刻、
                                  绘制游标永远追不上（pick 恒 null，画面冻结）。 */
  var AUDIO_LEAD_MS = 10000;   /* 音频滑窗（规格基准 ±10s） */
  var MAX_FRAMES = 8;          /* 同屏持有帧上限（基准口径在飞 ≤8；
                                  实测纪律：Chrome 解码器在 ~9 张存活帧时停发下游事件，
                                  持续 close 放行下游 = 引擎自然而行，勿调大） */
  var MAX_INFLIGHT = 8;        /* 解码请求在飞上限（=基准口径） */
  var MAX_AUDIO_INFLIGHT = 24; /* 音频解码在飞上限 */
  var CHAIN_CAP = 600;         /* seek 解码链上限（≈25s@24fps）：病态单 keyframe
                                  素材防"seek 一次解码整片"，截断时如实提示 */

  function MediaPipeline(opts) {
    this.provider = opts.provider;
    this.canvas = opts.canvas || null;
    this.onReady = opts.onReady || function () {};
    this.onError = opts.onError || function () {};
    this.onStopped = opts.onStopped || function () {};
    this.file = null;
    this.vTrack = null;
    this.aTrack = null;
    this.vS = [];
    this.aS = [];
    this._desc = null;
    this._aDesc = null;
    this._reg = [];
    this.decoder = null;
    this.aDecoder = null;
    this._frames = [];
    this._lastDrawnTs = -1;
    this._inFlight = 0;
    this._seq = 0;
    this._feedPtr = 0;
    this._chainRunning = false;
    this.playing = false;
    this.positionMs = 0;
    this.durationMs = 0;
    this.lastError = null;

    /* 音频调度 */
    this.ctx = null;
    this._aQueue = [];
    this._aNext = 0;
    this._aInFlight = 0;
    this._aLoop = false;
    this._aSources = [];
    this._rBufs = [];   /* 块级读缓存（双槽 LRU） */
    this._busy = {};    /* 块读取 single-flight（同块并行请求复用同一 IO） */
    this._stoppedReported = false;
    this.closed = false;
  }

  /* ---- ingest：分块读入到 moov 就绪 → 索引 + 描述符一次成型 ---- */
  MediaPipeline.prototype.ingest = function () {
    var self = this;
    var CHUNK = 4 * 1024 * 1024;
    var offset = 0;
    return new Promise(function (resolve, reject) {
      var c = detect();
      if (!c.mp4box) { reject(new Error("MP4Box 不可用（能力检测失败）")); return; }
      var file = window.MP4Box.createFile();
      self.file = file;
      var done = false;
      var finish = function () {
        if (done) return;
        done = true;
        try { self._finalizeTracks(); resolve(self); }
        catch (e) { reject(new Error("素材解析失败：" + (e && e.message))); }
      };
      file.onReady = function (info) {
        for (var i = 0; i < info.tracks.length; i++) {
          var t = info.tracks[i];
          if (t.type === "video" && !self.vTrack) {
            /* mp4box onReady 的宽高在 t.video.{width,height}（t.width 为 undefined 实测），
               归一化到顶层，解码器配置与画布尺寸共用 */
            self.vTrack = {
              id: t.id, type: t.type, codec: t.codec,
              timescale: t.timescale, duration: t.duration,
              width: (t.video && t.video.width) || 640,
              height: (t.video && t.video.height) || 360
            };
          }
          if (t.type === "audio" && !self.aTrack) {
            self.aTrack = {
              id: t.id, type: t.type, codec: t.codec,
              timescale: t.timescale,
              audio: t.audio ? { sample_rate: t.audio.sample_rate, channel_count: t.audio.channel_count } : null
            };
          }
        }
        self.durationMs = (info.duration && info.timescale) ?
          Math.round(info.duration / info.timescale * 1000) : 0;
        finish();
      };
      file.onError = function (e) {
        if (!done) { done = true; reject(new Error("MP4Box 解析错误：" + (e && e.message || e))); }
      };
      function pump() {
        if (self.closed) { if (!done) { done = true; reject(new Error("管线已销毁")); } return; }
        if (done) return;
        if (offset >= self.provider.size) {
          done = true; reject(new Error("素材读完未发现 moov（非 MP4 或文件损坏）")); return;
        }
        var len = Math.min(CHUNK, self.provider.size - offset);
        self.provider.readRange(offset, len).then(function (buf) {
          if (self.closed || done) return;
          buf.fileStart = offset;
          self._reg.push({ start: offset, buffer: buf, len: buf.byteLength });
          /* M1：描述符必住在 moov = 文件尾部；只留尾 2 块，其余分块 append 后即弃
             （否则大素材会把整个文件驻留内存直到 _finalizeTracks，OOM 风险） */
          if (self._reg.length > 2) self._reg.shift();
          try { file.appendBuffer(buf); if (file.flush) file.flush(); }
          catch (e) { done = true; reject(new Error("MP4Box 解析错误：" + e.message)); return; }
          if (self.vTrack || self.aTrack) { finish(); return; }
          offset += len;
          pump();
        }, function (e) {
          if (!done) { done = true; reject(new Error("素材读取失败：" + (e && e.message || e))); }
        });
      }
      pump();
    });
  };

  MediaPipeline.prototype._finalizeTracks = function () {
    var self = this;
    if (self.vTrack) {
      self.vS = self.file.getTrackSamplesInfo(self.vTrack.id) || [];
      var s0 = self.vS[0];
      if (s0 && s0.description) {
        var c = s0.description.avcC;
        if (c && typeof c.start === "number") {
          self._setDescFrom(c.start + (c.hdr_size || 8), c.size - (c.hdr_size || 8));
        }
        if (!self._desc && s0.description.hvcC) {
          var h = s0.description.hvcC;
          self._setDescFrom(h.start + (h.hdr_size || 8), h.size - (h.hdr_size || 8));
        }
        if (!self._desc && s0.description.vpcC) {
          self._desc = null; /* vp9 附加逻辑列后续档位 */
        }
      }
    }
    if (self.aTrack) {
      self.aS = self.file.getTrackSamplesInfo(self.aTrack.id) || [];
      var a0 = self.aS[0];
      if (a0 && a0.description && a0.description.esds && a0.description.esds.data) {
        var asc = extractAsc(a0.description.esds.data);
        self._aDesc = asc ? new Uint8Array(asc) : null;
      }
    }
    /* 描述符已拷出 → 释放解析缓冲 */
    self._reg = [];
    /* 画布分辨率 = 视频轨原始尺寸（绘制 drawImage 到 canvas.width/height） */
    if (self.canvas && self.vTrack && self.vTrack.width && self.vTrack.height) {
      self.canvas.width = self.vTrack.width;
      self.canvas.height = self.vTrack.height;
    }
    if (self.onReady) self.onReady(self);
  };

  /* ---- 描述符提取（M1 兜底）：优先从尾 2 分块的解析缓冲取；落在更早分块
         （moov >8MiB 的罕见路径）时单点重读，异步回填。 ---- */
  MediaPipeline.prototype._setDescFrom = function (off, len) {
    var self = this;
    if (typeof off !== "number" || off < 0 || len <= 0) return;
    var b = regBytes(self._reg, off, len);
    if (b) { self._desc = new Uint8Array(b); return; }
    self.provider.readRange(off, len).then(function (ab) {
      if (self.closed || self._desc) return;
      self._desc = new Uint8Array(ab);
    }, function () { /* 读失败：保持无描述符，configure 阶段如实报错 */ });
  };

  /* ---- 纯懒取物化：provider.readRange → 块级缓存（一次 IO 物化一串样本 =
        production 对 G1 readChunk 同样有效：IO 次数 ≈ 文件大小 / 块长） ---- */
  MediaPipeline.prototype._blockFor = async function (offset, size) {
    var self = this;
    var i;
    for (i = 0; i < self._rBufs.length; i++) {
      var r = self._rBufs[i];
      if (offset >= r.start && offset + size <= r.start + r.buf.byteLength) {
        /* 命中：置顶（双槽 LRU） */
        if (i !== 0) { self._rBufs.splice(i, 1); self._rBufs.unshift(r); }
        return r;
      }
    }
    var BLOCK = 1 * 1024 * 1024;
    var start = Math.max(0, Math.floor(offset / BLOCK) * BLOCK);
    var need = BLOCK * 3;
    if (start + need > self.provider.size) need = self.provider.size - start;
    /* P3 single-flight：视频链与音频回路同时撞同一块，只发一次 IO */
    var key = start + ":" + need;
    var pr = self._busy[key];
    if (!pr) {
      pr = self.provider.readRange(start, need);
      var clr = function () { delete self._busy[key]; };
      pr.then(clr, clr);
      self._busy[key] = pr;
    }
    var ab = await pr;
    if (self.closed) return { start: start, buf: new Uint8Array(0) };
    var r = { start: start, buf: new Uint8Array(ab) };
    self._rBufs.unshift(r);
    if (self._rBufs.length > 2) self._rBufs.pop();
    return r;
  };

  MediaPipeline.prototype._materialize = function (s) {
    var self = this;
    return self._blockFor(s.offset, s.size).then(function (blk) {
      var p = s.offset - blk.start;
      return blk.buf.subarray(p, p + s.size);
    });
  };

  /* ---- 会审修复（M2/M3)：管线运行期失败统一停根 ----
     playing=false、停视频链/音频回路、停掉已调度的音频源，onStopped 只上报一次
     （宿主 player 停走表 + 单条状态提示）；消除了"每 tick 重建链再炸"的错误刷屏。 */
  MediaPipeline.prototype._failStop = function (msg) {
    this.playing = false;
    this._chainRunning = false;
    this._aLoop = false;
    this.audioPause();
    if (!this._stoppedReported) {
      this._stoppedReported = true;
      this.onStopped(msg);
    }
  };

  /* ---- 视频解码器：每次 seek/play 重建 ---- */
  MediaPipeline.prototype._killDecoder = function () {
    if (this.decoder) {
      try { this.decoder.close(); } catch (e) {}
      this.decoder = null;
    }
    this._inFlight = 0;
  };
  MediaPipeline.prototype._freshDecoder = function () {
    var self = this;
    self._killDecoder();
    var seqAtConf = self._seq;
    var d = null;
    try {
      d = new VideoDecoder({
        output: function (vf) {
          self._inFlight--;
          if (self.closed || seqAtConf !== self._seq) { vf.close(); return; }
          var first = self._frames.length === 0;
          self._frames.push({ ts: vf.timestamp, frame: vf });
          if (self._frames.length > MAX_FRAMES) {
            var old = self._frames.shift();
            old.frame.close();
          }
          /* 两段式 scrub：链首（keyframe）一出即绘，链继续解码到目标帧 */
          if (first) self._draw(vf);
        },
        error: function (e) {
          /* M2：运行中失败 fail-closed——停根 + 单次上报（原来只 onError，
             player 每 tick 重建链再炸会刷屏） */
          self._failStop("VideoDecoder: " + e.message);
        }
      });
      var conf = {
        codec: self.vTrack.codec,
        width: self.vTrack.width,
        height: self.vTrack.height,
        optimizeForLatency: true
      };
      if (self._desc) conf.description = self._desc;
      d.configure(conf);
    } catch (e) {
      /* M3：configure 同步异常（codec/profile 不受支持）不穿透调用链 */
      self.onError("视频解码器不可用：" + (e && e.message));
      self.decoder = null;
      return null;
    }
    self.decoder = d;
    return d;
  };

  /* 二分：最后满足 cts/timescale*1000 <= timeMs 的样本下标 */
  function findSampleIndex(samples, timeMs) {
    var lo = 0, hi = samples.length - 1, ans = -1;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      var t = samples[mid].cts / samples[mid].timescale * 1000;
      if (t <= timeMs) { ans = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    return ans;
  }

  /* ---- seek（scrub 精确帧）：keyframe 起步解码链至目标，输出即绘 ---- */
  MediaPipeline.prototype.seekDecode = function (timeMs) {
    var self = this;
    if (!self.vS.length || self.closed) return Promise.resolve(false);
    var seq = ++self._seq;
    self.playing = false;
    self._releaseFrames();
    if (!self._freshDecoder()) { self.positionMs = timeMs; return Promise.resolve(false); }
    self.positionMs = timeMs;
    var targetTs = Math.round(timeMs / 1000 * 1e6);
    var idx = findSampleIndex(self.vS, timeMs);
    if (idx < 0) idx = 0;
    var kf = idx;
    while (kf >= 0 && !self.vS[kf].is_sync) kf--;
    if (kf < 0) kf = 0;
    return new Promise(function (resolve) {
      (async function () {
        try {
          for (var i = kf; i < self.vS.length; i++) {
            if (self.closed || seq !== self._seq) { resolve(false); return; }
            /* P1：链长上限——病态单 keyframe 素材防"一次 seek 解码整片" */
            if (i - kf >= CHAIN_CAP) {
              self._failStop("素材关键帧间隔过大（>600 帧）：seek 已截断，精度受限");
              resolve(false);
              return;
            }
            var s = self.vS[i];
            var data = await self._materialize(s);
            if (self.closed || seq !== self._seq) { resolve(false); return; }
            try {
              self.decoder.decode(new EncodedVideoChunk({
                type: s.is_sync ? "key" : "delta",
                timestamp: Math.round(s.cts / s.timescale * 1e6),
                duration: Math.round((s.duration || 1) / s.timescale * 1e6),
                data: data
              }));
              self._inFlight++;
            } catch (e) { self.onError("decode 失败：" + e.message); break; }
            if (s.cts / s.timescale * 1e6 >= targetTs) break;
          }
          await self.decoder.flush();
          if (seq !== self._seq) { resolve(false); return; }
          /* flush 后全帧落 _frames；绘目标 = 最后一个 ts ≤ target 的帧 */
          var pick = self._pickFrame(targetTs);
          if (pick) { self._draw(pick.frame); self._lastDrawnTs = pick.ts; }
          resolve(!!pick);
        } catch (e) {
          self._failStop("解码链失败：" + e.message);
          if (seq === self._seq) resolve(false);
        }
      })();
    });
  };

  /* 选中 ts <= posTs 的最后一帧（不绘，只挑） */
  MediaPipeline.prototype._pickFrame = function (posTs) {
    var pick = null;
    for (var i = 0; i < this._frames.length; i++) {
      if (this._frames[i].ts > posTs) break;
      pick = this._frames[i];
    }
    /* 目标早于首帧（典型 frameAt(0) 流首采样点 cts≈2μs>0）：最近一帧=首帧。
       修复前返回 null（导出首帧/扫描第一采样点误判为无帧）。 */
    if (!pick && this._frames.length && this._frames[0].ts > posTs) pick = this._frames[0];
    return pick;
  };

  /* ---- 导出/合成原语：解码到指定时刻，返回最近一帧的 VideoFrame ----
   * 调用方拥有返回帧（用完必须 frame.close()）；其余帧一律释放归还帧预算。
   * 与 seekDecode 同一条解码链，但不出帧到画布、不保留帧（预览缓存隔离：
   * 导出用独立 MediaPipeline 实例，避免与预览播放态互踩 seq）。 */
  MediaPipeline.prototype.frameAt = function (timeMs) {
    var self = this;
    if (!self.vS.length || self.closed) return Promise.resolve(null);
    var seq = ++self._seq;
    self.playing = false;
    self._releaseFrames();
    if (!self._freshDecoder()) return Promise.resolve(null);
    self.positionMs = timeMs;
    var targetTs = Math.round(timeMs / 1000 * 1e6);
    var idx = findSampleIndex(self.vS, timeMs);
    if (idx < 0) idx = 0;
    var kf = idx;
    while (kf >= 0 && !self.vS[kf].is_sync) kf--;
    if (kf < 0) kf = 0;
    return new Promise(function (resolve) {
      (async function () {
        try {
          for (var i = kf; i < self.vS.length; i++) {
            if (self.closed || seq !== self._seq) { resolve(null); return; }
            if (i - kf >= CHAIN_CAP) {
              self._failStop("素材关键帧间隔过大（>600 帧）：取帧已截断，精度受限");
              resolve(null);
              return;
            }
            var s = self.vS[i];
            var data = await self._materialize(s);
            if (self.closed || seq !== self._seq) { resolve(null); return; }
            try {
              self.decoder.decode(new EncodedVideoChunk({
                type: s.is_sync ? "key" : "delta",
                timestamp: Math.round(s.cts / s.timescale * 1e6),
                duration: Math.round((s.duration || 1) / s.timescale * 1e6),
                data: data
              }));
              self._inFlight++;
            } catch (e) { self._failStop("decode 失败：" + e.message); resolve(null); return; }
            if (s.cts / s.timescale * 1e6 >= targetTs) break;
          }
          await self.decoder.flush();
          if (seq !== self._seq) { resolve(null); return; }
          var pick = self._pickFrame(targetTs);
          var keep = pick ? pick.frame : null;
          /* 其余帧全部释放（导出逐帧取帧不可在飞堆积） */
          for (var j = 0; j < self._frames.length; j++) {
            if (self._frames[j].frame !== keep) try { self._frames[j].frame.close(); } catch (e2) {}
          }
          self._frames = [];
          self._lastDrawnTs = -1;
          resolve(keep);
        } catch (e) {
          self._failStop("取帧链失败：" + e.message);
          resolve(null);
        }
      })();
    });
  };

  /* ---- 导出原语：离线解码音频段 [startMs, endMs] → [{ ptsMs, buffer }] ----
   * bufferCtx = OfflineAudioContext（createBuffer 与主 AudioContext 解耦）。
   * 返回 null = 无音频轨或解码失败（调用方按"视频-only"处理并如实提示）。 */
  MediaPipeline.prototype.decodeAudioRange = function (startMs, endMs, bufferCtx) {
    var self = this;
    if (!self.aTrack || !self.aS.length || self.closed || !bufferCtx) return Promise.resolve(null);
    var conf = {
      codec: self.aTrack.codec,
      sampleRate: self.aTrack.audio ? self.aTrack.audio.sample_rate : 48000,
      numberOfChannels: self.aTrack.audio ? self.aTrack.audio.channel_count : 2
    };
    if (self._aDesc) conf.description = self._aDesc;
    return new Promise(function (resolve) {
      var got = [];
      var failed = false;
      var want = 0, arrived = 0;
      var settled = false;
      var dec = null;
      function finish() {
        if (settled) return;
        settled = true;
        try { dec.close(); } catch (e4) {}
        if (failed) { resolve(null); return; }
        got.sort(function (a, b) { return a.ptsMs - b.ptsMs; });
        resolve(got);
      }
      try {
        dec = new AudioDecoder({
          output: function (ad) {
            arrived++;
            try {
              var ptsMs = ad.timestamp / 1000;
              var buf = audioDataToBuffer(bufferCtx, ad);
              got.push({ ptsMs: ptsMs, buffer: buf });
            } catch (e5) { failed = true; }
            try { ad.close(); } catch (e6) {}
            if (arrived >= want) finish();
          },
          error: function (e) {
            failed = true;
            self.onError("音频解码失败：" + e.message);
            finish();
          }
        });
        dec.configure(conf);
      } catch (e7) {
        self.onError("音频解码器不可用：" + e7.message);
        finish();
        return;
      }
      (async function () {
        try {
          /* 段范围：首个"末采样点 >= startMs"起，至"采样点 > endMs"止 */
          var i0 = 0;
          while (i0 < self.aS.length) {
            var pre = self.aS[i0];
            if (pre.cts / pre.timescale * 1000 + (pre.duration || 0) / pre.timescale * 1000 >= startMs) break;
            i0++;
          }
          var i1 = i0;
          while (i1 < self.aS.length) {
            if (self.aS[i1].cts / self.aS[i1].timescale * 1000 > endMs) break;
            i1++;
          }
          want = i1 - i0;
          if (want <= 0) { finish(); return; }
          for (var i = i0; i < i1; i++) {
            if (self.closed) { finish(); return; }
            var s = self.aS[i];
            var data = await self._materialize(s);
            if (self.closed) { finish(); return; }
            dec.decode(new EncodedAudioChunk({
              type: "key",
              timestamp: Math.round(s.cts / s.timescale * 1e6),
              duration: Math.round((s.duration || 1) / s.timescale * 1e6),
              data: data
            }));
          }
          /* AAC 需要输出可能与解码入队节奏不一致：flush 兜底（仅当未到齐时），
             否则按已到样本收窄如实返回 */
          if (arrived < want) {
            try { await dec.flush(); } catch (e9) {}
          }
          if (!settled) finish();
        } catch (e8) {
          failed = true;
          self.onError("音频解码失败：" + e8.message);
          finish();
        }
      })();
    });
  };

  /* ---- 播放：feedLoop 领先窗 + tickPlay 绘制/音频调度 ---- */
  MediaPipeline.prototype.startPlay = function (fromMs) {
    if (!this.vS.length || this.closed) return false;
    this._seq++;
    this.playing = true;
    this.positionMs = fromMs || 0;
    this._releaseFrames();
    if (!this._freshDecoder()) { this.playing = false; return false; }
    var idx = findSampleIndex(this.vS, this.positionMs);
    if (idx < 0) idx = 0;
    this._feedPtr = idx;
    while (this._feedPtr > 0 && !this.vS[this._feedPtr].is_sync) this._feedPtr--;
    this._kickchain();
    this.audioStart(this.positionMs);
    return true;
  };

  MediaPipeline.prototype._kickchain = function () {
    var self = this;
    if (self._chainRunning || self.closed || !self.playing) return;
    self._chainRunning = true;
    (async function () {
      while (!self.closed && self._chainRunning && self.playing) {
        if (self._feedPtr >= self.vS.length) break;
        var s = self.vS[self._feedPtr];
        var ctsMs = s.cts / s.timescale * 1000;
        if (ctsMs > self.positionMs + FEED_LEAD_MS) break;
        if (self._inFlight >= MAX_INFLIGHT) {
          /* 在飞满：链内等 drain（不退链，否则输出速率被 tick 节拍拖住） */
          await self._waitDrain(MAX_INFLIGHT);
          continue;
        }
        self._feedPtr++;
        try {
          var data = await self._materialize(s);
          if (self.closed) { self._chainRunning = false; return; }
          self.decoder.decode(new EncodedVideoChunk({
            type: s.is_sync ? "key" : "delta",
            timestamp: Math.round(s.cts / s.timescale * 1e6),
            duration: Math.round((s.duration || 1) / s.timescale * 1e6),
            data: data
          }));
          self._inFlight++;
        } catch (e) {
          self._failStop("解码失败：" + e.message);
          return;
        }
      }
      self._chainRunning = false;
    })();
  };

  MediaPipeline.prototype._waitDrain = function (cap) {
    var self = this;
    return new Promise(function (resolve) {
      var tries = 0;
      var iv = setInterval(function () {
        if (self._inFlight < cap || self.closed || !self.playing || tries++ > 42) {
          clearInterval(iv);
          resolve();
        }
      }, 10);
    });
  };

  MediaPipeline.prototype.tickPlay = function (positionMs) {
    if (this.closed || !this.playing) return;
    this.positionMs = positionMs;
    var posTs = Math.round(positionMs / 1000 * 1e6);
    var pickI = -1;
    var i;
    for (i = 0; i < this._frames.length; i++) {
      if (this._frames[i].ts > posTs) break;
      pickI = i;
    }
    if (pickI >= 0) {
      var pick = this._frames[pickI];
      for (i = 0; i < pickI; i++) this._frames[i].frame.close();
      this._frames = this._frames.slice(pickI);
      if (pick.ts !== this._lastDrawnTs) {
        this._draw(pick.frame);
        this._lastDrawnTs = pick.ts;
      }
    }
    this._kickchain();
    this.audioTick(positionMs);
  };

  MediaPipeline.prototype.pausePlay = function () {
    this.playing = false;
    this._chainRunning = false;
    this.audioPause();
  };

  MediaPipeline.prototype._draw = function (frame) {
    if (!this.canvas || this.closed) return;
    var ctx = this.canvas.getContext("2d");
    try { ctx.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height); }
    catch (e) { /* 帧已释放：跳过 */ }
  };

  MediaPipeline.prototype._releaseFrames = function () {
    for (var i = 0; i < this._frames.length; i++) {
      try { this._frames[i].frame.close(); } catch (e) {}
    }
    this._frames = [];
    this._lastDrawnTs = -1;
  };

  /* ================= 音频滑窗（AudioDecoder ±10s → WebAudio） ================= */
  MediaPipeline.prototype._ensureCtx = function () {
    if (this.closed) return null;
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(function () {}); /* 需用户手势；点播放即手势 */
    }
    return this.ctx;
  };

  MediaPipeline.prototype._ensureADecoder = function () {
    if (this.aDecoder || !this.aTrack || !this.aS.length) return this.aDecoder || null;
    var self = this;
    var d = new AudioDecoder({
      output: function (ad) {
        self._aInFlight--;
        if (self.closed) { ad.close(); return; }
        self._aQueue.push({ pts: ad.timestamp, ad: ad });
        self._aQueue.sort(function (x, y) { return x.pts - y.pts; });
      },
      error: function (e) { self.onError("AudioDecoder: " + e.message); }
    });
    var conf = {
      codec: self.aTrack.codec,
      sampleRate: self.aTrack.audio ? self.aTrack.audio.sample_rate : 48000,
      numberOfChannels: self.aTrack.audio ? self.aTrack.audio.channel_count : 2
    };
    if (self._aDesc) conf.description = self._aDesc;
    d.configure(conf);
    self.aDecoder = d;
    return d;
  };

  MediaPipeline.prototype.audioStart = function (fromMs) {
    var ctx = this._ensureCtx();
    var d = this._ensureADecoder();
    if (!ctx || !d) return;
    this.audioPause();            /* 清老 source/queue（含 close） */
    var idx = findSampleIndex(this.aS, fromMs);
    this._aNext = Math.max(0, idx < 0 ? 0 : idx + 1);
    this._kickALoop();
  };

  MediaPipeline.prototype._kickALoop = function () {
    var self = this;
    if (self._aLoop || self.closed || !self.playing) return;
    self._aLoop = true;
    (async function () {
      while (!self.closed && self._aLoop && self.playing) {
        if (self._aNext >= self.aS.length) break;
        var s = self.aS[self._aNext];
        var ctsMs = s.cts / s.timescale * 1000;
        if (ctsMs > self.positionMs + AUDIO_LEAD_MS) break;
        if (self._aInFlight >= MAX_AUDIO_INFLIGHT) {
          await self._waitADrain(MAX_AUDIO_INFLIGHT);
          continue;
        }
        self._aNext++;
        try {
          var data = await self._materialize(s);
          if (self.closed) { self._aLoop = false; return; }
          var d = self._ensureADecoder();
          if (!d) { self._aLoop = false; return; }
          d.decode(new EncodedAudioChunk({
            type: "key",
            timestamp: Math.round(s.cts / s.timescale * 1e6),
            duration: Math.round((s.duration || 1) / s.timescale * 1e6),
            data: data
          }));
          self._aInFlight++;
        } catch (e) {
          self._failStop("音频解码失败：" + e.message);
          return;
        }
      }
      self._aLoop = false;
    })();
  };

  MediaPipeline.prototype._waitADrain = function (cap) {
    var self = this;
    return new Promise(function (resolve) {
      var tries = 0;
      var iv = setInterval(function () {
        if (self._aInFlight < cap || self.closed || !self.playing || tries++ > 42) {
          clearInterval(iv);
          resolve();
        }
      }, 10);
    });
  };

  MediaPipeline.prototype.audioTick = function (positionMs) {
    var self = this;
    var ctx = this.ctx;
    if (!ctx || !self.playing || self.closed) return;
    var live = [];
    var i, k;
    /* 只在 ctx running 时调度（挂起状态先攒 AudioData，不烧 buffer） */
    if (ctx.state === "running") {
      var remain = [];
      for (i = 0; i < self._aQueue.length; i++) {
        var q = self._aQueue[i];
        var ptsMs = q.pts / 1000;
        if (ptsMs >= positionMs + AUDIO_LEAD_MS) { remain.push(q); continue; }
        if (ptsMs < positionMs - 50) { q.ad.close(); continue; }
        var buf = audioDataToBuffer(ctx, q.ad);
        q.ad.close();
        var src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        var at = ctx.currentTime + Math.max(0, (ptsMs - positionMs) / 1000);
        try { src.start(at); } catch (e) { continue; }
        live.push({ src: src, mediaEnd: ptsMs + buf.duration * 1000 });
      }
      self._aQueue = remain;
    }
    /* 清理已放完的 source */
    var keep = [];
    for (k = 0; k < self._aSources.length; k++) {
      var r = self._aSources[k];
      if (r.mediaEnd < positionMs - 300) {
        try { r.src.stop(); } catch (e) {}
        try { r.src.disconnect(); } catch (e2) {}
      } else { keep.push(r); }
    }
    self._aSources = keep.concat(live);
    this._kickALoop();
  };

  MediaPipeline.prototype.audioPause = function () {
    var i;
    for (i = 0; i < this._aSources.length; i++) {
      try { this._aSources[i].src.stop(); } catch (e) {}
      try { this._aSources[i].src.disconnect(); } catch (e2) {}
    }
    this._aSources = [];
    for (i = 0; i < this._aQueue.length; i++) {
      try { this._aQueue[i].ad.close(); } catch (e) {}
    }
    this._aQueue = [];
  };

  /* ---- 销毁 ---- */
  MediaPipeline.prototype.destroy = function () {
    this.closed = true;
    this.playing = false;
    this._chainRunning = false;
    this._aLoop = false;
    this.audioPause();
    if (this.aDecoder) { try { this.aDecoder.close(); } catch (e) {} this.aDecoder = null; }
    this._killDecoder();
    this._releaseFrames();
    if (this.ctx && this.ctx.state !== "closed") {
      try { this.ctx.close(); } catch (e) {}
      this.ctx = null;
    }
  };

  /* ================= 出口 ================= */
  ZY.pipeline = {
    detect: detect,
    makeSliceProvider: makeSliceProvider,
    create: function (opts) { return new MediaPipeline(opts); }
  };
})();
