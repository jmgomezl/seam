# First-run journey validation · 2026-11-18

## Buyer/judge rationale

The prior landing page required choosing among unrelated boundary examples before observing a concrete consequence. First launch now tells one narrow engineering-review story: sequential retry matches the expected ledger; overlapping calls reproduce an extra record; actual evidence can be kept for review. It is a demonstration of runnable assumptions, not proof of customer adoption, savings or production safety.

## Behavior

- Fresh page starts the guided replay at sequential-redelivery; results remain unexecuted until an explicit click.
- Executes the same nine schedules and handlers. Guided transitions depend on actual results, not fabricated counts.
- A second action reveals the concurrent result from that same completed run; the UI explicitly says it is not a new run.
- The next action saves actual JSON evidence. All schedules remain available under a disclosure, avoiding nine competing initial choices.
- Existing example lab, AI proposal and readiness screens remain separately reachable. No proposal/parser/Firebase behavior changed; local demo guidance is not AI.
- Existing non-guided replay entry still starts at the concurrent example.

## Checks

122 tests pass, production build and whitespace check pass. Two new tests cover no pre-execution claims, actual sequential→concurrent transition, and error handling without a claimed success. Chrome desktop observed not-executed initial state, sequential1/1, concurrent2/1, contextual next actions and completed JSON download. Screenshot inspection confirmed readable result/call-to-action/ledger hierarchy. Mobile visual checks not performed. No real fulfillment, customer adapter or AI inference used.

## Peer-review fixes

The first review blocked the new proposal navigation key and the schedule disclosure's redraw behavior. Both are fixed in a successor commit: proposal navigation uses the existing `proposals` route; schedule disclosure open state survives redraw before focus returns to the selected, visible control. Two DOM-double regression tests execute the actual replay event bindings and verify routing/open-state/focus. Chrome independently confirmed the five-call selection remains visible/focused and AI contract proposal opens the excerpt-entry screen (without running inference). Full suite now 124 passing; production build passes.
