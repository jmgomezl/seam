# Printable replay review sheet

The replay lab can export a standalone HTML review sheet after execution, alongside the unchanged JSON export. It renders actual recorded effect counts and identifiers, the sequential/concurrent/reference witness, and every original schedule with its matching reference outcome. Missing/error outcomes are labeled, not presented as passes.

No source excerpts, private paths, timestamps, browser data, credentials or error messages are added. Dynamic identifiers are HTML-escaped. The document contains no JavaScript, forms, images or auto-loading external assets; a restrictive CSP is included. Source links are explicit user navigation. It is editable HTML, not a signed attestation, execution proof, or production guarantee.

Validation: actual replay export tests, malicious identifier escaping, incomplete/missing outcome tests, full suite and build. Browser download completion and mobile/print appearance have not been visually verified.
