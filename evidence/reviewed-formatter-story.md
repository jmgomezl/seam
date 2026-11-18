# Documentation review to actual formatter execution

Base: 2ded05c. No Firebase configuration changed.

The Contract proposals path now has a coherent four-step story: read excerpts, confirm the unit rule, execute pinned bundled code, retain the same runnable regression. Defaults are explicitly synthetic JPY display contracts agreeing on one wire unit per yen. Agreement of declarations is not evidence that code implements them.

AI remains a real optional extraction route. With Firebase unconfigured it is disabled; no canned AI response is substituted. Exact source-bound human review remains required and has no preselected answers. Edits invalidate confirmation and results. The new execution step accepts only confirmed declarations matching a fixed independent oracle. Neither model text nor excerpts become executable code.

Actual bundled JPY results: original 1/4, historical correction 4/4. At input 1000 the fixed oracle expects 1000 and original returns numeric 10. The browser identifies these as bundled historical components, never the user's code or a novel AI discovery. The source revision is linked; downloadable regression keeps the MIT notice, four selected probes, CLI validation, and explicit trusted-local-adapter rules.

Own-code exports remain separately gated by scope confirmation. No customer code executes in the browser and no application changes are applied.

Verification: 184 tests, TypeScript and production build pass; exported four-case regression independently executed (original exit1, correction exit0). UI event tests use explicitly test-only mocked inference; they are not evidence of live AI. Real browser initial-state QA requested; live AI and post-inference browser QA remain blocked pending Firebase setup.

Discoverability followup: the working local-demo introduction includes a direct documentation-to-regression entry with explicit inference prerequisite. This avoids burying the new story behind supporting tools while retaining a working non-AI landing flow. 185 tests/build pass.

Availability feedback followup: actual browser QA found the disabled-inference explanation too far down the form. The unconfigured workflow now announces PREVIEW / AI NOT AVAILABLE before the heading and excerpts. The guided entry says Preview AI workflow / setup needed when required Firebase fields are absent, and its lighter treatment retains the local run as the primary action. Configured availability does not claim successful runtime inference. 187 tests and build pass, including absent-config banner placement/disabled extraction and both entry labels. No Firebase initialization/configuration changed.
