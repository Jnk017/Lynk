# Dependency Audit

## Commands attempted

```bash
cd backend && npm audit --audit-level=low
cd backend && npm outdated
cd frontend && npm audit --audit-level=low
cd frontend && npm outdated
```

## Results

| Command | Result |
| --- | --- |
| Backend `npm audit` | Blocked by registry `403 Forbidden` on advisory endpoint. |
| Backend `npm outdated` | Blocked by registry `403 Forbidden` fetching package metadata. |
| Frontend `npm audit` | Blocked by registry `403 Forbidden` on advisory endpoint. |
| Frontend `npm outdated` | Blocked by registry `403 Forbidden` fetching package metadata. |

## Vulnerabilities remaining

Unknown in this container because npm registry audit endpoints are blocked by policy/network. CI or a developer workstation with registry access must run the same commands before beta.

## Risk level

Medium until dependency audit can be completed in an environment with npm registry access.

## Safe automatic fixes

No automatic dependency fixes were applied because audit metadata could not be retrieved.
