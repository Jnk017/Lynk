# Payment Success Business Event Wiring

This document defines the post-payment business events that must be triggered once a payment transaction is confirmed.

## Premium activation

A confirmed subscription payment must activate the member subscription, refresh profile state, and expose the premium badge.

## Boost activation

A confirmed boost payment must activate the boost entitlement and increase visibility only once for the confirmed transaction.
