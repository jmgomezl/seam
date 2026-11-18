# Trigger identity versus fulfillment identity

Verified 2026-11-18 against [Stripe's fulfillment guide](https://docs.stripe.com/checkout/fulfillment.md?ui=full-page).
It describes repeated or concurrent calls for one Checkout Session from webhooks
and the post-checkout page. It requires inspecting the retrieved session's
payment status and recording fulfillment. Delayed payment can become successful
after Checkout completes, with a later async-success event. Thus event receipt
and session fulfillment are different boundaries. A browser redirect is not
proof of successful payment.

## What Seam covers

Before this change, the nine authored schedules represented repeated session
calls and unpaid-to-paid transitions but omitted trigger identity. An adapter
keyed only by event ID could not be meaningfully challenged on that distinction.
The same schedules now carry optional synthetic trigger metadata:

- Same event retried: identical session and event ID, sequential calls.
- Webhook + redirect: concurrent calls for one session; the redirect has no event ID.
- New events, same sessions: distinct event IDs arrive for already fulfilled sessions.
- Delayed success: an unpaid completed-session snapshot is followed by a paid
  async-success snapshot for the same session.

Existing handlers may ignore the optional fields. The deliberately racy example
still passes 7/9; the single-process reference still passes 9/9. Fixture order
and expected ledgers are unchanged. Browser evidence exports the authored
schedules so labels can be checked against inputs; the CLI metadata report still
does not include request inputs or ledger identifiers.

## Negative controls

An authored event-ID-only deduplicator passes repeated delivery of the same event
but fails webhook-plus-redirect and later-distinct-event cases. Another authored
adapter marks a session as done while unpaid: it avoids premature effects but
incorrectly suppresses later paid fulfillment. Regression tests demonstrate
both failures against independent expected ledgers.

These are local synthetic models, not Stripe payload verification, API retrieval,
webhook signature handling, line-item handling, production exactly-once behavior,
durable storage or distributed coordination. Payment status represents a fake
retrieved-session snapshot; do not copy it from untrusted redirect parameters.
No Stripe or Firebase configuration is changed or used.
