# LYNK Production Readiness — Phase 7: CI/CD & Automated Validation

## Goal

Make Lynk automatically validate backend and frontend changes in GitHub Actions, including backend database migrations against a real PostgreSQL service.

## What changed

- Added `.github/workflows/ci.yml` with separate backend and frontend jobs.
- Backend CI now runs:
  - `npm ci`;
  - `npm run lint:check`;
  - `npm run build`;
  - `npm test -- --runInBand`;
  - `npm run migration:run` against a clean PostgreSQL service.
- Backend CI provisions service containers for:
  - PostgreSQL 16;
  - Redis 7.
- Backend CI sets safe test environment values for secrets, CORS and database flags, including `DB_SYNCHRONIZE=false`.
- Frontend CI now runs:
  - `npm ci --legacy-peer-deps`;
  - `npm run lint`;
  - `npm run typecheck`;
  - `npx --yes expo-doctor` as a non-blocking doctor check.
- Added npm cache configuration for both backend and frontend jobs.
- Added a frontend `lint` script so CI has a stable command. For now it delegates to TypeScript validation because the frontend does not yet have a dedicated ESLint configuration.
- Added a frontend `doctor` script for local Expo checks.

## Local validation

Passing locally:

- `cd backend && npm run lint:check`
- `cd backend && npm run build`
- `cd backend && npm test -- --runInBand`
- `git diff --check`

Environment-blocked locally:

- `cd frontend && npm ci --legacy-peer-deps` is still blocked in this container by the npm registry/proxy returning `403 Forbidden` for `@react-native/debugger-frontend`.
- Because frontend dependencies cannot be installed locally in this container, `cd frontend && npm run lint` and `cd frontend && npm run typecheck` currently fail with missing Expo/React Native type declarations and unresolved `expo/tsconfig.base`. This should resolve once `npm ci --legacy-peer-deps` can complete in CI or a registry-unblocked local environment.
- Backend `cd backend && npm run migration:run` still requires PostgreSQL. It is now covered in GitHub Actions via the PostgreSQL service container.

## Remaining Phase 7 notes

- The frontend needs a dedicated ESLint setup later. Current `npm run lint` is intentionally a conservative TypeScript validation alias so CI has a stable command today.
- If GitHub Actions sees the same `@react-native/debugger-frontend` registry block, resolve it by verifying Expo/RN version support and registry policy. Do not hide that failure.
- The Expo doctor step is non-blocking because it can report environment/tooling recommendations that should be reviewed without blocking backend production hardening.
