# Sprint 2C-2 — Safety, Reporting, Moderation & Trust Operations

## Member reporting workflow

1. A signed-in member selects one of the supported report reasons and may add details and an evidence note.
2. The API creates an auditable report in `pending` (`Submitted`) state without taking automatic punitive action.
3. A moderator moves the report to `reviewing` (`Under Review`).
4. A moderator closes the report as `resolved` or `dismissed`, with a required member-safe resolution note.
5. Members can see dates, categories, statuses, and resolution notes in **My Reports**. Moderator identity remains internal.

All transitions update timestamps, attach the internal moderator ID, create audit-log records, and emit the existing observability events. Report details and evidence notes are not returned in report-history list responses.

## Blocking behavior

Blocking is explicit and confirmed in the UI. A block:

- prevents both members from messaging one another;
- prevents new matches and excludes both members from discovery for one another;
- marks an existing match as unmatched;
- prevents chat history access while the block exists;
- does not notify the blocked member.

Unblocking is also explicit. It restores eligibility for future discovery and interaction but does not recreate previous matches.

## Admin MVP

The Alpha moderation workspace supports report filtering, report review, resolution, dismissal, and verification-queue review. Admin user search supports display name, email, or phone. Every moderation decision is recorded through the existing audit log; moderator identities are never exposed through member endpoints.

## Trust indicators

The client renders only indicators backed by current account data: Verified, Profile Complete, Founder, and the existing subscription tier badges (including Gold and Platinum). No synthetic safety score or unsupported **Safe Member** badge is created.

## Privacy and scope

This sprint adds no surveillance, AI moderation provider, payment integration, subscription billing change, staking change, or referral change. Safety analytics use the existing observability abstraction and avoid report narrative content.
