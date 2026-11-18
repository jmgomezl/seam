import {formatAmount as beforeFormat} from './vendor/link-cli/before.ts';
import {formatAmount as fixedFormat} from './vendor/link-cli/fixed.ts';
import {compiledAdapters,pinnedSource,vendorLicense} from './pinned-source.ts';
export type Revision='before'|'fixed';
export type Probe={id:string;currency:string;amount:number;expected:number;group:'control'|'edge'|'zero'|'refund';units:number};
export type ProbeResult=Probe&{output:string;observed:number|null;passed:boolean;error?:string};
// Independent oracle: declared UCP/ISO display units, NOT Stripe charge-request rules.
export const displayContract=[{currency:'USD',units:100},{currency:'EUR',units:100},{currency:'JPY',units:1},{currency:'KRW',units:1},{currency:'KWD',units:1000}];
export function makeProbes():Probe[]{return displayContract.flatMap(({currency,units})=>[1000,1,0,-1000].map((amount,i)=>({id:`${currency}:${amount}`,currency,units,amount,expected:amount/units,group:(i===2?'zero':i===3?'refund':units===100?'control':'edge') as Probe['group']})));}
export function executeProbes(formatter:(amount:number,currency:string)=>unknown,probes:Probe[]):ProbeResult[]{return probes.map(p=>{try{const value=formatter(p.amount,p.currency);if(typeof value!=='string')throw new Error('Adapter must synchronously return a formatted string.');const match=value.match(/^([^0-9]*?)((?:[0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:\.[0-9]+)?)([^0-9]*)$/);const prefix=match?match[1].replace(/\s/g,''):'';const suffix=match?match[3].replace(/\s/g,''):'';const affix=prefix.replace(/[+−-]/g,'');const valid=match&&(prefix.match(/[+−-]/g)?.length??0)<=1&&['','$','€','¥','￥','₩',p.currency].includes(affix)&&['',p.currency].includes(suffix);let observed=valid?Number(match[2].replace(/,/g,'')):null;if(valid&&observed!==null&&/[-−]/.test(match[1]))observed=-observed;return {...p,output:value,observed,passed:observed!==null&&Number.isFinite(observed)&&Math.abs(observed-p.expected)<=Number.EPSILON*Math.max(1,Math.abs(p.expected))*4};}catch(e){return {...p,output:'',observed:null,passed:false,error:e instanceof Error?e.message:String(e)};}});}
export function runLab(revision:Revision){const formatter=revision==='before'?beforeFormat:fixedFormat;const probes=makeProbes();return executeProbes(formatter,probes);}
export function runCustomProbe(revision:Revision,amount:number,currency:string):ProbeResult {if(!Number.isSafeInteger(amount)||Math.abs(amount)>1e9)throw new Error('Use a whole wire amount from −1,000,000,000 to 1,000,000,000.');const c=displayContract.find(c=>c.currency===currency);if(!c)throw new Error('Choose a currency covered by this pinned display contract.');return executeProbes(revision==='before'?beforeFormat:fixedFormat,[{id:`custom:${currency}:${amount}`,currency,amount,units:c.units,expected:amount/c.units,group:'edge'}])[0];}
export function smallestWitness(revision:Revision,currency:string){const candidate=runCustomProbe(revision,1,currency);return candidate.passed?null:candidate;}
export function labEvidence(revision:Revision,results:ProbeResult[]){return {format:'seam-executable-boundary-v1',revision,source:pinnedSource.metadata,contract:{scope:'UCP display contract only; not Stripe charge or payout validation. Numeric output only; not charge API denomination',excludedCurrencies:['ISK','HUF','TWD'],url:'https://ucp.dev/specification/reference/',units:displayContract},results,limits:['Known public historical component, not a blind discovery','Exact selected formatter bodies; no full CLI, API or real payment','Numeric values only; currency-symbol correctness is outside scoring','Deterministic execution, not AI-generated evidence','No claim about current upstream HEAD or advantage over other tools']};}
export function harnessSource(){return `// Seam executable boundary contract. Node 22+; no dependencies or network calls in this harness.
// Default: historical original; expected nonzero exit. --fixed: historical correction; expected exit 0.
// Your adapter: --adapter ./adapter.mjs (named formatAmount or default export).
// Signature: synchronous (amount: number, currency: string) => formatted string.
// Importing your module executes YOUR code: review it first. The harness is not a sandbox.
// Oracle: UCP display contract only; not Stripe charge or payout validation.
// ISK, HUF and TWD are excluded. Provider operations require separate unit-scale and amount-increment rules.
// Numeric display output only. Do not use this oracle to validate charge or payout requests.
// Vendored stripe/link-cli snippets are MIT licensed; full notice below.
${'/*\n'+vendorLicense+'\n*/'}
import {pathToFileURL} from 'node:url';
import {existsSync,realpathSync} from 'node:fs';
import {resolve} from 'node:path';
const probes = ${JSON.stringify(makeProbes())};
const executeProbes = ${executeProbes.toString()};
const original = (()=>{${compiledAdapters.before};return formatAmount;})();
const fixed = (()=>{${compiledAdapters.fixed};return formatAmount;})();
export function checkAdapter(formatAmount){return executeProbes(formatAmount,probes);}
if(process.argv[1] && existsSync(process.argv[1]) && import.meta.url===pathToFileURL(realpathSync(process.argv[1])).href){
 const args=process.argv.slice(2);
 const external=args.length===2&&args[0]==='--adapter'&&args[1].trim()!==''&&!args[1].startsWith('--');
 if(!(args.length===0||(args.length===1&&args[0]==='--fixed')||external)){
  console.error('Usage: node <downloaded-test.mjs> [--fixed | --adapter ./trusted-adapter.mjs]');
  process.exit(2);
 }
 let adapter=args[0]==='--fixed'?fixed:original;
 if(external){const m=await import(pathToFileURL(resolve(args[1])).href);adapter=m.formatAmount??m.default;if(typeof adapter!=='function')throw new Error('Export formatAmount or a default function');}
 console.log('Mode: '+(external?'external adapter':args[0]==='--fixed'?'bundled correction':'bundled original'));
 const results=checkAdapter(adapter);for(const r of results)console.log((r.passed?'PASS':'FAIL')+' '+r.id+' expected='+r.expected+' observed='+r.observed+' output='+JSON.stringify(r.output)+(r.error?' error='+r.error:''));
 console.log(results.filter(r=>r.passed).length+'/'+results.length+' numeric contract checks passed');
 process.exitCode=results.some(r=>!r.passed)?1:0;
}
`;}
