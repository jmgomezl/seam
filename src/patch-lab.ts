import type {Revision} from './lab.ts';
export type Json=null|boolean|number|string|Json[]|{[key:string]:Json};
export type PatchProbe={id:string;label:string;target:{[key:string]:Json};patch:{[key:string]:Json};expected:{[key:string]:Json}};
export type PatchResult=PatchProbe&{wire:string;actual:Json;passed:boolean;error?:string};
// Authored demonstration adapters, not upstream or discovered source.
export function brokenSerializer(patch:{[key:string]:Json}):string {
 return JSON.stringify({...patch,deliveryNote:patch.deliveryNote??null});
}
export function fixedSerializer(patch:{[key:string]:Json}):string {
 return JSON.stringify(patch);
}
/** Authored implementation of RFC 7396 data semantics. Own keys only; non-mutating. */
export function applyMergePatch(target:Json|undefined,patch:Json):Json {
 if(patch===null||typeof patch!=='object'||Array.isArray(patch))return structuredClone(patch);
 const result:{[key:string]:Json}=target!==null&&typeof target==='object'&&!Array.isArray(target)?structuredClone(target):{};
 for(const [key,value] of Object.entries(patch)){
  if(value===null){delete result[key];continue;}
  const previous=Object.prototype.hasOwnProperty.call(result,key)?result[key]:undefined;
  Object.defineProperty(result,key,{value:applyMergePatch(previous,value),enumerable:true,configurable:true,writable:true});
 }
 return result;
}
export function canonicalJson(value:Json):string {const normalize=(v:Json):Json=>{if(typeof v==='number'&&!Number.isFinite(v))throw new Error('Non-finite numbers are unsupported.');return v!==null&&typeof v==='object'?Array.isArray(v)?v.map(normalize):Object.fromEntries(Object.keys(v).sort().map(k=>[k,normalize(v[k])])):v;};return JSON.stringify(normalize(value));}
export function patchProbes():PatchProbe[]{return [
 {id:'omit-set',label:'Omit existing',target:{orderId:'demo-17',deliveryNote:'Leave at reception'},patch:{},expected:{orderId:'demo-17',deliveryNote:'Leave at reception'}},
 {id:'clear',label:'Explicit null',target:{orderId:'demo-17',deliveryNote:'Leave at reception'},patch:{deliveryNote:null},expected:{orderId:'demo-17'}},
 {id:'replace',label:'Set text',target:{orderId:'demo-17',deliveryNote:'Leave at reception'},patch:{deliveryNote:'Use side entrance'},expected:{orderId:'demo-17',deliveryNote:'Use side entrance'}},
 {id:'empty',label:'Empty string',target:{orderId:'demo-17',deliveryNote:'Leave at reception'},patch:{deliveryNote:''},expected:{orderId:'demo-17',deliveryNote:''}},
 {id:'omit-missing',label:'Omit missing',target:{orderId:'demo-17'},patch:{},expected:{orderId:'demo-17'}},
 {id:'omit-null',label:'Preserve stored null',target:{orderId:'demo-17',deliveryNote:null},patch:{},expected:{orderId:'demo-17',deliveryNote:null}},
 {id:'clear-missing',label:'Clear missing',target:{orderId:'demo-17'},patch:{deliveryNote:null},expected:{orderId:'demo-17'}},
 {id:'replace-null',label:'Replace stored null',target:{orderId:'demo-17',deliveryNote:null},patch:{deliveryNote:'Use side entrance'},expected:{orderId:'demo-17',deliveryNote:'Use side entrance'}}
 ];}
export function executePatchProbes(serializer:(patch:{[key:string]:Json})=>unknown,probes:PatchProbe[],merge:(target:Json|undefined,patch:Json)=>Json,canonical:(value:Json)=>string):PatchResult[]{return probes.map(p=>{let wire='';try{const output=serializer(structuredClone(p.patch));if(typeof output!=='string'||output.length>50000)throw new Error('Adapter must synchronously return a JSON string under 50,000 characters.');wire=output;const decoded:Json=JSON.parse(output);const actual=merge(structuredClone(p.target),decoded);return {...p,wire,actual,passed:canonical(actual)===canonical(p.expected)};}catch(e){return {...p,wire,actual:null,passed:false,error:e instanceof Error?e.message:String(e)};}});}
export function runPatchLab(revision:Revision):PatchResult[]{return executePatchProbes(revision==='before'?brokenSerializer:fixedSerializer,patchProbes(),applyMergePatch,canonicalJson);}
export function customPatchProbe(revision:Revision,previous:string,intent:'omit'|'clear'|'set',next:string):PatchResult {
 if(previous.length>200||next.length>200)throw new Error('Keep each demo note at 200 characters or fewer.');
 if(!['omit','clear','set'].includes(intent))throw new Error('Select Keep, Clear or Set.');
 const target={orderId:'demo-17',deliveryNote:previous};
 const patch:{[key:string]:Json}=intent==='omit'?{}:{deliveryNote:intent==='clear'?null:next};
 const expected:{[key:string]:Json}=intent==='omit'?{...target}:intent==='clear'?{orderId:'demo-17'}:{...target,deliveryNote:next};
 return executePatchProbes(revision==='before'?brokenSerializer:fixedSerializer,[{id:'custom',label:'Your note',target,patch,expected}],applyMergePatch,canonicalJson)[0];
}
export function noteState(value:Json):{kind:'absent'|'null'|'value'|'replaced';label:string}{if(value===null||typeof value!=='object'||Array.isArray(value))return {kind:'replaced',label:'Document replaced'};if(!Object.prototype.hasOwnProperty.call(value,'deliveryNote'))return {kind:'absent',label:'Field removed'};if(value.deliveryNote===null)return {kind:'null',label:'Stored null'};return {kind:'value',label:typeof value.deliveryNote==='string'?value.deliveryNote||'Empty string':JSON.stringify(value.deliveryNote)};}
export function patchEvidence(revision:Revision,results:PatchResult[]){return {format:'seam-merge-patch-v1',revision,source:'Authored synthetic demonstration adapters and receiver',contract:{mediaType:'application/merge-patch+json',url:'https://www.rfc-editor.org/rfc/rfc7396',field:'deliveryNote'},results,limits:['Not an upstream incident or automated discovery','Only local synthetic data; no API or database','Null removes a member; absence preserves it for this media type, not all PATCH APIs','The demo serializer intentionally supports a named-field object input; receiver semantics also tested separately']};}
export function patchHarnessSource(){return `// Seam: authored omission/null serializer regression, not an upstream incident.
// Contract: application/merge-patch+json, RFC 7396: https://www.rfc-editor.org/rfc/rfc7396
// Node 22+. Default broken adapter exits 1; --fixed exits 0.
// --adapter ./adapter.mjs accepts named serializePatch or default synchronous function.
// Review your adapter first: import executes your code. This harness is not a sandbox.
// Each adapter receives an object and returns JSON text. Fixed synthetic expected states are independent of receiver implementation.
import {pathToFileURL} from 'node:url';
import {existsSync,realpathSync} from 'node:fs';
import {resolve} from 'node:path';
const probes=JSON.parse(${JSON.stringify(JSON.stringify(patchProbes()))});
const broken=${brokenSerializer.toString()};
const fixed=${fixedSerializer.toString()};
const merge=${applyMergePatch.toString()};
const canonical=${canonicalJson.toString()};
const execute=${executePatchProbes.toString()};
export function checkSerializer(serializer){return execute(serializer,probes,merge,canonical);}
if(process.argv[1]&&existsSync(process.argv[1])&&import.meta.url===pathToFileURL(realpathSync(process.argv[1])).href){
 const args=process.argv.slice(2);let adapter=args.includes('--fixed')?fixed:broken;const at=args.indexOf('--adapter');
 if(at>=0){if(!args[at+1])throw new Error('Supply an adapter module path');const m=await import(pathToFileURL(resolve(args[at+1])).href);adapter=m.serializePatch??m.default;if(typeof adapter!=='function')throw new Error('Export serializePatch or a default function');}
 const results=checkSerializer(adapter);for(const r of results)console.log((r.passed?'PASS':'FAIL')+' '+r.id+' wire='+r.wire+' expected='+JSON.stringify(r.expected)+' actual='+JSON.stringify(r.actual)+(r.error?' error='+r.error:''));
 console.log(results.filter(r=>r.passed).length+'/'+results.length+' state checks passed');process.exitCode=results.some(r=>!r.passed)?1:0;
}
`;}
export function runPatchSelection(revision:Revision,selection:number|null,custom:{previousNote:string;patchIntent:'omit'|'clear'|'set';nextNote:string}){
 const results=runPatchLab(revision);
 if(selection!==null&&(!Number.isInteger(selection)||selection<0||selection>=results.length))throw new Error('Unknown fixture selection.');
 const focus=selection===null?customPatchProbe(revision,custom.previousNote,custom.patchIntent,custom.nextNote):results[selection];
 return {results,focus};
}
