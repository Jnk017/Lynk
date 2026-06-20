# Pi Network Submission Checklist

## Auth

- Use only `POST /auth/pi` for Pi Browser authentication.
- Verify the Pi SDK access token server-side with `GET /v2/me`.
- Compare the frontend-provided Pi UID with the UID returned by Pi.
- Store Pi identity with `piUid` as the unique account key.
- Keep `piWalletAddress` only for a real Mainnet wallet address when available.
- Return both short access token and rotating refresh token.
- Record legal acceptance for new Pi accounts with timestamp, IP, user agent, language and document version.

## Channel enforcement

- `frontend-pi` must send `X-Lynk-Channel: PI_ECOSYSTEM` on every request.
- `frontend-global` must send `X-Lynk-Channel: GLOBAL` on every request.
- Backend guards must reject Pi routes without the Pi channel header.
- Pi Browser build must not show email/phone login or non-Pi payment providers.

## Payments

- Client starts payment with `Pi.createPayment()`.
- Backend approves with `/v2/payments/{id}/approve`.
- Backend completes with `/v2/payments/{id}/complete` after txid.
- Backend verifies with `/v2/payments/{id}` before crediting.
- Payment ID must be idempotent.
- Authenticated user `piUid` must match payment owner UID.
- Incomplete payments must be recovered by a scheduled job.

## Legal and trust

- Terms and privacy acceptance required for new accounts.
- Verification uploads must become `PENDING_REVIEW`, not automatically verified.
- Admin/moderator approval is required before `VERIFIED`.
- Public chat copy must not claim E2E encryption until implemented and audited.

## Beta tests

- Pi new account auth.
- Pi existing account auth.
- UID mismatch rejection.
- Missing legal acceptance rejection.
- Refresh-token rotation after Pi auth.
- Pi payment approve/complete/verify.
- Payment idempotence.
- Payment ownership mismatch rejection.
- Channel-header rejection cases.
- Verification approval/rejection workflow.
- Moderation/admin queue workflow.

## Release gate

Do not submit to Pi Core Team until backend tests, frontend typechecks, Expo exports and migrations pass in CI for `backend`, `frontend-pi`, and `frontend-global`.
