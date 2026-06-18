# Pi Network Payment Audit

## Flow reviewed

| Capability | Status | Notes |
| --- | --- | --- |
| Create payment | Partial | Backend returns a pending reference; actual creation is initiated by the Pi client SDK. This is documented as a provider-specific SDK flow, not a server-created checkout. |
| Verify payment | Implemented | Server calls Pi API `/payments/:id` with API key and validates developer approval, transaction verification, completion, amount and Pi wallet UID. |
| Cancel payment | Not implemented server-side | No active cancel endpoint exists. Cancellation remains a Pi SDK/provider-side event; server rejects non-completed/cancelled payments during verification. |
| Expired payment | Covered by verification failure | Non-completed provider status is not credited. |
| Duplicate payment | Implemented | `externalRef` lookup rejects already processed Pi payment IDs. |
| Replay protection | Implemented for crediting | Duplicate `externalRef` protection prevents replay crediting. |

## API validation

- Requires `PI_API_KEY` via `pi.apiKey`.
- Uses `PI_API_BASE_URL`, defaulting to `https://api.minepi.com/v2`.
- Sends `Authorization: Key <apiKey>`.
- Does not log Pi API keys or tokens.

## Remaining risk

Pi server-side payment creation/cancellation depends on Pi SDK/provider behavior. Before beta, run a sandbox/manual Pi flow to confirm SDK-created payments reach the backend verification endpoint with expected identifiers.
