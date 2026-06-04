# LYNK Backend

NestJS API for LYNK, covering authentication, profiles, verification, matchmaking, chat, payments, subscriptions, referral/revenue sharing, Founder allocation, RBAC/admin, observability and production safety foundations.

## Requirements

- Node.js 22+
- PostgreSQL 15+
- Redis 7+
- npm

## Setup

```bash
cd backend
cp .env.example .env
npm ci
```

Edit `.env` before starting. In production, the API refuses weak/default JWT secrets, missing `ALLOWED_ORIGINS`, weak `DB_PASSWORD`, and `DB_SYNCHRONIZE=true`.

## Database migrations

The backend is migrations-first. Do not rely on TypeORM `synchronize` for shared development, staging, or production.

```bash
npm run migration:run
npm run migration:revert
npm run migration:generate -- src/database/migrations/YourMigrationName
```

Current migration set:

- `1764698600000-InitialProductionSchema.ts`
- `1764698700000-AddRefreshTokenRotation.ts`
- `1764698800000-HardenRevenueSharingIdempotency.ts`
- `1764698900000-AddRbacAdminAndReports.ts`

## Run locally

```bash
npm run start:dev
```

Default API prefix:

```text
/api/v1
```

Healthcheck:

```text
GET /api/v1/health
```

## Validation

```bash
npm run lint:check
npm run build
npm test -- --runInBand
```

With PostgreSQL available:

```bash
npm run migration:run
```

## Security-sensitive implementation notes

- Refresh tokens are stored hashed only and rotated on refresh.
- Reuse of a revoked refresh token triggers rejection, active-session revocation and audit logging.
- Admin routes require JWT auth plus `RolesGuard`.
- Admin state-changing actions write audit logs.
- Payment provider stubs refuse production operation.
- Pi crediting must use server verification and anti-duplicate transaction checks.
- Revenue sharing uses monthly idempotency keys and transaction-level locking foundations.
- HTTP errors are normalized and production responses do not expose stack traces.

## Payment provider status

| Provider | Status |
| --- | --- |
| Pi Network | Server verification path present; configure `PI_API_KEY` and `PI_API_BASE_URL` before live usage. |
| Moneroo | Secure test-mode stub only; real API integration pending. |
| AvadaPay | Secure test-mode stub only; real API integration pending. |
| Coinbase Commerce | Secure test-mode stub only; real API integration pending. |
| Stripe | Optional legacy/international path only; not the primary RDC payment channel. |

## Operational endpoints

- `GET /api/v1/health` — database, Redis, storage config and queue-placeholder status.
- Admin endpoints are under the admin module and must be accessed by `ADMIN`/`SUPER_ADMIN`/authorized moderator roles depending on route.

## CI

GitHub Actions runs backend dependency install, lint, build, unit tests and migrations against a clean PostgreSQL service.
