# Bounded mathematical checks, not a proof

Run `node --experimental-strip-types --test tests/bounded-properties.test.ts` (Node 22+) or `npm test` for all suites. This suite is development/CI evidence, not yet exposed in the UI or downloadable harness. No AI/runtime access or third-party data is required. No new dependencies.

## What is checked

- 5,075 currency-display checks: five explicitly declared currencies times 15 boundary amounts plus 1,000 deterministic generated integers in [-1e9, 1e9]. Generated draws can repeat. A separately written BigInt decimal parser reconstructs integer minor units from output; expected values are original input integers, not the production floating-point oracle. Unit exponents are declared independently: USD/EUR 2, JPY/KRW 0, KWD 3. Only numeric en-US display semantics, not currency-symbol correctness, locale coverage, processor charges or payouts.
- 512 JSON values (12 base values and 500 generated values, nesting depth at most 3) exercise RFC7396 idempotence, object-only empty-patch identity, omitted-member preservation, explicit-null deletion, array replacement, scalar replacement, input nonmutation, and preservation of false/0/empty string. Expected algebraic relations use Node strict structural equality, not production canonicalJson. Independent laws reduce shared implementation mistakes but do not constitute an independent complete merge implementation.
- Named deliveryNote serializer checks independently construct omit/clear/set expectations. Set is restricted to scalar/array values: object members recursively merge and therefore cannot use the same replacement expectation.
- Negative controls must detect the historical money scaling bug, deliberate precision/sign corruption, the omission-to-null adapter, and deliberate falsey-value deletion. These controls are not an exhaustive mutation-testing score.

## Replay and limits

Generator is xorshift32-v1 with unsigned seed 0x5345414d (1397047629). No random wall-clock seed, network, production inputs or claim of random statistical coverage. Assertions report failing input or generated index; preserve the seed and this test revision to replay. There is no automatic shrinking or guarantee of smallest witness in this suite. Samples are finite and selected, not a probability of correctness, full JSON coverage, formal verification or deployment approval. Unsupported cases include arbitrary locales, unlisted currencies, amounts beyond the bound, non-JSON inputs and arbitrary production adapters. Known examples and tests are authored by the same project; hold-out external adapters and independent review remain necessary.

## Why not add cryptography first?

Cryptographic hashes cannot establish that a business rule is correct or a test actually executed. A later SHA-256 fingerprint of exact exported artifact bytes can detect a change relative to a separately trusted digest, not authenticate an author or prevent replacement of both artifact and digest. Signing needs trusted key/identity handling. Hashes do not anonymize low-entropy private inputs. Current canonicalJson is an internal equality helper, not a claimed RFC8785 implementation. Blockchain, ZK proofs and unverifiable 'proof' badges would add complexity without validating these adapters.

Sources: [RFC7396 merge semantics](https://www.rfc-editor.org/rfc/rfc7396); [RFC8785 canonicalization](https://www.rfc-editor.org/rfc/rfc8785); [fast-check concepts](https://fast-check.dev/docs/introduction/) for a future dependency-backed generator/shrinker. This suite uses its own explicitly bounded deterministic corpus, not fast-check.
