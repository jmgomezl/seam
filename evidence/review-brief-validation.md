# Review brief validation · 2026-11-18

Implemented and checked locally on the Mac mini, separate from the reviewed baseline checkout. No deployment, GitHub push or user-data transmission is part of this change.

- New explicit comparison executes both bundled revisions, without reading custom inputs into the brief.
- Money: 11/20 original, 20/20 correction, nine failing fixed probes.
- Merge patch: 6/8 original, 8/8 correction, two failing fixed probes.
- Three new unit tests check counts, deterministic export, correction outputs and honest scope.
- Chrome desktop UI: clicked comparison for both boundaries, verified displayed counts/example; scenario switch resets brief. Downloaded money Markdown brief and observed completed download.
- Full suite: 85 tests pass on Node 25.6.1. TypeScript and Vite production build pass.
- Production dependency audit: zero findings. Full dependency audit reports four high-severity development-tool findings; not fixed in this feature.
- Mobile layout has responsive CSS but was not visually checked in this pass.
- Claude Code review was not completed; no source was sent.

## Portability repair

Baseline exported harnesses compared a module's canonical URL against a potentially symlinked invocation path. On macOS temporary paths this skipped execution and incorrectly returned exit 0. Resolve the invocation path with realpath before comparing, and guard missing paths. Existing failing export tests now pass. A new symlinked-directory regression exercises money and merge-patch harnesses independently.

## Product boundaries

The brief is a local fixed-fixture review artifact, not production coverage, deployment approval, automatic repository scanning or a managed CI service. Current money checks cover UCP display formatting, not Stripe payment/payout rules. Revenue, customer demand and savings remain unvalidated hypotheses.
