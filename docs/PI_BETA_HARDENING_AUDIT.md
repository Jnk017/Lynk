# PI Beta Hardening Audit

Scope: backend, `frontend-pi`, `frontend-global`, Pi auth, Pi payments, legal, admin, matching, verification, observability.

## Endpoint mapping observed

| Domain | Backend endpoint | Consumer | Status |
|---|---|---|---|
| Pi auth official | `POST /auth/pi` | `frontend-pi` via `API_ENDPOINTS.auth.loginPi` | Keep as the only official Pi auth entry point |
| Pi auth legacy | `POST /auth/pi/login` | Not required by current `frontend-pi/src/constants/api.ts` | Disabled from `PiModule` in this branch |
| Refresh session | `POST /auth/refresh` | Pi and global clients | Returns rotated refresh token through `AuthService` |
| Pi platform payments | `/payments/pi/*` or equivalent module routes | Pi client callbacks | Needs full sandbox/mock validation |
| Admin reports | `/admin/reports` | Admin UI constants | Present in constants, screen coverage still needs full UI validation |
| Admin verification | `/admin/verifications` | Admin UI constants | Present in constants, workflow still needs full UI validation |

## Inconsistencies found

1. Two Pi auth paths existed conceptually: main auth controller provides `/auth/pi`, while the Pi module registered a controller for `/auth/pi/login`.
2. The legacy Pi module service created/signed users independently and did not return a refresh token.
3. The legacy Pi module service set `piWalletAddress` from the Pi UID, which mixes two different identifiers.
4. The official auth service already has refresh-token rotation, but Pi identity lookup still needs to be keyed strictly by `piUid`.
5. `frontend-pi/src/constants/api.ts` already points to `/auth/pi`, but full channel-header coverage must be verified in the HTTP client/interceptor layer.
6. The repo contains production-readiness auth hardening docs and refresh-token migration, but Pi-specific tests need to be expanded.
7. Verification, fraud, matchmaking and observability requirements are larger than a small patch; they need dedicated implementation slices.

## Coverage snapshot by module

| Module | Evidence | Beta status |
|---|---|---|
| Auth/session | `auth.service.ts`, `auth.service.spec.ts`, refresh-token migration | Partial; Pi-specific cases incomplete |
| Pi auth | `pi-auth.controller.ts`, `pi-auth.service.ts`, `AuthController.loginWithPi` | Legacy route disabled; service consolidation still required |
| Pi payments | `pi-api.service.ts`, Pi payment module | API wrapper exists; idempotence/ownership E2E tests still required |
| Legal | `legal_acceptances` usage in auth service | Present for registration; Pi path needs strict validation tests |
| Admin | constants expose reports/verifications | UI completeness not proven |
| Verification | user status fields exist | Review workflow needs validation |
| Matchmaking | discovery/swipe constants exist | Dating-grade filtering and swipe limits need tests |
| Observability | service/events exist | `/metrics` and alert docs need follow-up implementation |

## Patch applied in this branch

- `backend/src/modules/pi/pi.module.ts`: removed legacy `PiAuthController` registration so `/auth/pi/login` is no longer registered through the Pi module. Pi auth must go through `POST /auth/pi`.

## Remaining P0 before beta

- Consolidate all Pi auth into `AuthService.loginWithPi` using `piUid` only.
- Enforce `X-Lynk-Channel: PI_ECOSYSTEM` on the official Pi auth route and protected Pi routes.
- Add Pi-auth tests for new account, existing account, UID mismatch, legal acceptance, refresh rotation.
- Add migration/backfill to prevent `piWalletAddress = piUid` collisions.
- Validate Pi payment approval/completion/verification/idempotence with a sandbox or mocked Pi API.
