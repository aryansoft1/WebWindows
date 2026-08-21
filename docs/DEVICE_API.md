# WebWindows Device API v1

The public device boundary is `window.WebWindows.device`. Application and Settings code must use this API instead of reading `window.WebWindowsNative`.

## Groups

- `system`: host and platform information.
- `network`: online state and optional Network Information details.
- `battery`: battery presence, level, and charging state.
- `display`: screen information and native or visual brightness.
- `audio`: native media volume where the trusted host supports it; otherwise WebWindows page-media volume.
- `storage`: quota estimates plus user-authorized local directory providers.
- `power`: power source derived from host battery/power information.

Every group exposes `isSupported()` and `getCapabilities()`. Unsupported state is represented by `supported: false` and nullable values; callers must not infer values that the host cannot supply.

```js
const device = await window.WebWindows.device.ready();

device.getAdapter(); // "browser" or "android"
device.getCapabilities();

device.network.getState();
device.battery.getState();
device.power.getState();
await device.display.setBrightness(0.8);
await device.audio.setVolume(0.5);

const volume = await device.storage.pickDirectory({ writable: true });
const entries = await device.storage.listDirectory(volume.id, []);
const file = await device.storage.openFile(volume.id, [entries[0].name]);
```

## Storage provider

The browser provider uses `showDirectoryPicker()` and stores granted
`FileSystemDirectoryHandle` objects in IndexedDB when structured-clone support is
available. Android uses Storage Access Framework `ACTION_OPEN_DOCUMENT_TREE` and
persisted URI permissions. Both expose opaque volume IDs; Android content URIs
and filesystem paths are never returned to page code.

- `listVolumes()` returns known directory grants and their current permission state.
- `pickDirectory({ writable, replaceVolumeId })` must be called from a user gesture. Passing a known opaque volume ID replaces that grant in place for reauthorization without changing the business-layer `device://` address.
- `requestPermission(volumeId, "read"|"readwrite")` reports or requests browser permission. Revoked Android grants require picking the directory again.
- `listDirectory(volumeId, path)` returns directory/file metadata.
- `getMetadata(volumeId, path)` returns one entry's metadata.
- `openFile(volumeId, path)` returns `{ metadata, data: ArrayBuffer }`. The Android bridge limits one read to 8 MiB.

Permission objects contain `state`, `readable`, `writable`, `persisted`, and
`revoked`. Unsupported browsers return an explicit unsupported result; they do
not throw merely because the picker API is absent.

Battery and power deliberately use separate semantics:

```js
device.battery.getState();
// { supported, present, level, charging, connected, source }

device.power.getState();
// { supported, source: "ac"|"battery"|"unknown", acConnected, batteryPresent }
```

`battery.present` describes whether a battery exists. `power.source` describes the current source. They are never treated as the same fact.

## Adapters and security

The Browser adapter uses standard browser APIs where available and returns explicit unsupported states otherwise. The Android adapter is selected only when the existing trusted top-level `WebWindowsNative` bridge is present. Device API code repeats the trusted-origin and top-frame checks; the Android host remains responsible for its existing origin allowlist, main-frame, current-URL, and lifecycle checks.

Linux and Windows hosts can add adapters behind this boundary without changing page code. No placeholder native values are fabricated.

## Events

- `webwindows:device-ready`
- `webwindows:battery-change`
- `webwindows:network-change`
- `webwindows:volume-change`
- `webwindows:storage-change`

`WebWindows.device.on(name, callback)` is also available. The older `WebWindows.deviceControls`, `webwindows:battery-changed`, and same-origin `webwindows:set-device-control` paths remain as compatibility surfaces for existing pages.
