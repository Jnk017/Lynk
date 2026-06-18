# Certification RBAC Audit

## Scope

Controllers audited: Auth, User, Profile, Matchmaking, Chat, Payment, Referral, Admin, Observability/Health.

## Public endpoints

| Endpoint group | Reason |
| --- | --- |
| `POST /auth/register`, `POST /auth/login`, `POST /auth/pi`, `POST /auth/refresh`, `POST /auth/logout` | Authentication/session entrypoints; controller-level throttling is present. |
| `POST /payment/providers/:provider/webhook` | Provider callbacks must be public; provider enum parsing and signature/replay verification form the security boundary. |
| `GET /health`, `GET /health/db`, `GET /health/redis` | Public operational health checks; no secrets returned. |
| `GET /gifts/catalog`, `GET /subscription/plans` | Public catalog/plan metadata. |

## Authenticated endpoints

| Module | Protection |
| --- | --- |
| Auth sessions and `me` | `AuthGuard('jwt')`; user ID from JWT scopes session listing/revocation. |
| User/Profile/Verification/Matching/Chat/Referral/Legal/Staking/Marriage | Controller-level or method-level `AuthGuard('jwt')`; service methods use current user IDs for ownership. |
| Payments | Create/verify/history require JWT; transaction history is scoped to current user. |

## Admin endpoints

| Area | Roles |
| --- | --- |
| User administration | `ADMIN`, `SUPER_ADMIN` |
| Reports/moderation/verification queues | `MODERATOR`, `SUPPORT`, `COMPLIANCE`, `ADMIN`, `SUPER_ADMIN` |
| Transactions/revenue distributions | `FINANCE`, `ADMIN`, `SUPER_ADMIN` |
| System settings / feature flag writes | `SUPER_ADMIN` |

## Risks detected

| Risk | Severity | Status |
| --- | --- | --- |
| Webhooks are public | Low/expected | Acceptable because providers require signature/replay checks. |
| Health endpoints are public | Low | Acceptable because responses are non-secret component states. |
| Future role sprawl | Low | Recommend a formal permission matrix if more roles are added. |

## Certification result

RBAC certification: **PASS**.
