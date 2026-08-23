# WebWindows Device API v1

The public device boundary is `window.WebWindows.device`. Application and Settings code must use this API instead of reading `window.WebWindowsNative`.

## Groups

- `system`: host and platform information.
- `runtime`: Dreama Runtime identity and bridge capability information.
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
device.runtime.getInfo();

device.network.getState();
device.battery.getState();
device.power.getState();
await device.display.setBrightness(0.8);
await device.audio.setVolume(0.5);

const volume = await device.storage.pickDirectory({ writable: true });
const entries = await device.storage.listDirectory(volume.id, []);
const file = await device.storage.openFile(volume.id, [entries[0].name]);
```

Display brightness preserves the existing public surface:

```js
device.display.getCapabilities();
await device.display.getBrightness(); // cached state
await device.display.refresh();       // refreshes from the active adapter
await device.display.setBrightness(0.8);
device.display.getInfo();             // browser Screen API information
```

Brightness state is `{ supported, value, scope, source, systemDefault? }`, where
`value` is normalized to `0..1` when known. Android NativeAdapter uses
`scope: "native"` for public compatibility, with the concrete capability scoped
to the current Dreama Runtime Activity/window. `systemDefault: true` means the
window inherits Android's system brightness; the Android `-1` sentinel is never
exposed. BrowserAdapter retains `scope: "visual"` and applies WebWindows-only
visual dimming. The established public setter coerces and clamps inputs to
`0..1`; Native Bridge method parameters and results are validated strictly.

Audio volume likewise preserves the existing public surface:

```js
device.audio.getCapabilities();
device.audio.getVolume();       // cached state
await device.audio.refresh();   // refreshes from the active adapter
await device.audio.setVolume(0.5);
```

Volume state is `{ supported, value, scope, source }`, with `value` normalized
to `0..1`. There is no separate public `muted` state; level zero is only a
numeric volume level and is not asserted to be Android logical mute. Browser
scope is `page` and controls WebWindows-managed same-origin media elements.
Android Native scope is `media` and maps the normalized value to the fixed
`AudioManager.STREAM_MUSIC` range without exposing its device-dependent integer
maximum. The established public setter coerces and clamps inputs to `0..1`;
Native Bridge parameters and results are validated strictly.

## Storage provider

The browser provider uses `showDirectoryPicker()` and stores granted
`FileSystemDirectoryHandle` objects in IndexedDB when structured-clone support is
available. Android uses Storage Access Framework `ACTION_OPEN_DOCUMENT_TREE` and
persisted URI permissions. Both expose opaque volume IDs; Android content URIs
and filesystem paths are never returned to page code.

- `listVolumes()` returns known directory grants and their current permission state.
- `pickDirectory({ writable, replaceVolumeId })` must be called from a user gesture. Passing a known opaque volume ID replaces that grant in place for reauthorization without changing the business-layer `device://` address.
- `requestPermission(volumeId, "read"|"readwrite")` reports or requests browser permission. Revoked Android grants require picking the directory again.
- `listDirectory(volumeId, path)` returns deterministic entry objects. `path` is
  an array of safe volume-relative segments; platform URI/path fields are never
  exposed.
- `getMetadata(volumeId, path)` returns `{ supported, name, kind, size, type,
  lastModified, readable, writable, path, source }`. `size: 0` is a real
  zero-byte value; unknown size/timestamp/type uses `null`.
- `openFile(volumeId, path)` returns `{ metadata, data: ArrayBuffer }`. Storage
  v1 is whole-file read-only and limits raw data to exactly `8 * 1024 * 1024`
  bytes. Base64 exists only inside the private Native transport.

Permission objects contain `state`, `readable`, `writable`, `persisted`, and
`revoked`. `state` is `granted`, `prompt`, `denied`, `revoked`, `unknown`, or
`unsupported`. `writable: true` describes an underlying grant only;
`getCapabilities().write.supported` remains `false` because Storage v1 has no
public write method. Revoked volumes remain listable for explicit
reauthorization, while reads fail rather than returning empty data. Unsupported
browsers return an explicit unsupported result; they do not throw merely
because the picker API is absent.

Battery and power deliberately use separate semantics:

```js
device.battery.getState();
// { supported, present, level, charging, connected, source }

device.power.getState();
// { supported, source: "ac"|"battery"|"unknown", acConnected, batteryPresent }
```

`battery.present` describes whether a battery exists. `power.source` describes the current source. They are never treated as the same fact.

Network state preserves the existing synchronous `getState()`/`refresh()` surface:

```js
device.network.getState();
// { supported, online, connected, internetAvailable, transport, kind,
//   effectiveType, downlink, rtt, saveData, source }
```

`connected` means a network attachment exists. `online` remains its compatibility alias for existing modules. `internetAvailable` is a separate `true | false | null` fact and is `null` when the platform cannot reliably validate Internet reachability. `transport` is the platform-neutral detailed value; legacy `kind` remains `wifi`, `cellular`, `ethernet`, `offline`, or `unknown` so existing taskbar and Settings consumers remain compatible. Network status never includes speed-test measurements or network identity information.

## Adapters and security

The BrowserAdapter uses standard browser APIs where available and returns explicit unsupported states otherwise. NativeAdapter is considered only after the host announces its private bridge and a compatible `getRuntimeInfo()` round trip succeeds. Merely assigning `window.WebWindowsNative`, setting a mobile UA marker, or returning `trusted: true` does not activate NativeAdapter. Device API code repeats the trusted-origin and top-frame checks; the native host remains responsible for its origin allowlist, main-frame, current-URL, lifecycle, request validation, and method whitelist.

`window.WebWindows.device` is the stable public API for WebWindows functions and developers. `window.WebWindowsNative` is a private Dreama Runtime ABI used only by the Device API and bridge implementation. Application code, third-party functions, and ordinary WebWindows modules must not call it directly. Its Android and Windows transport implementation may change without changing the public Device API.

Linux and Windows hosts can add adapters behind this boundary without changing page code. No placeholder native values are fabricated.

## Events

- `webwindows:device-ready`
- `webwindows:battery-change`
- `webwindows:network-change`
- `webwindows:display-change`
- `webwindows:volume-change`
- `webwindows:storage-change`

`WebWindows.device.on(name, callback)` is also available. The older `WebWindows.deviceControls`, `webwindows:battery-changed`, and same-origin `webwindows:set-device-control` paths remain as compatibility surfaces for existing pages.
