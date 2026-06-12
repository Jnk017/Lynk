# Payment provider code implementation

This branch contains the code changes for replacing the legacy payment provider targets with Pawapay and Binance Pay.

## Implemented changes

- Replaced legacy payment configuration variables with Pawapay and Binance Pay variables.
- Updated frontend refresh-token handling to persist the rotated refresh token returned by `/auth/refresh`.
- Added provider stubs for Pawapay and Binance Pay in non-production/test mode.
- Removed legacy Coinbase Commerce provider stub from the active branch.
- Updated payment module provider registration.
- Updated payment service provider map to expose Pawapay and Binance Pay.
- Updated provider tests to use Pawapay and Binance Pay.
- Added a TypeORM migration for the new provider enum values.

## Important follow-up

The current Pawapay and Binance Pay providers are still stubs for development/test mode. Before production launch, replace them with real provider implementations that verify signatures, validate provider status server-side, and process webhooks idempotently.
