# PR #38 Conflict Resolution

GitHub reported merge conflicts on `frontend-pi` auth/admin/privacy route files and static legal assets. Those files are already owned by the target branch in the open PR context, so this update removes the duplicate copies from the PR branch and lets the target branch versions win during merge.

The PR branch keeps the non-conflicting audit documentation and records the Pi callback authentication issue for a follow-up patch once the branch is mergeable.

## Follow-up conflict pass

GitHub later reported three remaining conflicts in `frontend-pi/src/features/profile/verification.ts`, `frontend-pi/src/services/api/client.ts`, and `frontend-pi/src/services/pi/pi-sdk.service.ts`. This branch now aligns those three files with the target branch shape to remove the remaining textual conflicts and keep the PR mergeable.

The alignment intentionally avoids carrying overlapping edits in those three files. The Pi callback JWT persistence requirement remains documented in `docs/POST_MERGE_AUDIT_PR37.md` as a follow-up to reapply on top of the merged target branch.

## Final two-file conflict pass

GitHub then reported two remaining conflicts in `frontend-pi/src/services/api/client.ts` and `frontend-pi/src/services/pi/pi-sdk.service.ts`. This update accepts the target-branch style for both conflict hunks: inline request headers in `lynkApi` and the target-branch `authenticateWithPi` SDK flow.
