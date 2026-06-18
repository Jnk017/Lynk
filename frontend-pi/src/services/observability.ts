export type FrontendObservabilityEvent =
  | "user_registered"
  | "onboarding_completed"
  | "profile_verified"
  | "swipe_created"
  | "match_created"
  | "message_sent"
  | "gift_sent"
  | "payment_created"
  | "subscription_started"
  | "referral_completed"
  | "founder_joined"
  | "commitment_center_opened"
  | "commitment_created_viewed"
  | "commitment_history_opened"
  | "commitment_benefits_opened"
  | "proof_submission_started"
  | "proof_submission_completed"
  | "milestone_viewed"
  | "report_created"
  | "report_submitted"
  | "report_resolved"
  | "report_dismissed"
  | "user_blocked"
  | "user_unblocked"
  | "safety_center_opened"
  | "verification_reviewed";

type EventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const POSTHOG_HOST =
  process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

function scrubProperties(properties: EventProperties): EventProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(
      ([key]) => !/token|secret|password/i.test(key),
    ),
  );
}

export async function trackFrontendEvent(
  event: FrontendObservabilityEvent,
  distinctId: string,
  properties: EventProperties = {},
): Promise<void> {
  if (!POSTHOG_API_KEY) return;

  try {
    await fetch(`${POSTHOG_HOST.replace(/\/$/, "")}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_API_KEY,
        event,
        distinct_id: distinctId,
        properties: scrubProperties(properties),
      }),
    });
  } catch {
    // Analytics must never break the user flow.
  }
}

export function captureFrontendException(
  _error: unknown,
  _properties: EventProperties = {},
): void {
  if (!SENTRY_DSN) return;
  // Placeholder for the official Sentry React Native SDK. Keep non-blocking.
}
