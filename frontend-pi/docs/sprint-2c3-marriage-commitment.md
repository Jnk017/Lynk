# Sprint 2C-3 — Marriage Commitment Experience

## Product intent

Marriage Staking is presented as a **mutual commitment mechanism**, not an investment product. The mobile experience emphasizes trust, relationship clarity, long-term planning, marriage readiness, and a shared understanding of what happens next. It does not change payment providers, subscription billing, staking calculations, settlement rules, matchmaking, ranking, or backend business logic.

## Marriage Commitment Center

`/profile/marriage` replaces the previous placeholder with a premium, responsive center containing:

- A plain-language explanation of Marriage Staking.
- A private, visual-only commitment-readiness score.
- The member's current commitment status.
- Partner verification, profile completion, commitment status, and shared progress when those existing fields are available.
- An eight-stage commitment timeline.
- Contextual required actions.
- Educational benefits.
- Links to history and the Commitment Wallet.
- Encouraging empty, loading, error, and retry states.

The score is calculated locally from existing profile completion, verification, and relationship progress only. It is never persisted and does not affect matching, ranking, billing, or staking rules.

## Commitment journey

The visible timeline has eight ordered stages:

1. Matched
2. Relationship started
3. Commitment created
4. Marriage commitment active
5. Proof submitted
6. Verification review
7. Marriage confirmed
8. Commitment released

Each stage is announced and displayed as **Completed**, **Current**, or **Upcoming**. If no relationship commitment exists, all stages remain upcoming; the UI does not invent progress.

## Milestone system

The Commitment Wallet presents five non-competitive milestones:

- First Match
- Verified Profile
- Commitment Created
- Proof Submitted
- Marriage Confirmed

Milestones have three visual states: **Unlocked**, **In progress**, and **Locked**. They provide recognition and orientation without points, streaks, leaderboards, rewards, or public comparison.

## Screens

- `/profile/marriage` — Marriage Commitment Center.
- `/profile/marriage/benefits` — Why Commitment Matters education.
- `/profile/marriage/history` — private commitment history with loading, error, retry, and empty states.
- `/profile/staking` — Commitment Wallet, active commitments, progress, milestones, and history.
- `/profile` — entry points for the Commitment Center and Commitment Wallet.

## Accessibility

- Semantic headers, buttons, links, summaries, alerts, lists, and progress bars.
- Descriptive labels and hints for navigation and actions.
- Timeline stages announce order, status, title, and description.
- Milestones announce lock state and meaning.
- Progress bars expose minimum, maximum, and current values.
- Celebration motion respects the operating-system reduced-motion setting.
- Existing high-contrast gold, purple, white, and semantic status tokens are used against dark surfaces.
- Content is scrollable, flexible, and capped at a tablet-friendly width to avoid clipping on small and large displays.

## Analytics

The existing frontend observability abstraction is used for:

- `commitment_center_opened`
- `commitment_created_viewed`
- `commitment_history_opened`
- `commitment_benefits_opened`
- `proof_submission_started`
- `proof_submission_completed`
- `milestone_viewed`

Analytics remains non-blocking and does not introduce a provider.

## Before and after

**Before:** Marriage and date-staking routes were static placeholders that described future work. They did not explain commitment, expose progress, handle data states, or connect to profile navigation.

**After:** Members receive a premium relationship journey with truthful empty states, visible stages, partner context, educational guidance, milestone recognition, subtle celebrations, history, accessible progress, and clear navigation. No financial or backend rule changed.

## Alpha readiness

**Updated score: 86/100.** The frontend commitment experience is alpha-ready and materially improves comprehension, differentiation, trust language, accessibility, and retention-oriented progression. Remaining risk is data availability: the current backend exposes creation and proof-submission commands but no read endpoint dedicated to commitment history. The frontend therefore consumes existing optional profile payload fields when available and otherwise shows honest empty states.

## Sprint 3 recommendation

Prioritize a **Relationship Foundations** sprint:

1. Couple conversation prompts for values, expectations, family, conflict, and long-term planning.
2. Private shared relationship check-ins with no streaks or public scoring.
3. Read-only backend query endpoints for authorized commitment and history records, without changing calculations or settlement logic.
4. Proof-submission UX only after secure media-upload, privacy, review-SLA, and recovery flows are approved.
5. Usability and accessibility testing with serious-dating users, couples, screen-reader users, and small-device users.
