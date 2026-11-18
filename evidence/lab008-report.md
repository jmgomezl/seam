# Executable boundary lab 008

## Product change

The default judge journey now executes a pinned historical Stripe Link checkout formatter rather than only comparing manually declared scales. The independent authored oracle uses UCP ISO currency display units: USD/EUR 100, JPY/KRW 1, KWD 1000. Each currency receives 1000, 1, 0 and -1000 wire-unit probes. These are 20 correlated checks of one known component, not 20 independent incidents or a blind discovery benchmark.

In the current Node run, the historical original passes 11/20 numeric checks; its selected correction passes 20/20. The USD/EUR controls and all zero cases pass in the original while nonzero JPY/KRW/KWD probes fail. A one-unit JPY probe actually returns 0.01 while the contract expects 1. The UI can execute custom bounded integer amounts, test minimal positive-integer witness 1, inspect source, and download this run's evidence. It never claims whole-application execution, current HEAD correctness or real provider behavior.

The exported dependency-free Node harness contains both known implementations and the explicit probe oracle. It genuinely executes original/fixed functions, and accepts a local adapter module exporting synchronous formatAmount(amount, currency) -> en-US formatted string. The module can also import checkAdapter. Importing user adapter code is not sandboxed and is expressly warned. This source-adapter harness is distinct from the older declared-boundary capture export, which remains available under Your payload.

## Source and license review

Source: stripe/link-cli packages/cli/src/commands/ucp/checkout-summary.tsx, original revision 8d46e6b0da0425b5cd9db208a100a96f4feff3fa, correction 7d80ee989e8ea7e69beab3562b67ba6820ed3eb3. Exact selected TypeScript declarations from preserved experiment 004 are retained. Browser modules add only exports and the original helper import alias; helper/function bodies are unchanged. Tests compare the actual vendor modules with retained extracts and their SHA256 identities. Harness source is transpiled from those extracts; no AI-generated substitute is presented as original source.

The pinned historical MIT license (Copyright (c) 2026 Stripe, LLC) is preserved verbatim in public/licenses/stripe-link-cli-MIT.txt and embedded verbatim in the harness. The previous source manifest, whole selected source files, extraction records and license-tree review remain in the unchanged 004 archive. This does not make a claim about licensing or behavior at current upstream HEAD.

Oracle source: https://ucp.dev/specification/reference/ . Amount and Signed Amount specify ISO currency exponents. This numeric display oracle is NOT the Stripe charge API denomination rule, whose UGX special case is intentionally outside this fixture's scope.

## Verification

67 tests pass, including actual bundled-original failure (exit 1), corrected success (exit 0), independent custom adapter success/failure, zero/refund controls, custom amount bounds, source identity, license identity and existing privacy/capture tests. Strict TypeScript check and production build pass. The generated harness was executed in Node, not merely inspected as text.

Independent review caught overly permissive output parsing: taking a first number could mistakenly accept error prose or a second numeric value. It now recognizes the complete en-US numeric output with valid grouping and a supported affix/bare number; scientific/other-locale/error/multiple-number strings fail, with regressions. This is a deliberately limited format adapter, not a universal monetary string parser. Currency symbol correctness remains outside numeric scoring.

This implementation-stage check did not include browser or network-runtime verification. No public release or submission occurred at this checkpoint.

## Honest remaining gap

This is deterministic execution of a known selected source component plus authored contract, not automated source discovery. It does not prove that developers save time or that Seam outperforms general assistants. Actual Firebase AI Logic, Gemini Nano and App Check runtime integration remains unvalidated and therefore the entry is not yet contest-ready. Local model extraction of candidates from evidence is not implemented as a fake substitute. The prior actual Claude description-based critique informed the reusable-harness direction, but Claude has not been claimed to have tested this new UI.

Independent re-review confirmed the prior six malformed-output counterexamples fail and the original/fixed/custom-adapter harness works. It identified one residual noncanonical thousands grouping case (1234,567); grouped input now requires a one-to-three digit first group, while ungrouped digits remain supported. Added regression checks for invalid 1234,567 and valid 1,234,567/1234567. The complete suite now passes 68 tests.

## Operation-specific currency audit follow-up

Independent review found no defect in the existing UCP/ISO display oracle. ISK, HUF and TWD are not in this five-currency matrix. Their provider-specific charge/payout behavior must not be treated as generic ISO-exponent bugs. The export panel, generated harness and evidence JSON now prominently state: “UCP display contract only; not Stripe charge or payout validation.” Future provider-operation probes require independently specified provider, operation, currency and version, with unit scale separate from allowed amount increment. No new currencies or claims were added, and original 11/20 versus corrected 20/20 results are unchanged. Full suite: 69 passing tests plus typecheck/build.

## Browser QA follow-up

Separate browser QA reported successful core-flow QA, original/corrected execution, exports, and no overflow at 1180 px and 500 px. Chromium did not render the diagonal-arrow glyph on the two revision buttons. Those labels now use portable text only: “Test original” and “Test correction.” The UCP-only warning remains unchanged. A source-level regression checks both labels; the complete suite now passes 70 tests and the strict production build. This note records a separate browser QA report, not additional browser coverage by the unit tests.
