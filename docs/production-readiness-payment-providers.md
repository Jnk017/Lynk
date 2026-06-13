# Lynk production payment providers

This document defines the production payment surface for Lynk after the payment-provider cleanup.

## Supported payment modes

Lynk supports exactly three payment modes:

1. **Pi Network**
   - Pi wallet authentication.
   - Server-side Pi payment verification.
   - Pi balance crediting.
   - Web3 staking and ecosystem flows.

2. **Pawapay**
   - Mobile Money-oriented payment rail for supported African markets.
   - Intended for fiat cash-in and local-market payments.
   - Must use provider-side status verification and idempotent webhook handling before production rollout.

3. **Binance Pay**
   - Crypto payment rail for international and merchant-style payments.
   - Must use signed provider requests, webhook signature verification and reconciliation before production rollout.

## Removed payment targets

The following providers are not part of Lynk's active payment architecture:

- Stripe
- Moneroo
- AvadaPay
- Flutterwave
- Coinbase Commerce

They must not be exposed by the backend payment module, frontend endpoint constants, environment templates or production documentation as active payment options.

## Required production controls

Before production launch, Pawapay and Binance Pay integrations must include:

- authenticated provider API calls;
- webhook signature verification;
- idempotent webhook processing;
- provider-side transaction status verification;
- explicit transaction state transitions;
- reconciliation reports;
- integration tests for success, failure, duplicate webhook and replay scenarios.

## Current status

- Pi Network remains active as a first-class Web3 payment rail.
- Pawapay and Binance Pay are the only non-Pi provider targets.
- Legacy provider references should be treated as historical migration context only and not as active product scope.
