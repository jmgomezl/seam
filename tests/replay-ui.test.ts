import test from 'node:test';
import assert from 'node:assert/strict';
import {compareFulfillment,replayEvidence,replayFinding,replayLedger} from '../src/replay-ui.ts';
test('browser replay comparison executes actual handlers and distinguishes sequential from concurrent duplicates',async()=>{const r=await compareFulfillment();assert.equal(r.original.filter(x=>x.passed).length,7);assert.equal(r.reference.filter(x=>x.passed).length,9);assert.deepEqual(r.original.find(x=>x.id==='sequential-redelivery')?.actual,['cs_demo_a']);assert.deepEqual(r.original.find(x=>x.id==='concurrent-same-session')?.actual,['cs_demo_a','cs_demo_a']);assert.deepEqual(r.reference.find(x=>x.id==='concurrent-same-session')?.actual,['cs_demo_a']);});
test('replay export contains actual ledgers and honest limitations',async()=>{const run=await compareFulfillment();const e=replayEvidence(run);assert.deepEqual(e.original,run.original);assert.deepEqual(e.reference,run.reference);assert.match(e.scope,/synthetic/);assert.ok(e.limits.some(s=>s.includes('Not live Stripe')));assert.ok(e.limits.some(s=>s.includes('No actual customer')));});

test('judge finding is grounded in selected execution and never promotes a sequential pass',async()=>{const run=await compareFulfillment();assert.match(replayFinding(undefined,undefined).detail,/No result/);for(const id of ['concurrent-same-session','five-call-burst'])assert.equal(replayFinding(run.original.find(r=>r.id===id),run.reference.find(r=>r.id===id)).title,'Extra fulfillment reproduced.');assert.match(replayFinding(run.original.find(r=>r.id==='sequential-redelivery'),run.reference.find(r=>r.id==='sequential-redelivery')).detail,/does not establish concurrent safety/);const r=run.original[0];assert.equal(replayFinding({...r,error:'failure'},run.reference[0]).title,'Replay incomplete.');assert.equal(replayFinding({...r,passed:false,actual:[]},run.reference[0]).title,'Observed behavior differs from the rule.');});

test('visual counts reflect actual records and keep error and raw-ID disclosure honest',()=>{
 assert.doesNotMatch(replayLedger(undefined),/replay-count/);
 const html=replayLedger({id:'x',actual:['<img src=x>','a'],expected:['a'],passed:false,error:'private details'});
 assert.match(html,/<strong>2<\/strong>/);assert.match(html,/Expected 1 · Incomplete/);
 assert.match(html,/&lt;img src=x&gt;/);assert.doesNotMatch(html,/private details/);
});

test('extra markers count identifiers against their own allowance, not merely total length',()=>{
 assert.match(replayLedger({id:'x',actual:['a','a'],expected:['a','b'],passed:false}),/1 extra record/);
 assert.doesNotMatch(replayLedger({id:'x',actual:['a'],expected:['a','b'],passed:false}),/replay-excess/);
 assert.match(replayLedger({id:'x',actual:['a','a','a'],expected:['a'],passed:false}),/2 extra records/);
 assert.doesNotMatch(replayLedger({id:'x',actual:['a','a'],expected:['a'],passed:false,error:'timeout'}),/replay-excess/);
});
