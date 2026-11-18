# Reveal observed results

Followup to 102b98f. Guided successful run and the overlap transition now move keyboard focus to the actual ledger section, not the status before it or finding after it. Its accessible label includes the selected schedule. Native focus scroll is used without animated smooth scrolling. No scroll is requested during pending replay. Existing detached-view guard and error-status behavior are retained. Advanced schedule selection still preserves focus on its selected button.

Validation: 178 tests and production build pass, including real event-binding tests for completed run and overlap focus, and no initial result target. Browser QA pending.
