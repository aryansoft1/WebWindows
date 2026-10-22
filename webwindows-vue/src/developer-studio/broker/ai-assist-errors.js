/* Preview-audit pilot error table for the ai.desktalk.requestAssist chain (design doc
 * WEBWINDOWS_DESKTALK_AI_ASSIST_V1.md §9 addendum). These codes are NOT part of
 * data/sdk/capability-broker-errors-v1.json: the stable errors registry stays untouched this
 * round (contract smoke freezes its set) and promoting them requires the per-code review the
 * registry lifecycle demands. Standard denials (invalid-params, method-not-allowed,
 * permission-not-declared, policy-denied, permission-denied, rate-limited, request-timeout,
 * request-cancelled, session-*, protocol-*) continue to resolve through the stable registry.
 */
export const AI_ASSIST_PILOT_ERRORS = Object.freeze(new Map(Object.entries(Object.freeze({
  "assist-rejected-by-user": {
    message: "The host user declined this assist request.",
    retryable: false
  },
  "assist-confirmation-required": {
    message: "The host cannot run the confirmation card for this request.",
    retryable: true
  },
  "desktalk-unavailable": {
    message: "The DeskTalk assist source is not available on this host.",
    retryable: true
  },
  "ai-provider-unavailable": {
    message: "The assist source failed to produce proposals.",
    retryable: true
  },
  "ai-rate-limited": {
    message: "Too many assist requests in a one-minute window (pilot: 6).",
    retryable: true
  },
  "assist-session-limit": {
    message: "One assist request is already in flight for this session (pilot limit).",
    retryable: true
  },
  "payload-schema-invalid": {
    message: "The payload does not conform to the registered scene summary schema.",
    retryable: false
  },
  "scene-not-registered": {
    message: "The requested scene is not registered in the method contract.",
    retryable: false
  }
})).map((entry) => [entry[0], Object.freeze({ code: entry[0], ...entry[1] })])));
