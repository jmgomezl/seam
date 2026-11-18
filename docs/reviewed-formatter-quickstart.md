# Connect a reviewed display proposal to your formatter

This path starts after a real candidate response and your independent review. Firebase extraction is not configured or validated in this repository; do not fabricate a response to skip that step. For the account-free authored demonstration, use `npm run demo` instead.

1. Review both source excerpts and enter the units/currencies yourself. Generate declaration witnesses. Only supported matching display contracts offer local adapter export.
2. Confirm the separate display-only applicability box. Download **local adapter test** and **unconnected adapter** into a new folder. Node 24 (or 22.18+) is recommended.
3. Open `trusted-adapter.mjs` and review it. It deliberately throws until connected. Import your own trusted synchronous formatter and replace the throw with a forwarding call, for example:

   ```js
   import {formatAmount as actualFormatter} from './your-reviewed-module.mjs';
   export function formatAmount(amount, currency) {
     return actualFormatter(amount, currency);
   }
   ```

   The import path/export name are placeholders for your code, not files Seam supplies. Ensure all imports are reviewed, free of secrets and live side effects. The formatter must accept integer display units and synchronously return an en-US string. Do not copy an expected result or the demo correction to make tests pass. This runner is not a sandbox; importing code can execute it. Blocking code needs an external process timeout.
4. Open a terminal **in the folder holding both downloaded files**. First run without redirection so you can see results without replacing a file:

   ```sh
   node seam-reviewed-adapter.mjs --adapter ./trusted-adapter.mjs
   ```

   The untouched scaffold must exit 1 with four failed/error rows. A connected correct implementation can exit 0; a mismatch/error exits 1; setup/argument failure exits 2. Exit 0 covers four numeric display cases only, not symbols, payment operations or production safety.
5. To save a report, choose a filename that does not already exist:

   ```sh
   node seam-reviewed-adapter.mjs --adapter ./trusted-adapter.mjs > new-report.json
   ```

   Shell redirection overwrites existing files. The runner's structured report omits excerpts, paths and raw exceptions, but your imported module can log its own data. Inspect the file before sharing; logging can also make it invalid JSON. Nothing is uploaded by the runner itself.
