# WebWindows Phase 2F Production Deployment Rehearsal Report v1

Date: 2026-08-31

Source baseline: `d9df03440ac929f7656556486574652bd01e58e9`

Decision: **BLOCKED / NOT PASSED**

Production mutation: **none**

`productionCapabilityBrokerV1` after rehearsal: **false**

This report records only observed evidence. Public production was probed read-only. No release was uploaded, no database was changed, no rollout was started, and no result below should be interpreted as production approval.

## A. Target environment and scope

The public origin `https://www.y0.hk` was usable only for a read-only deployed-state baseline. No isolated production-like IIS/Classic ASP/MySQL staging hostname, application-pool identity, database clone, test accounts, TLS operator access, or backup/restore authority was supplied. The local host has IIS 10 and .NET Framework 4.8, but no compatible MySQL server and no installed ODBC driver matching the application's configured driver. It therefore does not qualify as the requested rehearsal target.

Both x64 and x86 IIS Express served static files and the gate-off configuration. A request reaching a Classic ASP database route terminated the worker/connection; Windows recorded `0xc0000374`. This is diagnostic evidence of an incompatible local host, not evidence about production behavior.

## B. Frozen artifact manifest and provenance

`data/deploy/production-rehearsal-manifest-v1.json` pins 39 release-candidate artifacts by relative deployment target, byte count, role, and SHA-256. `tools/build-production-rehearsal-manifest.mjs` deterministically regenerates it. The manifest explicitly says that operator-supplied target evidence is required and that it is not independently deployable.

The public deployment manifest does not list the Phase 2 Runtime, Broker, validator, Runtime feature configuration, Runtime release API, admin security helper, or SDK contract artifacts. Public probes found the production Broker bundle, Runtime feature file, Runtime release endpoint, and Manifest v2 schema absent. The deployed Package Runtime and package-runtime page also differ from the frozen local hashes. This is expected for a feature not rolled out, but it means the public host cannot be used to claim a Phase 2F pass.

## C. Database migration, backup, and restore

**Blocked.** Phase 2 tables and columns are currently created or altered lazily in ASP request paths. There is no versioned, operator-applied migration artifact with preflight, idempotency record, rollback plan, or restore checkpoint. No target MySQL version, clone, binary log position, backup, or restoration authority was available. Transaction rollback, advisory-lock release, append-only role enforcement, and point-in-time recovery were not executed on a real database.

This must be resolved before deployment: export the current schema, create a reviewed forward migration, run it against a disposable production-like clone, capture pre/post schema hashes, exercise rollback and restore, and keep application traffic off the migration path.

## D. IIS identity, ACL, and quarantine

**Blocked.** The current validator writes ZIP, outer Manifest, and report files to `Server.MapPath("../App_Data/developer-validation")`. Although IIS normally treats `App_Data` as non-served, it is still inside the site root and does not satisfy the frozen requirement for a quarantine location outside the Web root. The helper executable is also deployed below the site root. Actual application-pool identity, modify/execute ACLs, deny-execute quarantine ACL, inherited permissions, and script immutability could not be verified.

Do not guess these paths in application code. The target deployment must provide an explicit non-Web-root quarantine path, a pinned helper path, and least-privilege ACL evidence. The worker may create/read/delete quarantine data but must not modify scripts or the helper; quarantine content must not execute.

## E. Validator helper behavior

Repository tests freeze command construction, server-side validation, cleanup attempts, and fail-closed report handling. Target-host evidence is still missing for process policy, executable launch, crash/hang timeout, worker recycle, antivirus interaction, concurrent submissions, orphan cleanup, and absence of secrets/private paths in logs. A synchronous `WScript.Shell.Run(..., True)` call has no application-level timeout, so hang behavior remains an operational blocker.

## F. HTTPS, session, and cookie baseline

Public HTTPS responds, but `http://www.y0.hk/SystemManager/login.html` returned HTTP 200 instead of redirecting to HTTPS. HSTS was not observed. Consequently HTTPS enforcement and secure-cookie assumptions do not pass. Classic ASP Session cookie flags, reverse-proxy scheme/origin handling, session renewal after authentication, logout invalidation, and session fixation resistance could not be inspected without the target configuration and authorized accounts.

## G. CSRF, clickjacking, and XSS

The repository contract requires POST, a session-bound CSRF token, exact canonical Origin/Referer, JSON Content-Type, Fetch Metadata checks, and security response headers. Local static serving showed the current admin page headers/configuration, but the public login response did not reflect the frozen Phase 2E.1 deployment. No authenticated real-browser state-changing flow was available, so same-origin success, cross-origin failure, stale-token failure, fixation rotation, frame embedding, and stored/reflected XSS cases remain unverified on the target host.

## H. Full submission-to-runtime chain

**Not run.** Developer authentication, deterministic ZIP upload, immutable ServerValidationReport, review decision, PublishedRelease, Catalog binding, exact package delivery, Runtime identity verification, Broker context creation, and Battery-only dispatch require a qualifying staging application and database. No production data was used to simulate this chain.

## I. Transactions and concurrency

**Not run.** The required two-uploader and two-reviewer races, unique app/version publication, losing-transaction rollback, advisory-lock release after worker failure, append-only enforcement, and Catalog revision atomicity need multiple IIS workers and a real InnoDB database. Source-level smoke tests are not substitutes.

## J. Runtime verification

Repository regression tests cover exact PublishedRelease lookup, package SHA, root Manifest/JCS identity, gate-off behavior, opaque sandbox, CSP, and Battery-only allowlisting. Public production lacks the frozen Runtime release endpoint, local Broker bundle, and feature configuration artifact, so no target Runtime verification was performed.

## K. Tamper and substitution cases

Repository tests cover tampered ZIP, root Manifest mismatch, publisher/release/review substitution, legacy/v1 denial, private Native surface exclusion, and unapproved method rejection. These cases were not replayed end-to-end through the target IIS and database.

## L. Revoke, delist, and emergency disable

Repository contracts require fresh release/gate checks and discard responses after revocation. No target release existed to revoke or delist. Emergency disable was not exercised. The checked-in feature gate remains false and query/Manifest overrides remain forbidden.

## M. Rollback and recovery

No deployment occurred, so no destructive rollback was necessary. A real rehearsal still needs: immutable pre-deploy artifact backup, database backup/binlog checkpoint, prior deployment manifest, tested file restore, tested database restore, worker restart, cache invalidation, health probes, and confirmation that the gate is false before and after rollback.

## N. Performance and stability

**Not measured.** Validator latency, ZIP memory pressure, synchronous worker occupancy, concurrent upload behavior, Runtime release lookup latency, Broker refresh quotas, process recycling, and database pool saturation require the target environment. The local database-route worker crash prevents meaningful performance results.

## O. Findings

Critical: **0 observed**. High: **7**. Medium: **2**. Low: **0**.

| ID | Severity | Finding | Required closure evidence |
| --- | --- | --- | --- |
| WWDEP-H001 | High | No qualifying production-like staging target or operator authority | Isolated HTTPS IIS site, app pool, MySQL clone, test accounts, and operator evidence |
| WWDEP-H002 | High | Public production does not contain the frozen Phase 2 release chain | Target manifest/hash verification after an authorized staging deployment |
| WWDEP-H003 | High | HTTP admin login does not redirect to HTTPS | Canonical redirect, HSTS policy, secure-cookie capture |
| WWDEP-H004 | High | Quarantine is site-root `App_Data`; target ACLs are unknown | Non-Web-root quarantine plus `icacls`/effective-access evidence |
| WWDEP-H005 | High | Request-time lazy schema migration; no backup/restore rehearsal | Versioned migration, clone execution, rollback and restore evidence |
| WWDEP-H006 | High | Available local ODBC environment crashes Classic ASP DB routes | Supported driver matrix and successful staging DB smoke test |
| WWDEP-H007 | High | Authenticated browser/session/CSRF/full-chain rehearsal unavailable | Browser evidence and complete audit-linked flow |
| WWDEP-M001 | Medium | HSTS not observed | Approved HSTS header after HTTPS-only verification |
| WWDEP-M002 | Medium | Validator timeout/cleanup/recycle behavior unverified | Forced hang/crash/recycle test with bounded cleanup |

## P. Fixes made in this phase

Only rehearsal tooling and evidence were added: a deterministic artifact manifest generator, a 39-artifact pinned manifest, a machine-readable blocked result, and a smoke test that verifies every byte/hash, required security artifacts, and the false gate. Production Runtime/API behavior, Native Bridge, Studio Preview, installation, Catalog, Store, and database behavior were not modified.

No speculative deployment fix was applied to connection settings, quarantine paths, IIS ACLs, or migrations because the target authorities and environment contract are missing.

## Q. Regression result

All 76 repository JavaScript contract/smoke tests passed. The trusted .NET validator smoke test was run with executable permission outside the restricted sandbox and passed. The new rehearsal-manifest test verifies all 39 pinned artifacts and confirms the feature gate is false. Production Broker was built three times; all three outputs were byte-identical with SHA-256 `224ed27b85e1fc48ac1058a8267d0a2e6b94af6205fb61e2b3919915ec2d410d`. Target-host acceptance remains blocked regardless of these local results.

## R. Release and operations notes

The artifact manifest is evidence, not an upload list for public production. Operators must regenerate it from a clean approved checkout, compare it to the committed version, deploy only to isolated staging, verify every target hash, and attach ACL/database/browser/rollback evidence. Any hash drift requires a new review. Never toggle the Broker gate as part of file deployment; the final state for this phase is false.

## S. Commit evidence

Commit hashes are recorded in the completion response after the evidence and tests are committed. The dirty working tree that predated Phase 2F is intentionally excluded.

## T. Phase 2F decision

**Phase 2F is not complete and cannot be accepted.** The result is blocked by missing target authority and seven High deployment findings. This is not a Security Freeze regression claim; it is a refusal to convert source-level confidence into unsupported production evidence.

## U. Limited rollout decision

**Not eligible.** No limited rollout should begin until all High findings are closed and the entire rehearsal is repeated on the production-like staging target.

## V. Feature gate decision

`productionCapabilityBrokerV1` remains **false**. It must not be enabled by request data, Manifest data, query strings, or this rehearsal manifest.

## W. Capability scope

No second capability is authorized. Battery remains the only frozen pilot surface, and even it is not authorized for production enablement by this report.

## X. Explicit stop point

No Run/Preview change, Capability expansion, Developer Center submission change, install-model change, Native Bridge change, or public API behavior change was made. Work stops at the blocked Phase 2F evidence boundary.

## Required inputs for the next rehearsal attempt

Provide these through approved secure operations channels, not in source or chat logs:

1. An isolated HTTPS IIS/Classic ASP staging origin and canonical-origin configuration.
2. Application-pool identity and permission to collect IIS/Windows/ACL evidence.
3. A disposable production-like MySQL clone, version/ODBC matrix, and backup/restore authority.
4. Non-Web-root quarantine and immutable helper deployment paths.
5. Staging developer/admin accounts and permission to create/delete rehearsal-only records.
6. A rollback owner, maintenance window, previous artifact manifest, and restore checkpoint.
