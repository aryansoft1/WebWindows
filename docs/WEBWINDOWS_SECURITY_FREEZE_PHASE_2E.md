# WebWindows Phase 2E Security Freeze

Status: audited release candidate; Production Broker feature gate remains off. Audit start: branch `codex/WebWindows-开发者工具`, HEAD `4171eea7c4b356f7a95ef610f1c2e2ebf610138d`, 2026-08-31.

## Frozen security baseline

- Source Manifest integrity: `webwindows-source-manifest-integrity-v1`, version 1.
- Manifest contracts: legacy v1 and explicit v2; Production facade requires v2 plus SDK API `1`.
- Broker wire protocol, method registry, error registry, permission decision and ProductionBrokerContext: v1.
- Feature authority: `data/config/runtime-features-v1.json`; `productionCapabilityBrokerV1` is `false` and cannot be overridden by URL, Manifest, Catalog, storage, message, iframe name, fragment, or sandbox code.
- The complete Production method allowlist is `device.battery.getState` and `device.battery.refresh`.
- The complete source-declarable permission allowlist is `device.battery-status.read`.
- No Storage, FileDialog, Native, Shell internal, network, runtime, display, or audio capability is enabled.

| Contract | Frozen version |
| --- | --- |
| Manifest | v1 legacy / v2 explicit |
| Source Manifest integrity | 1 |
| ServerValidationReport | schema 1 |
| ReviewDecision | schema 1 |
| PublishedRelease | schema 1 |
| CatalogReleaseBinding | schema 1 |
| VerifiedRuntimePackageIdentity | 1 |
| ProductionBrokerContext | 1 |
| Capability Broker protocol/method/error/policy | 1 |
| PermissionDecision / permissions registry | 1 |

Final local release-candidate evidence: Validator `f5946c677486d92ec468f89a61879cd825592797b1756a667ea86ddd14cf1b4d`; Production Broker bundle `224ed27b85e1fc48ac1058a8267d0a2e6b94af6205fb61e2b3919915ec2d410d`; Package Runtime `e8101b84264400e046b60c33f22b4302887ec10a25a5ac050b807d8b74d30513`. The Broker bundle produced the same SHA in three consecutive builds.

Release-candidate hashes are recorded in the rollout checklist after every reproducible build. A change to any frozen hash, contract version, method, permission, CSP, sandbox token, or feature default requires a new audit.

## Authority matrix

| Fact | Single authority | Projections/checks that are not authority |
| --- | --- | --- |
| Source Manifest | ZIP root `manifest.json` | Studio form state and outer submitted Manifest |
| Requested permissions | Verified ZIP-root Source Manifest | Catalog, Review UI and sandbox claims |
| Package hash | Server Validator result promoted into immutable PublishedRelease | Upload filename, Catalog URL and client metadata |
| Publisher | Authenticated developer plus app ownership, promoted into PublishedRelease | Manifest publisher strings and sandbox identity |
| Approved permissions | Latest applicable immutable ReviewDecision bound to exact validation/package | Catalog JSON and client permission selection |
| Release identity | Immutable PublishedRelease | query string and App Registry cache |
| Catalog binding | Normalized release-bound catalog revision row | visible Catalog JSON projection |
| Runtime actual bytes | Runtime SHA-256 of downloaded response | response headers alone and Catalog hash |
| Runtime Manifest | Strictly parsed ZIP-root `manifest.json` plus JCS hash | outer Manifest and Catalog projection |
| Effective permissions | Host-created ProductionBrokerContext intersection | sandbox, Manifest alone, Review alone or capability alone |
| Runtime capability | trusted Host Public Device API | sandbox capability claims |
| Current release status | authoritative runtime-release lookup | startup Context cache and Catalog status |
| Sandbox identity | none | session IDs, permission strings, messages and local objects are never authority |

No fact has two independent authorities. PublishedRelease and normalized Catalog binding preserve facts from their upstream authority; they do not permit independent edits.

## Adversarial results

Identity substitution is rejected for app ID, publisher, ReviewDecision, release, package SHA, Manifest SHA/integrity version, policy version and runtime session/channel. Catalog/query values are hints only; runtime-release plus actual ZIP verification decide execution.

Exact ZIP bytes are the release identity. Changed JavaScript, changed Manifest, timestamp/metadata changes, alternate compression, truncation, appended data and concatenated/duplicate central directories either fail the server ZIP policy or produce a different SHA and fail Runtime verification against an existing release. Local/central path disagreement and entry collision fail closed.

Manifest canonicalization follows the version-1 JCS contract:

- `1`, `1.0` and `1e0`; property/nested-property reorder; escaped versus literal valid Unicode; escaped slash; CRLF/LF and insignificant leading/trailing JSON whitespace produce the same semantic canonical digest.
- exponent thresholds, `-0`, large doubles, smallest subnormal and surrogate pairs have cross-JavaScript/C# vectors.
- duplicate keys, including escape-equivalent keys; BOM; invalid UTF-8; unpaired surrogates; malformed numbers; trailing non-whitespace bytes and invalid JSON reject before canonicalization.

Removing `manifestVersion: 2` makes a package v1. It cannot retain SDK/permission authority, cannot inherit v2 approval and never receives Production facade.

Review approval is an exact package/Manifest/submission/validation binding. Approved permissions must be an exact-string subset of requested permissions. Latest ReviewDecision by append-only ID is the applicable decision; a later deny supersedes an earlier approve. Rejected, stale-validation, changed-package or mismatched-policy reviews cannot publish.

Legacy packages remain `legacy-unverified` even if they contain Manifest v2, permissions, SDK fields, cached Catalog data or feature query parameters. A release query switches to the verified path and must independently satisfy the complete PublishedRelease chain; it is not an upgrade assertion.

## Broker terminal and failure semantics

Each valid refresh reserves rate/concurrency capacity before server I/O, then performs an authoritative release and feature-gate check before Public API dispatch and again before response delivery. Each check is bounded by the Broker request timeout and passes an AbortSignal to Host fetch. Timeout, HTTP failure, malformed/partial payload, missing field, unknown state, DB failure, integrity-version drift or gate-off returns no privileged result and maps publicly to `policy-denied` or the sandbox's bounded `request-timeout`; it never falls back to startup state.

If revocation commits before the response-delivery check completes, the Broker discards the Public API result and returns `policy-denied`. If revocation commits after the final authoritative check, the already-completed response may be posted; the bounded stale window is only the local check-to-MessagePort delivery interval. There is no TTL cache. Emergency gate disable is checked on every privileged request. An already-delivered synchronous `getState` snapshot cannot be retracted, but gate disable prevents new Host reads and refresh results.

Malformed, wrong-version, wrong-session/snapshot/channel, oversized, cyclic, unexpected-field, wrong-method, duplicate-ID, response/event injection, cross-session cancel, late result and closed-port messages fail closed or are ignored according to Broker v1. Authority checks in progress count against concurrency limits. Preview Console and Broker init protocols/ports are distinct.

The sandbox facade is a frozen sandbox-owned object. Mutation, prototype replacement, `defineProperty`, constructor traversal, call/apply/bind, serialization, reference replacement and fake port initialization cannot expose or modify Host authority. The application may create its own `WebWindowsNative`-named object, but it has no Host identity or transport.

## Findings by severity

### Critical

None found.

### High — fixed in Phase 2E

1. Duplicate JSON properties could be interpreted with last-value-wins behavior before JCS. Fixed with strict pre-parse duplicate/BOM/Unicode validation in Studio, Server Validator and Runtime.
2. Concurrent uploads for one submission could cross-bind Validator A with stored package B. Fixed with a submission-scoped database advisory lock covering read, replacement, validation and final binding.
3. A release revoked while Battery refresh was executing could receive a stale success. Fixed with response-delivery revalidation.
4. A hanging initial authority lookup was outside the Broker timeout. Fixed with bounded, abortable authority checks.

### Medium — fixed in Phase 2E

1. Rate/concurrency enforcement occurred after authority lookup and could amplify server load. Capacity is now reserved before lookup.
2. Server ZIP preflight accepted trailing bytes and ambiguous duplicate central-directory layout. EOCD, central range and local/central record agreement are now strict.

### High — open rollout blocker

1. Admin state-changing endpoints rely on authenticated admin session/username but have no frozen CSRF token or Origin/Referer enforcement contract. The feature gate must remain off outside a controlled staging/limited rollout until this is addressed or a compensating same-site reverse-proxy control is independently verified.

### Medium — accepted only for limited rollout

1. Catalog JSON validation uses Classic ASP string/regex projections rather than a strict structured JSON parser. The normalized binding row and Runtime exact release verification prevent privilege escalation, but malformed display projection remains possible. A future server JSON parser should make the Catalog projection exact.
2. Trust tables rely heavily on application checks and unique indexes rather than complete foreign-key/immutable-trigger coverage. Staging migration, InnoDB transaction and rollback tests are mandatory.
3. Real IIS process policy, validator quarantine ACL, MySQL concurrency and HTTPS behavior cannot be proven by repository smoke tests and remain deployment acceptance gates.

### Low / informational

- Successful refresh performs two feature-config reads and two release lookups. This is intentional for zero-cache revocation semantics. A future TTL requires a documented maximum stale privilege window and an emergency-revoke bypass; no TTL is authorized now.
- Bundle output is deterministic in three consecutive local builds. Deployment must still verify the recorded binary hashes.

## Browser acceptance

| Scenario | Project code | Facade | Privileged result | Final outcome |
| --- | --- | --- | --- | --- |
| Authorized Production Battery | yes | yes | state + refresh | success |
| Tampered ZIP | no | no | no | package integrity failure |
| Changed Manifest | no | no | no | Manifest identity failure |
| Review denied | yes | yes | no | `policy-denied` |
| Revoked during refresh | yes | yes | no refresh result | `policy-denied` |
| Legacy escalation/query injection | yes, compatibility only | no | no | `TypeError` on absent facade |
| Feature-gate query injection | yes | no | no | `TypeError` on absent facade |
| Cross-session fake MessagePort init | yes | legitimate facade only | legitimate result only | fake port ignored |
| CSP/network/storage/parent escape | yes | yes when authorized | Battery only | origin `null`; network `TypeError`; storage/parent `SecurityError` |
| Emergency gate disabled after launch | yes | existing facade/cache | no new refresh result | `policy-denied` |

`sandbox.WebWindows` is never the Host `window.WebWindows`. ProductionBrokerContext and VerifiedRuntimePackageIdentity remain `undefined` in sandbox.

## Freeze conclusion

The code-level chain demonstrates that unreviewed, altered, revoked, legacy or ambiguous code cannot reach the privileged Battery Public API. Limited Production rollout remains blocked by the Admin CSRF contract and by completion of the deployment checklist. The feature gate remains false.
