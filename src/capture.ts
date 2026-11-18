import {analyze,type Finding,type Spec} from './engine.ts';
export interface Capture {payload:string;pointer:string;producerUnits:string;consumerUnits:string;producerCurrency:string;consumerCurrency:string;producerReference:string;consumerReference:string}
export const starter:Capture={payload:'{\n  "payment": {"amount": 1250, "currency": "USD"}\n}',pointer:'/payment/amount',producerUnits:'100',consumerUnits:'1',producerCurrency:'USD',consumerCurrency:'USD',producerReference:'Example sender: amount is cents (100 per dollar).',consumerReference:'Example receiver: amount is treated as dollars (1 per dollar).'};
export function readPointer(payload:unknown,pointer:string):unknown {
 if(pointer==='')return payload;
 if(!pointer.startsWith('/')||pointer.length>512)throw new Error('Use a JSON Pointer such as /payment/amount. Empty selects the root.');
 let value:unknown=payload;
 for(const raw of pointer.slice(1).split('/')){if(/~(?![01])/u.test(raw))throw new Error('Invalid JSON Pointer escape. Use ~0 for ~ and ~1 for /.');const key=raw.replace(/~1/g,'/').replace(/~0/g,'~');if(value===null||typeof value!=='object'||!Object.prototype.hasOwnProperty.call(value,key))throw new Error(`Field not found at ${pointer}. Check the JSON Pointer.`);if(Array.isArray(value)&&!(/^(0|[1-9]\d*)$/.test(key)))throw new Error('Array indexes must be non-negative whole numbers without leading zeroes.');value=(value as Record<string,unknown>)[key];}return value;
}
function units(value:string):number|null {if(!value.trim())return null;const n=Number(value);if(!Number.isSafeInteger(n)||n<=0||n>1e9)throw new Error('Wire units must be a positive whole number up to 1,000,000,000, or blank when unknown.');return n;}
export function inspectCapture(c:Capture):{spec:Extract<Spec,{kind:'amount'}>;finding:Finding;value:number}{
 if(c.payload.length>50000)throw new Error('Keep the sanitized payload under 50,000 characters.');
 let data:unknown;try{data=JSON.parse(c.payload);}catch{throw new Error('Payload is not valid JSON. Use double quotes and remove trailing commas.');}
 const value=readPointer(data,c.pointer);if(typeof value!=='number'||!Number.isFinite(value))throw new Error('The selected field must be a finite JSON number, not a string or null.');
 if(Math.abs(value)>Number.MAX_SAFE_INTEGER)throw new Error('Amount exceeds JavaScript safe numeric range; this prototype cannot verify it reliably.');
 const currency=(s:string)=>{const t=s.trim().toUpperCase();if(t&&!/^[A-Z]{3}$/.test(t))throw new Error('Use a three-letter currency code or leave it blank when unknown.');return t;};
 const spec:Extract<Spec,{kind:'amount'}>={kind:'amount',value,producerScale:units(c.producerUnits),consumerScale:units(c.consumerUnits),producerCurrency:currency(c.producerCurrency),consumerCurrency:currency(c.consumerCurrency)};
 const finding=analyze(spec);return {spec,value,finding:{...finding,scope:'Browser-local arithmetic over your supplied payload and declarations. No source code, API or real transaction was tested.'}};
}
export function displayAmount(value:number,scale:number|null,currency:string){if(scale===null||!currency)return 'Unknown';const major=value/scale;const formatted=major.toLocaleString('en-US',{maximumFractionDigits:9,minimumFractionDigits:2});return `${currency} ${Number(formatted.replace(/,/g,''))===major?formatted:String(major)}`;}
export function previewContractAlignment(c:Capture):Capture {const {spec}=inspectCapture(c);if(spec.producerScale===null||!spec.producerCurrency)throw new Error('Confirm the producer units and currency first.');return {...c,consumerUnits:String(spec.producerScale),consumerCurrency:spec.producerCurrency};}
export function capturePacket(c:Capture){return {format:'seam-boundary-capture-v1',provenance:'User-declared boundary; not independently verified',inference:'none',input:{...c},...inspectCapture(c),limits:['No source/API execution','Currency rules are supplied, not inferred','No private uploads or AI transmission','Export contains the entered payload and references']};}
export function captureRegression(c:Capture):string {const {spec}=inspectCapture(c);return `// Seam: declared-boundary contract check, not an upstream integration test.
// Run: node seam-check.mjs [sanitized-response.json]
// Without a file, checks the captured sample. Optional file uses the same pointer/contracts.
// Nonzero exit means a declared mismatch or invalid/missing sample. No network requests.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const pointer = ${JSON.stringify(c.pointer)};
const source = ${JSON.stringify(spec)};
const fallback = JSON.parse(${JSON.stringify(c.payload)});
const readPointer = ${readPointer.toString()};
export function checkPayload(payload) {
 const value = readPointer(payload, pointer);
 assert.equal(typeof value, 'number', 'Selected field must be numeric');
 assert.ok(Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER, 'Unsupported numeric amount');
 assert.ok(source.producerScale && source.consumerScale && source.producerCurrency && source.consumerCurrency, 'Confirm missing units/currency first');
 assert.equal(source.producerCurrency, source.consumerCurrency, 'Declared currencies disagree; this check performs no FX conversion');
 assert.equal(source.producerScale, source.consumerScale, 'Declared wire units disagree, even when sample is zero');
 return {value: value/source.producerScale, currency: source.producerCurrency};
}
// Import checkPayload into your own test suite, or execute this file directly.
import {pathToFileURL} from 'node:url';
if(process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
 const payload = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], 'utf8')) : fallback;
 console.log('Declared boundary agrees:', checkPayload(payload));
}
`;}

export function numericFields(payload:string):Array<{pointer:string;value:number}>{
 if(payload.length>50000)return [];let data:unknown;try{data=JSON.parse(payload);}catch{return [];}const found:Array<{pointer:string;value:number}>=[];
 const visit=(value:unknown,pointer:string,depth:number)=>{if(depth>20||found.length>=100)return;if(typeof value==='number'&&Number.isFinite(value)){found.push({pointer,value});return;}if(value&&typeof value==='object')for(const [key,child] of Object.entries(value)){if(found.length>=100)break;visit(child,pointer+'/'+key.replace(/~/g,'~0').replace(/\//g,'~1'),depth+1);}};visit(data,'',0);return found;
}
