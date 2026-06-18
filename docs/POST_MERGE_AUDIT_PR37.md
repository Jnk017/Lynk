# Post-Merge Audit PR #37 — Lynk

## 1. Executive summary

Status: **PASS WITH FIXES**.

The post-merge audit verified the backend, both Expo frontends, Pi payment callback authentication, public branding, Pi-channel UI compliance, global-channel preservation, migrations, and secret/binary hygiene. Two corrective actions were applied during this audit:

1. `frontend-pi` Pi payment callback requests now attach `Authorization: Bearer <lynkJwt>` by default through the Pi API client.
2. `frontend-pi` user-facing auth/legal/privacy surfaces were tightened so the Pi Browser build exposes Pi authentication/payment flows only and no non-Pi payment/login labels.

The only check not fully executable in this local environment was `migration:run`, because Docker and a local PostgreSQL service are unavailable in this container.

## 2. Global status

**PASS WITH FIXES**

- Backend build/lint/unit/e2e: PASS.
- `frontend-pi` typecheck/lint/android export: PASS.
- `frontend-global` typecheck/lint/android export: PASS.
- Pi payment callback JWT propagation: PASS after fix.
- Branding scan of user-facing frontend/legal files: PASS.
- `frontend-pi` non-Pi auth/payment visible text scan: PASS after fix.
- Binary scan: PASS.
- Secret scan: PASS; only environment variable names/placeholders were found.
- Migration execution: BLOCKED locally by environment; CI or a machine with PostgreSQL must run it.

## 3. Command results

| Command | Result | Notes |
| --- | --- | --- |
| `npm --prefix backend run build` | PASS | Included in combined backend verification. |
| `npm --prefix backend run lint:check` | PASS | Included in combined backend verification. |
| `npm --prefix backend test -- --runInBand` | PASS | 15 suites / 50 tests passed. |
| `npm --prefix backend run test:e2e` | PASS | 2 suites / 5 tests passed. |
| `npm --prefix backend run migration:run` | BLOCKED | PostgreSQL unavailable locally; connection refused. |
| `npm --prefix frontend-pi run typecheck` | PASS | TypeScript check passed. |
| `npm --prefix frontend-pi run lint` | PASS | Script runs typecheck and passed. |
| `cd frontend-pi && EXPO_OFFLINE=1 npx --no-install expo export --platform android` | PASS | Android bundle exported to `dist`. |
| `npm --prefix frontend-global run typecheck` | PASS | TypeScript check passed. |
| `npm --prefix frontend-global run lint` | PASS | Script runs typecheck and passed. |
| `cd frontend-global && EXPO_OFFLINE=1 npx --no-install expo export --platform android` | PASS | Android bundle exported to `dist`. |
| `rg -n "Lynk Pi\|Lynk Global\|Pi version\|Global version\|PI_ECOSYSTEM\|GLOBAL\|frontend-pi\|frontend-global" ...` | PASS | No prohibited public branding in user-facing `frontend-pi` files; global internal option constants are not public product branding. |
| `rg -n "PawaPay\|Stripe\|Binance\|USDT\|Mobile Money\|Visa\|Mastercard\|Google login\|Apple login\|Email login\|Phone login\|Email or Phone" frontend-pi/app frontend-pi/src frontend-pi/public/legal ...` | PASS | No visible non-Pi auth/payment labels remain in `frontend-pi`. |
| `git ls-tree -r --name-only HEAD frontend-pi frontend-global \| awk 'tolower($0) ~ /\.(png\|jpg\|jpeg\|gif\|webp\|pdf\|ico)$/ {print}'` | PASS | No committed frontend binary assets detected in HEAD. |
| `rg -n "(PI_API_KEY\|PI_RECEIVING_WALLET\|BEGIN PRIVATE KEY\|PRIVATE_KEY\|wallet private\|api[_-]?key...)" ...` | PASS | Only env var names/placeholders found; no literal secret value found. |

## 4. Critical issues found

### P1 — Pi payment callbacks could fail with 401

The frontend Pi callback services call authenticated backend routes:

- `POST /api/v1/payments/pi/approve`
- `POST /api/v1/payments/pi/complete`
- `POST /api/v1/payments/pi/cancel`
- `POST /api/v1/payments/pi/error`
- `POST /api/v1/payments/pi/incomplete`

Those backend routes are protected by `AuthGuard('jwt')`, so the frontend API client must attach the Lynk JWT to every request. The audit confirmed this was not robust enough and fixed it by storing the Lynk JWT after Pi login and injecting `Authorization: Bearer <token>` in `frontend-pi/src/services/api/client.ts`.

### P1 — `frontend-pi` exposed non-Pi auth/legal/privacy user-facing content

The copied frontend surfaces included email/password auth screens and legal content that referenced non-Pi payment rails. These were removed or rewritten for the Pi Browser app.

## 5. Fixes applied

- Added Lynk token persistence helpers to the `frontend-pi` Pi API client and automatic `Authorization` header injection for all Pi API requests.
- Updated Pi authentication to save the backend-issued Lynk access/refresh tokens after `/auth/pi/login`.
- Replaced `frontend-pi` login/register/alternate Pi auth routes with the Pi-only auth screen.
- Replaced the `frontend-pi` welcome screen with Pi-only onboarding copy and action.
- Rewrote `frontend-pi` public legal HTML/Markdown files to Pi-compliant Lynk wording without non-Pi payment provider references.
- Removed password verification wording from the Pi account deletion UI.
- Removed visible email display from the Pi admin moderation screen.
- Replaced visible phone/email verification labels with Pi/profile verification labels in the Pi profile verification model.

## 6. Remaining issues

- Local migration execution remains unverified because this environment has no Docker binary and no reachable PostgreSQL instance. Run `npm --prefix backend run migration:run` in CI or a local environment with PostgreSQL available.
- Additional backend tests should be expanded in a follow-up to cover all disallowed providers and idempotence branches exhaustively, even though the guard and service code paths are present.

## 7. Pi callback JWT verification

PASS after fix.

`frontend-pi/src/services/api/client.ts` now reads the stored Lynk access token and injects `Authorization: Bearer <token>` while preserving `X-Lynk-Channel: pi`. `frontend-pi/src/services/pi/pi-sdk.service.ts` stores the backend-issued token immediately after successful Pi authentication.

## 8. Branding verification

PASS.

The user-facing scan found no public product names such as `Lynk Pi`, `Lynk Global`, `Pi version`, or `Global version` in the audited frontend UI/legal paths. Technical labels remain allowed only in backend code, CI, and technical docs.

## 9. `frontend-pi` compliance verification

PASS after fix.

- Pi auth route uses `authenticateWithPi()`.
- Pi SDK service uses `Pi.authenticate(['username', 'payments'], ...)`.
- Pi payment service uses `Pi.createPayment(...)` through the SDK service.
- No visible non-Pi payment provider labels remain in `frontend-pi/app`, `frontend-pi/src`, or `frontend-pi/public/legal` scans.
- No visible non-Pi login labels remain in `frontend-pi/app`, `frontend-pi/src`, or `frontend-pi/public/legal` scans.

## 10. `frontend-global` verification

PASS.

The global frontend typecheck/lint/export all pass. The global app still exposes global payment/auth option constants including PawaPay, Stripe, Binance Pay, USDT, Email, Phone, Google, Apple, and Pi for global-market flows.

## 11. Backend channel enforcement verification

PASS for code inspection and existing tests.

The backend contains `AppChannel`, `ChannelMiddleware`, `CurrentChannel`, and channel-aware controller/service enforcement. The Pi payment controller remains protected by JWT auth and channel policies. Follow-up tests are recommended for exhaustive provider/currency denial matrices.

## 12. Migration verification

PARTIAL.

Code inspection confirms migrations add the app channel enum, channel columns/indexes, user registration channel fields, and `pi_payments` with uniqueness constraints. Runtime migration execution is blocked locally by the unavailable PostgreSQL environment.

## 13. Pi API security verification

PASS.

- `PI_API_KEY` is referenced only as backend configuration/environment input.
- `PI_RECEIVING_WALLET` is an env var placeholder, not a hard-coded private value.
- No Pi secret was found in `frontend-pi`.
- Frontend env only exposes public Pi/app metadata.
- Pi access tokens are verified server-side through the Pi API service.

## 14. Pi payment idempotence verification

PASS by code inspection, with follow-up tests recommended.

The Pi payment entity includes unique `paymentId` and partial unique `txid` constraints. Service logic prevents repeat completion and handles incomplete/cancel/error flows without frontend-only crediting. More branch-specific unit/e2e tests should be added before Pi Mainnet launch.

## 15. Recommendations before Pi Mainnet launch

1. Run migration tests against a clean PostgreSQL database in CI.
2. Add exhaustive backend tests for each disallowed Pi-channel auth/payment provider and idempotent payment branch.
3. Perform a real Pi Browser test for authenticate, approve, complete, cancel, error, and incomplete payment recovery callbacks.
4. Confirm production env has `PI_SANDBOX=false`, `PI_NETWORK=mainnet`, and backend-only `PI_API_KEY`.
5. Re-run branding and non-Pi provider scans before every Pi listing submission.
