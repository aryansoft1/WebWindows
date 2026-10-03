# WebWindows ReviewDecision and PublishedRelease v1

## Scope

Phase 2D.2 changes the trust authority for Developer Platform review and publication without changing Package Runtime, the public API, Native Bridge, or the catalog format. The authoritative chain is now:

```text
Submission (mutable workspace/projection)
  -> active passed ServerValidationReport
  -> immutable ReviewDecision
  -> immutable PublishedRelease
  -> existing catalog publication compatibility path
```

`submission.status` remains for compatibility with existing screens and downloads. It is a projection and cannot, by itself, authorize publication.

## Pre-2D.2 approve/publish audit and drift

Before this phase, approve and reject updated `webwindows_function_submissions.status`, `review_note`, `reviewed_by`, and `reviewed_at` in place. A rejected submission could be approved again and an approved submission could be rejected, overwriting the prior result. No immutable decision survived the transition.

The browser publication flow read the active catalog, enhanced the Source Manifest with `catalog`, `package`, the package-runtime entry, iframe window mode, and runtime metadata, then replaced the catalog app with the same `appId`. It POSTed the catalog first and updated the submission to `published` second. Those operations were separate requests and therefore non-atomic. Re-publishing could overwrite a catalog entry by `appId`; no release identity or exact review binding prevented same-version package replacement. Revocation only changed submission status and explicitly did not remove the catalog entry.

Phase 2D.2 retains Manifest enhancement and catalog shape as a compatibility behavior. It does not make catalog data a runtime trust authority; that is Phase 2D.3.

## ReviewDecision v1

`webwindows_review_decisions` is append-only. Each record has an opaque `rvd_...` identity and binds the submission, publisher, app/version, exact package SHA-256, ZIP-root Source Manifest SHA-256, active validation record/report, Manifest and SDK versions, requested/approved/denied permission sets, policy version 1, decision, reviewer authority, review time, and risk summary. Re-review inserts a new row with `supersedes_id`; it never updates or deletes the earlier approved or rejected record.

Both approval and rejection require the active validation to be passed and to match the current package and Source Manifest hashes. Requested permissions are decoded from the stored immutable `ServerValidationReport`, never from the outer Developer API Manifest or the browser. Approved and denied sets are validated as disjoint subsets of requested permissions; denied is calculated as requested minus approved. For Manifest v1 the requested set is empty. For the current Manifest v2 pilot, `device.battery-status.read` can be approved or denied. Review approval does not enable a Production Broker or user grant.

The reviewer identity is the trusted admin session identity in the form `admin:<username>`, plus the numeric existing user id and reviewer type `authorized-reviewer`. Passwords, cookies, session tokens, and API keys are never recorded.

## PublishedRelease v1

`webwindows_published_releases` is append-only. Each record has an opaque `rel_...` identity and copies the exact review, validation, package, Source Manifest, publisher, app/version, Manifest/SDK, approved-permission, policy, and publication facts. Only the latest approved decision for the current active validation and package may create it. A unique `(app_id, app_version)` constraint and an explicit hash check reject both duplicate publication and same-version package replacement.

The base release is created as `active`. Later `delisted` or `revoked` states are append-only rows in `webwindows_published_release_events`; the release row is not rewritten. Revocation is terminal. Delisting and revocation preserve all review, release, and event records.

## Atomic catalog compatibility

The Developer Platform publication endpoint now creates the release, creates the next catalog revision, deactivates the previous catalog revision, and updates the submission projection in one InnoDB transaction on the same connection. A failure rolls back all four database effects. The release insert occurs before the catalog insert inside the transaction, and neither becomes visible before commit.

Phase 2D.3 adds the normalized Catalog-to-release binding and blocks the standalone Function Catalog endpoint from changing release authority. Runtime verification remains intentionally separate.

## Legacy records

Existing `legacy-unverified` publications do not receive synthetic ReviewDecision or PublishedRelease records. A future migration may revalidate, re-review, and publish a verified release. Historical trust is never fabricated.

## Deployment prerequisite

Production rollout still requires real IIS verification that the application-pool identity can execute the validator helper and create/delete quarantine files; the quarantine directory must remain outside the Web root; the helper executable must not be modifiable by the IIS identity; and process execution policy/WScript.Shell must permit the helper. If those conditions fail, validation must move to a worker/service deployment. Local tests do not make this production-ready.
