import type {ConfirmedUnits} from './proposal.ts';
import {displayContract,makeProbes,executeProbes} from './lab.ts';
export function adapterPlan(c:ConfirmedUnits){
 const contract=displayContract.find(rule=>rule.currency===c.producerCurrency&&rule.units===c.producerScale);
 if(!contract||c.consumerCurrency!==c.producerCurrency)throw new Error('No supported independent display oracle matches these declarations. Keep the declaration-only check.');
 return {currency:contract.currency,units:contract.units,probes:makeProbes().filter(p=>p.currency===contract.currency)};
}
/** Export data and a fixed runner only; never model-generated implementation. */
export function proposalAdapterHarness(c:ConfirmedUnits,scopeConfirmed:boolean){
 if(!scopeConfirmed)throw new Error('Confirm the local adapter signature and display-only scope first.');
 const plan=adapterPlan(c);
 return `// Seam trusted local formatter check. Node 22+. NOT A SANDBOX.
// Importing your adapter executes arbitrary local code; review all imports first.
// Use fake/sanitized data only. No credentials, network effects, charges or payouts.
// Synchronous en-US numeric display output only; currency symbols are not scored.
// Four independently authored probes; not production safety or exhaustive coverage.
// A blocking import/adapter needs an external process timeout.
// Run: node seam-reviewed-adapter.mjs --adapter ./trusted-adapter.mjs > new-report.json
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const declarations = ${JSON.stringify(c)};
const probes = ${JSON.stringify(plan.probes)};
const executeProbes = ${executeProbes.toString()};
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--adapter'||!args[1].trim()||args[1].startsWith('--')){
 console.error('Usage: node seam-reviewed-adapter.mjs --adapter ./trusted-adapter.mjs');process.exitCode=2;
}else try{
 const module=await import(pathToFileURL(resolve(args[1])).href);
 const adapter=module.formatAmount??module.default;
 if(typeof adapter!=='function')throw new Error('Adapter must export formatAmount or a default function.');
 const results=executeProbes(adapter,probes);
 // Omit local path, excerpts, raw output and exception messages from this report.
 // Adapter code can itself log or perform effects; this runner cannot prevent that.
 console.log(JSON.stringify({format:'seam-reviewed-display-adapter-v1',execution:'External trusted adapter invoked locally',declarations,provenance:'Human-reviewed declarations; not independently verified',oracle:{id:'seam-display-v1',source:'https://ucp.dev/specification/reference/',currency:${JSON.stringify(plan.currency)},units:${plan.units},selection:'Producer declaration matched fixed independent oracle; consumer scale does not set expectations'},results:results.map(r=>({id:r.id,amount:r.amount,currency:r.currency,expected:r.expected,observed:r.observed,passed:r.passed,error:!!r.error})),limits:['Four fixed numeric display cases only','No API, payment, payout, currency symbol or full integration validation','No source excerpts, model response or source-code hash included','Editable report, not a signed proof of execution']},null,2));
 process.exitCode=results.every(r=>r.passed)?0:1;
}catch{console.error('Adapter setup failed. No passing report produced. Check your trusted module and exports.');process.exitCode=2;}
`;
}
