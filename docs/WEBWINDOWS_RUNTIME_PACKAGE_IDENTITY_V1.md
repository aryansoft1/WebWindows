# WebWindows Production Runtime Package Identity v1

Phase 2D.4 binds production execution to the immutable `PublishedRelease` selected by the active Catalog release binding. Catalog JSON, App Registry cache, query parameters, and response headers are hints or transport metadata; none is package-identity authority.

## Verified route

`package-runtime.html?release=rel_…&appId=…&version=…&entry=…` first calls the read-only `/api/runtime-release.asp`. The server joins `webwindows_published_releases`, its immutable ReviewDecision, the current `webwindows_function_catalog_versions` row, and `webwindows_catalog_release_bindings`. Every duplicated binding fact must equal the release record. Optional app/version query hints must match.

The package endpoint's release route joins the package by `PublishedRelease.submission_id` and exact `package_sha256`. It does not select the newest package for an app/version. The browser computes SHA-256 from the downloaded bytes before calling JSZip; transport SHA headers cannot override this result.

After the ZIP passes SHA verification, the frozen ZIP structural policy still applies. The runtime reads only root `manifest.json`, decodes strict UTF-8, hashes its RFC-8785/JCS-compatible canonical JSON, checks app/version/Manifest/SDK identity, and verifies that release-approved permissions are a subset of the v2 Source Manifest request. The root manifest determines the entry; a catalog entry hint must match it.

Only then does the host create an immutable, session-memory `VerifiedRuntimePackageIdentity` and continue through the unchanged CSP and unique-origin iframe sandbox. The identity, hashes, publisher/review data, approved permissions, and trust state are never injected into the sandbox.

## Compatibility and status

- `active`: may create a verified session.
- `delisted`: no longer discoverable, but an existing exact release launch reference may continue under the frozen compatibility rule. The current association model has no trusted server-side installed-package ledger, so Phase 2D.4 does not claim stronger installed ownership evidence.
- `revoked` and `security-blocked` (if present): cannot create a new session.
- no `release` parameter: the previous app/version route remains `legacy-unverified`. It receives no verified identity, Broker, or SDK facade.
- built-in system apps retain their existing trusted model outside Package Runtime.

Production Capability Broker, persistent grants, consent UI, and production SDK facade remain disabled. Native Bridge v1 and the public WebWindows API are unchanged.

Stable runtime errors are `release-not-found`, `release-not-active`, `release-binding-mismatch`, `package-integrity-failed`, `manifest-integrity-failed`, `manifest-identity-mismatch`, and `runtime-release-verification-failed`. User UI does not expose database details, review notes, package contents, or full expected/actual hashes.
