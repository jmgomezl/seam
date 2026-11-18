# Practical boundary: repeated Checkout fulfillment

## Source and choice

Sources checked 2026-11-18:
- [Stripe Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment.md?ui=full-page), Create a fulfillment function: fulfillment can be requested repeatedly and concurrently for one Checkout Session. A handler needs to check payment status and avoid repeated fulfillment.
- [Stripe webhook duplicates](https://docs.stripe.com/webhooks#handle-duplicate-events): deliveries can repeat; separate events can refer to the same underlying object. A transport delivery is not inherently a unique business action.

These are documented integration requirements, **not evidence of a Stripe defect or a discovered customer incident**. All code/fixtures here are authored synthetic reproductions. No third-party implementation is copied. The test starts after authentication and retrieval of an authoritative session; it is not a webhook endpoint or full Stripe payload validator.

Why choose this instead of adding another conversion example? A passing happy-path test and even sequential duplicate test can hide a check-then-act race. The observable consequence is two local fulfillment records for one session. This demonstrates a time/identity boundary with a practical regression a team can adapt. It does not establish demand, revenue, saved money or superiority to other test tools.

## Run it (Node 22+)

From repository root:

```sh
# Deliberate check/await/write race: 7/9 fixtures pass; exit 1.
node --experimental-strip-types scripts/check-fulfillment.mjs
# In-memory single-process reference: 9/9 pass; exit 0.
node --experimental-strip-types scripts/check-fulfillment.mjs --reference
# Supplied intentionally racy local adapter: 7/9 pass; exit 1.
node --experimental-strip-types scripts/check-fulfillment.mjs --adapter ./examples/fulfillment-adapter.mjs
# Full test suite, including CLI execution and negative controls.
npm test
```

`--adapter` imports and executes arbitrary JavaScript. It is **not sandboxed** and can access the machine/network with the process's permissions. Review trusted local code first. Never connect this runner to live shipping, billing, email, customer records or production credentials. No dependencies, outbound requests or stored user data are added by the built-in replay itself.

## Adapter contract

Export `createHandler({recordFulfillment, checkpoint})`, returning an async function accepting `{sessionId, paymentStatus}`. Session IDs are synthetic. Status is paid, unpaid, or no_payment_required. Use the injected `recordFulfillment(sessionId)` for the sole simulated business effect. Await `checkpoint()` at the async I/O boundary that matters for your handler. All work must complete before the returned promise resolves. Each fixture receives fresh adapter state; a batch calls the handler concurrently, later batches wait for earlier batches. Different sessions must not suppress one another.

The bundled example shows the interface; replacing it with another equally authored example is not external validation. To test a real codebase, isolate its actual decision logic and inject fake storage/effects. Keep the real transaction semantics in a dedicated integration test as well. Missing the relevant await boundary or scheduling background work after resolution can invalidate this replay's observations.

## What is measured

Nine fixed input schedules have separately written expected ledgers: one paid request; sequential repeat; two concurrent requests; five concurrent requests; two distinct sessions; unpaid; unpaid then paid; no-payment-required; and replay after a two-session batch. The runner compares actual recorded session IDs with the expected multiset, independent of call completion order. It does not calculate expected behavior using the adapter's deduplication state. Negative controls demonstrate detection of duplicate effects, dropped effects, global instead of per-session deduplication, and fulfillment of unpaid requests.

The deliberately racy adapter records twice for the two-request concurrent fixture and five times for the burst; the single-process reference records once in each. Neither result is an AI inference. This module/CLI is not yet wired into the browser demo.

## Limits that matter

- The reference uses a JavaScript Map and Set shared by one handler instance. They disappear on process restart and do not coordinate multiple servers. **Do not use it as a production fulfillment implementation.**
- Crash recovery, database isolation, durable transactions, distributed locking, delivery ordering, signature verification, subscription lifecycle, refunds, chargebacks and real Stripe retrieval are outside this suite. A process dying after a real side effect but before recording completion remains unsolved here.
- No claim of exactly-once transport or guaranteed exactly-once effects. Durable systems need an application-specific atomic/idempotent effect strategy and failure tests.
- The finite schedules do not exhaust interleavings. A local adapter can hang or lie; this is trusted-code testing, not adversarial execution or attestation. CLI fixture failures exit 1; loading/argument failures exit 2.
- No production adapter, buyer or external reviewer is represented as validated. Next milestone: a permission-cleared actual handler whose storage/effects can be injected, plus an independently reviewed expectation and crash/concurrency integration tests.

## Judge demonstration

Show the same session twice, then its ledger: two records with the racy adapter, one with the reference. Reveal that sequential retry already passed. Show the official concurrency requirement and the exported CLI test. Explain the specific unsupported failure modes before claiming readiness. The honest value proposition is making a stated cross-system assumption executable and reviewable, not “AI guarantees your integration.”
