/* Preview-audit pilot validators for the registered ai.desktalk.requestAssist method and the
 * ai.assist.received event. These hand walks mirror the registry boundaries verbatim:
 *
 *  - parameterSchema / resultSchema / payloadSchema: data/sdk/capability-broker-methods-v1.json
 *    (entries registered verbatim 2026-10-22, round 17; this module never re-defines them)
 *  - video-edit scene summary field caps: docs/WEBWINDOWS_MEDIA_EDITING_APP_SUPPORT_V1.md §7.4.
 *    The doc leaves numeric caps to the platform; the values below are the PILOT cap table and
 *    must be ratified (or adjusted) at the per-method enablement review before any production use.
 *
 * Browser-side brokers cannot rely on a bundled Ajv, so these functions are hand-walked; the
 * JSON machine-readable equivalents exported below are compiled with Ajv in
 * tmp/studio-audit-smoke.cjs to prove the walk and the schema agree (no drift).
 *
 * Audit discipline: validators only parse numbers/shape. Nothing here echoes payload text.
 */

export const AI_ASSIST_METHOD_ID = "ai.desktalk.requestAssist";
export const AI_ASSIST_EVENT_ID = "ai.assist.received";
export const AI_ASSIST_PERMISSION_ID = "ai.desktalk-assist";
export const AI_ASSIST_SCENE = "video-edit";
export const AI_ASSIST_PAYLOAD_MAX_CHARS = 16384;
export const AI_ASSIST_TIMEOUT_MS = 120000;
export const AI_ASSIST_MAX_RESULT_BYTES = 4096;

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]+$/;
const OPAQUE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const PROPOSAL_KINDS = new Set([
  "plan-step", "text-suggestion", "insert-clip", "caption", "cover-copy", "adjustment"
]);

/* Pilot cap table (ratified = false until the enablement review signs it). */
export const VIDEO_EDIT_PILOT_LIMITS = Object.freeze({
  ratifiedByEnablementReview: false,
  clipsMax: 128,
  sceneCutsMax: 256,
  silenceSpansMax: 256,
  motionHistogramMax: 64,
  loudnessDownsampleMax: 64,
  tracksMax: 256,
  fpsMax: 240,
  durationMaxSeconds: 86400,
  dimensionMax: 16384,
  scenesPerClipMax: 65535,
  motionMax: 100,
  silenceRatioMax: 1,
  loudnessMin: -200,
  loudnessMax: 200,
  scoreMax: 10000,
  escapeNote: "opaque clip ids must not carry path semantics (/, \\, .. forbidden)"
});

export function isPlainJsonObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isBounded(value, min, max) {
  return isFiniteNumber(value) && value >= min && value <= max;
}

/* --- registered parameterSchema walk (scene const video-edit, payload string 2..16384, requestId token) --- */
export function validateAiParameters(params) {
  if (!isPlainJsonObject(params)) return "invalid-params";
  const keys = Object.keys(params);
  if (keys.length < 2 || keys.length > 3) return "invalid-params";
  for (const key of keys) {
    if (!["scene", "payload", "requestId"].includes(key)) return "invalid-params";
  }
  if (params.scene !== AI_ASSIST_SCENE) return "invalid-params";
  if (typeof params.payload !== "string"
    || params.payload.length < 2 || params.payload.length > AI_ASSIST_PAYLOAD_MAX_CHARS) {
    return "invalid-params";
  }
  if (params.requestId !== undefined) {
    if (typeof params.requestId !== "string" || params.requestId.length < 1
      || params.requestId.length > 128 || !REQUEST_ID_PATTERN.test(params.requestId)) {
      return "invalid-params";
    }
  }
  return null;
}

/* --- video-edit scene summary (media doc §7.4 + pilot cap table). payload text must parse as JSON --- */
export function parseVideoEditScenePayload(payloadText) {
  if (typeof payloadText !== "string") return { ok: false, code: "invalid-params" };
  let parsed;
  try { parsed = JSON.parse(payloadText); } catch { return { ok: false, code: "payload-schema-invalid" }; }
  if (!isPlainJsonObject(parsed)) return { ok: false, code: "payload-schema-invalid" };
  if (Object.keys(parsed).length !== 2 || parsed.scene !== AI_ASSIST_SCENE) {
    return { ok: false, code: "payload-schema-invalid" };
  }
  const summary = parsed.summary;
  if (!isPlainJsonObject(summary)) return { ok: false, code: "payload-schema-invalid" };
  const summaryKeys = Object.keys(summary);
  if (summaryKeys.length !== 3
    || !summaryKeys.includes("project") || !summaryKeys.includes("clips") || !summaryKeys.includes("analysis")) {
    return { ok: false, code: "payload-schema-invalid" };
  }
  if (!validateVideoEditProject(summary.project)) return { ok: false, code: "payload-schema-invalid" };
  if (!validateVideoEditClips(summary.clips)) return { ok: false, code: "payload-schema-invalid" };
  if (!validateVideoEditAnalysis(summary.analysis)) return { ok: false, code: "payload-schema-invalid" };
  return { ok: true, summary };
}

function validateVideoEditProject(project) {
  if (!isPlainJsonObject(project) || Object.keys(project).length !== 4) return false;
  const limits = VIDEO_EDIT_PILOT_LIMITS;
  if (!isBounded(project.duration, 0, limits.durationMaxSeconds)) return false;
  if (typeof project.fps !== "number" || !Number.isSafeInteger(Math.round(project.fps))
    || project.fps < 0 || project.fps > limits.fpsMax) return false;
  if (!Number.isInteger(project.tracks) || project.tracks < 0 || project.tracks > limits.tracksMax) return false;
  return validateDimensionPair(project.resolution);
}

function validateVideoEditClips(clips) {
  const limits = VIDEO_EDIT_PILOT_LIMITS;
  if (!Array.isArray(clips) || clips.length > limits.clipsMax) return false;
  for (const clip of clips) {
    if (!isPlainJsonObject(clip) || Object.keys(clip).length !== 7) return false;
    if (typeof clip.id !== "string" || clip.id.length < 1 || clip.id.length > 64
      || !OPAQUE_ID_PATTERN.test(clip.id) || clip.id.includes("..")) return false;
    if (!isBounded(clip.duration, 0, limits.durationMaxSeconds)) return false;
    if (!Number.isInteger(clip.scenes) || clip.scenes < 0 || clip.scenes > limits.scenesPerClipMax) return false;
    if (!isBounded(clip.motion, 0, limits.motionMax)) return false;
    if (!isBounded(clip.silenceRatio, 0, limits.silenceRatioMax)) return false;
    if (!isBounded(clip.loudness, limits.loudnessMin, limits.loudnessMax)) return false;
    if (!validateDimensionPair(clip.resolution)) return false;
  }
  return true;
}

function validateVideoEditAnalysis(analysis) {
  const limits = VIDEO_EDIT_PILOT_LIMITS;
  if (!isPlainJsonObject(analysis)) return false;
  const keys = Object.keys(analysis);
  if (keys.length !== 4
    || !keys.includes("sceneCuts") || !keys.includes("silenceSpans")
    || !keys.includes("motionHistogram") || !keys.includes("loudnessDownsample")) {
    return false;
  }
  const { sceneCuts, silenceSpans, motionHistogram, loudnessDownsample } = analysis;
  if (!Array.isArray(sceneCuts) || sceneCuts.length > limits.sceneCutsMax) return false;
  if (!Array.isArray(silenceSpans) || silenceSpans.length > limits.silenceSpansMax) return false;
  if (!Array.isArray(motionHistogram) || motionHistogram.length > limits.motionHistogramMax) return false;
  if (!Array.isArray(loudnessDownsample) || loudnessDownsample.length > limits.loudnessDownsampleMax) return false;
  for (const cut of sceneCuts) {
    if (!isPlainJsonObject(cut) || Object.keys(cut).length !== 2) return false;
    if (!isBounded(cut.t, 0, limits.durationMaxSeconds) || !isBounded(cut.score, 0, limits.scoreMax)) return false;
  }
  for (const span of silenceSpans) {
    if (!isPlainJsonObject(span) || Object.keys(span).length !== 2) return false;
    if (!isBounded(span.t0, 0, limits.durationMaxSeconds) || !isBounded(span.t1, 0, limits.durationMaxSeconds)) return false;
    if (span.t0 > span.t1) return false;
  }
  for (const share of motionHistogram) {
    if (!isBounded(share, 0, limits.motionMax)) return false;
  }
  for (const level of loudnessDownsample) {
    if (!isBounded(level, limits.loudnessMin, limits.loudnessMax)) return false;
  }
  return true;
}

function validateDimensionPair(pair) {
  const limits = VIDEO_EDIT_PILOT_LIMITS;
  if (!Array.isArray(pair) || pair.length !== 2) return false;
  for (const dimension of pair) {
    if (!Number.isInteger(dimension) || dimension < 0 || dimension > limits.dimensionMax) return false;
  }
  return true;
}

/* --- registered resultSchema walk (ticketId, channel const desktalk, expiresAtMs?, status enum?) --- */
export function validateAiTicketResult(result) {
  if (!isPlainJsonObject(result)) return false;
  const keys = Object.keys(result);
  if (keys.length < 2 || keys.length > 4) return false;
  if (keys.filter((key) => key === "ticketId" || key === "channel").length !== 2) return false;
  if (typeof result.ticketId !== "string" || result.ticketId.length < 1 || result.ticketId.length > 128) return false;
  if (result.channel !== "desktalk") return false;
  if (result.expiresAtMs !== undefined
    && (!Number.isSafeInteger(result.expiresAtMs) || result.expiresAtMs < 0)) return false;
  if (result.status !== undefined && !["accepted", "routed"].includes(result.status)) return false;
  return true;
}

/* --- registered event payloadSchema walk (ticketId+proposals; attribution const desktalk-assist) --- */
export function validateAssistEventDetail(detail) {
  if (!isPlainJsonObject(detail)) return false;
  const keys = Object.keys(detail);
  if (keys.length < 2 || keys.length > 3) return false;
  let requiredHit = 0;
  for (const key of keys) {
    if (key === "ticketId" || key === "proposals") requiredHit += 1;
    else if (key !== "attribution") return false;
  }
  if (requiredHit !== 2) return false;
  if (typeof detail.ticketId !== "string" || detail.ticketId.length < 1 || detail.ticketId.length > 128) return false;
  if (detail.attribution !== undefined && detail.attribution !== "desktalk-assist") return false;
  const proposals = detail.proposals;
  if (!Array.isArray(proposals) || proposals.length > 12) return false;
  for (const proposal of proposals) {
    if (!isPlainJsonObject(proposal)) return false;
    const proposalKeys = Object.keys(proposal);
    if (proposalKeys.length < 3 || proposalKeys.length > 4) return false;
    let core = 0;
    for (const key of proposalKeys) {
      if (key === "kind" || key === "title" || key === "body") core += 1;
      else if (key !== "reason") return false;
    }
    if (core !== 3) return false;
    if (!PROPOSAL_KINDS.has(proposal.kind)) return false;
    if (typeof proposal.title !== "string" || proposal.title.length < 1 || proposal.title.length > 80) return false;
    if (typeof proposal.body !== "string" || proposal.body.length > 4000) return false;
    if (proposal.reason !== undefined
      && (typeof proposal.reason !== "string" || proposal.reason.length > 2000)) return false;
  }
  return true;
}

/* --- machine-readable equivalents (Ajv-compiled in tmp/studio-audit-smoke.cjs to guard drift) --- */
export const AI_ASSIST_PARAMETERS_JSON_SCHEMA = Object.freeze({
  type: "object",
  required: ["scene", "payload"],
  properties: {
    scene: { const: AI_ASSIST_SCENE },
    payload: { type: "string", minLength: 2, maxLength: AI_ASSIST_PAYLOAD_MAX_CHARS },
    requestId: { type: "string", minLength: 1, maxLength: 128, pattern: "^[A-Za-z0-9._:-]+$" }
  },
  additionalProperties: false
});

export const AI_ASSIST_RESULT_JSON_SCHEMA = Object.freeze({
  type: "object",
  required: ["ticketId", "channel"],
  properties: {
    ticketId: { type: "string", minLength: 1, maxLength: 128 },
    channel: { const: "desktalk" },
    expiresAtMs: { type: "integer", minimum: 0 },
    status: { enum: ["accepted", "routed"] }
  },
  additionalProperties: false
});

export const AI_ASSIST_EVENT_DETAIL_JSON_SCHEMA = Object.freeze({
  type: "object",
  required: ["ticketId", "proposals"],
  properties: {
    ticketId: { type: "string", minLength: 1, maxLength: 128 },
    attribution: { const: "desktalk-assist" },
    proposals: {
      type: "array",
      minItems: 0,
      maxItems: 12,
      items: {
        type: "object",
        required: ["kind", "title", "body"],
        properties: {
          kind: { enum: ["plan-step", "text-suggestion", "insert-clip", "caption", "cover-copy", "adjustment"] },
          title: { type: "string", minLength: 1, maxLength: 80 },
          body: { type: "string", minLength: 0, maxLength: 4000 },
          reason: { type: "string", minLength: 0, maxLength: 2000 }
        },
        additionalProperties: false
      }
    }
  },
  additionalProperties: false
});

/* video-edit scene summary (media doc §7.4) as a JSON schema, used only for Ajv drift checks. */
export const VIDEO_EDIT_SCENE_JSON_SCHEMA = Object.freeze(buildVideoEditSceneJsonSchema());

function buildVideoEditSceneJsonSchema() {
  const limits = VIDEO_EDIT_PILOT_LIMITS;
  const dimensionPair = {
    type: "array", minItems: 2, maxItems: 2,
    items: { type: "integer", minimum: 0, maximum: limits.dimensionMax }
  };
  const clipSchema = {
    type: "object", additionalProperties: false,
    required: ["id", "duration", "scenes", "motion", "silenceRatio", "loudness", "resolution"],
    properties: {
      id: { type: "string", minLength: 1, maxLength: 64, pattern: "^[A-Za-z0-9][A-Za-z0-9._-]*$" },
      duration: { type: "number", minimum: 0, maximum: limits.durationMaxSeconds },
      scenes: { type: "integer", minimum: 0, maximum: limits.scenesPerClipMax },
      motion: { type: "number", minimum: 0, maximum: limits.motionMax },
      silenceRatio: { type: "number", minimum: 0, maximum: limits.silenceRatioMax },
      loudness: { type: "number", minimum: limits.loudnessMin, maximum: limits.loudnessMax },
      resolution: dimensionPair
    }
  };
  return {
    type: "object", additionalProperties: false,
    required: ["scene", "summary"],
    properties: {
      scene: { const: AI_ASSIST_SCENE },
      summary: {
        type: "object", additionalProperties: false,
        required: ["project", "clips", "analysis"],
        properties: {
          project: {
            type: "object", additionalProperties: false,
            required: ["duration", "resolution", "fps", "tracks"],
            properties: {
              duration: { type: "number", minimum: 0, maximum: limits.durationMaxSeconds },
              resolution: dimensionPair,
              fps: { type: "number", minimum: 0, maximum: limits.fpsMax },
              tracks: { type: "integer", minimum: 0, maximum: limits.tracksMax }
            }
          },
          clips: { type: "array", maxItems: limits.clipsMax, items: clipSchema },
          analysis: {
            type: "object", additionalProperties: false,
            required: ["sceneCuts", "silenceSpans", "motionHistogram", "loudnessDownsample"],
            properties: {
              sceneCuts: {
                type: "array", maxItems: limits.sceneCutsMax,
                items: {
                  type: "object", additionalProperties: false,
                  required: ["t", "score"],
                  properties: {
                    t: { type: "number", minimum: 0, maximum: limits.durationMaxSeconds },
                    score: { type: "number", minimum: 0, maximum: limits.scoreMax }
                  }
                }
              },
              silenceSpans: {
                type: "array", maxItems: limits.silenceSpansMax,
                items: {
                  type: "object", additionalProperties: false,
                  required: ["t0", "t1"],
                  properties: {
                    t0: { type: "number", minimum: 0, maximum: limits.durationMaxSeconds },
                    t1: { type: "number", minimum: 0, maximum: limits.durationMaxSeconds }
                  }
                }
              },
              motionHistogram: {
                type: "array", maxItems: limits.motionHistogramMax,
                items: { type: "number", minimum: 0, maximum: limits.motionMax }
              },
              loudnessDownsample: {
                type: "array", maxItems: limits.loudnessDownsampleMax,
                items: { type: "number", minimum: limits.loudnessMin, maximum: limits.loudnessMax }
              }
            }
          }
        }
      }
    }
  };
}
