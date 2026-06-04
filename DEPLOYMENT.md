# LYNK Deployment Guide

## Deployment principles

- Build once and deploy immutable artifacts.
- Run migrations explicitly before serving production traffic.
- Keep `DB_SYNCHRONIZE=false` in every shared environment.
- Use strong secrets from a secret manager, not committed files.
- Do not expose PostgreSQL or Redis publicly.

## Pre-deployment checklist

```bash
cd backend
npm ci
npm run lint:check
npm run build
npm test -- --runInBand
```

With a staging/production-like PostgreSQL database:

```bash
npm run migration:run
```

Frontend:

```bash
cd frontend
npm ci --legacy-peer-deps
npm run typecheck
npm run lint
npm run doctor
```

## Backend deployment sequence

1. Provision PostgreSQL 15+ and Redis 7+ on private networking.
2. Configure environment variables from `ENVIRONMENT.md`.
3. Build the backend image or artifact.
4. Run database migrations:

   ```bash
   cd backend
   npm run migration:run
   ```

5. Start the API with:

   ```bash
   npm run start:prod
   ```

6. Verify health:

   ```text
   GET /api/v1/health
   ```

7. Verify logs do not contain secrets and production errors do not expose stack traces.

## Docker Compose local/staging notes

`docker-compose.yml` is useful for local infrastructure and simple staging validation. For production, prefer managed PostgreSQL/Redis and do not bind-mount source code into the runtime container.

Start local dependencies:

```bash
docker-compose up postgres redis -d
```

## Database rollback

If a migration causes a deployment issue and rollback is safe for that migration:

```bash
cd backend
npm run migration:revert
```

Always inspect migration `down()` logic and backup production data before rollback.

## First SUPER_ADMIN

Before launch, create a secure one-time seed or operational runbook for the first `SUPER_ADMIN`. The process must:

- require direct operator approval;
- use a known user id/email;
- write an audit log;
- be disabled after use.

## Payments rollout

Current real-money rollout must remain conservative:

- Pi Network: enable only after validating server-side verification against Pi sandbox/live APIs.
- Moneroo, AvadaPay and Coinbase Commerce: do not enable in production until real API calls, signature verification, webhook idempotency tests and reconciliation are complete.
- Stripe: optional only for future international structure, not the primary RDC channel.

## Observability rollout

- Configure `POSTHOG_API_KEY` and `POSTHOG_HOST` for analytics.
- Configure `SENTRY_DSN` after production SDK initialization is completed.
- Preserve `x-request-id` in reverse proxy logs.
- Alert on `/api/v1/health` degradation.

## CI/CD

GitHub Actions workflow `.github/workflows/ci.yml` validates:

- backend install, lint, build, tests and migrations on PostgreSQL;
- frontend install, typecheck, lint and Expo doctor.

Require the workflow to pass before merging to `main`.
