# Certification Public API Audit

## Validation

- Global `ValidationPipe` uses `whitelist`, `forbidNonWhitelisted` and implicit transformation.
- DTO validation is present for auth, payments, admin actions, legal acceptance, reports, subscriptions and profile inputs.
- Enum parsing is used for payment provider path params.

## Rate limiting

- Auth register/login/Pi/refresh/logout endpoints use `@Throttle`.
- Global throttler is configured at application level.

## Exception handling

- Global `HttpExceptionFilter` is installed and reports exceptions to observability without exposing secrets.

## Serialization / sensitive output

- Auth responses sanitize user objects.
- Session listing excludes token hashes.
- Health endpoints return status/timestamp/details only.

## Endpoints without auth

Public endpoints are limited to auth entrypoints, provider webhooks, health checks and read-only catalog/plan data. No critical unauthenticated data mutation was found outside provider webhook callbacks.

## Certification result

Public API certification: **PASS**.
