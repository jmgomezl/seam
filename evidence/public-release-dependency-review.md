# Public release dependency review

2026-11-18: independent review identified a vulnerable transitive server-side dependency: firebase13.4.0 → @firebase/firestore4.20.0 → @grpc/grpc-js1.9.16. Seam does not import Firestore or run a gRPC server, so this was not evidence of browser exploitation. Nevertheless, the public install should not retain that known vulnerable version.

A bounded npm override pins @grpc/grpc-js to1.14.6 without upgrading Firebase. This version addresses both https://github.com/grpc/grpc-node/security/advisories/GHSA-m9gg-hp2v-232j and https://github.com/grpc/grpc-node/security/advisories/GHSA-f596-whhp-79r4 . The override intentionally exceeds Firestore's old minor constraint; it is validated for Seam's existing browser use, not a claim of tested Firestore/server compatibility.

Verification used a fresh, isolated npm ci --ignore-scripts installation, not shared dependencies. All81 tests and the strict production build passed. npm ls confirmed grpc1.14.6 overridden. npm audit --omit=dev reported zero known production dependency vulnerabilities at this check; this is not a guarantee against undisclosed vulnerabilities or a full development-dependency audit. No Firebase inference or App Check runtime validation was performed.
