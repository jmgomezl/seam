# Run your fulfillment decision logic locally

This runner is for a trusted, isolated handler with fake effects. It is not a webhook server, a production replay tool or a sandbox. Do not point it at real shipping, payments, email, customer records or credentials.

## 1. Verify the tool before connecting your code

From the Seam repository with Node 22+:

```sh
node --experimental-strip-types scripts/check-fulfillment.mjs --help
node --experimental-strip-types scripts/check-fulfillment.mjs --reference
```

The authored in-memory reference should report 9/9 and exit 0. Without flags, the deliberate race reports 7/9 and exits 1. Neither establishes that your code works.

## 2. Isolate the actual decision logic

Use an existing function whose storage, waiting and effect interfaces can be injected. Replace storage with fresh in-memory test state and effects with the supplied recorder. Add the injected checkpoint at the asynchronous boundary that matters. Return a promise covering all work. Background work after resolution is not observed reliably.

For example, if your module exports `createOrderService({store, waitForIO, fulfill})`, a thin adapter might look like this:

```js
import {createOrderService} from './your-local-order-service.mjs';
import {createFakeStore} from './your-local-test-store.mjs';

export function createHandler({recordFulfillment, checkpoint}) {
  return createOrderService({
    store: createFakeStore(),
    waitForIO: checkpoint,
    fulfill: recordFulfillment,
  });
}
```

This is an interface illustration, not a drop-in adapter: those application exports must actually exist and the returned handler must accept `{sessionId, paymentStatus}`. Review your imports; even module initialization can execute arbitrary code. Do not rewrite the business logic in the wrapper just to pass tests. A copied reference is not independent validation.

## 3. Run and save a new artifact

```sh
node --experimental-strip-types scripts/check-fulfillment.mjs --adapter ./adapter.mjs --report ./review-001.json
```

Paths are relative to your current directory. The adapter can import sibling modules. The nine fixed expectations use synthetic sessions: paid/no-payment-required should fulfill once per session; unpaid should not fulfill; retries should not add effects; distinct sessions should remain distinct.

- Exit **0**: all nine checks passed, not production approval.
- Exit **1**: inspect failed schedules and their actual/expected ledgers.
- Exit **2**: setup or report failure. A report collision can happen after the replay ran; choose a new filename, do not assume nothing executed.

Reports never overwrite. They contain counts and hashes, not ledger IDs, paths, source or error strings. Console output can contain adapter-provided data: inspect before sharing.

## 4. Make a negative control, then review limitations

In a disposable test branch, temporarily drop a fulfillment effect and verify a previously passing suite fails. Restore the code before reviewing results. If it stays green, check that your wrapper really calls the intended implementation and awaits the effect.

The report hashes only the entry adapter and replay module. An imported business module can change while the adapter hash stays identical. Hashes are not proof of dependency identity, authorship, integrity or actual execution. Preserve the application commit separately in your own review process; Seam does not inspect or attest your repository.

Real concurrency and crash safety still need your database/transaction integration tests, multiple-process tests, restart tests and failure injection. The local runner does not implement durable exactly-once effects. Adoption and time-saving benefits remain unmeasured.

### A handler that never finishes

Each fixture waits at most 5 seconds for asynchronous handler work. A waiting
limit produces a failing `timed-out` result; remaining fixtures are marked
`not-run`, not presented as executed failures or successes. The optional metadata
report preserves those statuses without adapter error text. A late completion
cannot change the returned evidence, and no later batches/fixtures are started.
The default racy and reference fixtures still have their original 7/9 and 9/9
outcomes.

This stops waiting, **not your code**. It cannot cancel your network calls, undo
side effects, interrupt CPU-blocking JavaScript, bound module import, or close
resources your adapter leaves open. Use fake effects and trusted code; apply your
CI's external process timeout as a separate safeguard. The programmatic runner
accepts `{timeoutMs}` from 1 to 60,000 ms for controlled local tests; the CLI uses
5,000 ms. Synchronous throws are also collected alongside started sibling calls
before reporting, unless the waiting limit is reached.
