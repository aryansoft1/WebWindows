# Camera and Scanner vertical slice v1

Status: implementation candidate; server migration and real-device matrix are required before deployment.

## Product review decision

| Capability | Decision | Rationale and boundary |
| --- | --- | --- |
| Document scan/copy | Keep, phased | A camera-to-private-cloud path is a real mobile-to-desktop workflow. V1 performs local capture, heuristic edge bounds, four-corner raster correction, rotation, filters, multi-page JPEG/PDF and explicit cloud save. Automatic contour quality needs a real-device corpus before stronger claims. |
| QR recognition | Keep | High-value bridge between paper/phone and the Web desktop. Results never auto-open. Dangerous schemes and credential-bearing URLs are blocked; HTTP(S) still requires a full-host confirmation. |
| Photo translation | Keep, adjust | Useful in Chinese/Japanese/English work, but silent third-party upload would violate the privacy model. V1 prefers `TextDetector`, `LanguageDetector`/local inference and `Translator`, then a trusted host-injected provider. No provider means an honest unavailable state and editable text. |
| Cross-device login | Keep with security gate | Strong cross-device value only when the QR contains an opaque challenge, not credentials. V1 uses 120-second challenges, initiator-session binding, explicit approving-device confirmation, row locks, atomic one-time consumption, a 30-second HttpOnly exchange and ASP session abandonment before final the new authenticated session. |
| Camera labels/switching | Keep | Device labels are read only after permission. V1 supports multiple inputs, front/rear preference, switching and `devicechange`; denial/no-device leaves album import usable. |
| AR scene translation | Phase | V1 is timed frames plus OCR, translation and a 2D overlay. It explicitly does not claim WebXR, world tracking or spatial anchors. Those require browser/device capability research and a separate permission/performance review. |

## WebWindows fit, cost and maintenance

The feature is a trusted system app because raw camera access is too sensitive for the currently preview-only third-party Production Broker. The app behaves like a desktop utility window, uses the existing private Cloud File Dialog, and keeps useful offline fallbacks. V1 adds one small static app and two MySQL tables. It has no paid service, credential, FTP or production dependency. OCR and translation adapters are deliberately optional so a China-available or overseas provider can be chosen at deployment time without coupling UI logic to one vendor.

## Security and privacy invariants

- Camera permission is requested only after a user action; streams stop on page hide.
- Images remain in browser memory until explicit download or confirmed private-cloud save.
- Remote OCR/translation cannot be configured by URL or query string. Only a same-origin trusted host object may inject a provider.
- QR payloads are treated as untrusted text. `javascript:`, `data:`, `vbscript:`, `file:` and `intent:` are blocked.
- Login QR payloads contain only a 48-hex-character random challenge inside a same-origin URL.
- Challenges are bound to a hashed initiator secret, expire in two minutes, transition once under database predicates/row locks, can be revoked, and record payload-free audit events.
- Authentication finalization uses a separate 30-second HttpOnly/Secure/SameSite exchange cookie after abandoning the initiating ASP session. The exchange hash is atomically nulled on use.

## Provider contract

A trusted same-origin host may expose `window.WebWindowsCameraProviders.ocr.recognize(canvas, options)` and/or `.translate.translate(text, options)`. Providers must return `{ text, provider }`, disclose whether processing is local or remote in their product UI, and must not retain images/text beyond the selected operation without separate consent. No API key may be placed in browser source.

## Deployment and verification gate

1. The production UI ships with `LOGIN_BACKEND_ENABLED = false` and clearly labels scan-login as unavailable. Apply `database/migrations/002_camera_login_challenges.sql` only through the normal controlled migration process, validate staging, deploy the backend, and then enable the flag in a separate reviewed release.
2. Serve only over HTTPS and retain the camera `Permissions-Policy` plus page CSP.
3. Test deny/allow, no camera, front/rear and at least two camera inputs on Android, iOS/Safari where supported, Windows Chrome/Edge and the Android WebView shell.
4. Validate QR attack fixtures and decode the generated login QR on a second physical device.
5. Exercise approve, expiry, concurrent double-consume, exchange replay, revoke and weak-network retry against a staging MySQL database.
6. Use representative printed and photographed Simplified Chinese, Japanese and English documents. Record OCR provider, device, lighting, latency and failure rather than treating API availability as accuracy proof.

No FTP upload or production mutation is part of this change.
