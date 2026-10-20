/* 桌影 clips.js：右侧检查面板 —— 片段检查、字幕卡编辑、滤镜与过渡。
 * 面板由状态驱动渲染；输入控件 change/input 即写回工程并持久化。 */
(function () {
  "use strict";
  var ZY = window.ZY;

  /* 滤镜预设（片段级，CSS filter 字符串常量；无滤镜为空串） */
  var FILTER_PRESETS = {
    none:  { label: "无滤镜", css: "" },
    warm:  { label: "暖调",   css: "saturate(1.25) sepia(0.18) contrast(1.02)" },
    cool:  { label: "冷调",   css: "saturate(1.1) hue-rotate(12deg) brightness(1.02)" },
    mono:  { label: "灰度",   css: "grayscale(1)" },
    punch: { label: "高对比", css: "contrast(1.45) saturate(1.15)" },
    retro: { label: "复古",   css: "sepia(0.45) contrast(0.95) saturate(0.85)" }
  };

  /* 过渡预设（存于“相邻片段衔接处”＝前段的 transitionOut 字段） */
  var TRANSITION_PRESETS = {
    none:        "无",
    crossfade:   "叠化",
    fadeBlack:   "黑场",
    flashWhite:  "白闪"
  };

  /* 画幅预设（工程级，参考 clips.js -> player 预览框与 V3 导出） */
  var ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:5"];

  var clipBody = null;
  var capBody = null;
  var fxBody = null;

  /* ---------------- 片段检查面板 ---------------- */

  function renderClipPanel(clip) {
    var html = clip
      ? '<div class="zy-field"><label>名称</label><input type="text" data-f="name" value=""></div>' +
        '<div class="zy-field"><label>起始/时长</label><span data-ro="time"></span></div>' +
        '<div class="zy-field"><label>时长(秒)</label><input type="number" min="0.1" step="0.1" data-f="duration"></div>' +
        '<div class="zy-field"><label>变速倍率</label><input type="range" min="0.25" max="4" step="0.05" data-f="speed"><span data-ro="speed"></span></div>' +
        '<div class="zy-hint">变速预览用 playbackRate 近似；“保持音调”重采样属导出管线，V3 实现（UI 只存倍率）。</div>' +
        '<div class="zy-field"><label>音量</label><input type="range" min="0" max="1.5" step="0.05" data-f="volume"><span data-ro="volume"></span></div>' +
        '<div class="zy-hint">V1 只存单值音量；音量曲线（关键帧）属 V2+。</div>' +
        '<div class="zy-field"><label>媒质</label><span data-ro="media"></span></div>' +
        '<button data-act="remove-clip">删除片段</button>'
      : '<div class="zy-empty-hint">未选中片段：单击时间线的视频/音频片段。</div>';

    clipBody.innerHTML = html;

    if (!clip) return;
    var name = clipBody.querySelector('[data-f="name"]');
    name.value = clip.name;
    name.addEventListener("input", function () {
      clip.name = name.value;
      ZY.state.persist();
      ZY.timeline.render();
    });
    var dur = clipBody.querySelector('[data-f="duration"]');
    dur.value = clip.duration;
    dur.addEventListener("change", function () {
      var v = parseFloat(dur.value);
      if (!isFinite(v) || v <= 0) return;
      clip.duration = v;
      ZY.state.persist();
      ZY.timeline.render();
    });
    var spd = clipBody.querySelector('[data-f="speed"]');
    spd.value = clip.speed;
    clipBody.querySelector('[data-ro="speed"]').textContent = "×" + clip.speed.toFixed(2);
    spd.addEventListener("input", function () {
      clip.speed = ZY.util.clamp(parseFloat(spd.value) || 1, 0.25, 4);
      clipBody.querySelector('[data-ro="speed"]').textContent = "×" + clip.speed.toFixed(2);
      ZY.state.persist();
    });
    var vol = clipBody.querySelector('[data-f="volume"]');
    vol.value = clip.volume;
    clipBody.querySelector('[data-ro="volume"]').textContent = clip.volume.toFixed(2);
    bindVolume(clip, vol);
    clipBody.querySelector('[data-ro="time"]').textContent =
      ZY.util.fmtTime(clip.start) + " → " + ZY.util.fmtTime(clip.start + clip.duration);
    var media = clipBody.querySelector('[data-ro="media"]');
    media.textContent = clip.mediaId
      ? (findMedia(clip.mediaId).name + "（时长 " + (findMedia(clip.mediaId).duration === null ? "未知" : findMedia(clip.mediaId).duration + "s") + "）")
      : "空片段（媒质未挂载）";
    clipBody.querySelector('[data-act="remove-clip"]').addEventListener("click", function () {
      ZY.state.removeClip(clip.id);
    });
  }

  function bindVolume(clip, vol) {
    vol.addEventListener("input", function () {
      clip.volume = ZY.util.clamp(parseFloat(vol.value) || 0, 0, 1.5);
      clipBody.querySelector('[data-ro="volume"]').textContent = clip.volume.toFixed(2);
      ZY.state.persist();
    });
  }

  function findMedia(id) {
    var d = ZY.project.data;
    var i;
    for (i = 0; i < d.media.length; i++) if (d.media[i].id === id) return d.media[i];
    return { name: "未知素材", duration: null };
  }

  /* ---------------- 字幕卡编辑 ---------------- */

  function showEditor() {
    var sel = ZY.ui.selection;
    renderCaptionPanel(sel && sel.kind === "caption" ? ZY.state.findCaptionById(sel.id) : null);
  }

  function renderCaptionPanel(cap) {
    var html = cap
      ? '<div class="zy-field"><label>起止(秒)</label><input type="number" step="0.1" min="0" data-f="cs"> <span>→</span> <input type="number" step="0.1" min="0" data-f="ce"></div>' +
        '<div class="zy-field"><label>文本</label><textarea data-f="text"></textarea></div>' +
        '<div class="zy-field"><label>字号(px)</label><input type="number" min="10" max="72" step="1" data-f="size"></div>' +
        '<div class="zy-field"><label>描边</label><input type="checkbox" data-f="outline"><span>底部居中（V1 固定）</span></div>' +
        '<button data-act="save-cap">保存字幕卡</button>' +
        '<button data-act="remove-cap">删除字幕卡</button>' +
        '<div class="zy-hint">字幕实渲染（描边内核/字体替换）属导出管线 V3；V1 只存样式参数。</div>'
      : '<div class="zy-empty-hint">未选中字幕卡：双击字幕轨空白处新增，双击已有卡编辑。</div>';

    capBody.innerHTML = html;
    if (!cap) return;
    var cs = capBody.querySelector('[data-f="cs"]');
    var ce = capBody.querySelector('[data-f="ce"]');
    var tx = capBody.querySelector('[data-f="text"]');
    var sz = capBody.querySelector('[data-f="size"]');
    var ol = capBody.querySelector('[data-f="outline"]');
    cs.value = cap.start;
    ce.value = cap.end;
    tx.value = cap.text;
    sz.value = cap.fontSize || 24;
    ol.checked = !!cap.outline;
    capBody.querySelector('[data-act="save-cap"]').addEventListener("click", function () {
      var s = parseFloat(cs.value);
      var e2 = parseFloat(ce.value);
      var f = parseFloat(sz.value);
      if (isFinite(s) && s >= 0) cap.start = s;
      if (isFinite(e2) && e2 > cap.start) cap.end = e2;
      cap.text = tx.value || "字幕卡";
      if (isFinite(f)) cap.fontSize = ZY.util.clamp(f, 10, 72);
      cap.outline = ol.checked;
      cap.align = "bottom-center";
      ZY.state.setSelection("caption", cap.id);
      ZY.state.persist();
    });
    capBody.querySelector('[data-act="remove-cap"]').addEventListener("click", function () {
      ZY.state.removeCaption(cap.id);
    });
  }

  /* ---------------- 滤镜与过渡面板 ---------------- */

  function renderFxPanel(clip) {
    var html = "<div class='zy-hint'>滤镜存于片段级（选中后改）；过渡存于相邻片段衔接处（＝前段的 transitionOut），过渡实渲染属 V2+。</div>";
    if (!clip) {
      html += "<div class='zy-empty-hint'>未选中片段。画幅预设（工程级）：</div>";
      html += aspectSelectHtml();
      html = wrapFx(html);
      fxBody.innerHTML = html;
      bindAspect();
      return;
    }
    var keys = Object.keys(FILTER_PRESETS);
    var i;
    html += "<div class='zy-filter-list'>";
    for (i = 0; i < keys.length; i++) {
      html += "<label><input type='radio' name='zy-filter' value='" + keys[i] + "'" +
        (clip.filter === keys[i] ? " checked" : "") + ">" + FILTER_PRESETS[keys[i]].label + "</label>";
    }
    html += "</div>";
    var tKeys = Object.keys(TRANSITION_PRESETS);
    html += "<div class='zy-field'><label>过渡(后接)</label><select data-f='transition'>";
    for (i = 0; i < tKeys.length; i++) {
      html += "<option value='" + tKeys[i] + "'" + (clip.transitionOut === tKeys[i] ? " selected" : "") + ">" + TRANSITION_PRESETS[tKeys[i]] + "</option>";
    }
    html += "</select></div>";
    html += aspectSelectHtml();
    fxBody.innerHTML = wrapFx(html);

    var radios = fxBody.querySelectorAll('input[name="zy-filter"]');
    var j;
    for (j = 0; j < radios.length; j++) {
      radios[j].addEventListener("change", function () {
        var target = ZY.state.selectedClip();
        if (!target) return;
        target.filter = this.value;
        ZY.state.persist();
      });
    }
    var sel = fxBody.querySelector('[data-f="transition"]');
    sel.addEventListener("change", function () {
      var target = ZY.state.selectedClip();
      if (!target) return;
      target.transitionOut = sel.value;
      ZY.state.persist();
    });
    bindAspect();
  }

  /* 画幅预设是工程级设置，任何选中态下都展示 */
  function aspectSelectHtml() {
    var ratios = ASPECT_RATIOS;
    var cur = ZY.project.data.settings.aspectRatio || "16:9";
    var html = "<div class='zy-field'><label>画幅预设</label><select data-f='aspect'>";
    var i;
    for (i = 0; i < ratios.length; i++) {
      html += "<option value='" + ratios[i] + "'" + (cur === ratios[i] ? " selected" : "") + ">" + ratios[i] + "</option>";
    }
    html += "</select></div><div class='zy-hint'>画幅作用于预览框与 V3 导出目标（同为工程级）。</div>";
    return html;
  }

  function wrapFx(inner) {
    return "<div data-fxwrap>" + inner + "</div>";
  }

  function bindAspect() {
    var sel = fxBody.querySelector('[data-f="aspect"]');
    if (!sel) return;
    sel.addEventListener("change", function () {
      ZY.project.data.settings.aspectRatio = sel.value;
      ZY.state.persist();
      ZY.player.applyAspectRatio();
      if (ZY.export) ZY.export.render();
    });
  }

  function render() {
    var sel = ZY.ui.selection;
    var clip = sel && sel.kind === "clip" ? ZY.state.findClipById(sel.id) : ZY.state.selectedClip();
    renderClipPanel(clip);
    renderCaptionPanel(sel && sel.kind === "caption" ? ZY.state.findCaptionById(sel.id) : null);
    renderFxPanel(clip);
  }

  function init() {
    clipBody = document.getElementById("inspect-clip-body");
    capBody = document.getElementById("inspect-caption-body");
    fxBody = document.getElementById("inspect-fx-body");
    render();
  }

  ZY.clips = {
    init: init,
    render: render,
    showEditor: showEditor,
    FILTER_PRESETS: FILTER_PRESETS,
    TRANSITION_PRESETS: TRANSITION_PRESETS,
    ASPECT_RATIOS: ASPECT_RATIOS
  };
})();
