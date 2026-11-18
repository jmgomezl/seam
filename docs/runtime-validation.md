# Runtime validation gate

This checklist is not evidence of a successful inference run. Configuration and live attestation remain prerequisites. Deterministic tests do not establish either.

## Required setup (owner-authorized)

Use a dedicated Firebase Spark project and Gemini Developer API for a bounded no-billing prototype. Do not repurpose unrelated projects or enable Blaze merely to get started. Obtain the web app's public API key, project ID and app ID, and a registered reCAPTCHA Enterprise site key. These populate the four fields in `.env.example`; the cloud route additionally requires an explicitly selected supported model. A populated configuration is not proof that APIs or attestation work.

Firebase AI Logic setup enables APIs/resources and App Check enforcement. Obtain authorization before those changes. For localhost, official guidance uses a private registered App Check debug token; do not add localhost to production reCAPTCHA allowed domains. No debug-token support is enabled by this branch. Do not put debug tokens in VITE variables, public source, screenshots, logs or exported evidence. For deployed judging, configure a real attestation provider for the exact deployed origin.

## Local inference proof

Use supported desktop Chrome with the Prompt API available. `downloadable` indicates capability, not a ready model or successful inference. Initialize/download after a user interaction and explicit consent. Model initialization can use network and disk even when prompts stay local. Keep ONLY_ON_DEVICE; do not introduce automatic cloud fallback. Test with public/synthetic input only.

Record: exact source commit, SDK/browser version, availability transition, successful SDK call, response.inferenceSource equal to InferenceSource.ON_DEVICE (`on_device`), schema-valid output, and independently observed network behavior. Source metadata is a post-request check, not a network privacy control. Reject absent/unexpected source. Test unavailable model, malformed output, repeated clicks and route changes. Cloud proof requires separate per-request consent and IN_CLOUD (`in_cloud`). Do not publish tokens or raw account metadata.

## Product acceptance

The Runtime view reviews reconstructed boundary fixtures. The implemented Contract proposals subset accepts bounded public display-unit excerpts, validates quoted candidates, requires human confirmation, and generates declaration-only arithmetic witnesses. It does not discover rules from arbitrary repositories or execute an independent production adapter. That stronger adapter-validation workflow remains future work. Model suggestions are not verified facts; quote matching is not semantic proof, and missing evidence must permit abstention.

## Primary references

- https://firebase.google.com/docs/ai-logic/hybrid/web/get-started
- https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options
- https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider
- https://firebase.google.com/docs/reference/js/ai#inferencesource

The SDK reference uses `on_device` and `in_cloud`, not UI labels. Configuration diagnostics expose missing field names only, never configuration values.

## Bounded proposal prototype

The Contract proposals view accepts two public/synthetic display-unit excerpts. It calls the same real Firebase SDK transport as Runtime, requires initialization consent, defaults to ONLY_ON_DEVICE, and requires a fresh explicit cloud checkbox for each cloud request. With missing Firebase config, extraction is disabled. There is no production mock or canned fallback.

Candidate output is bounded JSON with units per major (1/100/1000), currency, and exact contiguous source quotes. A source quote match does not prove semantic entailment: the person must confirm both declarations. Missing/invalid evidence is rejected or abstains. Editing excerpts or routing/consent invalidates the pending result, including changes to the cloud checkbox. This suppresses later rendering but does not cancel an SDK request or model download already in flight, recall cloud excerpts already sent, or revoke an initialized App Check session. The UI states this when a pending result is discarded. The model's proposed expected values or code are never executed or used as an oracle.

After confirmation, locally generated witnesses use 0,1,1250,-1250 to compare the two declared interpretations. These are arithmetic declaration checks, not an adapter run, a holdout benchmark, or production verification. Export excludes source excerpts and model prose and occurs only on explicit click. Input stays in page memory; an explicit cloud request transmits both excerpts. The unit-test mock transport is confined to tests. No live inference is claimed by this implementation.

## Bounded response parsing and structured output

The proposal parser accepts a complete JSON document or exactly one outer `json`
Markdown fence (LF or CRLF), with optional surrounding whitespace. It never
extracts a JSON substring from prose. Trailing instructions, multiple documents,
duplicate keys (including escaped aliases), non-finite numbers, more than 64
nesting levels, and responses above 20,000 characters are rejected. Existing
exact-quote and supported-scale checks still apply. Formatting acceptance is not
semantic validation or proof that the declarations describe an adapter.

Official structured-output support was checked against the installed Firebase
13.4.0 declarations: `OnDeviceParams.promptOptions.responseConstraint` is
available. Firebase documents that configuration for on-device inference and
`inCloudParams.generationConfig.responseMimeType` plus `responseSchema` for cloud
inference. Chrome also documents `responseConstraint` on `prompt()`.

- https://firebase.google.com/docs/ai-logic/hybrid/web/generate-structured-output
- https://developer.chrome.com/docs/ai/prompt-api

The parser hardening itself did not enable structured SDK generation. The subsequent
structured-proposal change now requests a schema only for the proposal flow:
local requests set `onDeviceParams.promptOptions.responseConstraint`; explicitly
consented cloud requests set `inCloudParams.generationConfig.responseMimeType`
and `responseSchema`. Only the selected strict route receives configuration.
The legacy boundary-review format is unchanged. SDK imports and schema setup
remain after consent and configuration checks. Schema errors fail closed without
retrying unconstrained or falling back to another route.

The schemas include candidate/abstain status and nullable side declarations.
Local uses standard JSON Schema null unions; cloud retains the SDK helper nullable
representation. See [direct Chrome observations](direct-chrome-schema-observation.md)
for the compatibility difference found in real synthetic-only inference. Thus
missing evidence can still abstain. Supported scale values, exact quotes, source
binding and human semantic confirmation are application checks, not guarantees
from the schema. A schema-shaped response can still be factually wrong.

Verification: actual adapter bundled with test-only Firebase stubs, real installed
SDK Schema helper construction, strict typecheck, and regression suite. No live
Firebase/App Check or schema-constrained model response is claimed. Actual runtime
compatibility remains to be tested after authorized project configuration; no
model version is inferred from these tests.

## Slow requests: stop waiting and manual continuation

The proposal view offers **Stop waiting** while a request is pending. It discards
that request's result and clears confirmation/export state. It does not cancel
SDK inference, model downloads or already-sent cloud data. Late success and
failure cannot replace the stopped view or a subsequent view.

Only one proposal request may remain in flight per page lifetime, including
navigation away and back. Stopping does not unlock another inference; extraction
becomes available only after that request settles. This deliberately avoids
stacking slow model calls. No automatic retry or cloud fallback is introduced.
If the SDK never settles, extraction remains blocked on that page; manual work
is still available. A page reload is not represented as guaranteed cancellation.

**Continue manually · no AI** opens the existing browser-local boundary form,
even before consent or when Firebase is unconfigured. Any earlier manual draft remains in that flow; source excerpts and inferred
declarations are not silently copied, saved or exported. The navigation may discard unsaved proposal inputs, as stated beside
the control. The manual flow is declaration arithmetic, not model output or
production adapter verification.

Regression tests exercise double clicks, stop followed by late success/rejection,
retry after settlement, navigation back while pending, detached/replaced views,
and manual fallback before any request. Transport in these tests is explicitly
mocked; these results do not establish live model latency or cancellation.

Browser check with Firebase unconfigured: extraction and Stop waiting disabled;
manual continuation enabled and navigated to the actual local boundary form
without consent or inference. Pending-response behavior was tested with mocks,
not live Firebase.

## Legacy Runtime view lifecycle

The separate AI Runtime review controls now bind to their own view and a cloned
synthetic boundary snapshot, not global element IDs after an await. Late success
or failure cannot overwrite a detached/replaced Runtime view. Changing either
consent checkbox discards pending output, without claiming cancellation or data
recall. Cloud approval is consumed for one request as before.

Both Runtime inference buttons stay disabled while one Runtime review is pending,
including navigation away and back. A new Runtime view may refresh its own button
availability when that shared request settles, but never receives the old result.
This is a Runtime-view guard, not a global cancellation mechanism or a claim that
all AI entry points share one queue. No retry, fallback or SDK configuration was
added. Availability checks also ignore stale views and reject repeated clicks
while the same check is pending; they do not initialize a model.

Verification: mocked async tests cover detached/replaced views, late success and
rejection, double clicks across local/cloud buttons, navigation back, retry after
settlement, source snapshots, consent edits and stale availability checks. These
are lifecycle tests, not live inference or App Check validation.
