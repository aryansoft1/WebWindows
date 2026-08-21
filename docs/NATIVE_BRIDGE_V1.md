# Dreama Native Bridge v1

Dreama Native Bridge is the private transport between a trusted Dreama Runtime host and the top-level WebWindows document. Applications and WebWindows functions must use `window.WebWindows.device`; they must not call `window.WebWindowsNative` directly.

## ABI boundary and trust model

- `window.WebWindows.device` is the stable public API. Runtime information remains namespaced at `window.WebWindows.device.runtime.getInfo()`; there is no public top-level `device.getRuntimeInfo()` alias.
- `window.WebWindowsNative` is a private ABI between Dreama Runtime and the Device API. Business features, third-party features, and ordinary WebWindows modules must not depend on it. Native transports may evolve while the public Device API remains compatible.
- `RuntimeInfo.trusted` is a status description produced after the native host has accepted the request. It is never, by itself, a credential or an authorization decision.
- NativeAdapter activation requires a host availability announcement, a trusted top-level WebWindows origin, a compatible asynchronous bridge round trip, and a complete RuntimeInfo response. A page-created object or a UA marker alone remains BrowserAdapter.
- The actual privilege boundary is native: Android exposes its WebMessage object only to its HTTPS allowlist and independently verifies source origin, main frame, current URL, active navigation lifecycle, request shape, protocol version, parameters, and method whitelist before executing a method. Web code must never use Adapter identity or `trusted` as authorization for privileged native work.

As with any same-JavaScript-realm API, arbitrary script execution in an allowed trusted origin can imitate page-visible objects or replace application behavior. This ABI does not claim to be cryptographic remote attestation; preventing same-origin script compromise depends on the trusted origin's script and content-security controls. Such imitation does not bypass the native listener's checks or create native capability.

## Versions and transport

- `bridgeVersion` is currently `1.0` and versions the wire contract.
- `runtimeVersion` versions Dreama Runtime independently.
- Every bridge method is asynchronous and returns a Promise.
- Android transports JSON messages through its existing origin-scoped WebMessage listener and reply proxy. Request IDs, method-specific timeouts, structured replies, the trusted-origin allowlist, top-frame checks, current-URL checks, and bridge lifecycle shutdown on navigation remain mandatory.
- A v1 client may accept the legacy Android success field `data` while hosts migrate to `result`. New hosts must emit `result`.
- `data` is read only from a legacy response that omits `version`. A versioned v1 response containing `data` instead of `result` is malformed.

## Request

```json
{
  "version": "1.0",
  "id": "42",
  "method": "getRuntimeInfo",
  "params": {}
}
```

`version`, `id`, and `method` are required for v1 clients. `params` is an object and defaults to an empty object. Hosts must reject unsupported major versions, missing IDs, unknown methods, and invalid parameters. During migration, the Android host accepts a legacy request with no `version` as v1 so already deployed pages retain their request-ID and timeout behavior; new clients must always send `version`.

## Success response

```json
{
  "version": "1.0",
  "id": "42",
  "ok": true,
  "result": {}
}
```

## Failure response

```json
{
  "version": "1.0",
  "id": "42",
  "ok": false,
  "error": {
    "code": "permission-required",
    "message": "User authorization is required.",
    "platform": "android",
    "method": "storagePickDirectory",
    "details": null
  }
}
```

`error.code` is stable and machine-readable. `message` is safe for diagnostics and must not contain credentials or private platform paths. `details` is optional and must contain only method-specific, non-sensitive structured data.

## Events

```json
{
  "version": "1.0",
  "event": "batteryChanged",
  "payload": {},
  "timestamp": "2026-08-21T12:34:56.789Z"
}
```

Event timestamps use UTC ISO 8601. Unknown events are ignored. Events are accepted only from the same trusted bridge lifecycle as requests.

## Capability states

Detailed capability results use one of these states:

- `supported`: implemented and currently callable.
- `unsupported`: not implemented by this runtime or platform.
- `unavailable`: normally supported but temporarily unavailable.
- `permission-required`: requires a user or operating-system permission flow.
- `denied`: the host or user rejected access.

The boolean capability map in `getRuntimeInfo()` is a discovery summary. Individual method results remain authoritative and may report a more specific state.

## Runtime identification

The required `getRuntimeInfo()` method returns:

```json
{
  "runtimeName": "Dreama Runtime",
  "runtimeVersion": "1.0.0",
  "bridgeVersion": "1.0",
  "platform": "android",
  "platformVersion": "15",
  "engine": "android-webview",
  "engineVersion": "140.0.7339.51",
  "deviceClass": "phone",
  "native": true,
  "trusted": true,
  "capabilities": {
    "battery": true,
    "network": true,
    "display": true,
    "audio": true,
    "storage": true,
    "power": false,
    "updater": true
  }
}
```

Allowed platforms are `android`, `windows`, `browser`, and `unknown`; engines are `android-webview`, `webview2`, `browser`, and `unknown`; device classes are `phone`, `tablet`, `desktop`, `laptop`, and `unknown`. Values that cannot be obtained reliably are `null` or `unknown`. The protocol does not expose or create a stable device identifier.

The public page API is `window.WebWindows.device.runtime.getInfo()`. A plain browser reports Browser Runtime information with `platform: "browser"`, `native: false`, and `trusted: false`. A page selects a native adapter only after a trusted top-level bridge successfully returns a complete, compatible runtime response. UA markers such as `WebWindowsMobile/1.0` are compatibility hints only and never establish trust.

## Battery capability

Battery uses the existing v1 method name `getBatteryStatus` with an empty parameter object. It does not change any v1 request, response, error, event, version, ID, timeout, navigation, or trust semantics.

```json
{
  "version": "1.0",
  "id": "43",
  "method": "getBatteryStatus",
  "params": {}
}
```

```json
{
  "version": "1.0",
  "id": "43",
  "ok": true,
  "result": {
    "present": true,
    "connected": false,
    "charging": false,
    "level": 0.72
  }
}
```

- `present` reports whether Android reports a battery.
- `connected` reports external power connection, not Bridge connectivity.
- `charging` is `true`, `false`, or `null` when Android cannot determine the charging state.
- `level` is normalized to `0..1`, or `null` when unavailable. During migration the Device API also accepts the previous Android `0..100` value and normalizes it without exposing that difference publicly.
- `RuntimeInfo.capabilities.battery` means the Runtime implements the method. It does not claim that a physical battery is present. Android currently reports `true` because `getBatteryStatus` is implemented without an additional runtime permission. Browser Runtime derives the capability from `navigator.getBattery` availability.
- No Bridge event is required for Battery v1. The public API refreshes through `window.WebWindows.device.battery.refresh()` and emits the existing page event `webwindows:battery-change`.

## Network Status capability

Network Status uses the v1 method name `getNetworkStatus` with an empty parameter object. It uses the frozen v1 request/response/error envelopes, version, request ID, timeout, navigation lifecycle, and trust model without modification.

```json
{
  "version": "1.0",
  "id": "44",
  "method": "getNetworkStatus",
  "params": {}
}
```

```json
{
  "version": "1.0",
  "id": "44",
  "ok": true,
  "result": {
    "connected": true,
    "internetAvailable": true,
    "transport": "wifi"
  }
}
```

- `connected` reports whether the platform has an active network attachment. It does not assert Internet reachability.
- `internetAvailable` is `true`, `false`, or `null`. Android maps it from `NET_CAPABILITY_VALIDATED`; Browser Runtime returns `null` because `navigator.onLine` is not an Internet reachability test.
- `transport` is `wifi`, `cellular`, `ethernet`, `vpn`, `other`, `unknown`, or `none`. `none` is valid only when `connected` is false. Android SDK constants never cross the Bridge.
- `RuntimeInfo.capabilities.network` reports that the Runtime implements `getNetworkStatus`; it does not report current connection, transport, or Internet validation.
- The result does not contain SSID, BSSID, MAC, IP addresses, gateway, DNS, SIM/operator data, Wi-Fi scans, stable identifiers, speed, throughput, latency, or ping.
- No Native Bridge event is added in Network Status v1. Existing browser `online`, `offline`, and Network Information change signals continue to refresh the public state. Native callers may use the existing synchronous `network.refresh()` cache surface; a later event-based refresh can use the already frozen event envelope without changing this method.

## Display Brightness capability

Display Brightness uses the existing v1 method names `getScreenBrightness` and `setScreenBrightness`. Both use the frozen request/response/error envelopes, version, request ID, timeout, navigation lifecycle, trust model, and fixed method dispatch without modification.

```json
{
  "version": "1.0",
  "id": "45",
  "method": "getScreenBrightness",
  "params": {}
}
```

```json
{
  "version": "1.0",
  "id": "45",
  "ok": true,
  "result": {
    "level": 0.6,
    "systemDefault": true
  }
}
```

```json
{
  "version": "1.0",
  "id": "46",
  "method": "setScreenBrightness",
  "params": {
    "level": 0.8
  }
}
```

The set result has the same shape as the get result and reflects the value read back after the write.

- `level` is a JSON number in the inclusive platform-neutral range `0..1`, or `null` only when the effective level cannot be read reliably. Strings, non-finite values, objects, arrays, and out-of-range values are invalid Native ABI parameters or results.
- `systemDefault` is a boolean. On Android, `true` means the Activity window is using the system brightness default. Android's internal `screenBrightness == -1` sentinel never crosses the Bridge; the Runtime reports the read-only effective system level when available, otherwise `level: null`.
- Android applies writes only to the Dreama Runtime Activity through `WindowManager.LayoutParams.screenBrightness`. The capability scope is `runtime-window`; it does not modify global Android settings, request `WRITE_SETTINGS`, or control automatic brightness.
- `RuntimeInfo.capabilities.display` means the Runtime implements both brightness methods. It does not advertise sensors, automatic/adaptive brightness, HDR, color temperature, display enumeration, resolution, or refresh-rate control.
- The public `window.WebWindows.device.display` API retains its established `0..1` state and compatibility behavior. Its BrowserAdapter continues WebWindows-only visual dimming and does not claim to change physical display brightness. The historical public setter coerces and clamps values before adapter dispatch; the private Native ABI itself remains strict.
- No Native Bridge event is added. A successful public set updates the Device API cache and emits the existing page event `webwindows:display-change`; failed or malformed writes leave the previous cache unchanged.

## Failure and compatibility behavior

- Missing bridges, timeouts, rejected Promises, incompatible versions, and malformed runtime responses fall back to BrowserAdapter.
- Unknown response IDs and duplicate responses are ignored. A completed or timed-out request is removed from the pending map, so a late response cannot complete it again.
- A malformed message safely rejects active requests as `invalid-response`; navigation/pagehide closes the page-side bridge, clears its timers, and rejects remaining requests as `bridge-closed`.
- Native failures must not reject `window.WebWindows.device.ready()` or prevent WebWindows initialization.
- Adapter initialization is idempotent. Repeated availability events may refresh state but must not replace the established public API or duplicate global listeners.
- Existing battery, display, audio, storage, network, and power APIs retain their current public shapes.
