# Payment Failure Coverage

This change strengthens payment failure-path tests without changing production behavior.

Covered scenarios:
- Unsupported payment provider is rejected before transaction creation.
- Missing or non-completed transaction cannot be consumed.
- Already consumed transaction cannot be reused.

Out of scope:
- Provider API integration changes.
- Webhook signature verification changes.
- Frontend payment UI changes.
