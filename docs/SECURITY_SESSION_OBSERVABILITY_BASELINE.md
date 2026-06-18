# Security, Session & Observability Baseline

## Baseline checks

- Backend `npm run lint:check`: passed.
- Backend `npm run build`: passed.
- Backend `npm run test`: passed (14 suites, 45 tests).
- Frontend `npm install`: passed.
- Frontend `npm run typecheck`: passed.
- Frontend `npm run lint`: passed (delegates to typecheck).

## Repository baseline notes

- The container has no `main` branch or configured remote, so this branch was created from the local `work` branch after verifying the tree was clean.
- Refresh-token entity and core rotation flow already exist, but session-management endpoints and complete audit coverage need hardening.
- Health endpoint exists at `/health`; component-specific `/health/db` and `/health/redis` endpoints need to be exposed.
- CI starts PostgreSQL and Redis, but migration validation should also revert the latest migration and run migrations again.

## Remaining risks to address

- Add session listing and per-session revocation endpoints.
- Add audit logs for login, logout, logout-all, token rotation and failed refresh attempts.
- Add payment webhook audit logs for received, duplicate and status-synchronization paths.
- Add a backend Sentry service abstraction that initializes only when `SENTRY_DSN` exists.
- Add targeted tests for audit logging and health endpoints.

## Files expected to be modified

- `backend/src/modules/auth/auth.controller.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/auth/auth.service.spec.ts`
- `backend/src/modules/audit-log/entities/audit-log.entity.ts`
- `backend/src/modules/audit-log/audit-log.service.ts`
- `backend/src/modules/payment/payment.module.ts`
- `backend/src/modules/payment/payment.service.ts`
- `backend/src/modules/payment/payment.service.spec.ts`
- `backend/src/modules/observability/health.controller.ts`
- `backend/src/modules/observability/health.service.ts`
- `backend/src/modules/observability/observability.module.ts`
- `backend/src/modules/observability/sentry.service.ts`
- `.github/workflows/ci.yml`
- `docs/SECURITY_SESSION_OBSERVABILITY_REPORT.md`
