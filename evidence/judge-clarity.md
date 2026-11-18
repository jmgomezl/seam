# First-read clarity pass · 2026-11-18

Observed issue: the original abstract landing headline described a theme, not what the app does. Replay terminology led with implementation detail, while a judge had to infer the consequence from counts. These are UX observations, not user-study findings.

Changes:
- Landing states the product category and the actual workflow: known failure → explicit rule comparison → adapt a runnable test to local code.
- Scenario labels name the assumption/failure rather than just “Money” or “Replay”.
- Replay action says all nine schedules execute, not merely the selected pair.
- Selected-schedule finding is derived from actual returned ledgers. No finding is claimed before execution; errors remain incomplete; a passing selected schedule does not establish concurrent safety.
- Race-prone and reference labels explain behavior in plain language. Authored/simulation/single-process limitations remain prominent.
- Schedule selection restores keyboard focus to the selected button after rendering.

Validation: 105 tests, typecheck/Vite build and whitespace check pass. Chrome on Mac mini: landing purpose visible, concurrent finding reports two effects versus one expected/reference, sequential view reports schedule-only success, and focus remains on its selected schedule button. Mobile visual checks and a formal accessibility audit were not performed. No changes to adapters, runtime configuration, permissions, AI behavior or data transmission. This is clarity work, not new production validation or eligibility evidence.
