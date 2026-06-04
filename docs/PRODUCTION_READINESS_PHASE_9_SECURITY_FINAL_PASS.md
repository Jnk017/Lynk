# Production Readiness — Phase 9: Security Final Pass

## Goal

Tighten backend runtime protections before observability and final production reporting.

## Security posture confirmed

- Helmet is enabled globally.
- HTTP CORS uses the strict `ALLOWED_ORIGINS` parser and fails closed in production.
- The global `ValidationPipe` uses `whitelist`, `forbidNonWhitelisted`, and `transform`.
- Global throttling is enabled, with auth-specific throttles on registration, login, Pi login, refresh and logout.
- TypeORM `synchronize` is disabled by default and explicitly rejected in production when `DB_SYNCHRONIZE=true`.
- Critical production secrets are required and weak/default JWT and DB secrets are rejected.

## Phase 9 changes

- Added request correlation IDs through `x-request-id` middleware and echoed the ID on responses.
- Added a global HTTP exception filter that includes `requestId` and avoids stack-trace leakage in production responses.
- Added optional `TRUST_PROXY` handling for reverse-proxy deployments.
- Disabled Swagger in production by default; it can only be enabled explicitly with `ENABLE_SWAGGER=true`.
- Added strict upload validation on profile photos, profile videos, liveness images and KYC documents:
  - photo/liveness: JPEG, PNG or WebP only;
  - video: MP4, QuickTime or WebM only;
  - KYC document: PDF, JPEG, PNG or WebP only;
  - size limits are enforced both at Multer level and via Nest file validators.
- Strengthened registration password policy to require at least 12 characters with lowercase, uppercase and numeric characters.
- Added tests for production error response stack redaction and password policy validation.
- Added `TRUST_PROXY` and `ENABLE_SWAGGER` to the backend environment template.

## Remaining limitations

- Dedicated e2e tests for throttling and multipart upload rejection should be added when the project has an e2e test harness with HTTP requests and multipart fixtures.
- Request logging is still basic; Phase 10 should replace ad-hoc logging with structured logs, Sentry and analytics events.
- Sanitization is currently handled primarily through DTO allowlisting and validation; field-level HTML sanitization should be added if rich text inputs are introduced.
