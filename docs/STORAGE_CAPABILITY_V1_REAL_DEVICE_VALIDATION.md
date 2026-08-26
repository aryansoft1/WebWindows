# Storage Capability v1 — Android Real-device Validation Record

Status: **validation preparation only**. This document records evidence for the
existing Frozen Candidate contract. It does not change the public API, Native
ABI, Native Bridge v1, RuntimeInfo, or production behavior.

## Current device baseline

- Android 15 tablet; Android System WebView `151.0.7922.170`.
- Launcher commit `746ff3369d35fbe755900adef558261dc28ba5c7`.
- Debug APK SHA-256
  `749A4B349A9C04A312E1120D48605721CC8449E3D5DEDB9111471D588A16C247`.
- Production Storage provider SHA-256
  `5318CB616D738DB2BF207338EB488601BAB6C4C7383A91BA8D604477DF5263E4`;
  asset token `20260825-storage-2`.
- SAF provider label in this record: Android system local-storage picker. No
  provider authority or authorization identifier is recorded.

## Contract lock

- Native Bridge v1 is **Frozen**.
- Battery, Network, Display, and Audio contracts are unchanged.
- Storage v1 is **Frozen Candidate**, not Final/Frozen.
- Storage write, streaming, and forget/release are unsupported.
- The maximum read is exactly **8,388,608 raw bytes**.
- Volumes use opaque IDs and exact-origin isolation.
- Public results must never expose URI, filesystem path, document ID, or
  provider authority.

Use `https://www.y0.hk` as origin A and `https://y0.hk` as origin B. For every
case, record Android version, WebView version, launcher build, provider name,
origin, test-file hash/size, result time, and evidence path. Mark **Actual**
and **Status** only during the run: `Pass`, `Fail`, `Blocked`, or `N/A`.

## Evidence legend

- **Capture**: screenshot or screen recording.
- **API record**: redacted console/inspection record containing public result or
  error code only; never record a `content://` URI.
- **System record**: Android settings/provider view used to establish grant or
  revocation state.
- **Log observation**: optional filtered launcher log; redact URI/path/provider
  identifiers before attaching it.

## Matrix

| ID | Case and precondition | Steps | Expected / failure code | Automated evidence | Required device evidence | Actual | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RD-01 | SAF picker success; trusted A, no active picker | Call `pickDirectory`, select readable directory | One A-scoped opaque volume; no URI leak | Contract/lifecycle smoke | Capture + API record | Android 15; WebView 151.0.7922.85; Launcher `6c6480a`; Android SAF local-storage UI; origin A; fixture N/A. At 2026-08-25 17:41:30 +09:00, picker resolved to one redacted opaque `directory` volume (`source:android-saf`); grant was readable/persisted, and `listVolumes()` changed 0→1. Public records contained no URI/path/provider identifier. Evidence: operator-local picker capture + redacted CDP API record in this validation task. | Pass |
| RD-02 | Picker cancel | Open picker, press Back/Cancel | `user-cancelled`; no record changes | Cancellation path smoke | Capture + before/after list | Same environment/provider/origin as RD-01; fixture N/A. At 2026-08-25 17:43:38 +09:00, Back/Cancel rejected with public code `user-cancelled`; `listVolumes()` remained 1→1. Evidence: operator-local picker observation + redacted CDP before/after API record in this validation task. | Pass |
| RD-03 | Picker busy; keep first picker open | Issue second picker request | Second rejects `picker-busy`; first remains sole operation | `StoragePickerStateTest`/lifecycle smoke | API record + capture | Same environment/provider/origin as RD-01; fixture N/A. Second concurrent request rejected in 92 ms with public code `picker-busy`; first picker remained active, then user cancellation returned `user-cancelled`; `listVolumes()` remained 1→1 (completed 2026-08-25 17:44:32 +09:00). Evidence: operator-local picker observation + redacted CDP API record in this validation task. | Pass |
| RD-04 | Picker then navigation; A and B pages available | Open on A, navigate to B, finish old picker | B receives no result; no grant/mapping persisted; later picker works after callback | Tombstone lifecycle smoke | Screen recording + before/after lists | Re-tested on Android 15 / WebView 151.0.7922.170 with Launcher `746ff33` and production Android SAF provider. With A=4 and B=1 at the controlled baseline, an A picker selected a previously ungranted directory only after navigation invalidated its generation: A remained 4→4, B remained 1→1, and neither origin listed the stale target. Reauthorization stale-result testing preserved the existing `WebWindowsValidation` mapping and created no target mapping. No old public result/event reached B; a subsequent picker opened normally and cancellation returned `user-cancelled` with A unchanged. No URI/path/provider identifier or opaque ID was recorded. Evidence: operator-local picker captures + redacted CDP/API records in this validation task. | Pass |
| RD-05 | Timeout/late callback | Leave picker open past host deadline, then select | Old result discarded; no grant/reply; note whether tombstone blocks until callback | Timeout state and bootstrap smoke | Timed recording + API record | Current device baseline; origin `https://y0.hk`; 2026-08-25. Valid run started at epoch ms `1787656289864`; native deadline was `1787656404864`; public JS rejection arrived after 120,172 ms with `timeout`. A late successful picker result returned after 129,487 ms but emitted no Storage event and created no mapping: origin counts stayed 4→4 and the comparison origin stayed 1→1. A subsequent picker opened normally and cancellation returned `user-cancelled`, again with no count change. The earlier attempt invalidated by the device's screen timeout is not evidence. Fixture N/A. Evidence: operator-local timed picker observation + redacted CDP/API record in this validation task. | Pass |
| RD-06 | Exact-origin isolation | A authorizes dir A; B lists/reads/reauthorizes; B authorizes dir B; return A | Each origin sees and operates only own volume; foreign ID is not found | Origin-key/lifecycle smoke | API records for list/metadata/open/reauthorize | Current device baseline; Android system local-storage picker; origins `https://y0.hk` and `https://www.y0.hk`; 2026-08-25. Each origin authorized and read its own 17-byte `probe.bin`: SHA-256 `3A353FBF3ACDDCAD2D8C5C8BBD9571769373523FE9AE19A345FF3F3089ADA4F9` and `933351E871C67DF7C6905EEF4E5864411E03694EA1907746A0FD4043E2A3292A`. In both directions the foreign opaque ID was absent from `listVolumes()` and metadata/open/replace each rejected `storage-volume-not-found`; list counts were unchanged. One origin already had an independently authorized same-name directory, but strict ID comparison confirmed it was not the foreign mapping. Evidence: operator-local picker observations + redacted CDP/API records in this validation task. | Pass |
| RD-07 | Persisted grant restore | Authorize, force-stop/restart launcher | Same origin restores v2 volume and remains readable | Unit policy coverage | Capture + API records before/after restart | Current device baseline; Android system local-storage picker; origin `https://y0.hk`; 2026-08-25. Before force-stop the origin listed 2 volumes. After a real Launcher force-stop and restart it again listed the same 2 volumes; an in-memory comparison (no ID logged or persisted) confirmed the complete opaque-ID set was unchanged. The restored 17-byte fixture remained readable with SHA-256 `3A353FBF3ACDDCAD2D8C5C8BBD9571769373523FE9AE19A345FF3F3089ADA4F9`. Evidence: operator-local restart observation + redacted CDP/API before/after record in this validation task. | Pass |
| RD-08 | Revoked grant | Authorize then revoke through available system/provider control | Volume stays listable; list/read/metadata reject permission-revoked; reauth is possible | Error-path/provider smoke | System record + API records | Current device baseline; Android system local-storage picker; origin `https://y0.hk`; 2026-08-25. Android App Info exposed ordinary permissions, storage/cache, and force-stop controls but no per-app persisted SAF-grant manager; the available Android activity command interface likewise exposed no URI-grant revoke operation. Clearing app data would also delete mappings, and editing internal state or deleting a directory would not be a genuine persisted-grant revoke, so none was performed. No public error code was fabricated. Evidence: operator-local Android settings inspection + redacted command-capability check in this validation task. | Blocked |
| RD-09 | Same-origin reauthorize | Existing A v2 volume | `pickDirectory({replaceVolumeId:id})`, select a directory | Same opaque ID; name/handle/grant reflect selection; cancel preserves old mapping | Browser unit parity; Android state tests | Before/after API record + capture | Current device baseline; Android system local-storage picker; origin `https://y0.hk`; 2026-08-25. Cancel path returned `user-cancelled`, kept count 2→2, preserved the original opaque ID/name, and retained the original 17-byte fixture hash `3A353FBF3ACDDCAD2D8C5C8BBD9571769373523FE9AE19A345FF3F3089ADA4F9`. Success path selected `WebWindowsReauthA`, kept count 2→2, returned the exact same opaque ID, updated the public name/handle, and read the new 17-byte fixture with SHA-256 `9CE744CDA9753638D6515372E2494BEBBF3F7D806689A9E4B083A3C469428200`. Evidence: operator-local picker observations + redacted CDP/API records in this validation task. | Pass |
| RD-10 | Multiple SAF providers | DocumentsUI/Downloads, local shared storage, Google Drive if installed, other available provider | Same public schema; unavailable fields become `null`, not invented | Schema/validator smoke | Provider-labelled records | Current device baseline; origin `https://y0.hk`; 2026-08-26. Tested (1) Android system local shared-storage picker with `WebWindowsReauthA`, (2) the Downloads location through the same local DocumentsProvider with `WebWindowsDownloadsRD10`, and (3) the already configured Google Drive provider with a dedicated empty `WebWindowsValidationRD10` directory created through the standard picker UI. All returned an opaque non-platform ID, `kind:directory`, granted readable/writable persisted permission, and `source:android-saf`; root metadata and `listDirectory()` conformed to the public schema. Downloads returned one 27-byte `text/plain` file and exact read SHA-256 `2555411BF3479D951C9B0CB2A638FEBF9EF57903101F95A5B2FA59FA6A19AD28`; Drive returned an empty list. Drive/provider roots that Android marks unselectable were not treated as failures; the dedicated subdirectory was selectable. No other natural provider was shown, and none was installed for the test. No private provider/account/file name or authorization identifier is retained. Evidence: operator-local picker observations + redacted CDP/API records in this validation task. | Pass |
| RD-11 | Root directory metadata | Authorized volume | `getMetadata(id, [])` | Directory metadata, `path: []`, size/type `null` | Provider schema smoke | API record | Current device baseline; Android system local-storage picker and Google Drive; origin `https://y0.hk`; 2026-08-26. Local public object: `{supported:true,name:"WebWindowsReauthA",kind:"directory",size:null,type:null,lastModified:<non-negative integer>,readable:true,writable:true,path:[],source:"android-saf"}`. Drive returned the same schema and null directory size/type for the dedicated validation directory. Display names were safe; no native/provider-private identifier appeared. Evidence: redacted CDP/API records in this validation task. | Pass |
| RD-12 | Nested directory | Directory with nested child | List and metadata at nested relative path | Safe relative `string[]`; correct child path | Browser/provider smoke | API record | Current device baseline; Android system local-storage picker; origin `https://y0.hk`; 2026-08-26. `listDirectory(volumeId,["nested"])` returned normal `child.txt` and safe Unicode `雪.txt`, each with the exact two-segment public path `['nested',name]`, `kind:file`, size 21, `type:text/plain`, non-negative `lastModified`, boolean readable/writable, and `source:android-saf`. Passing each returned path back to `getMetadata()` reproduced the same child. No absolute/slash-joined path was exposed. Fixture SHA-256 values: `A3039E1845782E687508166638BC72215AE33884897C6C3D85543B9B790357C4` and `156879F07EDCAFC0F9AA91742B7BC4249B0F8BFE31C9C30A08E8966BC684E9B6`. Evidence: redacted CDP/API records in this validation task. | Pass |
| RD-13 | File metadata | Known file | `getMetadata(id,[name])` | `kind:file`; non-negative known values or `null` | Metadata contract smoke | API record | Current device baseline; Android system local-storage and Downloads locations; origin `https://y0.hk`; 2026-08-26. Normal file metadata reported `supported:true`, the correct safe name and segment path, `kind:file`, exact fixture sizes (21 and 27 bytes), `type:text/plain`, non-negative integer `lastModified`, boolean readable/writable, and `source:android-saf`. Known sizes matched the raw bytes and the Downloads read hash. No tested file provider returned unknown nullable metadata in this block. Evidence: redacted CDP/API records in this validation task. | Pass |
| RD-14 | Directory metadata | Known directory | `getMetadata(id,[name])` | `kind:directory`, size/type `null` | Metadata contract smoke | API record | Current device baseline; Android system local-storage picker; origin `https://y0.hk`; 2026-08-26. `getMetadata(volumeId,["nested"])` returned `{supported:true,name:"nested",kind:"directory",size:null,type:null,lastModified:<non-negative integer>,readable:true,writable:true,path:["nested"],source:"android-saf"}`. Root directories from local, Downloads, and Drive likewise kept size/type null; no directory was assigned a file byte size. No naturally exposed unsafe child name was observed during RD-10～RD-14. Evidence: redacted CDP/API records in this validation task. | Pass |
| RD-15 | Zero-byte file | Empty file | Open file | Empty `ArrayBuffer`; size `0`, not `null` | Data-contract smoke | API record + file fixture hash |  |  |
| RD-16 | UTF-8 file | UTF-8 fixture | Open and decode at page | Exact bytes/text are returned | Browser/read smoke | Fixture hash + API record |  |  |
| RD-17 | Binary/NUL file | Binary fixture containing NUL | Open and compare bytes/hash | Exact bytes; no text coercion | Base64/read contract smoke | Fixture hash + API record |  |  |
| RD-18 | Exact 8 MiB | File exactly 8,388,608 bytes | Open file | Success; byteLength exactly 8,388,608 | Native read-limit unit test | Size/hash + API record |  |  |
| RD-19 | 8 MiB + 1 | File of 8,388,609 bytes | Open file | `storage-file-too-large`; no page oversized decode | Native stream-limit smoke | Size/hash + API record |  |  |
| RD-20 | Provider `SIZE == null` | Provider/file for which `OpenableColumns.SIZE` is absent/null | Metadata size is `null`; bounded actual stream still decides read | Nullable metadata smoke | Provider observation + API record |  |  |
| RD-21 | Unknown modification time | Provider reports `lastModified == 0` or no reliable time | Public `lastModified:null` | Metadata policy unit test | Provider observation + API record |  |  |
| RD-22 | Large ContentResolver stream | File substantially larger than 8 MiB, including provider with unknown SIZE if possible | Native stops over limit; no crash/OOM; `storage-file-too-large` | `StorageReadPolicy` test | Timed recording + optional redacted log |  |  |
| RD-23 | HTML upload regression | Page with `<input type=file>` | Upload success/cancel work before/during/after Storage picker states; no callback cross-talk | Separate request-code lifecycle smoke | Screen recording + upload result |  |  |
| RD-24 | HOME Launcher regression | Normal production launch | HOME/loading sequence returns and Storage actions do not disrupt it | Device experience smoke (web) | Capture |  |  |
| RD-25 | Device capability regression | Usable battery/network/display/audio conditions | Verify battery/charging, Wi-Fi/network, brightness, volume and physical-key refresh | Dedicated capability suites | Capture + API records |  |  |
| RD-26 | Cache/update regression | Normal production build URL | Verify cache/offline and update flow | Existing web regression suites | Capture + version/result record |  |  |

## Unsafe provider-name probe

Where a provider can expose such entries, test empty name, `.`, `..`, slash,
backslash, NUL, Unicode, emoji, combining characters, and a long name. Unicode
that remains a safe single segment is valid. Any unsafe child/root name must
make the operation fail; it must never be silently sanitized into a different
addressable name. Current implementation reports an availability-style native
failure before public schema reconstruction rather than fabricating a uniform
entry. Record the exact public code observed; do not reclassify it in this
validation document.

## What automation covers

Automated tests demonstrate the fixed method set, schemas, canonical Base64,
metadata/payload consistency, 8 MiB stream guard, Browser reload before
replacement-ID lookup, origin-key construction, picker tombstone/busy/cancel
logic, timeout state, stale callback ordering, and independent HTML upload
request-code handling. Website suites additionally cover Runtime, Battery,
Network, Display, Audio, device experience, and Storage provider contracts.

Automation cannot establish real `DocumentProvider` metadata quality, Android
permission revocation UX, activity/background/rotation behavior, actual picker
callback timing, persisted grants across a real process restart, OS memory
behavior, physical controls, cache/update, or production launch behavior.
RD-01 through RD-26 therefore retain a real-device evidence requirement even
when an automated column exists.

## Readiness and diagnostic limits

The current code/docs/tests support all matrix operations through the public
Device API and existing launcher behavior. No production diagnostic hook is
required to execute them. The only environment limitation found during
preparation is that this workstation lacks `JAVA_HOME` and `java`, so Gradle
JVM tests/debug assembly cannot be rerun here until a JDK is supplied. This is
an environment/test-runner limitation, not a Storage contract failure.

For provider or lifecycle failures, preserve public error code plus redacted
capture. Do not add URI logging or a debugging API solely for validation.

## Freeze gate

Do not promote Storage v1 to Final/Frozen until the applicable rows pass,
including dual-origin isolation, restart/reauthorization identity, stale
callback disposal, revoked-grant behavior, 8 MiB boundary, provider variability,
HTML upload isolation, and Launcher regressions. A blocked row must include its
device/provider limitation and does not become a pass merely because automatic
tests passed.
