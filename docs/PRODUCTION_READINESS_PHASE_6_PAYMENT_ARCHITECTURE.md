# LYNK Production Readiness — Phase 6: Payment Architecture Stubs

## Goal

Prepare Moneroo, AvadaPay and Coinbase Commerce architecture without integrating their real external APIs yet. The stubs must be typed, testable, disabled in production, webhook-loggable, and safe from duplicate webhook processing.

## What changed

- Kept the shared `PaymentProvider` interface and extended webhook results with `externalEventId` so generic webhook idempotency can be enforced.
- Added secure test-mode-only provider stubs:
  - `MonerooPaymentProviderStub`;
  - `AvadaPayPaymentProviderStub`;
  - `CoinbaseCommerceProviderStub`.
- The stubs:
  - refuse to create, verify or handle webhooks when `NODE_ENV=production`;
  - validate payment amounts before creating test checkout references;
  - return typed provider responses;
  - never verify real payments or credit balances.
- Added a provider registry in `PaymentService` for Pi, Moneroo, AvadaPay and Coinbase Commerce.
- Added `PaymentService.createProviderPayment()` to create pending transactions through the provider abstraction while keeping all unfinished providers test-only.
- Added `PaymentService.handleProviderWebhook()` to persist generic webhook logs and ignore duplicate events by `(provider, externalEventId)`.
- Hardened Stripe webhook idempotency by ignoring duplicate Stripe `event.id` values already present in `payment_webhook_logs`.
- Hardened Pi payment crediting with a transaction-scoped advisory lock on the external payment reference and a second in-transaction duplicate check before balance crediting.
- Added generic provider routes:
  - `POST /payment/providers/:provider/create`;
  - `POST /payment/providers/:provider/webhook`.
- Added focused tests for:
  - test-mode provider payment creation;
  - invalid amount rejection;
  - production-disabled provider stubs;
  - generic webhook logging;
  - duplicate webhook idempotency.

## Validation

Passing locally:

- `cd backend && npm test -- --runInBand payment.service.spec.ts`
- `cd backend && npm run lint:check`
- `cd backend && npm run build`
- `cd backend && npm test -- --runInBand`

## Remaining Phase 6 notes

- Moneroo, AvadaPay and Coinbase Commerce still need real API adapters, signature verification, provider-specific webhook schemas and integration tests at the end of the project.
- The current stubs intentionally do not mark payments as verified or completed. This prevents fake providers from being used as production money rails.
- CI should later run provider webhook idempotency tests against PostgreSQL to exercise the unique `(provider, externalEventId)` index under real database constraints.
