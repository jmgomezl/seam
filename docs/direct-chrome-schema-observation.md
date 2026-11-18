# Direct Chrome structured-output observation

Observed 2026-11-18, Chrome 157 on macOS. Five synthetic-only prompts, fresh
sessions, model availability `available`. This is direct Chrome Prompt API
behavior, **not** Firebase AI Logic, App Check, exact model-version verification,
production evidence, or a performance benchmark. No billing/project/security
configuration changed. Test page CSP blocked page network requests; browser
internal activity was not packet-captured.

The test used the application's proposal prompt, parser and actual installed
Firebase 13.4.0 `Schema` helper. The constraint was passed directly to
`session.prompt(prompt, {responseConstraint: schema})`.

## Candidate example

Producer: `Synthetic public display contract: amount uses USD cents, 100 units equal one dollar.`
Consumer: `Synthetic public display contract: amount uses USD dollars, 1 unit equals one dollar.`

With the SDK helper object, raw JSON declared producer scale 100, consumer scale
1, both USD. The returned exact quotes were `100 units equal one dollar.` and
`1 unit equals one dollar.` Application quote/scale validation passed. These
quotes alone omit the currency; the full synthetic excerpts supply USD, showing
why quote membership is not standalone semantic proof.

Session creation: 9,076 ms; generation: 5,779 ms. No fence was returned.

## Missing evidence and nullable mismatch

Producer: `Synthetic public document: amount is provided, but its numeric units and currency are not specified.`
Consumer: `Synthetic public document: show the amount. Its numeric units and currency are not specified.`

The SDK helper uses OpenAPI `nullable: true` with `type: "object"`. The ordinary
prompt returned `status: "abstain"` but populated both sides with invented USD/1
declarations and short source quotations. Creation: 3 ms; generation: 3,971 ms.
The application safely discarded those sides and returned nulls. That is parser
normalization, **not** evidence that the model generated nulls or valid semantics.

A second helper-schema run explicitly required null sides. Its raw output was:

```json
{"status":"abstain","producer":{"unitsPerMajor":1,"currency":"USD","quote":"amount is provided"},"consumer":{"unitsPerMajor":1,"currency":"USD","quote":"show the amount"},"reason":"Missing numeric units and currency."}
```

Creation: 2 ms; generation: 3,946 ms. Thus explicit prompt wording did not resolve
this observed format mismatch.

Converting the local constraint to standard JSON Schema `type: ["object", "null"]`
and removing `nullable` returned genuine null sides:

- Explicit null instruction: creation 3 ms, generation 1,969 ms.
- Ordinary application prompt: creation 2 ms, generation 2,974 ms.

Ordinary-prompt raw output:

```json
{"status":"abstain","producer":null,"consumer":null,"reason":"Both excerpts lack numeric units and currency. The excerpts only refer to 'amount' and 'show the amount' without specifying a value or unit. Therefore, no candidate numbers can be extracted."}
```

These few samples establish compatibility in this browser, not reliability or a
speed improvement. The code now converts only its fixed authored schema for the
local route. Cloud retains the Firebase helper schema. Both routes retain
application validation and human confirmation; schema validity is not truth.

## Sources and remaining verification

[Chrome structured output](https://developer.chrome.com/docs/ai/structured-output-for-prompt-api)
specifies JSON Schema constraints.
[JSON Schema type](https://json-schema.org/understanding-json-schema/reference/type)
defines arrays of allowed types, including null.
[Firebase hybrid structured output](https://firebase.google.com/docs/ai-logic/hybrid/web/generate-structured-output)
documents both plain schemas and helper objects. This observation shows why the
nullable representation still needs runtime testing rather than assuming all
helper semantics transfer to Chrome.

Still untested: actual Firebase transport/App Check, cloud schema output, and the
final local union-schema candidate path through Firebase. The direct Chrome
union-schema tests above exercised abstention only.
