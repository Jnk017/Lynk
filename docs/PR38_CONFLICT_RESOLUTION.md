# PR #38 Conflict Resolution

GitHub reported merge conflicts on `frontend-pi` auth/admin/privacy route files and static legal assets. Those files are already owned by the target branch in the open PR context, so this update removes the duplicate copies from the PR branch and lets the target branch versions win during merge.

The PR branch keeps the non-conflicting audit and Pi callback authentication fixes:

- `frontend-pi/src/services/api/client.ts` stores and sends `Authorization: Bearer <lynkJwt>` for Pi backend calls.
- `frontend-pi/src/services/pi/pi-sdk.service.ts` saves the backend-issued Lynk JWT after Pi authentication.
- `docs/POST_MERGE_AUDIT_PR37.md` documents the post-merge audit and the migration environment limitation.

This avoids add/add conflicts while preserving the critical JWT callback fix that was requested during the audit.
