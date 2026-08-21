# WebWindows device status and controls contract

## Browser behavior

The primary public API is now `window.WebWindows.device` (see `DEVICE_API.md`).
`window.WebWindows.deviceControls` remains a compatibility facade and exposes
`getCapabilities()`, `getState()`, `setVolume()`, `setBrightness()`, and
`refreshBattery()`.

- Volume changes the `volume` property of audio and video elements in the
  WebWindows document and readable same-origin frames. It cannot change the host operating system volume or cross-origin media.
- Brightness applies WebWindows visual dimming in a browser. It cannot change display backlight brightness.
- Battery is shown only when the Battery Status API succeeds or a trusted
  native shell reports battery capability. When neither source exists, the
  taskbar indicator stays hidden.
- The browser Battery Status API does not reliably distinguish a battery-free
  desktop from a platform that reports a synthetic full/charging battery. That
  platform result is displayed as API-provided status, not asserted as verified
  physical hardware.

## Trusted native bridge version 1

An Android or Linux shell may expose the following object to the top-level
trusted WebWindows document only:

```js
window.WebWindowsNativeDeviceStatus = {
  version: 1,
  getCapabilities(): '{"volume":true,"brightness":true,"battery":true}',
  requestControl(jsonRequest): '{"status":"accepted"}',
  getBatteryStatus(): '{"present":true,"connected":true,"charging":false,"level":0.72}'
};
```

`requestControl()` accepts only this fixed payload:

```json
{
  "version": 1,
  "control": "volume|brightness",
  "value": 0.5,
  "reason": "user_settings"
}
```

Volume and brightness values are normalized to `0..1`. A response succeeds only when `status` is `accepted` or
`completed`. Battery status uses normalized `level` `0..1`; `present:false`
hides the indicator, while `connected:false` displays the disconnected state.
After a native battery change, the shell may call
`window.WebWindows.deviceControls.refreshBattery()`.

## Mandatory shell enforcement

The shell, not JavaScript, is the security boundary. Android and Linux owners
must independently:

1. Allow only explicit production HTTPS and development origins, top frame
   only; remove the bridge immediately on any disallowed navigation.
2. Parse a fixed JSON schema, reject unknown operations/fields and non-finite
   values, clamp valid values, rate-limit calls, and never accept commands.
3. Expose only capabilities legitimately granted to the installed shell. A
   normal Android app or unprivileged Linux kiosk must return `false`.
4. Keep platform APIs and privileged helpers outside the Web content. Never
   embed administrator, sudo, ADB, FTP, signing, or deployment credentials.
5. Return `denied` or `error` when the platform rejects a request; do not claim
   device-level success based only on a JavaScript call.

Android launcher and Linux kiosk build changes remain owned by their respective
specialist tasks. This document is the handoff contract; it does not modify or
duplicate either build system.

## Expected test matrix

| Environment | Volume / brightness | Battery | Verification |
| --- | --- | --- | --- |
| Desktop browser | Page media / visual only | API result or hidden | Automated browser regression |
| Mobile browser | Page media / visual only | API result or hidden | 390×844 regression |
| Trusted Android shell | Native only for declared capabilities | Native present/disconnected states | Contract only; real device pending |
| Trusted Linux kiosk | Native only for declared capabilities | Native present/disconnected states | Contract only; kiosk image pending |
