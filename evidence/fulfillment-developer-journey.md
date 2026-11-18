# Independent local handler journey · 2026-11-18

## Exercise

Created a new two-file temporary application and thin adapter, independently authored without importing the bundled race-prone/reference handlers. The application serializes requests through a promise chain and records each eligible session once. This is another controlled synthetic example, not a customer repository, production locking design or evidence of demand.

Invoked the actual fulfillment CLI from a directory containing spaces, using relative adapter/report paths and a sibling module import. Observed 9/9, exit0, and a valid metadata report. Compared the adapter hash independently. A second run using the same report correctly exited2 and preserved the old bytes.

Then replaced only the application dependency with a handler that drops all effects. The same adapter wrapper now yielded 1/9, exit1, and a failing report. Its entry digest stayed unchanged, demonstrating why an entry hash cannot attest imported dependencies or execution. The unchanged report-limits warning is material, not boilerplate.

## Friction fixed

- `--help` now provides a no-execution onboarding path, adapter signature, commands, safety boundaries and exit meanings. Mixing help with other flags still fails closed.
- Report collision now tells the developer to use a new filename and that the replay already ran, instead of only exposing a low-level file error.
- A repository quickstart explains injection, avoiding live effects, retaining real decision logic, negative controls and dependency-hash limits.

## Validation

135 tests pass; TypeScript/Vite production build and whitespace checks pass on Mac mini. Two new tests exercise the full subprocess journey and help behavior. Existing replay/report tests continue passing. No browser changes, Firebase changes, billing, external APIs or real user code/data used. No external adoption, saved time or production readiness inferred from these synthetic tests.
