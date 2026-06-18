# Payment Provider Audit

## Scope

Command executed:

```bash
rg -ni "stripe|moneroo|avadapay|flutterwave|coinbase"
```

## Active providers

| Provider | Runtime status |
| --- | --- |
| Pi Network | Active |
| Pawapay | Active |
| Binance Pay | Active |

## Legacy provider findings

| Provider | Runtime references | Remaining references |
| --- | ---: | --- |
| Stripe | 0 | Historical migration enum and archived reports only |
| Moneroo | 0 | Historical migration enum and archived reports only |
| AvadaPay | 0 | Historical migration enum and archived reports only |
| Flutterwave | 0 | Archived reports only |
| Coinbase Commerce | 0 | Historical migration enum and archived reports only |

## Actions taken

- Updated obsolete provider implementation documentation so it no longer states Pawapay/Binance Pay are test-only stubs.
- Confirmed no active controller, service, DTO, config, environment template or frontend payment flow exposes legacy providers.
- Kept historical migration values unchanged to avoid destructive enum rewrites.

## Result

No active non-approved payment provider remains. Production payment scope is Pi Network, Pawapay and Binance Pay only.
