# Developer workflow stress test · 2026-11-18

## Challenge

A developer cannot treat a cheerful demo or bundled corrected adapter as evidence about their own code. The previous confirmation step described the demo interpretation, but did not help decide if the same oracle belongs in a real integration. Exporting a demo without an explicit implementation boundary risks false confidence.

## Practical examples

- Checkout summary formatter accepting UCP display units: potentially fits the Money suite if the declared five currency scales and en-US output match. Connect the actual formatter via a thin local wrapper, then inspect failures.
- Payment charge/payout amount builder: does not fit the display oracle, even if the payload has an amount and currency. Must define provider-operation constraints separately.
- Delivery-instruction serializer for an RFC 7396 endpoint: potentially fits Missing vs null if omission preserves and null deletes. Wrap the serializer, not an API client that performs network requests.
- JSON Patch, PUT, or an API storing explicit null: different semantics. Do not adopt the demo's expected states.

These are workflow examples, not interviewed customers, measured adoption or proven product-market fit.

## Implemented

- Explicit fits / unsure / different applicability choices, reset on scenario changes or comparison reruns.
- Exact contract scope and exclusions before revealing local adapter setup.
- Downloadable adapter scaffold deliberately throws until connected to the developer's implementation; it does not copy the bundled correction.
- Exact --adapter command, exit semantics and warning that imports execute local code. No upload, auto-discovery, external execution or hosted CI added.

## Evidence

89 tests pass, including actual subprocess runs proving both exported scaffolds fail all 20/8 checks until connected. Production build and whitespace checks pass. Chrome desktop verified unsure and incompatible states hide the setup; fits exposes the correct command/template; template download completed. Mobile layout not visually tested in this pass. No real customer repository or external API was tested.

## Remaining business risk

Setup still requires a developer to know their contract and write a wrapper. The next value test is an independent developer applying this to a permission-cleared adapter, measuring time to a relevant regression and whether they reuse it on the next change. No time-saving, demand, revenue or autonomous discovery claims are justified yet.
