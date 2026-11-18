# Privacy and submission-readiness audit, 2026-11-17

## Actual implementation

Both source copies were inspected. The shipped adapter already selects ONLY_ON_DEVICE for local requests and ONLY_IN_CLOUD for explicitly approved cloud requests. It does not use PREFER_ON_DEVICE, perform retries to cloud, or accept PDF/private uploads. Model invocation is text-only, single-turn and requires initialization consent before dynamic Firebase imports. Cloud consent is cleared on each UI request. No Firebase configuration is present in this audit; no inference or App Check traffic was initiated.

Firebase documents that PREFER_ON_DEVICE permits automatic cloud fallback, while ONLY_ON_DEVICE fails when local inference is unavailable. inferenceSource is a post-request diagnostic, not a prevention control. Local mode therefore must remain strict if private inputs are added. SDK initialization/App Check and model download may still use the network: local inference does not mean no network traffic.
Source: https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options

PDF input and multi-turn chat can fall back under permissive modes; strict local mode throws. Neither input form is exposed by this app today.
Source: https://firebase.google.com/docs/ai-logic/hybrid/web/get-started

## Narrow hardening (not deployed)

The TypeScript Route union was not enforced at runtime. An invalid JS route could pass the prior gate and select the ternary's cloud branch. The visible UI only emits local/cloud, so this is defensive hardening, not an observed leak. gate now rejects every unrecognized route before initialization. Three regression tests cover rejection, independent cloud authorization, and strict adapter wiring. A code comment makes the post-request nature of inferenceSource explicit. Both source copies receive the same changes.

These tests do not exercise the Firebase SDK or verify network behavior. Real-device tests remain required: missing/unavailable model, failed download, unsupported inputs if later added, canceled/repeated clicks and navigation, explicit cloud request, and network observation confirming no prompt payload reaches cloud on local failures. Observe metadata traffic separately from prompt traffic. Do not test private input before this is verified.

## Contest readiness, not submission authority

Official rules require a functioning eligible-platform app using Firebase AI Logic and App Check, actual runtime integration, public GitHub/GitLab source with an open-source license, English materials and a public YouTube demo (up to three evaluated minutes). Judges need free working-project access through the judging period ending December 16. A hosted URL is encouraged rather than the only permitted delivery: a working demo/test build is also allowed. Any access-controlled demo needs appropriate judge access. Production keys, live secrets, confidential business data and PII must stay out of submissions. Local or access-controlled previews are not proof of judge access. Submission closes November 30 at 14:00 Pacific (17:00 Colombia).
Source: https://firebasehybridaihackathon.devpost.com/rules

Blocked readiness items: actual authorized Firebase project/App Check configuration; compatible device and successful local inference; verified cloud route under explicit one-request consent; reliable complete product flow; judge access plan; source/license review and approved public release; demo. No project creation, billing activation, credential sharing, deployment, public repository or submission was performed by this audit.

Validation: 42/42 tests passed in both source copies. The sanitized Site checkout has no installed TypeScript compiler, so its first build attempt was blocked. The identical source was successfully typechecked and built in seam-reconstructed with its existing pinned dependencies; generated output was synchronized to the Site checkout. No browser, real inference or network-validation claim.
