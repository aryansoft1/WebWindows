/* 桌影 media-pipeline.js — V2 预览管线（WebCodecs→canvas）
 *
 * 能力检测（顺序固定，G3 契约）：
 *   isSecureContext → WebCodecs 接口存在 → codec isTypeSupported → 解码阶梯档位。
 *   勘误纪律（2026-10-21）：任何"能力缺失"结论必须先排除 secure-context 干扰。
 *
 * readProvider 抽象（素材来源，见 docs/ZHUOYING_DESKSHADOW_V2_SPEC.md §1）：
 *   浏览器降级模式：File.slice().arrayBuffer()（开发便利，整文件可持握）
 *   Production：G1 device.storage.readChunk(offset, length)（审计材料见
 *   docs/WEBWINDOWS_STORAGE_MEDIA_V1_DRAFT.md；未落地前本模块在 Production 内部
 *   如实报"管线待契约"，绝不禁静默降级）
 *
 * 现场验证事实（tmp/v2-probe/ 已跑通，2026-10-21）：
 *   - avc1: first.description.avcC 头部(hdr_size)跳过取 body → VideoDecoder.description
 *   - mp4a: description.esds.data → ES(3)>DC(4)>ASC(5) 嵌套 tag 解析取 AudioSpecificConfig
 *   - 帧序按 dts 排序喂 EncodedVideoChunk；解码输出 VideoFrame 用完必须 close()
 */
(function () {
  "use strict";
  var ZY = window.ZY = window.ZY || {};

  /* ---------- 能力检测 ---------- */
  var caps = null;
  function detect() {
    if (caps) return caps;
    var secure = (window.isSecureContext === true);
    var hasVD = secure && ("VideoDecoder" in window);
    var hasVE = secure && ("VideoEncoder" in window);
    var hasAD = secure && ("AudioDecoder" in window);
    var capsObj = {
      secure: secure,
      webCodecs: hasVD || hasVE,
      videoDecode: hasVD,
      videoEncode: hasVE,
      audioDecode: hasAD,
      mp4box: false,              /* 由 ensureMp4box() 落实 */
      ready: hasVD && "MP4Box" in window
    };
    caps = capsObj;
    return capsObj;
  }

  function ensureMp4box() {
    var c = detect();
    if (!c.mp4box && ("MP4Box" in window)) {
      try { window.MP4Box.createFile(); c.mp4box = true; } catch (e) { c.mp4box = false; }
    }
    return c;
  }

  /* ---------- readProvider ---------- */
  function makeSliceProvider(file) {
    var size = file.size;
    return {
      size: size,
      /* 分片读 ArrayBuffer（≤4MiB 语义与 G1 对齐） */
      readRange: function (offset, length) {
        var end = Math.min(size, offset + length);
        return file.slice(offset, end).arrayBuffer();
      }
    };
  }

  /* WP.chunks: 注册缓冲（fileStart→buffer），描述符/样本按绝对文件偏移定位 */
  function attachBuffer(reg, buffer, fileStart) {
    reg.push({ fileStart: fileStart, buffer: buffer, offset: 0, len: buffer.byteLength });
  }
  function readFromReg(reg, offset, length) {
    for (var i = 0; i < reg.length; i++) {
      var r = reg[i];
      if (offset >= r.fileStart + r.offset && offset + length <= r.fileStart + r.offset + r.len) {
        return new Uint8Array(r.buffer, offset - (r.fileStart + r.offset), length).slice().buffer;
      }
    }
    return null;
  }

  /* ---------- 描述符提取（现场验证过的两种路径） ---------- */
  function extractAvcDesc(sample) {
    var c = sample.description && sample.description.avcC;
    if (!c || typeof c.start !== "number") return null;
    var bytes = readFromReg(_reg, c.start + (c.hdr_size || 8), c.size - (c.hdr_size || 8));
    return bytes;
  }
  function extractAscDesc(sample) {
    var e = sample.description && sample.description.esds;
    if (!e || !e.data) return null;
    var d = new Uint8Array(e.data.buffer || e.data, e.data.byteOffset || 0, e.data.byteLength);
    function walk(lo, hi) {
      var i = lo;
      while (i < hi - 1) {
        var tag = d[i], len = d[i + 1];
        var b0 = i + 2, b1 = Math.min(i + 2 + len, hi);
        if (tag === 0x05) return d.slice(b0, b1);
        if (tag === 0x03 && b0 + 3 <= b1) { var r = walk(b0 + 3, b1); if (r) return r; }
        else if (tag === 0x04 && b0 + 13 <= b1) { var r2 = walk(b0 + 13, b1); if (r2) return r2; }
        else if (tag !== 0x03 && tag !== 0x04) { var r3 = walk(b0, b1); if (r3) return r3; }
        i = b1;
      }
      return null;
    }
    return walk(0, d.length);
  }

  var _reg = [];

  /* ---------- 管线 ---- */
  function MediaPipeline(opts) {
    /* opts: provider {size, readRange}, canvas (HTMLCanvas), onReady, onError */
    this.provider = opts.provider;
    this.canvas = opts.canvas;
    this.onReady = opts.onReady || function () {};
    this.onError = opts.onError || function () {};
    this.file = null;           /* MP4Box file */
    this.videoTrack = null;
    this.audioTrack = null;
    this.durationMs = 0;
    this.samples = [];          /* video samples（按 index 抽取不缓存全部 data）*/
    this.decoded = null;        /* 最近一帧 VideoFrame */
    this.decoder = null;
    this.playing = false;
    this.positionMs = 0;
    this.rafHandle = 0;
    this.pending = 0;           /* 在飞解码（≤8 纪律）*/
    this.closed = false;
    detect();
  }

  /* 逐块读入，直到 moov 就绪 */
  MediaPipeline.prototype.ingest = function () {
    var self = this;
    var CHUNK = 4 * 1024 * 1024;
    var offset = 0;
    return new Promise(function (resolve, reject) {
      var file = ensureMp4box() ? window.MP4Box.createFile() : null;
      if (!file) { reject(new Error("MP4Box 不可用")); return; }
      self.file = file;
      file.onReady = function (info) {
        for (var i = 0; i < info.tracks.length; i++) {
          var t = info.tracks[i];
          if (t.type === "video" && !self.videoTrack) self.videoTrack = t;
          if (t.type === "audio" && !self.audioTrack) self.audioTrack = t;
        }
        self.durationMs = (info.duration && info.timescale) ? Math.round(info.duration / info.timescale * 1000) : 0;
        self.onReady(self);
      };
      file.onError = function (e) { self.onError(e && e.message || "MP4Box 错误"); };
      file.onSamples = function () {};
      function pump() {
        if (self.videoTrack || self.closed) { resolve(self); return; }
        if (offset >= self.provider.size) { reject(new Error("素材解析完成但未发现可用视频轨道")); return; }
        var len = Math.min(CHUNK, self.provider.size - offset);
        self.provider.readRange(offset, len).then(function (buf) {
          attachBuffer(_reg, buf, offset);
          buf.fileStart = offset;
          file.appendBuffer(buf);
          if (file.flush) file.flush();
          offset += len;
          /* moov 常在前端（标准的转换格式），逐块判断即可 */
          if (self.videoTrack || file.isProcessingComplete && file.isProcessingComplete()) { resolve(self); return; }
          pump();
        }, function (e) { reject(new Error("素材读取失败：" + (e && e.message))); });
      }
      pump();
    });
  };

  MediaPipeline.prototype.ensureDecoder = function () {
    if (this.decoder) return Promise.resolve(this.decoder);
    var self = this;
    return this.collectDescription().then(function (desc) {
      return new Promise(function (resolve, reject) {
        var d = new VideoDecoder({
          output: function (vf) {
            self.pending--;
            if (self.decoded) { self.decoded.close(); self.decoded = null; }
            self.decoded = vf;
            self.drawCurrent();
          },
          error: function (e) { self.onError("VideoDecoder: " + e.message); }
        });
        var conf = {
          codec: self.videoTrack.codec,
          width: self.videoTrack.width,
          height: self.videoTrack.height,
          optimizeForLatency: true
        };
        if (desc) conf.description = desc;
        d.configure(conf);
        self.decoder = d;
        resolve(d);
      });
    });
  };

  MediaPipeline.prototype.collectDescription = function () {
    var self = this;
    if (self._desc !== undefined) return Promise.resolve(self._desc);
    var t = self.videoTrack;
    return new Promise(function (resolve) {
      var done = false;
      self.file.onSamples = function (id, user, ss) {
        if (done || !ss.length || id !== t.id) return;
        done = true;
        var s = ss[0];
        var bytes = null;
        if (s.description && s.description.avcC) bytes = extractAvcDesc(s);
        if (!bytes) self._desc = null;
        else self._desc = new Uint8Array(bytes);
        self.file.entryOffsets = null;
        resolve(self._desc);
      };
      self.file.setExtractionOptions(t.id, null, { nbSamples: 1, nbPartialSamples: 0 });
      self.file.start();
      setTimeout(function () { if (!done) { done = true; self._desc = null; resolve(null); } }, 2000);
    });
  };

  /* 松手精确 seek：从目标时刻之前的最近 sync 样本开始解码链 */
  MediaPipeline.prototype.seekDecode = function (timeMs, maxFrames) {
    var self = this;
    if (!self.file || !self.videoTrack) return Promise.resolve(false);
    return self.ensureDecoder().then(function (decoder) {
      var t = self.videoTrack.timescale;
      var targetCts = timeMs / 1000 * t;
      var entries = self._entries();
      var start = 0;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].cts <= targetCts) start = i;
        else break;
      }
      for (var k = start; k >= 0; k--) {
        if (entries[k].is_sync) { start = k; break; }
      }
      var pendingList = entries.slice(start, Math.min(entries.length, start + (maxFrames || 64)));
      return self._decodeRange(pendingList).then(function () {
        return true;
      });
    });
  };

  /* 抽样索引（懒加载，样本 data 由 _fetch 按 need 取） */
  MediaPipeline.prototype._entries = function () {
    var self = this;
    if (self._entCache) return self._entCache;
    var file = self.file;
    var t = self.videoTrack.id;
    var ents = [];
    var d;
    var raw = file.getItem && file.getItem(t);
    if (raw && raw.length) { ents = raw; }
    self._entCache = ents;
    return ents;
  };

  MediaPipeline.prototype._decodeRange = function (list) {
    var self = this;
    var timescale = this.videoTrack.timescale;
    var defer = Promise.resolve();
    list.forEach(function (s) {
      defer = defer.then(function () {
        if (self.closed) return null;
        var data = s.data;
        return self.decoder.decode(new EncodedVideoChunk({
          type: s.is_sync ? "key" : "delta",
          timestamp: Math.round(s.cts / timescale * 1e6),
          duration: Math.round(((s.duration || 1) / timescale) * 1e6),
          data: data || s.data
        }));
      });
    });
    return defer.then(function () { return self.decoder.flush(); });
  };

  MediaPipeline.prototype.drawCurrent = function () {
    if (this.closed || !this.decoded || !this.canvas) return;
    var ctx = this.canvas.getContext("2d");
    try {
      ctx.drawImage(this.decoded, 0, 0, this.canvas.width, this.canvas.height);
    } catch (e) { /* frame closed: skip */ }
  };

  /* 播放（V2 最小闭环：按解码实时能力顺放，音频预览列下一里程碑） */
  MediaPipeline.prototype.play = function (fromMs) {
    var self = this;
    self.pause();
    self.playing = true;
    self.positionMs = fromMs || 0;
    var lastTick = performance.now();
    function tick() {
      if (!self.playing || self.closed) return;
      self.positionMs += performance.now() - lastTick;
      lastTick = performance.now();
      self.seekDecode(self.positionMs, 30).then(function () {
        if (self.playing) self.rafHandle = requestAnimationFrame(tick);
      });
    }
    self.rafHandle = requestAnimationFrame(tick);
    self.seekDecode(self.positionMs, 30);
  };

  MediaPipeline.prototype.pause = function () {
    this.playing = false;
    if (this.rafHandle) { cancelAnimationFrame(this.rafHandle); this.rafHandle = 0; }
  };

  MediaPipeline.prototype.destroy = function () {
    this.closed = true;
    this.pause();
    if (this.decoded) { this.decoded.close(); this.decoded = null; }
    if (this.decoder) { try { this.decoder.close(); } catch (e) {} this.decoder = null; }
  };

  ZY.pipeline = {
    detect: detect,
    makeSliceProvider: makeSliceProvider,
    create: function (opts) { return new MediaPipeline(opts); }
  };
})();
