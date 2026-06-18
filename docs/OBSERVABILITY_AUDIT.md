# Observability Audit

## Health

- `GET /health` returns aggregate application/component status and timestamp.
- `GET /health/db` runs a PostgreSQL `SELECT 1` health check.
- `GET /health/redis` sends Redis `PING` when Redis is configured.

## Logging and audit trails

- Audit logs track actor/resource metadata, IP address and user agent where available.
- Payment webhook logs persist provider, event type, external reference, external event ID, headers, payload and processing status.
- Sensitive values should not be included in application logs or audit metadata.

## Monitoring

- Sentry abstraction initializes only when `SENTRY_DSN` exists.
- Captured exception context is scrubbed for token/secret/password/authorization key names.
- PostHog event tracking scrubs token/secret/password properties.

## Sensitive data review

No code path intentionally logs passwords, refresh tokens, JWT secrets, webhook secrets or API keys. Remaining risk is accidental inclusion of provider webhook payloads if providers send sensitive fields; provider payload schemas should be reviewed before live launch.
