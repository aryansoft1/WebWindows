# Dreama Native Bridge v1

Dreama Native Bridge is the private transport between a trusted Dreama Runtime host and the top-level WebWindows document. Applications and WebWindows functions must use `window.WebWindows.device`; they must not call `window.WebWindowsNative` directly.

## Versions and transport

- `bridgeVersion` is currently `1.0` and versions the wire contract.
- `runtimeVersion` versions Dreama Runtime independently.
- Every bridge method is asynchronous and returns a Promise.
- Android transports JSON messages through its existing origin-scoped WebMessage listener and reply proxy. Request IDs, method-specific timeouts, structured replies, the trusted-origin allowlist, top-frame checks, current-URL checks, and bridge lifecycle shutdown on navigation remain mandatory.
- A v1 client may accept the legacy Android success field `data` while hosts migrate to `result`. New hosts must emit `result`.

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

## Failure and compatibility behavior

- Missing bridges, timeouts, rejected Promises, incompatible versions, and malformed runtime responses fall back to BrowserAdapter.
- Native failures must not reject `window.WebWindows.device.ready()` or prevent WebWindows initialization.
- Adapter initialization is idempotent. Repeated availability events may refresh state but must not replace the established public API or duplicate global listeners.
- Existing battery, display, audio, storage, network, and power APIs retain their current public shapes.
