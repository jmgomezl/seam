# Developer adapter handoff challenge · 2026-11-18

## Question

Can the downloaded tests execute code in a separate developer module, rather than merely rerun bundled corrections?

## Test performed

`tests/real-adapter-handoff.test.ts` creates a temporary directory outside the checkout, including spaces in its path. Each exercise writes the actual generated standalone harness, a newly authored service module, and a separate adapter that imports and calls that service. Fresh Node processes run the documented `--adapter ./adapter.mjs` command from this directory. No private/customer code, network, credentials or live integration is used.

- Money: an independently written numeric formatter with an explicit scale table passes 20/20. Changing its service to assume every currency uses scale 100 fails the JPY/KRW/KWD checks. The wrapper stays unchanged.
- Merge Patch: a shallow-copy JSON encoder passes 8/8. Changing the service to coalesce an omitted deliveryNote to null fails preservation checks. The wrapper stays unchanged; this also verifies a default export.
- Missing module, wrong export and an async-returning implementation never produce a passing suite. These harnesses deliberately require synchronous functions returning strings.

“Independently written” here means newly authored for this challenge, without importing the bundled correction. It does **not** mean an external reviewer, customer-owned implementation, blind evaluation or an unseen production dataset. The same project supplied the known contracts and test scenarios. This validates the handoff mechanics, not product demand or automatic bug discovery.

## Concrete false-confidence bug found and fixed

Before the change, this command silently used the bundled correction and exited 0:

```sh
node seam-boundary.test.mjs --fixed --adpater ./bad.mjs
```

The misspelled flag was ignored. A developer could wrongly attribute the resulting 20/20 to their adapter. Both generated money and patch harnesses now accept only one of: no arguments, `--fixed`, or `--adapter <path>`. Unknown, mixed, missing or extra arguments exit 2 with usage, before executing an adapter. Valid runs explicitly print their mode: external adapter, bundled correction or bundled original. Module loading errors remain nonzero Node errors; failed contract checks exit 1.

## Practical adoption and limits

1. Verify the exact contract in the app; an incompatible oracle is not evidence of a bug.
2. Save the standalone test and adapter scaffold in a local scratch directory.
3. Replace the scaffold's deliberate error with an import and call to your actual synchronous function. A small wrapper is needed if the original API differs.
4. Review imports before running. They execute with normal process permissions: this is not a sandbox, network blocker or secrets scanner.
5. Run `node <downloaded-test.mjs> --adapter ./adapter.mjs`. Read the mode and individual failures, not only the exit status. Keep the test in CI only after reviewing applicability.

The numeric money oracle excludes symbol correctness, unlisted currencies and provider-specific charge/payout rules. The patch oracle tests one named field against a local receiver, not a real server. Passing fixed fixtures is not proof across arbitrary inputs. Hangs and malicious adapters are not contained by the harness. No actual developer-owned production adapter was validated in this challenge.

Validation: reproduced the false-pass before fixing it; all four new handoff tests pass afterwards. Full suite: 109 tests pass; typecheck/Vite build and whitespace check pass on Mac mini. No UI or Firebase changes.
