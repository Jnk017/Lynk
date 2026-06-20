# Pi Payment Flow

## Required U2A sequence

1. `frontend-pi` creates the payment with `Pi.createPayment()`.
2. Pi SDK calls `onReadyForServerApproval(paymentId)`.
3. Backend approves with `POST /v2/payments/{paymentId}/approve` using the Pi Server API key.
4. User submits the transaction in Pi Browser.
5. Pi SDK calls `onReadyForServerCompletion(paymentId, txid)`.
6. Backend completes with `POST /v2/payments/{paymentId}/complete`.
7. Backend verifies final state with `GET /v2/payments/{paymentId}`.
8. Backend updates transaction, subscription or purchased feature only after verification.

## Idempotence

- Use Pi `paymentId` as the external idempotency key.
- Repeated approval/completion callbacks for an already-processed payment must return success without double credit.
- Store final state transitions with timestamps.

## Ownership

- The authenticated user's `piUid` must match the Pi payment `user_uid`.
- A user must not approve, complete, cancel or recover another user's payment.
- Ownership mismatch returns `403` and must be logged.

## States

| State | Backend action |
|---|---|
| `approved` | Server approved; wait for txid |
| `completed` | Verify and credit once |
| `cancelled` | Mark cancelled; no credit |
| `failed` | Mark failed; no credit |
| `incomplete` | Queue recovery job |
| `already_processed` | Return safe success; no duplicate credit |

## Beta validation

Before launch, run sandbox/mock tests for complete, cancel, incomplete recovery, duplicate callbacks and ownership mismatch.
