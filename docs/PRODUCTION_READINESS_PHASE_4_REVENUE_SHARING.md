# LYNK Production Readiness — Phase 4: Revenue Sharing Idempotency

## Goal

Make monthly Founder revenue sharing transaction-safe, idempotent, auditable, configurable, and test-covered before exposing it through admin tooling.

## What changed

- `ReferralService.distributeMonthlyDividends(month, options)` now accepts an explicit `YYYY-MM` month and a `dryRun` option.
- The monthly cron delegates to the same distribution method, so scheduled and manual/admin-triggered execution use one code path.
- Distribution execution now:
  - acquires a PostgreSQL transaction advisory lock for the target month;
  - checks completed `RevenuePool` rows inside the lock;
  - returns an idempotent result if the month has already completed;
  - uses `system_settings.revenue_sharing_percentage` for the configurable percentage;
  - computes eligible Founders only from active, non-banned, revenue-sharing-enabled Founder users;
  - records deterministic internal transaction references in the form `rev_share_<month>_<founderId>`;
  - enforces `totalDistributed <= distributableAmount` before committing;
  - records an `AuditLog` entry for completed executions;
  - persists a retryable failed pool marker when a payout transaction rolls back.
- Added `revenue_pools.idempotencyKey` as a unique key for month-level idempotence.
- Expanded statuses to include production workflow states:
  - `RevenuePoolStatus.PROCESSING`, `FAILED`, `CANCELLED`;
  - `RevenueDistributionStatus.PROCESSING`, `CANCELLED`.
- Added a migration to update the revenue-sharing enum values and idempotency indexes.
- Added `referral.service.spec.ts` tests for:
  - successful monthly distribution;
  - repeated execution of a completed month without double payment;
  - no eligible Founder handling;
  - dry-run simulation with no writes;
  - rollback when a payout write fails.

## Validation

Passing locally:

- `cd backend && npm test -- --runInBand referral.service.spec.ts`
- `cd backend && npm run lint:check`
- `cd backend && npm run build`
- `cd backend && npm test -- --runInBand`

Blocked by environment:

- `cd backend && npm run migration:run` cannot connect to PostgreSQL in this container because no DB service is running (`ECONNREFUSED 127.0.0.1:5432` / `ECONNREFUSED ::1:5432`).

## Remaining Phase 4 notes

- A real PostgreSQL integration test should be added in CI when the database service is available, so advisory locks and unique indexes are exercised with actual concurrent transactions.
- Admin-triggered dry-run endpoints belong to Phase 5 (RBAC/Admin), where access control and audit trails for manual distribution previews will be added.
