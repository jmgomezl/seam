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
