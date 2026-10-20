/* 桌影 ai.js：
 * 1) 诊断抽屉：window.WebWindows 与桌面端能力的真实检测结果（不伪造成功）。
 * 2) 桌讯 AI 抽屉：占位卡片 + 本地素材分析（L1，拟定）+ L2 发送按钮置灰，
 *    引用 docs/WEBWINDOWS_DESKTALK_AI_ASSIST_V1.md 的隐私边界要点。 */
(function () {
  "use strict";
  var ZY = window.ZY;

  var diagBody = null;
  var aiBody = null;
  var lastSummary = null;

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
      ["fileDialog.saveBlob（宿主保存）", badge3(fd)],
      ["ai 命名空间（ai.requestAssist）", caps.aiNamespace ? badge3(caps.aiRequestAssist) : badge(false)],
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

  /* ---------------- 桌讯 AI ---------------- */

  /* L1（拟定）：本地结构化摘要 —— 只统计工程数据，不做任何发送，不调用未接入 API。 */
  function buildSummary() {
    var d = ZY.project.data;
    var i;
    var clipCount = d.clips.length;
    var total = 0;
    var fastest = 1;
    var slowest = 1;
    var filters = {};
    var transitions = {};
    for (i = 0; i < d.clips.length; i++) {
      total += d.clips[i].duration;
      fastest = Math.min(fastest, d.clips[i].speed);
      slowest = Math.max(slowest, d.clips[i].speed);
      if (d.clips[i].filter !== "none") filters[d.clips[i].filter] = (filters[d.clips[i].filter] === undefined ? 0 : filters[d.clips[i].filter]) + 1;
      if (d.clips[i].transitionOut !== "none") transitions[d.clips[i].transitionOut] = (transitions[d.clips[i].transitionOut] === undefined ? 0 : transitions[d.clips[i].transitionOut]) + 1;
    }
    return {
      scene: "video-edit",
      mediaCount: d.media.length,
      clipCount: clipCount,
      captionCount: d.captions.length,
      totalDurationSec: Math.round(total * 100) / 100,
      speedRange: fastest > slowest ? [fastest, slowest] : total > 0 ? [1, 1] : null,
      filtersUsed: filters,
      transitionsUsed: transitions,
      aspectRatio: (d.settings && d.settings.aspectRatio) || "16:9"
    };
  }

  function renderAi() {
    if (!aiBody) return;
    var caps = ZY.env.detect();
    var html = "";
    html += "<div class='zy-ai-card zy-ai-disabled'>";
    html += "<strong>桌影 · 桌讯 AI 剪辑助手（契约评审中）</strong>";
    html += "<p class='zy-hint'>该面板为占位：桌讯 AI 协助契约评审通过并登记权限后，此处的按钮才会启用。当前运行环境检测结果：";
    html += caps.hostDetected ? "检测到 WebWindows Host；" : "未检测到 WebWindows Host（浏览器直开，降级）；";
    html += "ai.requestAssist " + (caps.aiRequestAssist ? "存在（仍待契约评审放行）" : "不存在") + "。</p>";
    html += "</div>";

    /* L1 功能位：本地素材分析（拟定）。生成摘要但不发送。 */
    html += "<div class='zy-field' style='margin-top:10px'><strong>本地素材分析（L1，拟定）</strong>" +
      "<button data-act='l1-analyze'>生成本地摘要</button></div>";
    html += "<p class='zy-hint'>L1 只在本页内统计工程结构（片段数/总时长/变速区间/滤镜与过渡使用、字幕数），不读取帧画面，不发送任何数据；发送通道依赖 L2 契约。</p>";
    if (lastSummary) {
      html += "<div class='zy-ai-summary'>" + escapeHtml(JSON.stringify(lastSummary, null, 2)) + "</div>";
    }

    /* L2 按钮：置灰。 */
    html += "<div class='zy-field'><button data-act='l2-send' disabled>发送剪辑摘要到桌讯（L2，拟走 ai.requestAssist）</button></div>";
    html += "<p class='zy-warn-hint'>L2 按钮在 ai.desktalk-assist 权限与 ai.requestAssist API 从契约评审中落地并登记后才会启用；现在点按无效（disabled）。</p>";

    /* 隐私边界（引用 docs/WEBWINDOWS_DESKTALK_AI_ASSIST_V1.md 的要点）： */
    html += "<div class='zy-ai-privacy'>隐私边界（依据 docs/WEBWINDOWS_DESKTALK_AI_ASSIST_V1.md 的纪律原文）：";
    html += "<ul>" +
      "<li>用户主动点击后才发起；应用不静默、不循环、不在后台自动触发。</li>" +
      "<li>只传递结构化摘要（本例：scene=video-edit 的剪辑统计），不传帧画面、不传媒体内容或坐标轨迹。</li>" +
      "<li>每次发送在 Host 侧渲染可信确认卡（本应用无法伪造授权），单次摘要上限 16 KiB。</li>" +
      "<li>桌讯依据既有纪律回答：依据 Knowledge 回答，不知道时明确说明。</li>" +
      "<li>回复经 ai.assist.received 事件回流应用。</li>" +
      "</ul></div>";
    aiBody.innerHTML = html;

    var l1 = aiBody.querySelector("[data-act='l1-analyze']");
    if (l1) {
      l1.addEventListener("click", function () {
        lastSummary = buildSummary();
        renderAi();
      });
    }
    /* l2-send 保持 disabled，无监听：未接入的能力不给假动作 */
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

  ZY.ai = {
    init: init,
    renderDiag: renderDiag,
    renderAi: renderAi,
    buildSummary: buildSummary
  };
})();
