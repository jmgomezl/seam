import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {runFulfillmentReplay,racyHandler,singleProcessHandler,fulfillmentCases} from '../src/fulfillment-replay.ts';
import type {HandlerFactory} from '../src/fulfillment-replay.ts';
test('replay catches concurrent duplicate fulfillment despite sequential deduplication',async()=>{
 const results=await runFulfillmentReplay(racyHandler);
 assert.equal(results.filter(r=>r.passed).length,7);
 assert.equal(results.find(r=>r.id==='sequential-redelivery')?.passed,true);
 assert.deepEqual(results.find(r=>r.id==='concurrent-same-session')?.actual,['cs_demo_a','cs_demo_a']);
 assert.equal(results.find(r=>r.id==='five-call-burst')?.actual.length,5);
});
test('single-process reference satisfies all nine explicit ledgers deterministically',async()=>{
 const results=await runFulfillmentReplay(singleProcessHandler);
 assert.equal(results.length,9);assert(results.every(r=>r.passed));
 assert.deepEqual(await runFulfillmentReplay(singleProcessHandler),results);
});
test('negative controls reject missing effects, global dedup and unpaid fulfillment',async()=>{
 const noOp:HandlerFactory=()=>async()=>{};
 const globalDedup:HandlerFactory=({recordFulfillment})=>{let done=false;return async r=>{if(!done&&r.paymentStatus!=='unpaid'){done=true;recordFulfillment(r.sessionId);}};};
 const allPaid:HandlerFactory=({recordFulfillment})=>async r=>{recordFulfillment(r.sessionId);};
 assert.equal((await runFulfillmentReplay(noOp)).find(r=>r.id==='one-paid-session')?.passed,false);
 assert.equal((await runFulfillmentReplay(globalDedup)).find(r=>r.id==='distinct-sessions')?.passed,false);
 assert.equal((await runFulfillmentReplay(allPaid)).find(r=>r.id==='unpaid-does-not-fulfill')?.passed,false);
});
test('throws and invalid adapters fail, fixtures cannot be mutated between runs',async()=>{
 assert((await runFulfillmentReplay(()=>async()=>{throw new Error('synthetic failure');})).every(r=>!r.passed&&r.error==='synthetic failure'));
 const first=fulfillmentCases();first[0].expected.push('tampered');
 assert.deepEqual(fulfillmentCases()[0].expected,['cs_demo_a']);
 const results=await runFulfillmentReplay((()=>null) as unknown as HandlerFactory);
 assert(results.every(r=>!r.passed));
});
test('CLI executes imported adapter and reports nonzero for known race, zero for reference',()=>{
 for(const [args,code,passed] of [[[],1,7],[['--reference'],0,9],[['--adapter','./examples/fulfillment-adapter.mjs'],1,7]] as const){
  const run=spawnSync(process.execPath,['--experimental-strip-types','scripts/check-fulfillment.mjs',...args],{encoding:'utf8'});
  assert.equal(run.status,code,run.stderr);assert.equal(JSON.parse(run.stdout).passed,passed);
 }
 const invalid=spawnSync(process.execPath,['--experimental-strip-types','scripts/check-fulfillment.mjs','--unknown'],{encoding:'utf8'});
 assert.equal(invalid.status,2);
});
