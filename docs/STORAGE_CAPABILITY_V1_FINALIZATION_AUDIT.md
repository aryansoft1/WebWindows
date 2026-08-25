# Storage Capability v1 Finalization Audit

Status: **Contract Frozen Candidate — real-device validation pending**.

This audit records the evidence required to promote the existing read-oriented
Storage capability from Frozen Candidate to Frozen. It does not add a method,
change Native Bridge v1, or authorize Storage write functionality.

## Contract decision

The v1 Native method set is fixed:

```text
storageListVolumes
storagePickDirectory
storageListDirectory
storageGetMetadata
storageOpenFile
```

Its public scope is an origin-scoped opaque directory volume, directory
selection or same-origin reauthorization, directory listing, metadata, and a
whole-file read of at most `8 * 1024 * 1024` raw bytes. It excludes write,
create, delete, rename, move, mkdir, append, streaming, range reads, file
pickers, create-document, forget/release, and path or URI exposure.

The public `requestPermission` remains a Browser handle permission operation.
On Android it reports the persisted grant; Android reauthorization is
`pickDirectory({ replaceVolumeId })`.

The following schemas are contract-ready:

- Volume: `{ id, name, kind: "directory", permission, source }`.
- Permission: `state`, `readable`, `writable`, `persisted`, and `revoked`;
  boolean fields describe grant facts, not the availability of a write API.
- Metadata: `{ supported, name, kind, size, type, lastModified, readable,
  writable, path, source }`; unknown values are `null`, while zero is a real
  size or timestamp value.
- Paths: safe, relative `string[]`; no empty segment, dot segment, slash,
  backslash, NUL, URI, drive-path, or coercion/normalization.
- Native open result: `{ metadata, base64 }`; public result:
  `{ metadata, data: ArrayBuffer }`.

Metadata for `getMetadata(volumeId, [])` is supported on both adapters: it is
the selected directory handle/tree root with `path: []`, `kind: "directory"`,
and `size`/`type` as `null`. A provider whose root name is unsafe is rejected;
it is not silently renamed.

## Browser and Android parity

| Concern | Browser File System Access | Android SAF | Public result |
| --- | --- | --- | --- |
| Persistence | IndexedDB-held directory handle | persisted URI permission plus private preferences | opaque ID only |
| Reauthorize | replace the handle, preserve same ID | replace origin-scoped URI, preserve same ID | same identity behavior |
| Revocation | handle permission becomes non-readable | persisted grant is absent | listed volume remains, operations reject |
| Unknown metadata | browser may supply reliable file values | provider may omit size/type/time | nullable fields, no invented value |
| Read limit | pre-check and post-read ArrayBuffer check | metadata pre-check and stream hard limit | 8 MiB raw maximum |
| Unsafe child name | reject listing | reject listing | no sanitization or path exposure |

The intentional platform semantic differences are permission prompting
(Browser can request handle permission; Android needs picker reauthorization)
and provider metadata quality. They do not alter the public schema. Android
may return a temporarily unavailable/revoked provider as a Storage error rather
than inventing metadata; Browser similarly exposes actual handle permission.

## Identity, migration, and lifecycle

Android mappings are keyed by `(exactOrigin, opaqueVolumeId)`. The only allowed
origins are `https://www.y0.hk` and `https://y0.hk`; neither can list, read, or
replace the other's volume. A successful same-origin replacement retains the
ID, replaces the private URI/handle and display name, and updates the returned
permission state. Cancellation and a failed picker leave the previous mapping
unchanged. A foreign or unknown ID is rejected before launching the picker.

Legacy unpartitioned `uri.<id>` preferences have no trustworthy owner. They are
intentionally not listed or adopted by either origin. After upgrade, the user
selects the directory again and receives a newly generated opaque ID; no unsafe
automatic migration, ID reuse, or cross-origin inference is attempted. Legacy
private metadata can remain until an explicit future host-maintenance policy is
separately designed. Reauthorization of a *v2 origin-scoped* ID preserves that
ID and does not create a duplicate volume.

One Android Activity owns at most one picker operation. Active, navigated, and
timed-out operations all block a second picker. Navigation/close marks the
operation stale and drops its reply proxy; a late callback only consumes the
tombstone and must not take a grant, change a mapping, or reply to another
page. This behavior is contract-ready in automated lifecycle tests, but needs
real-device confirmation for the OS picker lifecycle and UX duration.

## Real-device validation checklist

### SAF provider and payload matrix

Run the following for DocumentsUI/Downloads, local shared storage, Google Drive
when installed, and any other available DocumentProvider. Record whether size,
MIME type, and modification time are present or `null`.

- Root, nested directory, zero-byte, 1-byte, UTF-8, binary/NUL, 7.9 MiB, exact
  8 MiB, 8 MiB + 1, and substantially larger file.
- Confirm exact 8 MiB succeeds; larger files fail `storage-file-too-large` and
  do not cause a visible crash, OOM, or page-side oversized decode.
- Exercise empty, dot, dot-dot, slash, backslash, NUL, Unicode, emoji,
  combining-character, and very long provider names. An unsafe returned name
  must reject the listing; it must never be silently sanitized.

### Origin, restart, and revocation

1. At `https://www.y0.hk`, authorize directory A and record its ID.
2. At `https://y0.hk`, confirm A is absent; authorize B.
3. Return to each origin and verify list, metadata, open, and reauthorize see
   only their own mapping.
4. Restart the Runtime and repeat the checks.
5. Revoke a persisted grant where the device/provider permits it. Confirm the
   volume remains listable, operations reject, and explicit same-origin
   reauthorization restores the existing v2 ID.

If the device cannot revoke a persisted grant manually, record that limitation
rather than claiming the scenario was verified.

### Picker races and independent upload picker

- Start a Storage picker on page A, navigate to page B, complete the old picker,
  and verify no grant/mapping/reply is produced; then verify a subsequent picker
  works after tombstone consumption.
- Repeat with user cancel, Home/background/resume, and rotation/recreation when
  the launcher configuration permits it.
- Leave the picker open past the 120-second deadline, then choose a directory:
  the stale result must be discarded and must not answer a later request. Record
  whether the tombstone remains busy longer than acceptable UX permits.
- Verify `<input type="file">` still uses its independent `ACTION_OPEN_DOCUMENT`
  / `ValueCallback<Uri[]>` path before, during, and after Storage cancellation.

### Launcher regression

Manually verify production URL loading, startup/loading sequence, HOME launcher,
Battery (including charging), Network/Wi-Fi, Display brightness, Audio volume
and physical-key refresh, Storage list/read, HTML upload, cache/offline, and
update flow. These are manual real-device checks; the Node and JVM suites are
automatic regression checks.

## Promotion criteria

Storage v1 may be marked **Frozen** only after the fixed method set, schemas,
permission/path/error semantics, 8 MiB limit, dual-origin isolation,
same-origin reauthorization identity, stale callback disposal, Browser/Android
parity, and regression suite are confirmed, together with the real-device
matrix above. Until then the correct label is **Contract Frozen Candidate —
real-device validation pending**.

No remaining source-level production defect was identified by this audit. The
remaining work is evidence gathering and, only if that evidence exposes a
specific defect, a separately scoped minimal finalization fix.

## Dreama Runtime v1 readiness

`runtime`, `battery`, `network`, `display`, `audio`, and read-oriented
`storage` form a sufficient minimum cross-platform capability baseline. A future
Windows Runtime can map them respectively to runtime identity, Windows
power/battery status, connectivity, current-runtime-window display control when
available, a deliberately scoped media/session or system-volume policy, and a
folder picker backed by origin-scoped opaque tokens. This is a readiness
assessment only: it does not create a Windows/WebView2 project or expand any
existing contract.
