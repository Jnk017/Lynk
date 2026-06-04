# LYNK Production Readiness — Phase 2: Auth Hardening

## Goal

Replace stateless refresh tokens with persisted, hashed, rotating refresh-token sessions that can be revoked per device or for all devices.

## What changed

- Added `RefreshToken` entity mapped to `refresh_tokens`.
- Added migration `1764698700000-AddRefreshTokenRotation.ts` for the refresh-token session table.
- Refresh tokens are now signed with a unique `jti`, hashed with bcrypt, and stored only as hashes.
- Login, registration, and Pi login now create a persisted refresh-token record with device metadata.
- Refresh now rotates tokens by revoking the previous token and creating a new hashed token.
- Reuse of a revoked refresh token is rejected, marks reuse detection, revokes active sessions for that user, and writes an audit log entry.
- Added logout endpoints:
  - `POST /auth/logout` revokes the current refresh token.
  - `POST /auth/logout-all` revokes all active refresh tokens for the authenticated user.
- Added service support for device-level revocation through `revokeDevice(userId, deviceId)`.
- Added unit tests for hash-only storage, rotation, reuse detection/audit logging, and logout revocation.

## Validation

Passing locally:

- `cd backend && npm run lint:check`
- `cd backend && npm run build`
- `cd backend && npm test -- --runInBand`

Blocked by environment:

- `cd backend && npm run migration:run` still cannot connect to PostgreSQL in this container because no DB service is running (`ECONNREFUSED 127.0.0.1:5432` and `ECONNREFUSED ::1:5432`).

## Remaining Phase 2 notes

- The refresh-token security model is now production-grade at service level, but should be verified with an e2e test against a real PostgreSQL database in CI.
- A future admin/security dashboard can call `revokeDevice(userId, deviceId)` for device management UI.
