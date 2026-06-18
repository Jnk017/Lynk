# Technical Debt Report

Command executed:

```bash
rg -ni "TODO|FIXME|HACK|XXX|TEMP|STUB|MOCK"
```

## Critical

None found in active runtime code.

## Important

| Item | Location | Notes |
| --- | --- | --- |
| Provider class filenames contain `stub` | `backend/src/modules/payment/providers/*stub.ts` | Class names/filenames remain for backward-compatible imports, but implementations now include production-oriented validation/signature checks. Rename in a follow-up refactor only. |
| Generic test-mode provider remains | `backend/src/modules/payment/providers/test-mode-payment-provider.stub.ts` | Not wired to active providers. Keep for tests/dev unless unused after future refactor. |
| Frontend placeholder screens | `frontend/app/**` | Several app screens still contain `todo` placeholder text. Not security-critical for backend beta, but product readiness item. |

## Minor

- Unit/e2e tests contain mocks by design.
- Historical docs mention removed payment providers and should remain archived or be moved under an explicit archive folder later.
