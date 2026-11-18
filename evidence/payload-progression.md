# Payload result progression

Base: f60b812. Presentation only: no contract engine, authentication or Firebase changes.

The payment declaration check now separates the decision from file exports:
- Original and hypothetical preview have explicit numbered state labels.
- A mismatch offers one emphasized preview action plus an edit return.
- Missing declarations offer a primary completion action, not a preview.
- Export controls and detailed local-run guidance sit behind an explicit disclosure.
- Preview/back restores focus to the result. Edit returns keyboard focus to sender units.
- Existing no-code-fix caveats, export privacy warning and generated-test inspection remain.

Validation: 177 tests pass, including event-driven preview/back/edit/invalidation/missing-declaration coverage; TypeScript and production build pass; git diff --check passes. Real browser QA pending.
