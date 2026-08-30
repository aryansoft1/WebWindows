# WebWindows ProductionBrokerContext v1

Phase 2D.5 constructs a Host-owned, immutable, session-only authorization context after exact production package verification. It does not enable a Broker, MessagePort, SDK facade, Battery method invocation, persistent grant, or consent UI.

`sourceManifestSha256` has one definition across the platform: SHA-256 of UTF-8 RFC 8785/JCS canonical JSON parsed from the unique ZIP-root `manifest.json`. It is not a raw ZIP entry digest. ServerValidationReport creates it; ReviewDecision, PublishedRelease, CatalogReleaseBinding, and runtime-release copy the same value; Package Runtime recomputes it. Cross-implementation regression vectors cover key order, exponent/fixed number formatting, large numbers, Unicode, and escaped characters.

Context construction requires `verified-release`, an exact active release, all release/review/package/Manifest/publisher/policy fields matching, and requested permissions from the verified root Manifest. Server facts supply publisher, review, approved permissions, release state, and package identity. Runtime facts supply verified bytes, verified Manifest declarations, an opaque per-load session identity, and capability detection through the stable Host `window.WebWindows.device` public API. Sandbox claims are never inputs.

`effectivePermissions` is requested ∩ approved ∩ allowed policy ∩ applicable trusted grant ∩ supported runtime capability. The Battery Pilot uses `no-consent` / `not-required`; other consent/grant modes remain ineffective while Production grant authority is absent. An effective permission is only eligibility for a future Broker decision—it does not expose an API today.

Only active releases may receive a privileged context. Delisted packages retain Phase 2D.4 compatibility execution, but receive no context because there is no trusted server-side installed-release ledger. Revoked, security-blocked, legacy, failed verification, and developer-shaped system apps receive no ProductionBrokerContext.

The context and session are destroyed on pagehide/runtime stop. Reload creates new opaque `runtimeSessionId` and `contextId` values. Nothing is stored in localStorage, IndexedDB, cookies, query parameters, iframe datasets, serialized Manifest, or the sandbox. Safe Host diagnostics may record identity counts, effective permission IDs, capability support, context state, and denial reason, but never credentials, review notes, package content, Native transport, or private stacks.
