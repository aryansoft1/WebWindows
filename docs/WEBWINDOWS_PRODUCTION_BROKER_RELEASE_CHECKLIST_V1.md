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
- [ ] Admin CSRF token or independently verified same-site Origin/Referer enforcement is active.

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
| `server-tools/developer-package-validator/runtime/WebWindows.DeveloperPackageValidator.exe` | `f5946c677486d92ec468f89a61879cd825592797b1756a667ea86ddd14cf1b4d` |
| `dist-production-broker/production-battery-broker.global.js` | `224ed27b85e1fc48ac1058a8267d0a2e6b94af6205fb61e2b3919915ec2d410d` |
| `assets/js/package-runtime.js` | `e8101b84264400e046b60c33f22b4302887ec10a25a5ac050b807d8b74d30513` |
| `api/runtime-release.asp` | `8c98bd207689ff070ed248ddb793fa57e1ccc31bf738df17bcd261612164b12f` |
| `api/function-package.asp` | `87b6de8e622a82d82d0182ef8a04492591ea8b898a7eddd1361ed37aea6c1c14` |
| `developer_api/v1.asp` | `88665c1ee1e3c7874a4ebc16ff9a4ca3cb7dca0467da10b8207e14d2f33cfb75` |
| `admin_api/developerPlatform.asp` | `b6c073a427cf6190bbffdebcacf19b29d2cd49860724bb29453cea1d55b6caf4` |
