import type {ReviewScenario} from './review-brief.ts';
export type Applicability='unanswered'|'fits'|'unsure'|'different';
export function handoff(scenario:ReviewScenario,applicability:Applicability){
 const money=scenario==='money';
 const filename=money?'seam-boundary.test.mjs':'seam-merge-patch.test.mjs';
 return {canConnect:applicability==='fits',question:money?'Does your formatter accept integer display units for USD, EUR, JPY, KRW and KWD and return an en-US currency string?':'Does your API use JSON Merge Patch, where omitted members stay and explicit null removes them?',caution:money?'Not for charge/payout amounts, provider-specific rounding, localization or currencies outside this suite.':'Not for JSON Patch, PUT, or APIs where null means a stored value. This suite checks a deliveryNote serializer against a local RFC 7396 receiver.',message:applicability==='unsure'?'Check your contract before adopting this test. No adapter setup is unlocked.':applicability==='different'?'Do not use this oracle for your integration. Keep the demo as an example; define the correct expected behavior separately.':'Only connect a trusted local adapter after verifying the rule.',command:`node ${filename} --adapter ./seam-adapter.mjs`,filename,signature:money?'formatAmount(amount, currency)':'serializePatch(patch)'};
}
/** A fail-closed scaffold, not an implementation or a verified customer adapter. */
export function adapterTemplate(scenario:ReviewScenario){
 const money=scenario==='money';
 return `// Seam local adapter scaffold. Review before running: imported modules execute code.\n// Keep secrets and network calls out. This file deliberately fails until connected.\n// ${money?'Display units only; not payment/payout validation. Return an en-US formatted string.':'RFC 7396 only; return JSON text, preserving omission versus explicit null.'}\n// Import your real synchronous implementation, then replace the throw below.\n// Do not copy the bundled correction just to make the suite pass.\nexport function ${money?'formatAmount(amount, currency)':'serializePatch(patch)'} {\n  throw new Error('Adapter not connected. Import and call your trusted local implementation.');\n}\n`;
}
