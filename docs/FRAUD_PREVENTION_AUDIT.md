# Fraud Prevention Audit

## Auth

- Login/register/refresh/logout endpoints have Nest throttling at the controller level.
- Passwords are bcrypt-hashed.
- Refresh tokens are stored hash-only, rotated on refresh and revoked on logout/logout-all.
- Reused, expired or revoked refresh tokens are rejected and audited.

## Referral

- Referral activation is tied to verified users and monthly revenue distribution uses database transactions plus advisory locks.
- Remaining important risk: explicit self-referral and multi-account heuristics should be expanded with device/IP fingerprint rules after privacy review.

## Payments

- Provider creation validates positive amounts.
- Pawapay/Binance Pay attach idempotency/correlation metadata.
- Webhooks persist event IDs and reject duplicates.
- Pi payments reject duplicate `externalRef` values before crediting.

## Sessions

- Refresh-token sessions store device ID, user agent, IP address, expiry and revocation timestamp.
- Users can list and revoke active sessions.
- Logout-all revokes all active user sessions.

## Risk classification

| Risk | Level | Recommendation |
| --- | --- | --- |
| Referral multi-account abuse | Medium | Add privacy-reviewed IP/device velocity rules and admin review queues. |
| Provider sandbox drift | Medium | Run provider sandbox contract tests before beta. |
| Brute-force login | Low | Throttling exists; consider per-account lockout telemetry if abuse appears. |
