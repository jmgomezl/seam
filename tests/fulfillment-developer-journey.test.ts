import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const cli=fileURLToPath(new URL('../scripts/check-fulfillment.mjs',import.meta.url));
const invoke=(args:string[],cwd?:string)=>spawnSync(process.execPath,['--experimental-strip-types',cli,...args],{cwd,encoding:'utf8'});
// Newly authored example with serialized work; does not import bundled handlers.
// Serialization passes this finite model, not crash/durable/distributed safety.
const application=`export function queueOrders({yieldWork,writeRecord}) {
 const completed=new Set();let tail=Promise.resolve();
 return request=>{const work=tail.then(async()=>{
  if(request.paymentStatus==='unpaid'||completed.has(request.sessionId))return;
  await yieldWork();writeRecord(request.sessionId);completed.add(request.sessionId);
 });tail=work.catch(()=>{});return work;};
}`;
const wrapper=`import {queueOrders} from './order-service.mjs';
export const createHandler=({checkpoint,recordFulfillment})=>queueOrders({yieldWork:checkpoint,writeRecord:recordFulfillment});`;
test('independent two-file local handler runs from a spaced directory and creates traceable report',()=>{
 const dir=mkdtempSync(join(tmpdir(),'seam developer journey '));try{
 writeFileSync(join(dir,'order-service.mjs'),application);writeFileSync(join(dir,'adapter.mjs'),wrapper);
 const result=invoke(['--adapter','./adapter.mjs','--report','./review.json'],dir);assert.equal(result.status,0,result.stderr);
 const stdout=JSON.parse(result.stdout),report=JSON.parse(readFileSync(join(dir,'review.json'),'utf8'));
 assert.equal(stdout.passed,9);assert.equal(report.passed,9);assert.equal(report.mode,'local-adapter');
 assert.equal(report.entryModuleSha256,createHash('sha256').update(wrapper).digest('hex'));
 assert.ok(report.limits.some((s:string)=>s.includes('imported dependencies')));
 const saved=readFileSync(join(dir,'review.json'),'utf8');const collision=invoke(['--adapter','./adapter.mjs','--report','./review.json'],dir);
 assert.equal(collision.status,2);assert.match(collision.stderr,/Choose a new --report filename/);assert.match(collision.stderr,/replay already ran/);assert.equal(readFileSync(join(dir,'review.json'),'utf8'),saved);
 // Independent behavioral mutation drops all effects; neither wrapper nor report can hide it.
 writeFileSync(join(dir,'order-service.mjs'),'export const queueOrders=()=>async()=>{};');
 const broken=invoke(['--adapter','./adapter.mjs','--report','./broken-review.json'],dir);assert.equal(broken.status,1,broken.stderr);assert.equal(JSON.parse(broken.stdout).passed,1);
 const badReport=JSON.parse(readFileSync(join(dir,'broken-review.json'),'utf8'));assert.equal(badReport.passed,1);
 // The entry hash is unchanged despite dependency behavior changing: explicitly not closure attestation.
 assert.equal(badReport.entryModuleSha256,report.entryModuleSha256);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('help is useful without executing replay; mixed help flags fail closed',()=>{
 const help=invoke(['--help']);assert.equal(help.status,0);assert.match(help.stdout,/createHandler/);assert.match(help.stdout,/not a sandbox/);assert.match(help.stdout,/Exit codes: 0/);assert.ok(!help.stdout.includes('"results"'));
 assert.equal(invoke(['--help','--reference']).status,2);
});
