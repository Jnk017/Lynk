# Production Readiness — Phase 10: Observability

## Goal

Make Lynk monitorable with health checks, correlation IDs, safe error capture and analytics event plumbing without requiring third-party observability credentials in local development.

## Backend additions

- Added `ObservabilityModule` with:
  - `GET /api/v1/health` for database, Redis, storage configuration and queue status checks;
  - `ObservabilityService.track()` for PostHog events;
  - `ObservabilityService.captureException()` as a non-blocking Sentry-ready error capture placeholder.
- Wired the global HTTP exception filter to forward server-side errors to the observability service when configured.
- Added backend PostHog event tracking for:
  - `user_registered`;
  - `founder_joined`;
  - `message_sent`;
  - `payment_created`;
  - `subscription_started`.
- Defined the full minimum event vocabulary requested for future expansion:
  - `user_registered`, `onboarding_completed`, `profile_verified`, `swipe_created`, `match_created`, `message_sent`, `gift_sent`, `payment_created`, `subscription_started`, `referral_completed`, `founder_joined`.

## Frontend additions

- Added a lightweight frontend `trackFrontendEvent()` helper that sends PostHog capture calls when `EXPO_PUBLIC_POSTHOG_API_KEY` is configured.
- Added frontend env typings for `EXPO_PUBLIC_POSTHOG_API_KEY`, `EXPO_PUBLIC_POSTHOG_HOST` and `EXPO_PUBLIC_SENTRY_DSN`.
- Wired frontend registration to emit `user_registered` without blocking the user flow.

## Safety choices

- Analytics calls are fire-and-forget and must never break core app flows.
- Sensitive properties containing `token`, `secret`, or `password` are scrubbed before analytics delivery.
- Sentry is prepared as configuration and capture plumbing, but the official SDK should be added in a later pass for full stack traces, releases and source maps.
- Queue health is reported as configured=false because queue processors are not yet implemented.

## Remaining limitations

- Full Sentry SDK integration and release/source-map upload remain for the next production pass.
- Structured logging is improved by request IDs and centralized error filtering, but a dedicated JSON logger should be added before high-volume production traffic.
- More events should be wired as modules mature: onboarding completion, profile verification, swipes, matches, gifts and referrals.
