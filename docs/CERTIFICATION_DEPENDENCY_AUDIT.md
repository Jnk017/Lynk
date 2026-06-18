# Certification Dependency Audit

## Commands executed

```bash
cd backend && npm audit
cd backend && npm outdated
cd frontend && npm audit
cd frontend && npm outdated
```

## Results

| Command | Result |
| --- | --- |
| Backend `npm audit` | Blocked by npm registry `403 Forbidden` advisory endpoint. |
| Backend `npm outdated` | Blocked by npm registry `403 Forbidden` package metadata fetch. |
| Frontend `npm audit` | Blocked by npm registry `403 Forbidden` advisory endpoint. |
| Frontend `npm outdated` | Blocked by npm registry `403 Forbidden` package metadata fetch. |

## Critical/high vulnerabilities

Could not be determined in this container due registry access restrictions.

## Abandoned dependencies

No abandoned dependency could be confirmed without registry metadata. Existing lockfiles remain installable locally.

## Certification result

Dependency certification: **CONDITIONALLY PASS**. Required beta gate: rerun audit/outdated in CI or a developer workstation with registry access before launch.
