# Payment Provider Code Implementation

Active runtime payment providers are limited to:

- Pi Network
- Pawapay
- Binance Pay

Legacy payment providers are not active in runtime code, controllers, DTOs, frontend payment flows or environment templates. Historical removal notes live in archival production-readiness reports only.

Pawapay and Binance Pay provider classes keep their original filenames for backward-compatible imports, but now include production-oriented request validation, idempotency/correlation metadata, provider-side verification and webhook signature/replay checks. Before live launch, run sandbox contract tests with merchant credentials for both providers.
