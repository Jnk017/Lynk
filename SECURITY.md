# Security Policy

## Supported branch

Security fixes should target `main` and be backported only if a long-lived release branch is introduced.

## Reporting vulnerabilities

Do not open public issues containing exploitable details. Report privately to the repository owner with:

- affected module and endpoint;
- reproduction steps;
- expected vs actual impact;
- suggested remediation if known.

## Current security posture

### Authentication and sessions

- Passwords are hashed with bcrypt.
- Registration enforces a stronger password policy.
- Refresh tokens are never stored in plaintext.
- Refresh tokens are hashed, persisted, rotated on use and revocable.
- Reuse of a revoked refresh token is rejected and audited.

### Authorization

- JWT auth protects private endpoints.
- `@Roles()` and `RolesGuard` protect admin/moderation surfaces.
- Roles include `USER`, `PREMIUM_USER`, `FOUNDER`, `MODERATOR`, `ADMIN`, and `SUPER_ADMIN`.
- Admin state changes must write audit logs.

### Configuration and secrets

- Production rejects missing/weak JWT secrets and weak database passwords.
- `ALLOWED_ORIGINS` is mandatory in production.
- `DB_SYNCHRONIZE=true` is forbidden in production.
- No private payment or Pi keys should ever be exposed to the frontend.

### HTTP/API hardening

- Helmet is enabled.
- CORS is allowlist-driven.
- Global DTO validation uses whitelist and forbids unknown fields.
- Global rate limiting is enabled, with stricter throttling on auth-sensitive routes.
- Request IDs are attached to responses for correlation.
- Production error responses must not expose stack traces.

### Uploads

- Profile and verification uploads validate file size and MIME type.
- S3 storage is isolated behind backend services.

### Payments

- Transactions must not be marked paid from client-provided status alone.
- Provider webhooks use idempotency logs keyed by provider and external event id.
- Pi crediting must be based on server-side verification.
- Moneroo, AvadaPay and Coinbase Commerce are currently secure stubs only and must not process production money until real signed webhook verification is implemented.

## Required pre-production checks

```bash
cd backend
npm run lint:check
npm run build
npm test -- --runInBand
npm run migration:run
```

```bash
cd frontend
npm ci --legacy-peer-deps
npm run typecheck
npm run lint
```

## Remaining security work before full launch

- Add end-to-end tests for critical auth/admin/payment flows.
- Seed the first `SUPER_ADMIN` through a secure, audited one-time process.
- Implement real signed webhook verification for Moneroo, AvadaPay and Coinbase Commerce.
- Add production-grade Sentry SDK initialization.
- Add automated dependency/security scanning in CI.
