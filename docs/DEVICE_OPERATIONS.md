# WebWindows Device Operations contract

## Scope and invariant

`window.WebWindowsDeviceOperations` is the only Web-facing entry point for power and session operations. A normal browser cannot shut down, restart, sleep, or lock its host device. Without a trusted native bridge, WebWindows must use the session-level behavior described below and must not report that a device operation completed.

| Operation | Browser fallback | Native operation, when declared |
| --- | --- | --- |
| `shutdown` | Cover and close the WebWindows session view | Shut down the host device |
| `restart` | Reload WebWindows and clear the `booted` marker | Restart the host device |
| `sleep` | Cover the WebWindows session view | Put the host device to sleep |
| `lock` | Show a WebWindows privacy cover | Lock the host device/session |
| `reloadSession` | Reload WebWindows | Never delegated to the host |

The public API exposes `getCapabilities()`, `shutdown()`, `restart()`, `sleep()`, `lock()`, and `reloadSession()`. Each operation returns a promise. The `webwindows:device-operation` event reports `action`, `level` (`session` or `native`), and `status`.

## Native bridge version 1

An Android or Linux shell may inject the bridge below into the **top-level WebWindows document only**:

```js
window.WebWindowsNativeDeviceOperations = {
  version: 1,
  getCapabilities(): '{"shutdown":true,"restart":true,"sleep":false,"lock":true}',
  requestOperation(jsonRequest): '{"status":"accepted"}'
};
```

`getCapabilities()` returns either an object or JSON string. Only the exact boolean keys `shutdown`, `restart`, `sleep`, and `lock` are accepted. WebWindows never sends arbitrary commands. `requestOperation()` receives JSON with this schema:

```json
{
  "version": 1,
  "requestId": "ww-device-<timestamp>-<sequence>",
  "action": "shutdown|restart|sleep|lock",
  "reason": "user_power_menu"
}
```

The response is an object or JSON string with `status` equal to `accepted`, `completed`, `denied`, or `error`. WebWindows treats only `accepted` and `completed` as success. `accepted` means the shell took ownership of the request; it does not authorize the Web page to show a false completion screen.

## Mandatory shell controls

Both Android and Linux implementations must enforce all controls independently of the Web page:

1. Allow only the production WebWindows HTTPS origin(s) and an explicit development origin. Reject redirects, opaque/file origins, unexpected ports, and subframes.
2. Expose the bridge only to the top-level trusted document. Remove or disable it before navigating away. Do not expose it to arbitrary WebViews, iframes, plugins, or user-entered pages.
3. Parse JSON into a fixed enum and reject unknown keys, versions, actions, oversized input, replayed request IDs, and requests outside a short time window.
4. Require a fresh visible user confirmation rendered by the native shell for every native operation, including `lock`. Web confirmation is advisory and is not a security boundary.
5. Apply rate limiting and log action, time, origin, result, and shell version without recording secrets.
6. Run a narrowly scoped privileged helper or platform API. Never accept shell command text from JavaScript and never embed administrator, sudo, ADB, FTP, signing, or deployment credentials in Web content.
7. Return `denied`/`error` on failure. Never return `completed` before the platform confirms completion where confirmation is possible.

### Android handoff

The mobile operating-system task owns the launcher/WebView build. It should prefer a message-based bridge or a single `@JavascriptInterface` object exposing only `getCapabilities()` and `requestOperation(String)`. Enable JavaScript only for the trusted WebWindows view, disable file/content access unless independently required, block mixed content, validate every navigation, and perform device-policy/privileged actions only when the installed launcher is legitimately authorized. Ordinary Android apps generally cannot power off or reboot a device.

### Linux kiosk handoff

The real-operating-system task owns kiosk packaging and privilege policy. Keep Chromium/WebKit unprivileged and delegate fixed operations to a small local service. The service should map the enum to approved platform APIs (for example, logind over D-Bus), enforce the kiosk user/origin policy, and display native confirmation. Do not give the browser unrestricted `sudo`, shell, D-Bus, or systemd access.

## Verification matrix

- Desktop and mobile browsers: all device capabilities must report `session`; text must name WebWindows; no host claim is made.
- Trusted Android shell: only explicitly declared capabilities report `native`; shell origin, top-frame, confirmation, denial, and replay tests are required.
- Trusted Linux kiosk: same checks as Android plus privileged-helper policy and D-Bus/system-action denial tests.
- Cross-origin iframe: no native bridge and no device operation. The current public API may affect only its own WebWindows document if a same-origin embedding is deliberately allowed.

Android and Linux native execution remain unverified until their owning tasks implement this contract and run tests on real hardware or a representative managed image.
