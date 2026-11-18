# Seam

An executable lab for semantic integration mismatches: the same data can mean different things on opposite sides of an API boundary.

## Try it

Use Node 24 (or 22.18+).

```sh
npm ci --ignore-scripts
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

Current validation: 81 automated tests and production build pass. Evidence logs and per-milestone scope are in `evidence/`. Browser reports cover their named checkpoints, not all future changes.

This code was reconstructed on 2026-11-17 and then extended. Original earlier experiment bytes were not recovered; transcribed historical figures are labeled as such and are not a reproduced benchmark. See [history](HISTORY.md).

The money experiment runs extracted formatter functions, not the entire upstream CLI. The missing/null adapter is our authored example, not a discovered upstream incident. No automatic repository analysis, superiority to Claude, unseen benchmark performance, or measured human time saving is established.

Firebase AI Logic and App Check integration code is present, but real inference and attestation are unvalidated. No configured project or credentials are included. This is not yet a validated hybrid-AI hackathon submission.

## Attribution

Pinned Stripe Link source and its MIT notice are retained in `src/vendor/link-cli/` and `public/licenses/stripe-link-cli-MIT.txt`. See `evidence/lab008-report.md` for revisions and scope. Merge Patch semantics follow [RFC7396](https://www.rfc-editor.org/rfc/rfc7396).

## Contributing and traceability

Use descriptive commits, retain source notices, add regression tests for behavior changes, and run tests/typecheck/build. Do not commit credentials, private payloads, browser state, or deployment identifiers. Changes after this public import should remain traceable through commits and review.
