# Dreama Runtime Storage/SAF Capability v1 Contract Design Audit

Status: **contract proposal only**. This document audits the implementation at
website commit `76ce102366ff391db58c322d86ece02d01ca36a9` and Android commit
`61347865e678f5d965271413022ff9c9b876b1cd`. It does not authorize or implement
production Storage changes.

Storage v1 must use the already frozen Dreama Native Bridge v1 envelopes,
versioning, request IDs, structured errors, trusted-origin checks, main-frame
restriction, and navigation lifecycle. `window.WebWindows.device.storage` is
the public API. `window.WebWindowsNative` and Android SAF details remain private.

## 1. Current public Storage API

`window.WebWindows.device.storage` currently exposes:

- `isSupported()`
- `getCapabilities()`
- `getState()`
- `refresh()`
- `listVolumes()`
- `pickDirectory(options)`
- `requestPermission(volumeId, mode)`
- `listDirectory(volumeId, path)`
- `openFile(volumeId, path)`
- `getMetadata(volumeId, path)`

`getState()` is quota-estimate state, not a mounted-volume state:

```js
{
  supported: boolean,
  usage: number | null,
  quota: number | null,
  source: "storage-manager-api" | "unsupported"
}
```

Detailed public capabilities currently include `estimate`, `directoryPicker`,
`persistentHandles`, `read`, and `write`, each shaped as `{ supported, source }`.
There is no public `writeFile`, `mkdir`, `delete`, `rename`, `forgetVolume`, file
picker, or mount/unmount method. Both providers currently advertise
`write.supported: true` even though no public or Native write operation exists;
that is capability drift, not evidence that write belongs in Storage v1.

The existing volume shape is:

```js
{
  id: string,
  name: string,
  kind: "directory",
  permission: {
    state: "granted" | "prompt" | "denied" | "revoked",
    readable: boolean,
    writable: boolean,
    persisted: boolean,
    revoked: boolean
  },
  source: "file-system-access-api" | "android-saf"
}
```

Directory entries and metadata currently use:

```js
{
  supported: true,
  name: string,
  kind: "file" | "directory",
  size: number | null,
  type: string | null,
  lastModified: number | null,
  readable?: boolean,
  writable?: boolean,
  source: "file-system-access-api" | "android-saf",
  path?: string[] // added by the public provider for directory listings
}
```

`openFile()` returns `{ metadata, data: ArrayBuffer }` publicly. No URI, real
filesystem path, Android document ID, provider authority, or browser handle is
returned.

Current consumers are:

- `cloud/browser/device-locations.js`: lists authorized volumes, reauthorizes a
  revoked volume, browses directories, opens files, and creates `device://`
  display addresses. Opened resources are read-only (`edit: false`).
- `assets/js/file-search.js`: recursively searches volume directory metadata,
  with depth and scan-count limits. It does not read file contents.
- Device/cloud integration harnesses and tests.
- `assets/js/desktalk.js` only reports whether directory-picker capability is
  present; it does not perform SAF operations.

The current product therefore needs directory authorization, persistent volume
discovery, directory listing, metadata, and whole-file reads. It does not
currently need Storage writes.

## 2. Current Browser implementation

The Browser provider in `assets/js/device-storage-provider.js` uses:

- `showDirectoryPicker()` from the File System Access API.
- `FileSystemDirectoryHandle` / `FileSystemFileHandle` traversal.
- `File.arrayBuffer()` for whole-file reads.
- IndexedDB structured cloning to persist records containing `{ id, name,
  handle }` when supported.
- An in-memory `Map` as the current-session cache and fallback.
- `queryPermission()` and `requestPermission()` for read/readwrite grants.

It does **not** use `showOpenFilePicker()` and provides no public file picker.
HTML `<input type=file>` behavior is separate from Device Storage. It provides
no write, create, append, delete, rename, or directory-creation operation.

Browser IDs currently have the form `browser-dir-<random UUID>` with a
time/random fallback. IndexedDB is origin-scoped, so handles cannot normally be
reused by another origin. Permission is queried again before each traversal;
persisting a handle does not imply that permission remains granted.

Existing Browser call chain:

```text
WebWindows feature
  -> window.WebWindows.device.storage
  -> WebWindowsStorageProvider browser adapter
  -> File System Access handle
  -> File / ArrayBuffer result
```

Known Browser migration issue: `pickDirectory({ replaceVolumeId })` checks the
in-memory map without first loading IndexedDB records. Immediately after a new
session, reauthorization may therefore allocate a new ID unless another call
has already loaded the handles. Storage v1 must load persistent records before
deciding whether a replacement ID exists.

## 3. Current Android SAF implementation

The Android Launcher currently has two distinct picker paths.

### Web upload picker (not Device Storage)

`WebChromeClient.onShowFileChooser()` launches `ACTION_OPEN_DOCUMENT`, supports
one or multiple results, and resolves the WebView `ValueCallback<Uri[]>`. It
does not take persisted URI permission and does not use `WebWindowsNative`.
This is ordinary HTML file-upload behavior and is outside Storage v1.

### Device Storage directory provider

The private Bridge exposes these existing method names:

- `storageListVolumes`
- `storagePickDirectory`
- `storageListDirectory`
- `storageOpenFile`
- `storageGetMetadata`

`storagePickDirectory` launches `ACTION_OPEN_DOCUMENT_TREE` with read, write,
persistable, and prefix grant flags. `onActivityResult()` validates the returned
read flag, takes the available persisted read/readwrite grant, creates or
reuses an opaque ID, and stores the private URI/name mapping in app-private
`SharedPreferences`.

Other operations resolve the ID internally, verify that a persisted read grant
still exists, traverse with `DocumentFile`, and read through
`ContentResolver.openInputStream()`. Directory listing and metadata use
`DocumentFile`. File reads use a 16 KiB buffer, a `ByteArrayOutputStream`, and
Base64 without line wrapping.

Android currently has:

- `ACTION_OPEN_DOCUMENT`: yes, only for HTML file upload.
- `ACTION_OPEN_DOCUMENT_TREE`: yes, for Device Storage volumes.
- `ACTION_CREATE_DOCUMENT`: no.
- `ActivityResult`: legacy `startActivityForResult/onActivityResult`, yes.
- persisted URI permission: yes.
- `takePersistableUriPermission`: yes.
- `DocumentFile`: yes.
- `InputStream`: yes.
- `OutputStream`: no.
- Base64 file response: yes.
- Native write/create/delete/rename: no.
- Traditional `addJavascriptInterface`: no.
- Storage-specific JS callback interface: no.

Android call chain:

```text
WebWindows feature
  -> window.WebWindows.device.storage
  -> WebWindowsStorageProvider Android adapter
  -> private window.WebWindowsNative method
  -> frozen WebMessage request { version, id, method, params }
  -> MainActivity fixed method dispatch
  -> SAF / SharedPreferences / ContentResolver / DocumentFile
  -> frozen structured response with the same request ID
  -> provider validation/translation
  -> public volume, metadata, or ArrayBuffer result
```

There is no legacy Storage Promise resolver. The asynchronous directory picker
stores a `JavaScriptReplyProxy`, request ID, and optional replacement volume ID
until `onActivityResult()`. The separate HTML upload picker still uses the
standard WebView `ValueCallback` path.

## 4. Current limits and lifecycle

- Normal Bridge methods time out after 8 seconds in the injected bootstrap.
- `storagePickDirectory` has a method-specific 120-second timeout.
- Android allows one pending Storage directory picker; another request returns
  `storage-picker-busy`.
- A file read is whole-file only and limited to 8 MiB of raw bytes. The length
  is checked both before and during reading.
- Android returns Base64 in JSON; the provider decodes it to an `ArrayBuffer`.
- Navigation calls `closeNativeBridge()`, rejects page-side pending Promises on
  `pagehide`, marks the Native lifecycle inactive, and currently clears the
  stored picker reply/request fields.

The 8 MiB raw limit is a reasonable v1 ceiling because Base64 adds roughly 33%
and the operation can simultaneously hold the native byte buffer, Base64 text,
JSON text, WebView/JS string, decoded typed array, and final `ArrayBuffer`.
Storage v1 should remain whole-file only: no offset, range, chunk, or streaming
protocol in v1.

## 5. Security and correctness findings

These findings must be addressed during implementation; this audit does not
change production behavior.

### Critical: Android grants are not origin-partitioned

Android stores all URI mappings in one `device_storage` preference namespace.
Both allowed origins (`https://www.y0.hk` and `https://y0.hk`) can currently list
and use the same mappings. A Storage volume must instead be scoped to the exact
accepted origin. The message listener already knows `sourceOrigin`, but that
origin is not passed into Storage dispatch or persisted with the record.

### High: picker result can be confused across navigation generations

Navigation clears the old pending picker fields. If a new trusted page installs
a Bridge and starts another picker before the old Android activity result is
consumed, the fixed request code and reusable single pending slot provide no
generation/token with which to prove which launch produced the callback. The
old result could be associated with the new pending request.

The fix is not a new Bridge envelope. Native must retain an invalidated
"tombstone" for the active OS picker until its callback is consumed, bind the
request to a monotonically increasing navigation generation and exact origin,
and reject new interactive picker requests as busy while an older OS picker is
still outstanding. A stale callback must only clear its tombstone and must
never persist a grant or reply to a new page.

### High: picker timeout is not coordinated with Native pending state

After 120 seconds the JavaScript Promise times out and removes its request ID,
but Android still holds its pending reply slot. A later selection can persist a
grant and send a response that the page ignores. Until a callback or navigation
occurs, another picker is reported busy. The implementation phase must give
the page timer and Native interactive-operation state one coordinated policy.

### Medium: Native parameter validation is incomplete

The public provider rejects `.`/`..` and slash-containing path segments, but
the Native host treats a missing or non-array `path` as the root, and
`JSONArray.optString()` can coerce non-string elements. Neither side explicitly
rejects NUL. Private ABI validation must independently require an array of
non-empty strings and reject `.`, `..`, `/`, `\\`, NUL, absolute paths, and
malformed parameter types.

### Medium: Storage results are not yet strictly validated in JavaScript

The Android provider largely trusts volume, permission, entry, metadata, and
Base64 result shapes. Base64 decoding coerces missing values to an empty string.
Storage v1 needs validators before cache/UI use or binary decoding.

### Medium: permission errors lose specificity

`postNativeResponse()` currently maps every `SecurityException` to `denied`, so
messages such as `storage-permission-revoked` and
`storage-read-permission-required` do not survive as their original codes.
Storage v1 needs intentional capability error mapping without redesigning the
Bridge error envelope.

### Medium: capability declarations overstate write support

Both public providers advertise `write.supported: true`, and Android
`RuntimeInfo.capabilities.storage` is true, while no write method exists.
Storage v1 must define the boolean as the complete **read-oriented v1** method
set and report detailed public write support as false until a write contract is
separately implemented.

## 6. Proposed opaque volume model

Preserve the existing public volume shape instead of inventing platform fields:

```js
{
  id: "opaque-runtime-generated-value",
  name: "Downloads",
  kind: "directory",
  permission: {
    state: "granted" | "prompt" | "denied" | "revoked",
    readable: boolean,
    writable: boolean,
    persisted: boolean,
    revoked: boolean
  },
  source: "file-system-access-api" | "android-saf" | "windows-runtime"
}
```

Rules:

- `id` is an opaque random capability reference. Existing `browser-dir-*` and
  `saf-*` IDs remain acceptable migration formats; page code must never parse
  the prefix.
- The ID contains no URI, path, filename hash, provider authority, device ID,
  account ID, or hardware identifier.
- The Runtime maps `(exact origin, id)` to its private handle/token/URI.
- The ID is not a credential. Every operation repeats origin, lifecycle,
  permission, volume existence, and path validation.
- IDs are persistent for an origin and Runtime installation when the underlying
  platform can persist the handle/grant. They are not portable between origins,
  browser profiles, Runtime installations, or devices.
- IDs must not be emitted as analytics or used for device tracking. They are
  persistent resource references, not stable device identities.

### Volume lifecycle

1. Create a new random ID only after picker success and successful acquisition
   of the requested platform grant.
2. Persist the private mapping under the exact origin. Browser uses
   origin-scoped IndexedDB; Android must add origin partitioning.
3. On restart, return the same ID if the mapping still exists. Query the real
   permission/grant again; stored metadata is never proof of access.
4. App/profile data clearing destroys the mapping. A later picker creates a new
   ID because the old ID is no longer meaningful.
5. A revoked grant remains listable as `permission.state: "revoked"` so the UI
   can offer reauthorization, but all data operations fail.
6. `pickDirectory({ replaceVolumeId })` may bind a newly selected handle to the
   same origin-scoped ID only when that ID already belongs to the caller's
   origin. Unknown or foreign IDs fail with `volume-not-found`.
7. Storage v1 does not add `forgetVolume`; release/forget requires a later
   public lifecycle design and platform-specific grant-release behavior.

## 7. Proposed relative path model

Keep the existing canonical public representation: an array of relative path
segments. Root is `[]`.

```js
["Documents", "notes", "todo.txt"]
```

Native requests must also use the array form. A slash-delimited string may be
accepted temporarily by the public Browser compatibility layer, but it is not
part of the Native ABI.

For every segment:

- type must be string;
- value must be non-empty and not `.` or `..`;
- `/`, `\\`, and NUL are forbidden;
- absolute paths, drive letters, URI schemes, and platform tokens are invalid;
- the Runtime resolves one exact child at a time beneath the authorized root;
- no normalization may turn an invalid path into a different valid path;
- provider case and Unicode behavior are preserved rather than guessed.

The result can include the same segment array for UI navigation. It must never
include `/storage/...`, `content://...`, `C:\\...`, a document ID, or a provider
authority. Root escape must be impossible by construction.

## 8. Proposed Storage v1 methods

Storage v1 should formalize the five existing private methods rather than add
new methods:

### `storageListVolumes`

Request params: `{}`. Result: `Volume[]`. It returns known origin-scoped volume
records, including revoked records with current permission state.

### `storagePickDirectory`

Request:

```js
{
  writable: boolean,
  replaceVolumeId: string | null
}
```

Success result: one validated `Volume`. `writable: true` requests write access
for future compatibility but does not imply that Storage v1 exposes write
operations. The method must be initiated by an explicit public user action;
the host still enforces one active picker and all trust/lifecycle checks.

Cancellation rejects the Promise with structured code `user-cancelled`. It is
expected user control flow, not a successful volume and not `native-error`.
During migration the Adapter may normalize Browser `AbortError` and existing
Android `storage-picker-cancelled` to the public `user-cancelled` code.

### `storageListDirectory`

Request: `{ volumeId, path: string[] }`. Result: validated metadata entries.
The provider appends each entry name to the requested path for public
navigation.

### `storageGetMetadata`

Request: `{ volumeId, path: string[] }`. Result:

```js
{
  supported: true,
  name: string,
  kind: "file" | "directory",
  size: number | null,
  type: string | null,
  lastModified: number | null,
  readable: boolean,
  writable: boolean,
  source: string
}
```

`size` and `type` are `null` for directories. `lastModified` is `null` when the
provider cannot supply a reliable timestamp. No inode, document ID, absolute
path, ownership, or platform flags are exposed.

### `storageOpenFile`

Request: `{ volumeId, path: string[] }`.

Native result:

```js
{
  metadata: { /* validated metadata */ },
  base64: "..."
}
```

Public result remains `{ metadata, data: ArrayBuffer }`. Storage v1 is a
whole-file read contract with an 8 MiB raw-byte maximum. Zero-byte files are
valid and return an empty Base64 string/zero-length ArrayBuffer. Oversized files
fail before allocation when size is known and again while reading. No offset,
length, chunking, or streaming is included.

### Public `requestPermission`

Retain the current public method. Browser may query/request its handle. Android
returns the current persisted-grant state; reauthorization uses
`pickDirectory({ replaceVolumeId })`. No new Native permission method is needed
for v1.

## 9. Write contract decision

Storage v1 is read-oriented and contains **no `writeFile` method**. Current
WebWindows device-location consumers open resources read-only, and neither
provider has a production write path. Advertising write capability must be
corrected during implementation, but adding speculative writes would increase
data-loss and permission risk.

A later write contract must separately decide and test:

- create-versus-require-existing behavior;
- overwrite/truncate semantics (append should be a separate explicit mode);
- Base64 input validation and raw-byte limit;
- MIME type handling;
- whether the platform can provide atomic replacement;
- cleanup after partial failure;
- write permission revalidation immediately before commit.

Until that design is frozen, `write.supported` must be false even when the
underlying grant is writable.

## 10. Picker state machine, timeout, and concurrency

Only one interactive picker may be active per Runtime Activity/window.

```text
idle
  -> launch(origin, requestId, navigationGeneration)
  -> active
      -> success: validate grant, persist mapping, reply, idle
      -> user cancel: reply user-cancelled, idle
      -> navigation/host close: invalidate reply but retain tombstone
          -> stale OS callback: discard result, clear tombstone, idle
      -> coordinated timeout: reject/expire, retain tombstone until callback
```

A second request while `active` or while an invalidated picker tombstone remains
returns `picker-busy`. A new page can never inherit the old page's reply proxy,
request ID, selected URI, grant, or result.

The current 120-second timeout is method-specific already, proving that picker
policy does not require a new wire field. Storage v1 should keep the frozen
envelope and request IDs, but replace the uncoordinated short timer with one
named interactive-operation policy shared by the bootstrap and Native host. A
10-minute bound is a reasonable implementation candidate, not a wire constant:

- page timeout still rejects with the existing Bridge `timeout` code;
- Native marks the matching `(generation, requestId)` expired;
- the active OS picker result is discarded after expiry;
- its tombstone continues blocking a second picker until the old callback is
  consumed or the host Activity is destroyed.

If implementation cannot coordinate page and Native expiry without altering
the frozen transport, it must stop for a Bridge v1.1 discussion. The audit found
no envelope limitation: the required state can remain entirely inside the
existing bootstrap and host lifecycle machinery.

## 11. Proposed error taxonomy

Bridge errors remain unchanged: `timeout`, `bridge-closed`,
`bridge-unavailable`, `invalid-response`, `unsupported-method`, and
`native-error`.

Storage capability codes should normalize current platform-specific names to:

- `user-cancelled`: user dismissed an interactive picker.
- `picker-busy`: another interactive picker/tombstone is active.
- `volume-not-found`: unknown, deleted, foreign-origin, or invalid opaque ID.
- `permission-required`: a grant can be requested or reauthorized.
- `permission-revoked`: a recorded grant no longer exists.
- `storage-unavailable`: provider/root is temporarily unavailable.
- `path-invalid`: malformed type, segment, traversal, absolute path, or NUL.
- `entry-not-found`: no entry exists at the relative path.
- `not-a-directory`: directory operation targeted a file.
- `not-a-file`: file operation targeted a directory.
- `file-too-large`: raw file exceeds 8 MiB.
- `read-failed`: provider read failed after validation.
- `unsupported`: Runtime/Browser does not implement the requested Storage v1
  operation.

`write-failed` is reserved for a future write contract. User cancellation is a
structured rejected Promise so existing call sites can keep one success shape;
UI should treat it as neutral control flow rather than display a system error.

## 12. RuntimeInfo capability strategy

Keep the simple boolean model:

```js
capabilities.storage: boolean
```

For a Native Runtime, `true` means the complete read-oriented Storage v1 private
method set is implemented:

```text
storageListVolumes
storagePickDirectory
storageListDirectory
storageGetMetadata
storageOpenFile
```

It does not mean a volume is currently granted, a picker is currently
available, permission is writable, or write operations exist. Revocation and
temporary availability remain method/volume state. Public
`storage.getCapabilities()` continues to expose detailed Browser/Native
differences. A nested object inside RuntimeInfo is unnecessary and would break
the consistency of the frozen RuntimeInfo schema.

The current Browser Runtime/storage support calculation is broader than this
definition because namespace/quota support can make Storage appear available
without a usable directory picker. Implementation must distinguish namespace
support from the detailed Storage v1 method set rather than changing the
RuntimeInfo schema.

## 13. Frozen Bridge v1 compatibility

Storage v1 fits the existing Bridge v1:

- Request envelope: unchanged; Storage params remain method-specific objects.
- Success/error envelopes: unchanged.
- Version and request IDs: unchanged.
- Trust model: unchanged, with Storage adding exact-origin partitioning inside
  Native capability policy.
- Navigation lifecycle: existing concept is sufficient, but Native needs a
  generation-bound picker state/tombstone implementation.
- Timeout machinery: existing method-specific timeout mechanism is sufficient
  if coordinated with Native interactive state.
- Event envelope: unused; Storage v1 requires no Native event.
- Large payload: bounded 8 MiB Base64 whole-file transfer fits v1; unbounded
  files or streaming do not.

No Bridge v1.1 change is presently required. Streaming, cancellation messages,
or concurrent interactive operations would require a separate future design,
not an expansion of Storage v1.

## 14. Minimum Storage v1 scope

The minimum scope that formally brings the existing Android SAF behavior behind
Dreama Runtime is:

1. origin-scoped opaque directory volumes;
2. list known volumes and current grants;
3. one-at-a-time directory picker with reauthorization;
4. safe relative-segment directory listing;
5. stable cross-platform metadata;
6. whole-file read up to 8 MiB;
7. strict result/Base64/error validation and lifecycle isolation.

No write, file picker, create, rename, delete, mkdir, forget/release, streaming,
or arbitrary platform path belongs in v1.

## 15. Migration phases

### Phase 1 — boundary and lifecycle hardening

- Partition Android records by exact origin and pass accepted source origin into
  Storage dispatch.
- Replace the reusable pending fields with one generation-bound picker state
  that retains stale tombstones.
- Coordinate interactive timeout and normalize cancellation/busy errors.
- Harden Native params and ensure a stale callback cannot persist a grant.
- Correct detailed `write` capability to false.

Existing public methods and UI remain unchanged. The critical origin/lifecycle
issues must be resolved before calling Storage v1 frozen.

### Phase 2 — identity and result validation

- Load Browser IndexedDB records before replacement-ID decisions.
- Validate volume, permission, metadata, entry, and Base64 schemas in the
  Storage provider.
- Normalize existing platform error names to the public taxonomy.
- Verify grants on every operation and preserve revoked records for reauth.

### Phase 3 — formalize picker and volume contract

- Freeze picker success/cancel/busy/navigation behavior.
- Add migration tests for existing Browser/Android opaque IDs.
- Confirm no public URI/path/token exposure and no cross-origin reuse.

### Phase 4 — formalize list/metadata/read

- Freeze canonical path arrays and entry metadata.
- Enforce the 8 MiB raw-byte limit and malformed Base64 handling.
- Run zero-byte, binary, UTF-8, maximum, oversized, revoked, and isolation tests.

### Future phase — separately design writes and volume release

Do not add writes or forget/release behavior until their data-loss,
authorization, atomicity, and compatibility contracts are independently frozen.

There is no legacy Android Storage bridge to remove: SAF already uses the
private WebMessage Bridge. The standard HTML upload `ValueCallback` remains a
separate Web platform feature.

## 16. Future test matrix

### Picker and lifecycle

- picker success creates one origin-scoped opaque ID;
- picker cancel normalizes to `user-cancelled`;
- second picker returns `picker-busy`;
- navigation invalidates the old reply but retains a tombstone;
- late old result cannot persist a grant or reach the new page;
- new page cannot receive an old request ID/result;
- coordinated timeout expires both page and Native request state;
- host close/activity destruction safely ends the request;
- replacement preserves an existing same-origin ID;
- foreign-origin replacement is rejected.

### Grants and identity

- persisted grant and ID restore after restart;
- Browser replacement loads IndexedDB before ID lookup;
- revoked grant remains listable but unreadable;
- reauthorization binds the same ID;
- unknown/invalid/foreign-origin volume ID fails;
- app/profile data clear makes old ID unknown;
- IDs expose no URI, path, document ID, filename hash, or device identifier.

### Paths and metadata

- root `[]`, one segment, and nested path;
- `..`, `.`, empty segment, absolute path, drive path, URI, slash, backslash,
  NUL, non-string element, non-array Native path, and malformed params;
- file-not-found and directory-not-found behavior;
- file/directory kind mismatch;
- nullable size/type/lastModified and malformed metadata;
- provider Unicode and case behavior without unsafe normalization.

### Reads

- zero-byte file;
- UTF-8 text;
- arbitrary binary bytes;
- valid Base64 and malformed Base64;
- exact 8 MiB file;
- known and streaming-detected oversized files;
- provider read failure and unavailable root;
- returned metadata matches the opened file;
- no URI/path/token in results.

### Platform and isolation

- unsupported Browser picker with quota estimate still available separately;
- Browser permission prompt/denied/revoked states;
- Android persisted read-only and readwrite grants;
- RuntimeInfo `storage` means the complete v1 Native method set;
- malformed Storage response does not change Runtime identity;
- picker/read failures do not affect Battery, Network, Display, Audio, or
  `device.ready()`;
- common Bridge timeout, duplicate/unknown response ID, malformed response, and
  navigation tests remain centralized in the bootstrap suite.

## 17. Phase 2 data contract hardening

Phase 2 status: **Storage Capability v1 Frozen Candidate**. Final/Frozen status
still requires the remaining lifecycle/compatibility phases and real-device SAF
verification.

Phase 2 freezes the five existing Native methods without adding a method or
changing Native Bridge v1. Native Volume, Permission, Directory Entry, Metadata,
and open-file results are validated as structured data and rebuilt from public
fields before page use; one malformed entry rejects the whole response as
`invalid-response`.

Permission state is `granted`, `prompt`, `denied`, `revoked`, `unknown`, or
`unsupported`. The booleans describe current grant facts. In particular,
`writable: true` does not advertise a write API, and detailed Storage write
capability remains unsupported.

Entry kinds are `file`, `directory`, and `unknown`. Public paths are safe
volume-relative segment arrays constructed from the requested parent plus the
validated child name. Metadata uses non-negative safe integers for known size
and timestamps; `0` is a real zero-byte size and unavailable values are `null`.

The private Android open-file result remains `{ metadata, base64 }`; the public
result remains `{ metadata, data: ArrayBuffer }`. Base64 must be canonical
`NO_WRAP` data with no whitespace or data-URI prefix. Both Native actual-stream
reading and the Web decoder enforce a raw maximum of `8 * 1024 * 1024` bytes.
When metadata size is known it must equal the actual payload size. Storage v1
remains whole-file and read-only, with no streaming, range, or write operation.
