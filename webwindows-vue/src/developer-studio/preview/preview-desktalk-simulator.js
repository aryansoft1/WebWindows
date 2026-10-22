/* DeskTalk PREVIEW SIMULATOR (preview pilot, DO NOT confuse with the real DeskTalk app).
 *
 * This is the proposal source for the ai audit pilot in Developer Studio. It mimics the L2
 * flow of docs/WEBWINDOWS_DESKTALK_AI_ASSIST_V1.md §7 as a deterministic, offline source built
 * ONLY from the numeric summary the broker already validated. It is NOT the real DeskTalk
 * panel, has NO AI provider, and never sees chatproxy. Every proposal body carries the honest
 * 【预览仿真】 marker; the real askAppAssist wiring (assets/js/desktalk.js) is a separate
 * scheduled item and untouched this round.
 *
 * The interface mirrors what the Host must exact from the DeskTalk side: attribution is the
 * registered const "desktalk-assist" and proposals must pass the registered payload schema
 * (validated again by the broker before delivery).
 */
const PILOT_PROPOSAL_DELAY_MS = 120;
const PILOT_PROPOSAL_DELAY_MAX_MS = 2000;

export class PreviewDeskTalkSimulator {
  constructor({ now = () => Date.now(), setTimer = (callback, delay) => setTimeout(callback, delay) } = {}) {
    this.now = now;
    this.setTimer = setTimer;
    this.delay = Math.min(Math.max(PILOT_PROPOSAL_DELAY_MS, 0), PILOT_PROPOSAL_DELAY_MAX_MS);
  }

  isAvailable() {
    return true;
  }

  describe() {
    return "PreviewDeskTalkSimulator（preview 试点，非桌讯真实对话）";
  }

  /* requestAssist({ attribution, scene, summary }) -> Promise<{ proposals: [...] }> */
  requestAssist(request) {
    if (!request || request.attribution !== "desktalk-assist" || request.scene !== "video-edit") {
      return Promise.reject(Object.assign(new Error("simulator: invalid assist handoff"), { code: "ai-provider-unavailable" }));
    }
    const summary = request.summary || {};
    return new Promise((resolve) => {
      this.setTimer(() => resolve({ proposals: this.#simulateProposals(summary) }), this.delay);
    });
  }

  /* deterministic, summary-numbers only; bodies are labeled 【预览仿真】 */
  #simulateProposals(summary) {
    const proposals = [];
    const project = summary.project || {};
    const clips = Array.isArray(summary.clips) ? summary.clips : [];
    const analysis = summary.analysis || {};
    const totalDuration = clips.reduce((sum, clip) => sum + (clip.duration ?? 0), 0);
    const maxScenes = clips.reduce((max, clip) => Math.max(max, clip.scenes ?? 0), 0);
    const maxSilence = clips.reduce((max, clip) => Math.max(max, clip.silenceRatio ?? 0), 0);
    const cutCount = Array.isArray(analysis.sceneCuts) ? analysis.sceneCuts.length : 0;

    proposals.push({
      kind: "plan-step",
      title: "开场取舍建议",
      body: `【预览仿真】依据摘要数值估算：素材 ${clips.length} 段共 ${formatNumber(totalDuration)} 秒，`
        + `检测到 ${cutCount} 项场景切换（最大段内场景数 ${maxScenes}）。建议先以场景切换数量最高的段落作为开场候选，`
        + `再按时间序排布其余段落。未接入桌讯对话，请勿据此判断素材画面内容。`,
      reason: `为什么这样剪：场景切换表项数 ${cutCount}、最大段内场景数 ${maxScenes} 可反映画面变化密度，是纯数值估算，未包含任何画面或音频内容。`
    });
    proposals.push({
      kind: "text-suggestion",
      title: "节奏与静音处理建议",
      body: `【预览仿真】静音比最高段约为 ${formatNumber(maxSilence)}。若保留该段作为呼吸感，建议保留 0.3~0.5 秒即可；`
        + `其余段可不等长裁剪。此建议仅凭静音比数值，未试听任何音频。`,
      reason: `为什么这样剪：静音比 ${formatNumber(maxSilence)} 显示该段以静音为主，属于节奏压缩的常见做法。`
    });
    if (clips.length >= 2) {
      proposals.push({
        kind: "caption",
        title: "字幕轨起始文案建议",
        body: `【预览仿真】建议开场字幕写「共 ${clips.length} 段 · ${formatNumber(totalDuration)} 秒 · ${formatNumber(project.fps ?? 30)} fps」，`
          + `并以工程分辨率 ${project.resolution ? formatNumber(project.resolution[1]) + "×" + formatNumber(project.resolution[0]) : "未知"} 作为排版基准。仅为占位建议，应用可自行改写。`,
        reason: "为什么这样剪：开场字幕通常承载概览信息，以上数值全部来自工程摘要字段。"
      });
    }
    if (analysis.motionHistogram && analysis.motionHistogram.length > 0) {
      proposals.push({
        kind: "cover-copy",
        title: "封面文案建议",
        body: `【预览仿真】运动强度分布共 ${analysis.motionHistogram.length} 项。封面文案建议突出「节奏快」「剪辑密」等措辞，`
          + `具体字样由应用定夺。无真实图像输入，不应描述任何画面细节。`,
        reason: "为什么这样剪：运动分布是节奏感知的常见代理，仅用于文案方向建议。"
      });
    }
    return proposals.slice(0, 12);
  }
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 1000) / 1000);
}
