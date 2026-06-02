# LYNK Production Readiness — Phase 3: Founder Concurrency

## Goal

Guarantee that the Founder Program cannot allocate duplicate founder numbers or exceed the absolute 2,500 Founder cap under concurrent signup pressure.

## What changed

- Hardened `FounderService.allocateFounderSlotWithManager()` to compute the next Founder number from the maximum historical `founderNumber`, including soft-deleted rows, instead of relying on an active row count.
- Kept the PostgreSQL transaction-scoped advisory lock (`pg_advisory_xact_lock`) as the service-level concurrency gate.
- Kept database-level protection from Phase 1:
  - unique `founders.userId`;
  - unique `founders.founderNumber`;
  - `CHK_founders_founderNumber_cap` enforcing `founderNumber BETWEEN 1 AND 2500`.
- Added `founder.service.spec.ts` tests for:
  - concurrent-style allocations serialized by the advisory-lock boundary;
  - no duplicate founder numbers;
  - no duplicate allocation for an existing user;
  - rejection of the 2,501st Founder allocation.

## Validation

Passing locally:

- `cd backend && npm run lint:check`
- `cd backend && npm run build`
- `cd backend && npm test -- --runInBand`

Blocked by environment:

- `cd backend && npm run migration:run` still cannot connect to PostgreSQL in this container because no DB service is running (`ECONNREFUSED 127.0.0.1:5432` and `ECONNREFUSED ::1:5432`).

## Remaining Phase 3 notes

- The unit tests verify the service contract and lock-dependent behavior using a deterministic in-memory manager. A full PostgreSQL integration test should still be added in CI once a test database service is available, so the real advisory lock can be exercised with actual concurrent transactions.
