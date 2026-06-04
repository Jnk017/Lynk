# LYNK Production Readiness — Phase 5: RBAC & Admin Foundation

## Goal

Create a secured backend foundation for operational administration with explicit roles, protected admin routes, and mandatory audit logging for privileged changes.

## What changed

- Added `UserRole` values:
  - `USER`;
  - `PREMIUM_USER`;
  - `FOUNDER`;
  - `MODERATOR`;
  - `ADMIN`;
  - `SUPER_ADMIN`.
- Added `@Roles()` and `RolesGuard` so routes can require one or more privileged roles.
- Added `users.role` with a default `USER` value and an index for admin filtering/authorization.
- Added a minimal `reports` table/entity for the moderation queue with `ReportStatus` values:
  - `PENDING`;
  - `REVIEWING`;
  - `RESOLVED`;
  - `DISMISSED`.
- Added `AdminModule` with protected endpoints for:
  - listing users;
  - reading user detail;
  - suspending/restoring users;
  - listing and resolving reports;
  - listing transactions;
  - listing Founders;
  - listing revenue distributions;
  - triggering dry-run revenue-sharing previews;
  - listing/upserting system settings;
  - listing/upserting feature flags.
- Added audit logging for privileged mutations:
  - user suspension;
  - user restoration;
  - report resolution;
  - revenue-sharing dry-run preview;
  - system setting upsert;
  - feature flag upsert.
- Added `FeatureFlagService` and expanded `SystemSettingsService` so admin endpoints can list/upsert operational settings safely.
- Added migration `1764698900000-AddRbacAdminAndReports.ts` for role enum, `users.role`, report status enum and reports table/indexes.

## Validation

Passing locally:

- `cd backend && npm test -- --runInBand roles.guard.spec.ts admin.service.spec.ts`
- `cd backend && npm run lint:check`
- `cd backend && npm run build`
- `cd backend && npm test -- --runInBand`

Blocked by environment:

- `cd backend && npm run migration:run` cannot connect to PostgreSQL in this container because no DB service is running (`ECONNREFUSED 127.0.0.1:5432` / `ECONNREFUSED ::1:5432`).

## Remaining Phase 5 notes

- The admin module is backend-only. A dedicated admin frontend can be built later, likely as a separate Next.js app.
- This phase introduces a minimal reports queue. Full moderation workflows, suspicious behavior scoring, shadow bans and admin action policies remain part of the later Moderation/Safety phase.
- Production deployments should seed at least one `SUPER_ADMIN` user through a controlled migration/seed or secure operational process, not through a public endpoint.
