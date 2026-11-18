import {pinnedSource} from './pinned-source.ts';
import {runLab} from './lab.ts';
import {runPatchLab} from './patch-lab.ts';
export type ReviewScenario='money'|'patch';
export type ReviewBrief={scenario:ReviewScenario; title:string; rule:string; source:string; scope:string; total:number; originalPassed:number; correctedPassed:number; examples:{id:string;expected:string;original:string;corrected:string}[]; limits:string; command:string};
/** Explicitly executes both bundled adapters. Never reads custom/pasted inputs. */
export function createReviewBrief(scenario:ReviewScenario):ReviewBrief {
 const money=scenario==='money';
 const before=money?runLab('before'):runPatchLab('before');
 const after=money?runLab('fixed'):runPatchLab('fixed');
 const examples=before.filter(r=>!r.passed).map(r=>{
  const corrected=after.find(a=>a.id===r.id)!;
  return {id:r.id,expected:JSON.stringify(r.expected),original:'observed' in r?JSON.stringify(r.observed):JSON.stringify(r.actual),corrected:'observed' in corrected?JSON.stringify(corrected.observed):JSON.stringify(corrected.actual)};
 });
 return {scenario,title:money?'Currency display review':'Merge-patch review',rule:money?'Interpret each currency using its display-unit scale.':'Omitted members stay unchanged; explicit null removes a member.',source:money?'Pinned historical Stripe Link formatter · UCP display contract':'Authored synthetic adapters · RFC 7396',scope:money?'USD, EUR, JPY, KRW, KWD · 20 fixed numeric display probes':'8 fixed states · application/merge-patch+json',total:before.length,originalPassed:before.filter(r=>r.passed).length,correctedPassed:after.filter(r=>r.passed).length,examples,limits:money?'Display only, not Stripe charge or payout validation. ISK/HUF/TWD excluded. Not the full CLI or current upstream HEAD.':'Authored demonstration, not an upstream incident. Not every PATCH API follows RFC 7396.',command:`node ${money?'seam-boundary':'seam-merge-patch'}.test.mjs --fixed`};
}
export function reviewMarkdown(b:ReviewBrief):string {
 return [`# Seam · ${b.title}`,'',`Source: ${b.source}`,`Rule: ${b.rule}`,`Scope: ${b.scope}`,...(b.scenario==='money'?[`Contract: https://ucp.dev/specification/reference/`,`Original source: https://github.com/${pinnedSource.metadata.repository}/blob/${pinnedSource.metadata.beforeRevision}/${pinnedSource.metadata.path}`,`Correction source: https://github.com/${pinnedSource.metadata.repository}/blob/${pinnedSource.metadata.fixedRevision}/${pinnedSource.metadata.path}`]:['Contract: https://www.rfc-editor.org/rfc/rfc7396']), '','## Executed locally',`Original: ${b.originalPassed}/${b.total} passed`, `Correction: ${b.correctedPassed}/${b.total} passed`,'','## Original failures', '| Probe | Expected | Original | Correction |','| --- | --- | --- | --- |',...b.examples.map(e=>`| ${e.id} | ${e.expected} | ${e.original} | ${e.corrected} |`),'','## Reproduce','Export the runnable test from the same lab, then run:','```sh',b.command,'```','Original exits 1; --fixed exits 0 for these bundled checks.','', '## Limits',b.limits,'These checks passing is not a deployment approval or evidence of production coverage.','Fixed fixtures only. Custom inputs are not included. No AI inference or live API calls.',''].join('\n');
}
