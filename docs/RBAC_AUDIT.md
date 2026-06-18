# RBAC Audit

## Controllers reviewed

- `auth`
- `payment`
- `admin`
- `user`
- `referral`
- `observability` / `health`

## Exposed endpoints

| Endpoint group | Exposure | Rationale |
| --- | --- | --- |
| `POST /auth/register`, `POST /auth/login`, `POST /auth/pi`, `POST /auth/refresh`, `POST /auth/logout` | Public/throttled | Required authentication/session entrypoints. Refresh/logout require refresh-token possession. |
| `POST /payment/providers/:provider/webhook` | Public provider endpoint | Must be callable by payment providers; provider enum parsing and provider signature validation apply. |
| `GET /health`, `/health/db`, `/health/redis` | Public health | Returns component status only; no secrets. |
| Gift catalog and subscription plans | Public | Non-sensitive catalog data. |

## Protected endpoints

| Area | Protection |
| --- | --- |
| Auth session management (`/auth/logout-all`, `/auth/sessions`, `/auth/sessions/:id`, `/auth/me`) | JWT auth and ownership via current user ID. |
| User profile endpoints | JWT auth and service-level current-user ownership checks for `me` mutations. |
| Referral stats/distributions/pools | JWT auth and current-user scoped service calls. |
| Payment creation and transaction history | JWT auth; transaction history is scoped to current user. |
| Admin user moderation | JWT + `RolesGuard`; admin/super-admin, with support/compliance added to moderation/review queues. |
| Admin finance/revenue views | JWT + `RolesGuard`; finance/admin/super-admin. |
| System settings and feature flags | JWT + `RolesGuard`; super-admin for writes. |

## Corrections applied

- Added `SUPPORT` and `COMPLIANCE` access to admin moderation/report/verification queues.
- Added `FINANCE` access to admin transaction and revenue-distribution endpoints.

## Remaining risks

- Webhook endpoints are intentionally unauthenticated; provider signature validation remains the security boundary.
- Consider a future explicit permission matrix if role count grows beyond current operational roles.
