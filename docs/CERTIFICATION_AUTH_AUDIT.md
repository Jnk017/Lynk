# Certification JWT & Session Audit

## Access tokens

- JWT access tokens are signed with `JWT_ACCESS_SECRET`.
- Production validation requires strong non-default secrets.
- JWT-authenticated controllers use `AuthGuard('jwt')`.

## Refresh tokens

- Refresh tokens are stored hash-only.
- Refresh token payloads include `jti` and optional `deviceId`.
- Refresh rotation revokes the old token, saves the replacement hash and links replacement token ID.

## Session revocation

- `POST /auth/logout` revokes the current refresh-token session.
- `POST /auth/logout-all` revokes all active sessions for the current user.
- `GET /auth/sessions` lists active sessions without token hashes.
- `DELETE /auth/sessions/:id` revokes a user-owned session.

## Replay/reuse

- Reused revoked refresh tokens are rejected.
- Expired refresh tokens are revoked and rejected.
- Reuse detection revokes active sessions for the user and writes audit logs.

## Token leakage review

No route intentionally returns refresh-token hashes, JWT secrets or raw token metadata beyond the one-time refresh token response.

## Certification result

JWT/session certification: **PASS**.
