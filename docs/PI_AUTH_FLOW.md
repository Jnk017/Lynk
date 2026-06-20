# Pi Auth Flow

## Official endpoint

`POST /auth/pi` is the only official Pi authentication endpoint.

The legacy Pi module route `/auth/pi/login` must remain disabled or redirected to avoid two independent account-creation paths.

## Sequence

1. `frontend-pi` runs inside Pi Browser and obtains a Pi access token through the Pi SDK.
2. `frontend-pi` sends `POST /auth/pi` with:
   - `uid` from Pi SDK
   - `accessToken`
   - `username` when available
   - legal acceptance fields for a first account creation
   - `X-Lynk-Channel: PI_ECOSYSTEM`
3. Backend calls `GET /v2/me` with `Authorization: Bearer <accessToken>`.
4. Backend compares the returned `uid` with the frontend `uid`.
5. Backend looks up the user by `piUid` only.
6. For new users, backend records legal acceptance and allocates any Founder slot inside the same transaction.
7. Backend returns a sanitized user object, a short access token, and a rotating refresh token.

## Identity rules

- `piUid`: official Pi UID returned by `/v2/me`; unique login key.
- `piUsername`: optional username returned by Pi.
- `piWalletAddress`: real Mainnet wallet address only when available; never use UID as a wallet placeholder.

## Security requirements

- Reject UID mismatch.
- Reject missing or wrong channel header.
- Reject duplicate Pi UID at service and database levels.
- Hash refresh tokens in the database and rotate on every refresh.
- Log Pi legal acceptance and auth failures for observability.
