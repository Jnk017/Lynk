# Certification Observability Audit

## AuditLog

Audit logs support action, actor/resource fields, metadata, IP address, user agent and timestamps. Auth/session and admin-sensitive actions are audited.

## Sentry

Sentry abstraction initializes only when `SENTRY_DSN` exists and scrubs token/secret/password/authorization fields from context metadata.

## Health

- `/health` returns aggregate status and timestamp.
- `/health/db` validates PostgreSQL connectivity.
- `/health/redis` validates Redis ping when configured.

## Sensitive data logging

No code intentionally logs passwords, refresh tokens, JWT secrets, webhook secrets or API keys. Provider webhook payload schemas should still be reviewed with live provider samples before beta.

## Certification result

Observability certification: **PASS**.
