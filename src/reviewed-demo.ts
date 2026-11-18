import {adapterPlan} from './proposal-adapter.ts';
import type {ConfirmedUnits} from './proposal.ts';
import {executeProbes,harnessSource,makeProbes} from './lab.ts';
import {formatAmount as original} from './vendor/link-cli/before.ts';
import {formatAmount as corrected} from './vendor/link-cli/fixed.ts';
import {pinnedSource} from './pinned-source.ts';
/** Execute only reviewed, bundled functions; neither excerpts nor model output become code. */
export function runReviewedDemo(declarations:ConfirmedUnits){
 const plan=adapterPlan(declarations);
 return {currency:plan.currency,source:pinnedSource.metadata,original:executeProbes(original,plan.probes),corrected:executeProbes(corrected,plan.probes)};
}
/** Same fixed oracle and four probes as the visual run, with existing safe CLI semantics. */
export function reviewedDemoHarness(declarations:ConfirmedUnits){
 const probes=adapterPlan(declarations).probes;
 const source=harnessSource();
 const all=`const probes = ${JSON.stringify(makeProbes())};`;
 if(!source.includes(all))throw new Error('Regression template changed; no export produced.');
 return source.replace(all,`const probes = ${JSON.stringify(probes)};`);
}
