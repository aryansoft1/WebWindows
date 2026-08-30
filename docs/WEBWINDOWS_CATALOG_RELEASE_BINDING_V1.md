# WebWindows Catalog Release Binding v1

## Authority audit

Before Phase 2D.3, `app.id` was the only practical Catalog entry key and each revision stored only a complete JSON blob. The independent Function Catalog page could edit version, entry, advanced JSON, package metadata and catalog state, then directly activate a revision. Developer Platform publication replaced an entry by `appId`. No normalized revision-to-release map existed, and `type`/`install` heuristics were the only system/third-party distinction. This allowed a direct Catalog publication to bypass immutable review/release authority or replace its package fields.

Catalog remains a discovery projection. PublishedRelease is the authority for third-party identity, package/Manifest hashes, review, permissions and package download identity.

## Source and binding model

Entries use three source types:

* `system` / binding `system`: trusted built-in functions; no fabricated PublishedRelease.
* `developer-release` / binding `verified`: references a real immutable PublishedRelease and projects its exact security fields.
* `legacy-third-party` / binding `legacy-unverified`: historical packaged entry without a trust record. It remains compatible and receives no Production Broker trust.

Unclassified built-in seed entries are interpreted as `system`; unclassified entries carrying package metadata are interpreted as `legacy-third-party`. This classification does not synthesize review or release records.

## Revision binding and publication

`webwindows_catalog_release_bindings` records `(catalog revision, appId) -> exact PublishedRelease` plus the projected release fields. Developer Platform generates the opaque release ID on the server and writes that exact ID into the Catalog JSON, PublishedRelease and normalized binding row in one database transaction. A later revision copies existing binding rows and replaces only the explicitly published app binding. Historical revision mappings remain intact.

The independent Function Catalog endpoint rejects direct publication when the active revision contains release bindings and rejects attempts to submit release/package authority fields. This intentionally favors fail-closed behavior: release-backed changes, delisting and revocation go through Developer Platform. System-only Catalog management remains compatible.

## Status projection

Release `delisted` and `revoked` events create a new Catalog revision in the same transaction and set the entry to non-discoverable. They remain distinct in the normalized binding and entry release projection. Runtime enforcement is not introduced here; existing installed behavior remains unchanged.

## Deployment boundary

Package Runtime, runtime SHA verification, Production Broker/facade, grants, consent, Native Bridge and Public Device API are unchanged. Production rollout still depends on real IIS validator-helper execution and quarantine permission verification documented by Phase 2D.1.
