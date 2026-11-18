# Semantic boundary lab 009

## Scope and UI

Adds Missing vs null beside Money while retaining the ink/paper/lime visual direction. Default prose is reduced to the scenario title, source badge, result and compact scope. Three visual stages show caller intent, serialized wire and receiver outcome. Source, all observations, custom inputs and method are available through disclosures. Omitted, null and empty-string values are not conflated. Result/status and error focus support keyboard and screen-reader users; the UI introduces no motion or artificial waiting.

## New executable category

This is an authored synthetic delivery-note serializer demonstration, not an upstream incident. The faulty adapter changes a missing deliveryNote into null. An authored RFC 7396 receiver then removes the key. The corrected adapter preserves omission. Eight explicitly authored expected states independently cover omission, explicit clear, replacement, empty string, missing existing state and stored null. Original passes 6/8; correction passes 8/8. Custom Keep/Clear/Set intentions execute the same adapters with public/synthetic text only.

The media type is application/merge-patch+json, not all PATCH APIs. Receiver behavior follows https://www.rfc-editor.org/rfc/rfc7396 : missing members remain, null removes a member, nested objects merge, arrays/non-object patches replace rather than element-merge. Implementation and fixtures are newly authored; no extracted RFC code or examples are represented as ours.

The downloadable Node harness actually executes both adapters and supports user-provided synchronous serializePatch(object) returning JSON text. It includes an independent expected-state oracle, local reference receiver and clear no-sandbox warning. No browser evaluation of arbitrary user code is introduced. Built-in monetary source attribution and UCP-only exclusions remain unchanged.

## Verification and review corrections

81 tests pass with strict typecheck/build. Tests assert own-key absence rather than a null value, preserve unrelated fields, cover nested/array/root merge behavior, protect __proto__/constructor keys, verify input nonmutation, exercise the actual Node export and custom adapter, and generate/run an export from minified production-style code.

Independent review identified overflow JSON numbers: 1e400 could become Infinity and stringify to null. Canonical comparison now recursively rejects non-finite numbers; direct and exported-adapter regressions prove rejection. Review also required fair before/after selection: a chosen fixture now remains chosen through implementation changes, rather than silently substituting hidden custom inputs. The tested runPatchSelection helper drives this UI path. Custom mode starts only when its form is submitted.

Browser QA was separate from this implementation-stage check. Existing money results remain original 11/20 and correction 20/20. Real Firebase AI Logic/Gemini Nano/App Check, independent user benefit, automated discovery and contest eligibility remain unvalidated. No public release or submission occurred at this checkpoint.
