# Provider Adapter Contracts and Sandbox Stubs

PR63 lets Lynk move forward while waiting for final provider API credentials.

## Providers

- PawaPay for the Global frontend.
- Binance Pay for the Global frontend.
- Pi Network / Pi SDK for the Pi frontend.

## Required before production activation

### PawaPay

- API key.
- Base URL.
- Webhook secret.
- Deposit status callback URL.
- Supported countries and currencies confirmation.
- Minimum and maximum transaction amounts.

### Binance Pay

- API key.
- Secret key.
- Base URL.
- Webhook/callback secret.
- Merchant trade number rules.
- Supported currencies and amount limits.

### Pi Network

- Pi API key.
- Pi app identifier.
- Pi SDK runtime validation.
- Server-side payment approval callback.
- Server-side payment completion callback.

## Certification checklist

- Sandbox create payment.
- Sandbox pending status.
- Sandbox success status.
- Sandbox failed status.
- Duplicate webhook replay.
- Idempotent transaction consumption.
- Wallet reconciliation.
- Admin audit visibility.
