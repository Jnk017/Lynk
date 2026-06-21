# Wallet Balance Integrity

This document defines P0 wallet balance invariants for Lynk before any cash-in, cash-out, wallet transfer, or stored-balance feature is expanded.

## Core invariants

- A wallet balance must never become negative.
- Balance mutations must be tied to a durable transaction record.
- A completed transaction must be consumed only once.
- Retried webhooks must be idempotent and must not double-credit or double-debit a user.
- Failed, cancelled, pending, or unknown transactions must not mutate wallet balances.
- Balance updates must run in the same database transaction as the transaction state change.
- Any rollback must leave both the transaction row and the user balance unchanged.
- Currency-specific balances must not be mixed.

## Cash-in requirements

- Credit only after provider confirmation is verified.
- Credit only if the provider transaction belongs to the authenticated user or verified account owner.
- Store provider, external reference, currency, amount, and confirmation timestamp in metadata.
- Reject duplicate external references before balance mutation.

## Cash-out requirements

- Reserve or debit atomically before submitting payout.
- Reject withdrawals when available balance is insufficient.
- Restore or release funds when provider payout fails.
- Keep payout status transitions auditable.

## Test coverage checklist

Future wallet service tests must cover:

- successful cash-in credit,
- duplicate cash-in webhook replay,
- failed cash-in webhook,
- cash-out insufficient balance,
- cash-out provider failure rollback,
- concurrent balance mutation protection,
- cross-currency mutation rejection,
- transaction metadata integrity,
- audit logging for manual admin balance changes.

## Current status

The current backend hardening already covers payment transaction consumption for subscriptions and payment provider failure paths. A dedicated wallet service should implement the invariants above before exposing user-facing wallet cash-in or cash-out flows.
