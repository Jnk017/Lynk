# Payment State Synchronization

PR58 defines the frontend synchronization contract after confirmed payments.

## Subscription state

After a confirmed subscription payment, the frontend must invalidate subscription and profile state so the premium badge, plan name and expiration are reloaded from the backend source of truth.

## Founder state

After eligible payments, the frontend must invalidate founder and profile state so founder benefits, revenue-sharing eligibility and founder badges are refreshed from backend state.
