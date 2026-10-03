# WebWindows Production Battery Broker v1

Production reuses `webwindows-capability-broker-v1`; it does not define a second wire protocol. The only Production-enabled methods are `device.battery.getState` and `device.battery.refresh`. Preview and Production use the same sandbox facade source and Battery result sanitizer. Their trust roots differ.

The Host-owned `data/config/runtime-features-v1.json` gate defaults to `productionCapabilityBrokerV1: false`. Query strings, Source Manifest, Catalog clients, and sandbox code cannot enable it. When enabled, an eligible verified active Manifest v2 / SDK 1 `ProductionBrokerContext` creates one dedicated MessagePort with fresh opaque wire identities. The Host closure binds those identities to the real runtime session, context, and PublishedRelease.

`getState()` is a synchronous sanitized handshake snapshot. Missing declaration, review denial, or unsupported capability never reads Battery state. `refresh()` uses the frozen request/response/cancel protocol, fixed 3000 ms timeout, schema and size validation, quotas, cancellation, and late-result suppression. Before each privileged refresh, the Host re-reads the exact runtime-release authority and requires the release to remain active with identical package, Manifest integrity version/hash, review, publisher, app, version, and approved permissions.

The sandbox remains a unique opaque origin with `connect-src 'none'` and without `allow-same-origin`. It receives only a frozen `WebWindows.device.battery` facade, never Host objects, trust records, Native ABI, arbitrary fetch, or additional capabilities. Stop, reload, navigation, and pagehide close ports, cancel pending requests, and destroy the Context.

The feature gate must remain off for Production traffic until IIS helper execution, quarantine permissions, binary integrity, database migrations/transactions, release endpoints, exact package delivery, and HTTPS browser rollout checks pass.
