# Sprint 2C-1 — Profile completion and verification

## Completion engine

The frontend computes a deterministic 0–100 profile score from the product weights: photo 15, about 15, interests 10, location 10, relationship goals 10, values 10, verification 15, lifestyle 5, languages 5, and education/occupation 5. Scores map to Weak (0–39), Fair (40–59), Good (60–79), and Excellent (80–100).

Compatibility details use the existing `lifestyleTags` JSON field with a category and label. This preserves backend architecture while allowing interests, values, goals, lifestyle, languages, education, and occupation to participate independently in completion.

The relationship seriousness score shown on the private profile is a presentation insight, not a backend ranking or matchmaking change. It combines 60% profile completion and 40% of the existing trust score. It is never used to gate features.

## Trust system

Trust indicators are restrained status labels for verified identity, verified selfie, complete profile, founder status, and existing Gold or Platinum membership. They do not award points and do not change billing, staking, matching, or marriage logic.

## Verification experience

The verification center presents five progressive levels: phone, email, identity submission, identity approval, and selfie verification. Existing KYC and liveness endpoints are reused. Documents remain private and are not rendered on profile surfaces. States are presented as Approved, Pending review, or Needs action.

## UX and accessibility

Profile actions expose labels, hints, button roles, progress values, and status summaries. Empty states use supportive, non-shaming language. Layouts are single-column, wrapping, and scroll-based for small and large phones. Motion uses the established design-system durations for completion growth and verification status emphasis.
