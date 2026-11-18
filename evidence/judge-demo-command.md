# Reproducible judge entry point

The repository previously introduced older currency/merge-patch examples before the current first-run fulfillment story, and reported a stale test count. `npm run demo` now gives reviewers one account-free way to execute the authored fulfillment story and see a compact outcome.

The command runs both real bundled replay handlers. It checks the exact expected failing fixture IDs, absence of handler errors, all reference checks, and the sequential/overlap witness counts. A changed original that no longer exposes the deliberate bug is a demo mismatch, not a false success. Unknown arguments are rejected before execution. Full per-case results remain available from the imported function and the existing replay CLI.

Validation at this commit: 164 tests, TypeScript/build, actual `npm run demo`, and whitespace checks pass. Tests also swap the handler roles, inject a throwing handler, and execute the CLI with valid/invalid arguments. No browser flow was changed.

Scope remains synthetic single-process demonstration. Passing the command is not proof of production safety, Stripe integration, AI inference, merchant impact or readiness to submit the contest. Existing real-adapter CLI still exits 1 for failing checks; this separate entry point intentionally verifies that the authored faulty example fails in the documented way.
