# WebWindows Permission Decision and Grant Model v1

Status: Preview framework; Production Broker and Production consent remain disabled. Policy version: `1`.

## Effective decision

Every Preview Broker authorization follows one order:

```text
source manifest declaration
→ trusted platform/review policy
→ trusted Host-owned user grant (when required)
→ trusted Runtime capability observation
→ method registry policy
→ Broker allow/deny
```

These facts are independent. A declaration requests access but is not a grant. A grant does not imply Runtime support. Runtime support does not authorize an application. `no-consent` suppresses a user prompt; it does not bypass declaration or platform policy. A platform/review deny cannot be overridden by a user grant.

The machine-readable authority is `data/sdk/permission-decision-v1.json`. A decision contains `permissionId`, `methodId`, `declared`, `policy`, `consentMode`, `grantState`, `capability`, `methodPolicy`, `effective`, `denialReason`, `publicErrorCode`, and `policyVersion`.

## Grant states

- `not-required`: no user decision is needed. This is the only active Battery Preview state.
- `session-grant`: future trusted Host consent, scoped to one Preview session, project, app and permission. It is currently exercised only by policy-engine tests.
- `persistent-user-grant`: reserved contract state; no persistence or Production UI exists.
- `resource-scoped-grant`: reserved contract state for a Host-selected resource; it does not open Storage or any API.
- `denied`: the trusted grant authority denied or did not establish a required grant.

Preview grants and decisions live only in the `PreviewSessionController`/Broker object graph. Stop destroys them. Reload creates a new session and reevaluates them. They are never stored in localStorage, IndexedDB, the server, the project, or the source manifest.

## Consent authority

Consent UI is owned by a trusted WebWindows Host. Sandbox request fields cannot establish a grant, user gesture, capability, platform policy, or policy version. A future consent flow may pause a Broker request, ask Host UI, then resume or reject it, but no Production consent UI is implemented by this contract.

## Stable diagnostics

Developer diagnostics use stable denial reasons from the contract and map them to the already-frozen public Broker errors. The projection may show decision facts and latency, but never request parameters, response bodies, Native/adapter/provider details, credentials, tokens, filesystem paths, or private stacks.

## Battery pilot

`device.battery-status.read` remains `risk: low`, `consent: no-consent`. It never prompts and creates no persistent user grant. It still requires Manifest v2 declaration, trusted policy approval, Runtime capability support, and an enabled method. Battery remains the only Preview Broker pilot.
