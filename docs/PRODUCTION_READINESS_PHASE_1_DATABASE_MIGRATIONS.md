# LYNK Production Readiness — Phase 1: Database & Migrations

## Goal

Remove production reliance on TypeORM `synchronize` and introduce a deterministic initial schema migration for a fresh PostgreSQL database.

## What changed

- Added `backend/src/database/migrations/1764698600000-InitialProductionSchema.ts` as the initial production schema migration.
- Added all current backend entities to the migration, including users, subscriptions, profile media/prompts, matchmaking, chat, payments, gifts, staking, marriage, referral/revenue sharing, webhook logs, founders, system settings, feature flags, and audit logs.
- Added PostgreSQL enum types with explicit `enumName` values in entity definitions to keep future TypeORM schema diffs aligned with the migration.
- Normalized relation join-column names to match existing TypeScript property names, preventing duplicate implicit FK columns in future generated migrations.
- Added critical indexes and uniqueness constraints for:
  - `users.email`
  - `users.phone`
  - `users.piWalletAddress`
  - `users.referralCode`
  - `founders.userId`
  - `founders.founderNumber`
  - `transactions.externalRef`
  - `transactions.provider`
  - `referral_logs.referrerId`
  - `referral_logs.refereeId`
  - `revenue_distributions.month`
  - `payment_webhook_logs.provider + externalEventId`
- Added a DB-level Founder cap guard with `CHK_founders_founderNumber_cap` to keep founder numbers between 1 and 2500.
- Added `DB_SYNCHRONIZE=false` and `DB_LOGGING=false` to `backend/.env.example`.
- Updated migration scripts so `migration:run` and `migration:revert` force `DB_SYNCHRONIZE=false`.

## Validation

Passing locally:

- `cd backend && npm run lint:check`
- `cd backend && npm run build`
- `cd backend && npm test -- --runInBand`

Blocked by environment:

- `cd backend && npm run migration:run` could not connect to PostgreSQL because there is no local Postgres service available in this container (`ECONNREFUSED 127.0.0.1:5432` and `ECONNREFUSED ::1:5432`). Docker is also unavailable in the environment, so a clean DB migration execution could not be completed here.

## Remaining Phase 1 risk

The migration compiles through the backend build and is ready to run, but it still must be executed against a fresh PostgreSQL 15+ database in CI or a local environment with Postgres available. This is the acceptance criterion that remains environment-blocked, not code-blocked.
