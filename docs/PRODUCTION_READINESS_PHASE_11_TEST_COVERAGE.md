# Production Readiness — Phase 11: Critical Test Coverage

## Goal

Raise confidence in the modules that most directly affect security, money flows, trust and user safety without requiring an external PostgreSQL instance for unit tests.

## Coverage added in this phase

- Chat security tests:
  - users cannot create/read a match room when they are not a match participant;
  - toxic text is rejected before persistence or notification;
  - valid messages are persisted, notify other participants, and emit `message_sent` observability events.
- Profile validation tests:
  - profile media uploads go through S3 and persist generated URL metadata;
  - maximum active photo limit is enforced before upload;
  - users cannot delete media they do not own;
  - prompt limit is enforced.
- Referral reward safety:
  - `onUserVerified()` now exits if a referral was already verified, preventing duplicate referral increments/rewards;
  - test confirms a repeated verification call only saves/increments once.
- Payment consumption tests:
  - completed transaction lookup is constrained by user, type and completed status;
  - already-consumed subscription transactions are rejected;
  - consumption metadata is merged without dropping existing provider metadata.

## Existing critical coverage retained

- Auth refresh-token hashing, rotation, logout and reuse detection.
- Registration password policy.
- Founder allocation concurrency and 2,500 cap.
- Revenue-sharing idempotency, dry-run, no-founder and rollback behavior.
- Payment provider stubs and webhook idempotency.
- RBAC guard and admin service behavior.
- Production error response stack redaction.
- Observability property scrubbing.

## Remaining test gaps

- E2E tests are still needed for real HTTP request behavior: global validation pipe rejection, throttling, multipart upload rejection and admin route protection through guards.
- Migration execution still needs a real PostgreSQL service and is covered by CI rather than local unit tests.
- Frontend tests are still blocked until the npm registry issue for React Native dependencies is resolved.
