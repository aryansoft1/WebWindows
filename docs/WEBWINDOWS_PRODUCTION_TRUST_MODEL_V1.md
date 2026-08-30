# WebWindows Production Trust Model v1

Status: contract freeze only. Production Broker, Production SDK facade, consent UI and persistent grant storage remain disabled.

## 1. Trusted Production identity

`appId` is a name, not a complete security identity. A trusted `PublishedAppIdentity` combines the verified ZIP-root manifest identity, publisher ownership, exact package and manifest hashes, release/catalog identity, and package-bound review decision. Field authorities are defined in `data/sdk/published-app-identity-v1.json`; neither the sandbox, API Key nor Native Bridge may assert them.

Preview and Production retain the same `webwindows-capability-broker-v1` wire protocol but use different trust roots. Preview uses `projectUuid + snapshotId + sessionId`; Production uses `publishedReleaseId + packageSha256 + reviewDecisionId + runtimeSessionId`. Production does not acquire a project UUID.

## 2. Package and Manifest trust chain

```text
uploaded ZIP → server SHA-256 → safe extraction → ZIP-root manifest.json
→ schema/package validation → ServerValidationReport → package-bound review
→ approved release → catalog reference → Runtime download and SHA-256 verification
→ PublishedAppIdentity → trusted ProductionBrokerContext
```

ZIP-root `manifest.json` is the only Source Manifest authority. If an outer Developer API manifest is retained temporarily, both documents must parse and be semantically equal after RFC 8785 JSON Canonicalization Scheme serialization; otherwise validation fails. The canonical UTF-8 bytes are SHA-256 hashed as `sourceManifestSha256`.

Package hash, version, canonical Manifest, release or review binding mismatch is an integrity failure. It is not a capability error and prevents creation of any trusted Production Broker context.

## 3. Validation, review and permission ceiling

`ServerValidationReport` records package/manifest hashes, normalized identity, schema and package-policy results, requested permissions, SDK and validator versions, stable diagnostics, and final pass/fail. It contains no secrets, package blob or private server paths and is shared by Developer Center, admin review, publication and audit.

Source Manifest permissions are requests only. Review creates a package/release-bound `ReviewDecision` whose approved permissions must be a subset of requested permissions. The user can narrow but never expand access:

```text
effective = requested ∩ approved ∩ active user grants
```

For a `no-consent` permission, the last term is the trusted policy result rather than a user prompt. Approval never attaches to `appId` forever; a new ZIP/release requires a new bound validation report and review decision.

## 4. Persistent grant and updates

A future `PersistentUserGrant` binds user, app, publisher, permission, origin release/package/review, risk, resource scope, review policy version and grant version. API Keys are submission credentials and never appear in the runtime identity or grant.

- An unchanged permission may inherit only when app and publisher are unchanged, the new release still requests and is approved for it, risk has not increased, scope and policy remain compatible, and the grant is active.
- A newly added permission never inherits another permission's grant; it requires new review and consent when its mode requires consent.
- A removed permission is invalidated and retained as a tombstone for audit.
- Risk increase or resource-scope change requires a new grant.
- Publisher change or ownership transfer invalidates all existing grants and requires re-review and fresh consent.

## 5. Revocation and delisting

Delisting is distribution state, not a security revocation. It blocks discovery/new acquisition while an already verified installed release may continue to start and use still-approved permissions. Release/developer/security revocation blocks new privileged sessions, terminates affected running privileged sessions and makes Broker authorization deny immediately. Permission-only revocation removes that permission without requiring the whole app to terminate. Policy invalidation requires reevaluation. Hash mismatch aborts trust establishment but does not silently delete a legitimate grant; the grant remains unusable for the mismatched package. Invalidated grants are retained as tombstones by default.

The complete event matrix is machine-readable in `data/sdk/review-decision-v1.json`.

## 6. Future ProductionBrokerContext

Before Broker creation, the trusted Host must assemble:

```text
ProductionBrokerContext
├─ PublishedAppIdentity
├─ verifiedPackageHash
├─ requestedPermissions
├─ ReviewDecision / approvedPermissions
├─ applicable user grants or no-consent policy facts
├─ policyVersion
├─ trusted runtime capabilities
└─ opaque runtime session identity
```

Every value comes from verified Host/server/catalog authority. The sandbox receives only the facade and protocol channel.

## 7. Catalog and publisher authority

The existing Function Catalog remains the sole distribution catalog. A future published third-party entry must provide or reference the release ID, package and Source Manifest hashes, Manifest/SDK versions, publisher, review decision/policy, approved permissions and immutable package download identity. Catalog metadata must be checked against downloaded/package-verified identity and cannot override it.

`appId` ownership is bound to an opaque publisher/developer account ID. Review binds the publisher and exact release. Developer revocation affects all publisher releases according to the revocation matrix. Ownership transfer is an explicit security event, not an edit to display metadata, and invalidates grants. API Key rotation has no effect on published identity.

## 8. Current production drift (audit only)

The following are observations, not changes introduced by this contract:

1. `developer_api/v1.asp` accepts an outer `manifestJson` plus separate `appId`/`version`; it performs string-level ID checks and does not establish ZIP-root Manifest authority or canonical equality.
2. Upload computes SHA-256 over the stored package blob and compares a submitted digest, but it does not safely extract/validate package contents or create a structured ServerValidationReport.
3. Admin review verifies a package exists and its stored hash equals submission integrity, but review state has no immutable review-decision identity, requested/approved permission sets, risk data or review policy version.
4. Review/publish state is bound to a submission row, but the Function Catalog is published through a separate request. Submission/catalog/package publication is not one atomic release transaction.
5. `api/function-package.asp` serves the stored SHA-256 via `ETag` and `X-WebWindows-Package-SHA256`; `assets/js/package-runtime.js` downloads the ZIP but does not cryptographically verify those values before extraction.
6. Package Runtime receives `appId`, `version` and `entry` from catalog/runtime query parameters and does not bind them to ZIP-root `manifest.json` or a PublishedAppIdentity.
7. Current submission status supports `revoked`, but there is no separate delisted state, emergency block, permission-only review revocation, running-session termination or Broker revocation propagation.
8. `webwindows_function_ownership` binds `appId` to numeric developer ID, but transfer/revocation/grant invalidation semantics are absent. Developer status controls submission authentication, not a runtime publisher identity record.
9. Current catalog schema can carry package hash/size/download URL through published metadata, but it lacks required release, publisher, canonical Manifest hash, review reference/policy and approved-permission fields.
10. Catalog validation is structural/string-level and does not verify catalog metadata against the published package/review identity. Database catalog publication may also fall back to the JSON system catalog.
11. API Key is correctly used for Developer API authentication, but no separate formal statement currently prevents downstream code from treating it as application identity; this contract now forbids that use.

No production implementation is changed in Phase 2C.5.
