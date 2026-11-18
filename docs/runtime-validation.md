# Runtime validation gate

This checklist is not evidence of a successful inference run. Configuration and live attestation remain prerequisites. Deterministic tests do not establish either.

## Required setup (owner-authorized)

Use a dedicated Firebase Spark project and Gemini Developer API for a bounded no-billing prototype. Do not repurpose unrelated projects or enable Blaze merely to get started. Obtain the web app's public API key, project ID and app ID, and a registered reCAPTCHA Enterprise site key. These populate the four fields in `.env.example`; the cloud route additionally requires an explicitly selected supported model. A populated configuration is not proof that APIs or attestation work.

Firebase AI Logic setup enables APIs/resources and App Check enforcement. Obtain authorization before those changes. For localhost, official guidance uses a private registered App Check debug token; do not add localhost to production reCAPTCHA allowed domains. No debug-token support is enabled by this branch. Do not put debug tokens in VITE variables, public source, screenshots, logs or exported evidence. For deployed judging, configure a real attestation provider for the exact deployed origin.

## Local inference proof

Use supported desktop Chrome with the Prompt API available. `downloadable` indicates capability, not a ready model or successful inference. Initialize/download after a user interaction and explicit consent. Model initialization can use network and disk even when prompts stay local. Keep ONLY_ON_DEVICE; do not introduce automatic cloud fallback. Test with public/synthetic input only.

Record: exact source commit, SDK/browser version, availability transition, successful SDK call, response.inferenceSource equal to InferenceSource.ON_DEVICE (`on_device`), schema-valid output, and independently observed network behavior. Source metadata is a post-request check, not a network privacy control. Reject absent/unexpected source. Test unavailable model, malformed output, repeated clicks and route changes. Cloud proof requires separate per-request consent and IN_CLOUD (`in_cloud`). Do not publish tokens or raw account metadata.

## Product acceptance

The current AI feature reviews reconstructed boundary fixtures; it does not discover rules from arbitrary documents. A stronger next flow must accept bounded public contract excerpts, produce quoted candidate semantics, require human confirmation, and run independent deterministic counterexamples. Model suggestions must never be presented as verified tests or silently become the oracle. Unknown/missing evidence must permit abstention. This flow is not claimed as implemented here.

## Primary references

- https://firebase.google.com/docs/ai-logic/hybrid/web/get-started
- https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options
- https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider
- https://firebase.google.com/docs/reference/js/ai#inferencesource

The SDK reference uses `on_device` and `in_cloud`, not UI labels. Configuration diagnostics expose missing field names only, never configuration values.
