# Production readiness payment provider changes

This branch prepares Lynk for a cleaner production payment surface.

## Scope

- Retire the legacy provider targets: Moneroo, AvadaPay and Coinbase Commerce.
- Introduce Pawapay and Binance Pay as the next payment provider targets.
- Document the required follow-up implementation steps before production rollout.

## Required backend changes for final implementation

1. Replace `TransactionProvider` values for legacy providers with:
   - `pawapay`
   - `binance_pay`
2. Register the new provider classes in `PaymentModule`.
3. Wire the provider map in `PaymentService` to only expose active providers.
4. Add a TypeORM migration that extends `transaction_provider_enum` with `pawapay` and `binance_pay`.
5. Keep old enum values in PostgreSQL only for historical records; do not expose them in new code.
6. Update `.env.example` with:
   - `PAWAPAY_API_KEY`
   - `PAWAPAY_BASE_URL`
   - `BINANCE_PAY_API_KEY`
   - `BINANCE_PAY_BASE_URL`
7. Remove old provider environment variables.

## Required frontend changes

The mobile API client must persist both tokens returned by `/auth/refresh`.
The backend rotates refresh tokens, so storing only the new access token breaks the next refresh attempt.

## Security note

Production must not rely on provider stubs. Pawapay and Binance Pay require real implementations with:

- request signing or bearer authentication;
- webhook signature verification;
- idempotent webhook processing;
- provider-side status verification;
- explicit transaction state transitions;
- integration tests for success, failure, duplicate webhook and replay attempts.

## Review status

This PR is opened as a review branch. Do not merge until the provider implementations and CI checks are complete.
