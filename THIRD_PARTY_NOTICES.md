# Third-party notices

The extracted Stripe Link formatter functions in `src/vendor/link-cli/` and their literals in `src/pinned-source.ts` originate from `stripe/link-cli`, `packages/cli/src/commands/ucp/checkout-summary.tsx`.

- Original revision: 8d46e6b0da0425b5cd9db208a100a96f4feff3fa
- Corrected revision: 7d80ee989e8ea7e69beab3562b67ba6820ed3eb3
- License: MIT, Copyright (c) 2026 Stripe, LLC. Complete notice: `public/licenses/stripe-link-cli-MIT.txt`. The exported money harness includes this notice.

The Merge Patch receiver is an authored implementation of RFC7396 semantics, not copied RFC pseudocode. Reference: https://www.rfc-editor.org/rfc/rfc7396 .

The currency oracle uses the UCP Amount display contract: https://ucp.dev/specification/reference/ . It is not Stripe charge/payout validation.

Package dependencies retain their own upstream licenses. See `package-lock.json` for pinned versions.
