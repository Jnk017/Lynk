# LYNK Production Readiness — Payment Architecture v2

## Goal

Standardize Lynk's production payment surface around three supported payment modes only:

- Pi Network
- Pawapay
- Binance Pay

This replaces the earlier exploratory payment-provider architecture and removes legacy provider targets from the active product scope.

## Supported provider matrix

| Provider | Status | Primary role |
| --- | --- | --- |
| Pi Network | Active | Pi wallet authentication, Pi payment verification, staking and Web3 ecosystem flows |
| Pawapay | Active target | Mobile Money payments for supported African markets |
| Binance Pay | Active target | Crypto payments and international settlement |

## Removed provider targets

The following providers are removed from the active Lynk payment architecture:

| Provider | Status |
| --- | --- |
| Stripe | Removed |
| Moneroo | Removed |
| AvadaPay | Removed |
| Flutterwave | Removed |
| Coinbase Commerce | Removed |

## Backend architecture

The payment module should expose:

- `POST /payment/pi/verify` for server-side Pi payment verification.
- `POST /payment/providers/:provider/create` for Pawapay and Binance Pay payment creation.
- `POST /payment/providers/:provider/webhook` for Pawapay and Binance Pay webhook intake.
- `GET /payment/transactions` for authenticated user transaction history.

`TransactionProvider` should expose only:

- `pi_network`
- `pawapay`
- `binance_pay`

Historical database enum values may remain in old migrations only as migration history. They must not be used by the active code path.

## Frontend architecture

The frontend should only reference:

- Pi payment verification.
- Generic provider payment creation for Pawapay and Binance Pay.
- Transaction history.

It must not expose removed providers as selectable payment methods.

## Production controls required

Pawapay and Binance Pay implementations must include:

- provider API authentication;
- request signing where required;
- webhook signature verification;
- idempotent webhook processing;
- external status verification before marking transactions completed;
- reconciliation reporting;
- integration tests for success, failure, duplicate webhook and replay scenarios.

## Validation checklist

Before production launch:

- Backend lint, build and tests pass.
- Frontend install, typecheck and lint pass.
- `.env.example` and Docker environment variables expose only Pi Network, Pawapay and Binance Pay payment secrets.
- README and production docs present only the supported payment modes.
- Removed providers are absent from active controllers, services, config and frontend endpoint constants.
