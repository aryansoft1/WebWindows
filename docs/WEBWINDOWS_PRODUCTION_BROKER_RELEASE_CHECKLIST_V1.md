# WebWindows Production Broker Release Checklist v1

The gate `productionCapabilityBrokerV1` must remain `false` until every mandatory item is evidenced for the target environment. Critical or High findings reopen the security freeze.

## Frozen artifacts

- [ ] Branch and approved commit are recorded.
- [ ] `productionCapabilityBrokerV1` is false before rollout and cannot be changed by request data.
- [ ] Production methods are exactly `device.battery.getState` and `device.battery.refresh`.
- [ ] Source-declarable permissions are exactly `device.battery-status.read`.
- [ ] Validator EXE SHA-256 matches the approved audit baseline.
- [ ] Production Broker bundle SHA-256 matches the approved audit baseline.
- [ ] Package Runtime, runtime-release and exact-package endpoint hashes match the approved baseline.
- [ ] Three clean Broker builds are byte-identical.

## IIS and host

- [ ] HTTPS is enforced; mixed content and insecure cookies are impossible.
- [ ] Validator helper executable is immutable to the IIS application identity.
- [ ] Quarantine directory grants minimum create/read/delete access and denies execution.
- [ ] Temporary ZIP, Manifest and report names are unpredictable and submission-scoped.
- [ ] `WScript.Shell` process policy permits only the pinned validator command/arguments.
- [ ] Helper timeout and cleanup work for crash, hang and worker recycle.
- [ ] Logs do not contain API keys, cookies, package bodies, Native objects or private filesystem paths.
- [x] Admin CSRF application contract requires a session-bound token, exact Origin/Referer, POST, Content-Type and Fetch Metadata checks.
- [ ] Admin CSRF/canonical-origin behavior, Classic ASP Session cookies and reverse-proxy headers are verified on production IIS/HTTPS.

## Database

- [ ] All Phase 2 trust migrations are applied with `source_manifest_integrity_version=1` for new records; old/default-0 records fail closed.
- [ ] Tables use InnoDB and transaction rollback has been exercised.
- [ ] Unique app/version release and ReviewDecision constraints are present.
- [ ] Submission-scoped upload advisory lock works across IIS workers and releases after error/recycle.
- [ ] Validation records, ReviewDecisions, PublishedReleases and release events are append-only through application roles.
- [ ] Active validation cannot reference another submission/developer/package.
- [ ] Catalog normalized binding row exactly matches the active Catalog revision.
- [ ] Two admins concurrently publishing one app/version yield one trusted release; loser rolls back cleanly.
- [ ] Backup and point-in-time restore are tested before enabling the gate.

## Server endpoints

- [ ] Developer API enforces API-key developer ownership and upload state.
- [ ] Server Validator rejects duplicate JSON keys, BOM, invalid UTF-8/surrogates, unsafe ZIP layouts and policy violations.
- [ ] Runtime-release returns only exact active/delisted immutable release facts and rejects unknown/revoked/incomplete records.
- [ ] Exact package endpoint joins submission ID and SHA to PublishedRelease and emits the release header.
- [ ] Function Catalog fails closed when JSON release references and normalized bindings differ.
- [ ] Timeout, HTTP 500, malformed response, DB unavailable and unknown state tests deny Broker access.

## Runtime and sandbox

- [ ] Local pinned Broker bundle loads before Package Runtime; no CDN or runtime npm fetch exists.
- [ ] Runtime computes exact ZIP SHA before unzip and verifies strict root Manifest/JCS before execution.
- [ ] Manifest v1, legacy, delisted and verification-failed sessions receive no Production facade.
- [ ] CSP retains `connect-src 'none'`, no `allow-same-origin`, opaque origin and local-only rewritten resources.
- [ ] Sandbox receives no Host function/object, trust identity, Native ABI or Shell internal API.
- [ ] Reload, close, pagehide and init failure destroy Context and ports.
- [ ] Each refresh checks gate/release before dispatch and response delivery with bounded AbortSignal.
- [ ] Broker rate/concurrency quotas apply before authoritative server I/O.

## End-to-end acceptance

- [ ] Clean Studio snapshot validates and builds deterministic ZIP.
- [ ] Authenticated owner uploads exact ZIP and receives immutable ServerValidationReport.
- [ ] Authorized reviewer approves only a subset of requested permissions.
- [ ] Publish atomically creates PublishedRelease, Catalog revision and normalized binding.
- [ ] Runtime lookup, package delivery, ZIP SHA and root Manifest checks succeed.
- [ ] Gate-off launch has no facade.
- [ ] Limited gate-on launch exposes Battery only.
- [ ] Tampered ZIP, changed Manifest, substituted release/review/publisher and legacy escalation fail.
- [ ] Revoke during active refresh discards the result; the next call denies.
- [ ] Emergency gate disable prevents new Host Battery refresh/result.
- [ ] Rollback restores gate false and the previous approved local artifacts.

## Recorded release-candidate hashes

Populate from a clean checkout immediately before approval. Repository audit values are security evidence, not a substitute for production host verification.

| Artifact | SHA-256 |
| --- | --- |
| `server-tools/developer-package-validator/runtime/WebWindows.DeveloperPackageValidator.exe` | `b4e566d57c58870a68374c5dee228d1e097e421284ed5f3331bec8172b4c32b5` |
| `dist-production-broker/production-battery-broker.global.js` | `224ed27b85e1fc48ac1058a8267d0a2e6b94af6205fb61e2b3919915ec2d410d` |
| `assets/js/package-runtime.js` | `e8101b84264400e046b60c33f22b4302887ec10a25a5ac050b807d8b74d30513` |
| `api/runtime-release.asp` | `8b43b2fb4884daa6d666549f9bec8f19eeb114825d669b0bd6cb015d954887b5` |
| `api/function-package.asp` | `25e7a962665b2899897d06cc829b6f9bfaa4e7b67caca704758d95b2dea13703` |
| `developer_api/v1.asp` | `70197fbe6a10c58f6afe89ddb5ca8c2486ea3ae5b34003ef3f3f764ad7a98d44` |
| `admin_api/developerPlatform.asp` | `d7e40c261a6d3aca900ef269c600e721b8771cdf2a178501d5a0066ac368b8b1` |
| `admin_api/adminAuth.asp` | `09fbfd68fa4b775186afa3b4b3e6bfcd4f66e56f71030afae2e7b19d35dd144d` |
| `admin_api/functionCatalog.asp` | `e2a2886006f3b147247e01741a83ee1b22a600b6216f7a5add7c79e010c9a586` |
| `inc/admin-security.asp` | `29862e816d9765bc842a28a23e06dc353e2cd64059cd44013a2a6b8d959bf5b5` |
| `SystemManager/assets/js/admin-security.js` | `1e5aebf0095af136205fdf446f5c77567fc94c5a13d48269889e6b6b3c12c140` |
| `web.config` | `0e356b2bd45f665c00bdb0a5854727684214396bf68be5a148dc0de977d0603c` |
