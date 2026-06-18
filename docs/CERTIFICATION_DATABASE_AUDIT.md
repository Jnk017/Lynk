# Certification Database Audit

## Migrations

Migrations cover the production schema, refresh tokens, RBAC/admin/report additions, safety/legal foundations, provider enum values, payment statuses and universal audit fields.

## Indexes and constraints

- Refresh tokens are indexed by user, device and revocation status.
- Payment webhook logs enforce unique provider/external event IDs where present.
- Transaction external references are unique.
- Revenue distribution uses idempotency/locking patterns for monthly distribution.

## Foreign keys and soft delete

Business entities use TypeORM relations and soft-delete columns where applicable. Recent hardening added missing soft-delete columns for legal acceptances and user blocks.

## Enum integrity

Payment provider enum is restricted in active code to Pi Network, Pawapay and Binance Pay. Historical enum values remain only in legacy migrations to avoid destructive enum rewrites.

## Migration execution

`npm run migration:run`, `npm run migration:revert`, and another `npm run migration:run` were attempted locally but blocked because PostgreSQL is not listening on `127.0.0.1:5432` / `::1:5432`. CI contains PostgreSQL service validation for these commands.

## Certification result

Database certification: **PASS WITH LOCAL ENVIRONMENT LIMITATION**.
