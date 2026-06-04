# LYNK Environment Variables

This document summarizes the operational environment required by LYNK.

## Backend variables

Copy and edit:

```bash
cd backend
cp .env.example .env
```

### App

| Variable | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | yes | `development`, `test`, or `production`. |
| `PORT` | yes | API port, usually `3000`. |
| `TRUST_PROXY` | production-dependent | Set `true` behind a trusted reverse proxy/load balancer. |
| `ENABLE_SWAGGER` | no | Keep `false` in production unless explicitly needed. |

### Database

| Variable | Required | Notes |
| --- | --- | --- |
| `DB_HOST` | yes | PostgreSQL host. |
| `DB_PORT` | yes | PostgreSQL port. |
| `DB_USERNAME` | yes | PostgreSQL username. |
| `DB_PASSWORD` | yes | Must be strong in production. |
| `DB_NAME` | yes | Database name. |
| `DB_SYNCHRONIZE` | yes | Recommended `false`; forbidden as `true` in production. |
| `DB_LOGGING` | no | Usually `false` outside local debugging. |

### Redis

| Variable | Required | Notes |
| --- | --- | --- |
| `REDIS_HOST` | yes | Redis host. |
| `REDIS_PORT` | yes | Redis port. |
| `REDIS_PASSWORD` | optional | Required if Redis is protected. |

### JWT

| Variable | Required | Notes |
| --- | --- | --- |
| `JWT_ACCESS_SECRET` | yes | Must be non-default and at least 32 characters in production. |
| `JWT_REFRESH_SECRET` | yes | Must be non-default and at least 32 characters in production. |

### CORS

| Variable | Required | Notes |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | production yes | Comma-separated origin allowlist. Required in production. |

### Payments

| Variable | Required | Notes |
| --- | --- | --- |
| `PI_API_KEY` | for live Pi | Server-side Pi verification key. |
| `PI_API_BASE_URL` | yes for Pi | Defaults to Pi API base URL. |
| `PI_SANDBOX` | no | Use sandbox while testing. |
| `MONEROO_API_KEY` | future | Real provider integration pending. |
| `AVADAPAY_API_KEY` | future | Real provider integration pending. |
| `COINBASE_COMMERCE_API_KEY` | future | Real provider integration pending. |
| `COINBASE_COMMERCE_WEBHOOK_SECRET` | future | Required when Coinbase webhook verification is implemented. |
| `STRIPE_SECRET_KEY` | optional | Not the primary RDC payment path. |
| `STRIPE_WEBHOOK_SECRET` | optional | Required only if Stripe is enabled. |

### Media/AI/notifications/observability

| Variable | Required | Notes |
| --- | --- | --- |
| `AWS_REGION` | media-dependent | AWS region. |
| `AWS_ACCESS_KEY_ID` | media-dependent | S3 access key. |
| `AWS_SECRET_ACCESS_KEY` | media-dependent | S3 secret. |
| `AWS_S3_BUCKET` | media-dependent | Media bucket. |
| `CLOUDFRONT_DOMAIN` | optional | CDN domain. |
| `OPENAI_API_KEY` | AI-dependent | Required for real AI calls. |
| `FIREBASE_PROJECT_ID` | notifications-dependent | FCM configuration. |
| `FIREBASE_CLIENT_EMAIL` | notifications-dependent | FCM configuration. |
| `FIREBASE_PRIVATE_KEY` | notifications-dependent | FCM private key. |
| `SENTRY_DSN` | optional | Enables Sentry capture when wired to SDK. |
| `POSTHOG_API_KEY` | optional | Enables backend analytics events. |
| `POSTHOG_HOST` | optional | Defaults to PostHog cloud. |

## Frontend variables

Expo only exposes variables prefixed with `EXPO_PUBLIC_`:

| Variable | Required | Notes |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | yes | Backend API base URL, e.g. `http://localhost:3000/api/v1`. |
| `EXPO_PUBLIC_WS_URL` | yes | Backend Socket.IO URL. |
| `EXPO_PUBLIC_POSTHOG_API_KEY` | optional | Frontend analytics key. |
| `EXPO_PUBLIC_POSTHOG_HOST` | optional | Frontend PostHog host. |
| `EXPO_PUBLIC_SENTRY_DSN` | optional | Frontend Sentry DSN placeholder. |

Never place backend secrets, payment private keys, Pi API keys, database credentials, JWT secrets or webhook secrets in frontend variables.
