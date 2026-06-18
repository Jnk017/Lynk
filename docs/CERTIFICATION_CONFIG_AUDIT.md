# Certification Configuration Audit

## Files reviewed

- `backend/.env.example`
- `frontend/.env.example`
- `backend/src/config/*`
- `.github/workflows/ci.yml`

## Secrets exposure

No real secrets are committed in environment examples or config files. Production secret validation rejects weak/default JWT and DB secrets and now requires active payment provider credentials/secrets.

## Variables corrected

- Added `JWT_ACCESS_EXPIRES_IN` and `JWT_REFRESH_EXPIRES_IN` to `backend/.env.example`.
- Added `PAWAPAY_WEBHOOK_SECRET` to `backend/.env.example`.
- Added `BINANCE_PAY_SECRET_KEY` to `backend/.env.example`.
- Production env validation now requires `PI_API_KEY`, `PAWAPAY_API_KEY`, `PAWAPAY_WEBHOOK_SECRET`, `BINANCE_PAY_API_KEY`, and `BINANCE_PAY_SECRET_KEY`.

## Unused / legacy variables

No active Stripe/Moneroo/AvadaPay/Flutterwave/Coinbase environment variables were found in active config.

## Certification result

Configuration certification: **PASS**.
