# Seam

An executable lab for semantic integration mismatches: the same data can mean different things on opposite sides of an API boundary.

## Reproduce the judge demo (no account or AI setup)

After installing dependencies below, run `npm run demo`. It executes both bundled fulfillment handlers, not pre-recorded results: a sequential retry records once, webhook-plus-redirect overlap records twice in the deliberately faulty handler, and the single-process reference records once. The command verifies the expected 7/9 versus 9/9 outcome and exits 0 only if this authored demonstration matches. Exit 0 is **not production readiness**; a mismatch exits 1 and a setup error exits 2.

Run `npm run dev` to explore the same story visually. No Stripe requests, credentials, real fulfillment or Firebase configuration are needed. For trusted local code integration, see [the adapter quickstart](docs/local-handler-quickstart.md). AI proposals are a separate, currently unvalidated integration, not required for this demo.

## Try it

Use Node 24 (or 22.18+).

```sh
npm ci --ignore-scripts
npm run demo
npm test
npm run typecheck
npm run build
npm run dev
```

- **Money:** execute pinned historical Stripe Link formatting source against 20 UCP-display probes. Original 11/20; corrected 20/20. This is not Stripe charge or payout validation.
- **Missing vs null:** execute an explicitly authored serializer demonstration with an RFC7396 receiver. Original 6/8; corrected 8/8. Omission preserves a member; null deletes it. Not every PATCH API uses this media type.
- Compare actual output, inspect the code and contract, try supported custom inputs, then export a runnable Node regression harness.

All examples are public-source or synthetic. The deterministic lab makes no inference requests. Pasted payloads stay in memory and are not sent to AI.

## Evidence and limitations

Run `npm test` and `npm run build` for current validation; the test count changes as coverage grows. Evidence logs and per-milestone scope are in `evidence/`. Browser reports cover their named checkpoints, not all future changes.

This code was reconstructed on 2026-11-17 and then extended. Original earlier experiment bytes were not recovered; transcribed historical figures are labeled as such and are not a reproduced benchmark. See [history](HISTORY.md).

The money experiment runs extracted formatter functions, not the entire upstream CLI. The missing/null adapter is our authored example, not a discovered upstream incident. No automatic repository analysis, superiority to Claude, unseen benchmark performance, or measured human time saving is established.

Firebase AI Logic and App Check integration code is present, but real inference and attestation are unvalidated. No configured project or credentials are included. This is not yet a validated hybrid-AI hackathon submission.

## Attribution

Pinned Stripe Link source and its MIT notice are retained in `src/vendor/link-cli/` and `public/licenses/stripe-link-cli-MIT.txt`. See `evidence/lab008-report.md` for revisions and scope. Merge Patch semantics follow [RFC7396](https://www.rfc-editor.org/rfc/rfc7396).

## Contributing and traceability

Use descriptive commits, retain source notices, add regression tests for behavior changes, and run tests/typecheck/build. Do not commit credentials, private payloads, browser state, or deployment identifiers. Changes after this public import should remain traceable through commits and review.

## Review brief

Select a boundary and click **Compare both adapters** to execute both bundled revisions locally. The compact comparison and downloadable Markdown brief include fixed-fixture failures, expected/original/corrected values, scope and reproduction instructions. Custom inputs are excluded. Export the runnable test alongside the brief. Passing these checks is not deployment approval or production coverage.

## Business hypotheses, not validated claims

The proposed first customer is an engineering lead at a payment-heavy SaaS or integration agency who needs reproducible evidence when reviewing risky adapter changes. This prototype demonstrates currency-display and merge-patch boundaries, not payment processing or automatic repository analysis.

The MIT local runner and exports remain free. A future paid team service could maintain rule versions, shared baselines and review/CI history; none of those managed capabilities is built. A $99/team/month starting price is an interview hypothesis, not an offer or established willingness to pay. First validation targets: five interviews, three permission-cleared real adapters, two repeat users on their next change and one paid pilot. Measure accepted-rule setup time, rejected findings and regression reuse before claiming savings.

Existing tools already cover important parts of this workflow: [PactFlow](https://pactflow.io/pricing/) provides collaborative contract testing and [Schemathesis](https://schemathesis.io/) generates schema-based tests with custom checks. Seam's proposed focus is source-linked semantic rules and small, reviewable reproductions, not a claim that other tools cannot test semantics.

## Companion-guided demo

A small Seam character now guides **select → compare → confirm → save** with one primary next action. Its prompts are scripted from actual local comparison results, not generated by AI. Confirming an interpretation acknowledges the selected demo rule; it is not approval to deploy and does not configure a real integration. Comparison selects the bundled JPY/1000 or omit-existing example and synchronizes the main output, matrix and evidence export. Changing boundaries or rerunning comparison clears confirmation. All existing custom probes, source inspection and runnable exports remain available.

## Try a real local adapter

The **Demo → your local code** panel asks whether the exact contract fits. Unsure or different contracts do not reveal the adapter setup. For a matching contract, download the runnable test and `seam-adapter.mjs`, replace its deliberate error with a call to your trusted synchronous implementation, then run the displayed `--adapter` command. The scaffold deliberately fails every probe until connected. It is not a supplied fix, an upload, or browser-side validation of your repository. Imported code executes with your local permissions; review it first. Add the command to your existing CI only after reviewing applicability and failures.

## Visual fulfillment replay

The third lab selector opens **Fulfillment replay**. Choose a schedule, run both authored handlers and inspect their actual local effect ledgers. Sequential redelivery records once in both; overlapping calls expose duplicates in the racy implementation. All nine schedules execute, and the JSON download contains the actual results plus limitations. The single-process reference is not a production fix: no shared database, restart recovery, live Stripe calls or real fulfillment is exercised. Source links and CLI reproduction commands remain visible in the scenario.

### Traceable local replay reports

For a code-review or CI artifact, opt in to a new report file:

```sh
node --experimental-strip-types scripts/check-fulfillment.mjs --adapter ./examples/fulfillment-adapter.mjs --report ./replay-report.json
```

The report records a versioned format, timestamp, Node version, adapter mode, entry/replay module SHA-256 digests and per-fixture counts/outcomes. It excludes source contents, request inputs, ledger identifiers, adapter paths and error messages. Fixture numbers follow `fulfillmentCases()` order in the hashed replay module. It refuses to overwrite an existing file (exit 2); an observed source change during execution also prevents writing. Checks failing still exit 1, passing exit 0. Reports are local only; nothing is uploaded.

A digest identifies bytes read, **not authorship, integrity, execution proof or attestation**. Transitive dependencies and runtime behavior are not attested. Review trusted code before running it. Existing console output still includes the full synthetic ledger and may include adapter-supplied output/errors; inspect it before sharing. Report redaction does not sandbox the adapter or sanitize its console logging. No hosted CI or production integration is configured by this option.

## First-run evidence story

A fresh page now starts with one concrete developer-review question: can repeated fulfillment calls record the same order twice? Click to run the nine authored local schedules, inspect the passing sequential retry, then reveal the concurrent result from that same completed run and save its actual evidence. No inference runs automatically. The guide is explicitly labeled local/non-AI. All examples, AI proposal and runtime readiness remain reachable separately; the proposal's consent workflow is unchanged.

### Local handler onboarding

Run `node --experimental-strip-types scripts/check-fulfillment.mjs --help` or follow [the local handler quickstart](docs/local-handler-quickstart.md). It explains how to inject fake storage/effects into your actual decision logic, run the CLI/report, interpret exit codes and use a negative control. An existing report now produces actionable guidance without overwriting it; the message explicitly notes that the replay already ran.

Handler replay bounds asynchronous waiting to 5 seconds per fixture. A timeout fails the run and labels later fixtures `not-run`; metadata reports retain those statuses. It does not cancel adapter work or replace a CI process timeout. See the [local handler quickstart](docs/local-handler-quickstart.md#a-handler-that-never-finishes).
