/* Machine summary for the host-owned confirmation card (design doc §5). The card must present
 * FIELD NAMES AND NUMBERS, never lenient descriptions, and never the raw payload text: source
 * summary objects carry opaque ids that are counted, not echoed. Output is used for the pilot
 * card in Developer Studio; audit rows record only scene + byte counts (never payload content).
 */
import { VIDEO_EDIT_PILOT_LIMITS } from "./assist-schema-validators.js";

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 1000) / 1000);
}

function formatDimensionPair(pair) {
  return Array.isArray(pair) && pair.length === 2 ? `${pair[1]}×${pair[0]}` : "未知";
}

export function buildAssistConfirmationSummary(summary, payloadText) {
  const lines = [];
  lines.push("场景：视频剪辑（scene: video-edit）");
  const project = summary?.project;
  if (project) {
    lines.push(`工程：时长 ${formatNumber(project.duration)} 秒 · ${formatNumber(project.fps)} fps · `
      + `${project.tracks} 轨 · 分辨率 ${formatDimensionPair(project.resolution)}`);
  }
  const clips = summary?.clips;
  if (Array.isArray(clips)) {
    const totalDuration = clips.reduce((sum, clip) => sum + (clip.duration ?? 0), 0);
    const maxScenes = clips.reduce((max, clip) => Math.max(max, clip.scenes ?? 0), 0);
    const maxSilence = clips.reduce((max, clip) => Math.max(max, clip.silenceRatio ?? 0), 0);
    lines.push(`素材段：${clips.length} 段（总时长 ${formatNumber(totalDuration)} 秒 · 最大场景数 `
      + `${maxScenes} · 静音比最高 ${formatNumber(maxSilence)}）`);
  }
  const analysis = summary?.analysis;
  if (analysis) {
    lines.push(`分析点：场景切换 ${(analysis.sceneCuts || []).length} 项 · 静音段 `
      + `${(analysis.silenceSpans || []).length} 段 · 运动分布 ${(analysis.motionHistogram || []).length} 项 · `
      + `响度采样 ${(analysis.loudnessDownsample || []).length} 项`);
  }
  let payloadChars = 0;
  let payloadBytes = 0;
  if (typeof payloadText === "string") {
    payloadChars = payloadText.length;
    try { payloadBytes = new TextEncoder().encode(payloadText).byteLength; } catch { payloadBytes = NaN; }
  }
  lines.push("不含任何画面或音频内容；仅凭字段名与数值摘要生成剪辑建议。");
  return Object.freeze({
    scene: "video-edit",
    limits: VIDEO_EDIT_PILOT_LIMITS,
    lines: lines.map((line) => Object.freeze(line)),
    payloadChars,
    payloadBytes
  });
}
