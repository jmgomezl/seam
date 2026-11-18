# Quote matching is not meaning · 2026-11-18

## Public-doc challenge

[Stripe's currency documentation](https://docs.stripe.com/currencies#special-cases), checked 2026-11-18, is a concrete example of why context matters: HUF/TWD payout constraints differ from general charge behavior, and ISK has compatibility-specific amount representation. A short sentence mentioning a zero-decimal currency is insufficient to select an operation's numeric rule. These provider-operation rules are outside Seam's bounded DISPLAY-declaration prototype; it should not repurpose them as a general display oracle.

No Stripe text or private source was sent to a model in this pass. Test inputs are separately authored paraphrases/synthetic contradictions, not captured AI output or an external benchmark.

## Adversarial cases

The new tests deliberately supply a syntactically valid candidate with an exact quote that is nevertheless semantically unsupported:

1. A negated cents interpretation.
2. A legacy rule contradicted by the current version.
3. A provider payout constraint, with an unsupported currency claim.
4. Quoted instruction-injection text rather than a contract.

All can pass structural/quote validation. This is an intentional demonstration of its limit, not a claim that the model produced them. A quote-presence check cannot establish entailment. No keyword heuristic or second model is misrepresented as a semantic oracle.

## Human-review guardrail

Instead of one blanket confirmation checkbox, a candidate now requires:
- An explicit scope acknowledgement: same display field and operation, not charges, payouts, conversions or historical/example-only rules.
- Separate user-entered producer and consumer units/currency, initially blank. These must agree with the candidate before witnesses can be generated.
- A prominent reject/insufficient-evidence path. A mismatch does not silently rewrite the candidate or assume the model is right.

The full original excerpts remain above the candidate; the reviewer is warned to inspect negation, versions, exceptions and operation context. Editing any review answer removes existing witnesses. Export rechecks current answers and source revision. No source excerpts or model prose are added to the exported declaration check.

This adds deliberate friction only at the point where a proposed interpretation becomes a runnable declaration. It does not remove confirmation bias or prove semantics. Tests explicitly demonstrate that a human who enters the wrong values and acknowledges scope can still confirm a wrong candidate. No AI accuracy or guardrail efficacy percentage is claimed.

## Verification

124 tests pass; TypeScript/Vite build and whitespace check pass. Test-only bundled transport/minimal DOM exercises a candidate result, blank fields, disagreement, successful human review, edit clearing and reject. It is not live inference, a real-browser success-path check or an accessibility/layout audit. The production transport remains real Firebase-only; no mock or canned fallback is added. Parser formatting changes are separately owned; this increment does not modify proposal.ts or Firebase settings.
