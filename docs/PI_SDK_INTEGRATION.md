# PI SDK INTEGRATION

“frontend-pi”, “frontend-global”, “PI_ECOSYSTEM” and “GLOBAL” are internal technical labels only. The public product name must always remain “Lynk”.

## Public branding

- App public name: Lynk
- Public product, UI, emails, notifications, legal pages, onboarding, payment screens, settings, support, marketing, public reports and investor exports must use the single product name Lynk.
- Internal channel labels are allowed only in source code, deployment paths, CI, technical docs, guards, feature flags, and tests.

## Operating model

- The backend is shared and receives `X-Lynk-Channel` on every frontend request.
- The Pi Browser deployment uses Pi authentication and Pi payments only.
- The mobile/web deployment can use enabled global authentication and payment providers.
- Server-side guards and Platform API verification are mandatory; frontend callbacks are never trusted as final proof.
