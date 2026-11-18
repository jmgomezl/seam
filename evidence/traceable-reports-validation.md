# Traceable report validation · 2026-11-18

## Practical gap addressed

The developer workflow already ran trusted local handlers, but saving CLI output did not identify the entry-module bytes or distinguish a shareable metadata artifact from potentially sensitive adapter output. An optional report now carries bounded fixed-fixture counts and provenance without copying inputs, ledger identifiers, paths, source contents or error messages.

## Scope

`--report` accepts a new local filename. Writes are exclusive, use mode 0600 for new files, and never overwrite existing artifacts. File digests cover entry and replay module bytes read before execution; an observed change at the after-run check aborts the report. This is not execution proof, authorship, attestation or hashing the dependency closure. A malicious adapter can lie, modify files or emit secrets; imports are trusted local code, not a sandbox. Existing console output is not redacted by this feature.

## Checks

- Actual CLI subprocess tests: racy result report (7/9, exit1), reference report (9/9, exit0), custom throwing adapter report, missing/unknown/conflicting arguments and load failure (exit2), exclusive-write refusal, and entry-file mutation refusal.
- Compare custom digest with independently calculated SHA-256 of the saved entry module.
- Verify report does not include secret-like adapter filename, error text, ledger identifiers or source text; pure serializer test strips arbitrary input/output/error strings.
- Report numbers fixtures rather than carrying arbitrary adapter-controlled labels.
- Full 109-test suite, TypeScript/Vite build and whitespace checks pass on Mac mini. No browser changes in this increment; existing UI unchanged.
- No real customer adapter or external integration tested. Newly authored test modules are controlled fixtures, not customer validation.
