/* 桌影 export.js：导出面板。
 * V1 诚实范围：只做能力探测支持矩阵展示 + 画幅/格式选择器 UI 先行；导出按钮置灰并标注
 * “导出管线属 V3”（WebCodecs 离线渲染管线 + MediaRecorder 原型设计待评审）。 */
(function () {
  "use strict";
  var ZY = window.ZY;

  var body = null;
  var lastChoice = null;

  function render() {
    if (!body) return;
    var caps = ZY.env.detect();

    function row(label, okOrNotFound) {
      var cls = okOrNotFound ? "ok" : "no";
      var word = okOrNotFound ? "可" : "否";
      return "<tr><td>" + label + "</td><td><span class='zy-badge " + cls + "'>" + word + "</span></td></tr>";
    }

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
    var cur = (ZY.project.data.settings && ZY.project.data.settings.aspectRatio) || "16:9";
    var i;
    for (i = 0; i < ratios.length; i++) {
      html += "<option value='" + ratios[i] + "'" + (cur === ratios[i] ? " selected" : "") + ">" + ratios[i] + "</option>";
    }
    html += "</select></div>";

    html += "<div class='zy-field'><label>目标格式</label><select data-e='format'>" +
      "<option value='mp4' selected>MP4（H.264/AAC，拟走 WebCodecs 重封装）</option>" +
      "<option value='webm'>WebM（VP9/Opus，拟走 WebCodecs）</option>" +
      "<option value='webm-mr'>WebM 原型（拟走 MediaRecorder captureStream，仅原型）</option>" +
      "</select></div>";

    html += "<div class='zy-field'><button data-e='do-export' disabled>开始导出（不可用）</button></div>";
    html += "<p class='zy-warn-hint'>导出管线属 V3：变速/保音调重采样、滤镜与过渡的离线渲染、字幕实渲染、封装写盘均未实现。" +
      "上述按钮置灰仅展示目标交互；当前页签下的支持矩阵只是静态探测结果，导出能力不受此判断授权。</p>";
    body.innerHTML = html;

    var fmt = body.querySelector("[data-e='format']");
    var aspect = body.querySelector("[data-e='aspect']");
    if (fmt && aspect) {
      fmt.value = lastChoice && lastChoice.format ? lastChoice.format : fmt.value;
      aspect.value = cur;
      function remember() {
        lastChoice = { format: fmt.value, aspect: aspect.value };
      }
      fmt.addEventListener("change", remember);
      aspect.addEventListener("change", function () {
        ZY.project.data.settings.aspectRatio = aspect.value;
        ZY.state.persist();
        ZY.player.applyAspectRatio();
        remember();
      });
    }
    /* data-e='do-export' 无监听：保持置灰 */
  }

  function init() {
    body = document.getElementById("panel-export-body");
    render();
  }

  ZY.export = {
    init: init,
    render: render
  };
})();
