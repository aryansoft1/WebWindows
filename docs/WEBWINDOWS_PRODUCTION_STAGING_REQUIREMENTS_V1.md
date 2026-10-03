# WebWindows Production-like Staging Requirements v1

This is the provisioning contract for repeating Phase 2F. It does not make staging ready, does not authorize production deployment, and does not enable `productionCapabilityBrokerV1`.

## 1. Isolation and identity

Staging must use a separate IIS application, application pool, database/schema clone, validator quarantine, package repository/test prefix, and test app-ID namespace. It must not publish real Store releases or mutate production trust records. Required accounts are one staging developer, two independent staging admins for concurrency, and one ordinary staging user. Credentials remain in the approved secret store and evidence must redact them.

Record the Windows host, IIS site/application ID, application-pool name and service identity, database name, public staging origin, TLS termination point, package prefix, test app-ID prefix, deployment owner, rollback owner, and maintenance window.

## 2. Supported host baseline

- Windows Server 2019 or 2022 with IIS 10.
- Classic ASP and IIS URL Rewrite 2.1 enabled.
- A dedicated 64-bit application pool with `enable32BitAppOnWin64=false`; do not mix x86 COM/ODBC components.
- .NET Framework 4.6.2 runtime or later; .NET Framework 4.8 is the preferred verified host.
- `WScript.Shell` may launch only the absolute configured Validator helper. The helper has a 30-second self-timeout; host process controls must also permit termination and cleanup.
- HTTPS certificate valid for the recorded staging origin. HTTP is bound only to verify redirect/rejection behavior.

## 3. Database and ODBC baseline

The Phase 2F rerun baseline is MySQL 8.0 with InnoDB and `utf8mb4`, accessed by a 64-bit MySQL Connector/ODBC 8.0 Unicode driver from the 64-bit IIS pool. The exact installed driver name and version must be recorded from the 64-bit ODBC registry and must match `WEBWINDOWS_DB_CONNECTION_STRING`. A different server/driver version requires a new compatibility finding; installing an arbitrary ODBC driver is not sufficient.

`WEBWINDOWS_DB_CONNECTION_STRING` is an IIS worker process secret. It must not be committed, logged, returned to clients, placed in the artifact manifest, or supplied via request data. The staging database principal needs normal application DML only after migration. Migration and backup/restore use separate operator identities and secure MySQL `--defaults-extra-file` files.

The local Phase 2F crash is classified as an environment mismatch: the application requested a driver name absent from both local ODBC architectures, while a different Connector version existed only in the 64-bit registry. No unsafe connection lifecycle was found in the endpoint code. This finding remains open until the prescribed staging bitness/driver combination serves real Classic ASP database requests without worker faults.

## 4. Filesystem layout and ACL

Provision three non-overlapping absolute paths:

```text
Web root             deployment-owned site content
Trusted Validator    external executable directory
Validator quarantine external transient data directory
```

Set IIS process environment variables:

```text
WEBWINDOWS_VALIDATOR_EXECUTABLE_PATH=<absolute external exe path>
WEBWINDOWS_VALIDATOR_QUARANTINE_PATH=<absolute external directory>
```

The application rejects relative paths, absent paths, Web-root paths, a Validator inside quarantine, and missing configuration. There is no `App_Data` fallback.

ACL requirements:

| Identity | Web root | Validator executable/directory | Quarantine |
| --- | --- | --- | --- |
| IIS worker | Read required site content; no upload-to-executable path | Read + Execute; no Write/Modify | Create/Read/Write/Delete; no Execute |
| Anonymous/public identity | No filesystem discovery beyond served content | No direct access | No access |
| Deployment identity | Controlled artifact replacement | Controlled replacement | Administrative cleanup only |

Run `tools/Test-WebWindowsValidatorDeployment.ps1` and retain its JSON plus `icacls`/effective-access evidence. Then execute valid, invalid, concurrent, crash, timeout, and worker-recycle validation cases and prove quarantine cleanup.

## 5. HTTPS and proxy topology

Production canonical admin origin remains `https://www.y0.hk`. Direct IIS TLS is the default topology. Application security ignores `Forwarded`, `X-Forwarded-Proto`, and `X-Forwarded-Host`; an untrusted client cannot turn HTTP into a secure request by spoofing them.

If TLS terminates at a trusted reverse proxy, re-encrypt proxy-to-IIS traffic so IIS still observes `{HTTPS}=on`, restrict the IIS binding/firewall to the proxy, and record the proxy identity. Do not enable generic forwarded-header trust. A different staging origin is allowed only with both process variables below and an approved staging-only IIS redirect overlay; wildcards are forbidden:

```text
WEBWINDOWS_DEPLOYMENT_ENVIRONMENT=staging
WEBWINDOWS_ADMIN_STAGING_ORIGIN=https://exact-staging-host[:port]
```

Capture the public URL, TLS termination point, IIS `HTTPS`, Host, Origin, Referer, Sec-Fetch-Site, and all forwarded headers for accepted and rejected cases. HTTP GET/HEAD under `/SystemManager` must redirect to the configured canonical HTTPS origin. HTTP mutations and all `/admin_api/*`, `/developer_api/*`, `/api/runtime-release.asp`, and `/api/function-package.asp` requests must return 403 without replaying a body. HTTPS must emit HSTS, CSP, frame-ancestors/X-Frame-Options, and Referrer-Policy as applicable.

## 6. Explicit database migration

No Developer/Admin/Catalog/Runtime trust request contains `CREATE TABLE` or `ALTER TABLE`. Requests require the exact successful checksummed row for `001_webwindows_trust_schema`; missing or drifted history fails closed.

Use a secure MySQL defaults file and run:

```powershell
tools/Invoke-WebWindowsTrustMigration.ps1 -Action Check  -Database <clone> -DefaultsFile <secure-path>
tools/Backup-WebWindowsTrustDatabase.ps1 -Database <clone> -DefaultsFile <secure-path> -OutputDirectory <backup-dir>
tools/Invoke-WebWindowsTrustMigration.ps1 -Action Apply  -Database <clone> -DefaultsFile <secure-path>
tools/Invoke-WebWindowsTrustMigration.ps1 -Action Verify -Database <clone> -DefaultsFile <secure-path>
```

Migration order is filename order. Applied rows record migration ID, SHA-256, timestamp, and `success=1`. Changed applied SQL is checksum drift and fails. DDL may auto-commit in MySQL, so history is written only after structural verification; absence of history after failure means deployment is incomplete and application requests remain denied.

## 7. Backup and restore rehearsal

Before migration, create a single-transaction, hex-blob backup of all developer, submission, package, validation, review, release, release-event, Catalog-binding, and migration-history tables. Store it outside Web root, verify it is non-empty, retain its SHA-256 sidecar, and record server/binlog coordinates under the operator policy.

On a disposable isolated clone: record trust-table counts and selected immutable identity hashes; apply a deliberate test-only destructive change; run `Restore-WebWindowsTrustDatabase.ps1` with `-ConfirmIsolatedStaging` and the expected SHA-256; run migration `Verify`; then compare submissions, validations, ReviewDecisions, PublishedReleases, release events, Catalog bindings, and migration history to the pre-change record. Never run this restore protocol against production from the repository task.

## 8. Artifact deployment verification

Regenerate the frozen manifest from a clean approved checkout. Run `Test-WebWindowsArtifactDeployment.ps1` against staging before deployment and retain mismatches as the rollback baseline. Deploy by the authorized identity, then rerun it and require every `site-root:/` artifact to match; partial key-file checking is not acceptable. Verify external Validator bytes separately against its manifest hash and ACL contract.

Environment-specific values are limited to IIS bindings/certificates, the exact staging origin overlay, process environment values, database secret configuration, and external filesystem paths. They are not package or request inputs and are never added to the frozen source Manifest.

## 9. Cookie and session protocol

Using a real browser plus an HTTP capture with redacted values:

1. Start with a new cookie jar and record the pre-auth ASP session identifier.
2. Authenticate over HTTPS and verify the authority/CSRF rotation contract; record whether the ASP session identifier rotates. If it does not, treat fixation resistance as failed until the IIS/application session strategy is corrected.
3. Confirm `Secure`, `HttpOnly`, and approved `SameSite` behavior on every session cookie.
4. Verify a valid same-session CSRF mutation succeeds, a token from another session fails, a stale pre-auth token fails, and cross-origin Origin/Referer and Sec-Fetch-Site cases fail.
5. Log out, replay the old cookie/token, and require authentication failure.
6. Attempt iframe embedding and stored/reflected payload fixtures; require frame and encoding protections.

Do not replace this protocol with mocked headers in repository tests.

## 10. Required Phase 2F rerun evidence

The rerun requires provisioning inventory, clean manifest hashes, TLS/HTTP captures, process environment names with values redacted, ODBC/app-pool bitness evidence, Validator/ACL checker JSON, migration check/apply/verify output, backup/restore hashes, two-uploader and two-reviewer concurrency traces, authenticated browser/session/CSRF captures, complete submission-to-Runtime audit IDs, tamper/revoke/delist/emergency-disable results, performance measurements, and rollback results.

Until all evidence is attached: `stagingReady=false`, `productionVerified=false`, Phase 2F remains blocked, limited rollout is forbidden, and `productionCapabilityBrokerV1` remains false.
