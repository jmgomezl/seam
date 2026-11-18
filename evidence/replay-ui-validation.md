# Fulfillment replay UI validation · 2026-11-18

The visual third scenario directly invokes the published authored replay engine; no separate hardcoded result dataset or upstream implementation is introduced. It shows synthetic input batches, original/reference actual ledgers, nine-case outcomes, and real-result JSON export. Source links pin the engine to d0985456b7cb3a60a65b9464610127d3ffd8e374 and explain official Stripe requirements without alleging a Stripe defect.

Validation on Mac mini:
- 104 tests pass; TypeScript/Vite production build and whitespace check pass.
- Added tests check actual comparison results (7/9 vs9/9), sequential one-record vs concurrent two-record behavior, reference ledger and exported limitations.
- Chrome desktop: entered through third selector, observed not-executed state, ran both handlers, saw two versus one concurrent records, switched to sequential retry and saw one versus one, downloaded completed actual-evidence JSON.
- Repeated execution is guarded while pending; detached navigation cannot repaint another view.
- Responsive styles supplied; mobile visual checks not performed.

No production adapter, live Stripe, real effects, AI inference, distributed locks or crash recovery tested. The in-memory reference is explicitly not a production fix. No publication/deployment performed by this branch.
