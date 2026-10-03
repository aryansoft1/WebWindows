# WebWindows Server Package Validation v1

Status: Phase 2D.1 implemented for new Developer submissions. This does not enable Production Broker or change Package Runtime.

## Current upload facts

- `developer_api/v1.asp` stores the ZIP as `webwindows_function_packages.package_blob` in MySQL; the database row is the quarantine store.
- Upload accepts 22 bytes through 10 MiB and checks ZIP signatures `PK\x03\x04`, `PK\x05\x06`, or `PK\x07\x08`.
- MySQL `LOWER(SHA2(package_blob,256))` computes the stored-byte SHA-256 and checks the optional expected upload digest.
- Submission request `appId`, `version`, and outer `manifestJson` were historically independent sources. Admin review read these fields plus package size/hash and status. Catalog publication was a separate browser-driven catalog merge.

## Trusted validator

`server-tools/developer-package-validator` is a .NET Framework 4.6.2 helper compatible with the current Windows/IIS host. It has no third-party runtime dependency. Classic ASP writes package bytes and the compatibility outer Manifest only to the external directory configured by `WEBWINDOWS_VALIDATOR_QUARANTINE_PATH`, launches the exact helper configured by `WEBWINDOWS_VALIDATOR_EXECUTABLE_PATH`, reads its JSON report, then deletes all transient files. Both paths are trusted IIS process configuration, must be absolute and outside the Web root, and have no Web-root fallback. The helper never executes package content, bounds validation to 30 seconds, and fails closed if configuration or validation is unavailable.

The helper independently loads `manifest-v1.schema.json`, `manifest-v2.schema.json`, `permissions-v1.json`, and `package-runtime-policy-v1.json`. ZIP-root `manifest.json` is the authority. Outer Manifest and request app/version are expected-value compatibility inputs only.

Checks include central/local directory consistency, encrypted/unsupported methods, overlapping data ranges, duplicate and case-colliding paths, encoding, traversal/absolute/drive/NUL paths, symlink/special entries, path/file/size/ratio limits, extension allowlist, decompressed CRC, entry existence/type, Manifest v1/v2 resolution, v2 SDK/permission declarations, published-only fields, ES Modules, external resources, private API references, and static network diagnostics.

## Records and status compatibility

`webwindows_submission_validations` is append-only/versioned by validation attempt and binds the complete JSON report to submission, developer, package SHA-256, Source Manifest SHA-256, and validator version. `webwindows_function_submissions.active_validation_id` selects the current report. Replacing ZIP bytes clears that pointer and always creates a new record.

The existing submission review state remains compatible. A separate `validation_status` maps package validation:

```text
not-validated → validating → validated | validation-failed
```

Existing `published` rows are marked `legacy-unverified`; they are not silently promoted to verified and remain downloadable. New approval or publication requires an active passed report whose package hash equals the current stored ZIP hash. Admin listing can view the report and cannot approve a failed/unvalidated submission.

The authenticated numeric developer ID becomes `publisherId` in the report. API Keys remain request authentication only and never enter helper arguments or reports.

## Deployment

The source project and reproducible Release artifact are committed. Rebuild with:

```text
dotnet build server-tools/developer-package-validator/WebWindows.DeveloperPackageValidator.csproj -c Release
```

Deploy the contents of `server-tools/developer-package-validator/runtime/` to an external trusted executable directory. Grant the IIS application identity read/execute but no write/modify permission there, and create/read/write/delete permission only in a separate external quarantine directory. The anonymous identity receives no quarantine access. Set the two process environment variables to those exact paths and recycle the application pool. Verify paths and ACLs with `tools/Test-WebWindowsValidatorDeployment.ps1`; never grant write access to the helper executable or place quarantine below the Web root.
