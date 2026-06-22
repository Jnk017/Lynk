# Payment Success Business Event Wiring

This document defines the post-payment business events that must be triggered once a payment transaction is confirmed.

## Premium activation

A confirmed subscription payment must activate the member subscription, refresh profile state, and expose the premium badge.

## Boost activation

A confirmed boost payment must activate the boost entitlement and increase visibility only once for the confirmed transaction.

## Gift delivery

A confirmed gift payment must create the gift delivery record, notify the recipient, and prevent duplicate delivery for the same transaction reference.

## Wallet balance record

A confirmed wallet cash-in must create a durable balance record, update visible balance from durable records, and preserve transaction linkage.

## Staking creation

A confirmed commitment payment must create the commitment record once, attach it to the transaction reference, and keep the relationship milestone state consistent.
