import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {judgeDemo} from '../scripts/judge-demo.mjs';
import {racyHandler,singleProcessHandler} from '../src/fulfillment-replay.ts';

test('judge demo executes the expected failure and reference, not only passing totals',async()=>{
 const e=await judgeDemo();assert.equal(e.verified,true);
 assert.deepEqual(e.original.failures,['concurrent-same-session','five-call-burst']);
 assert.deepEqual(e.witness,{sequentialEffects:1,overlappingEffects:2,referenceOverlappingEffects:1});
 assert.equal(e.results.original.length,9);assert.equal(e.results.reference.length,9);
});
test('judge demo fails closed if faulty/reference implementations are changed',async()=>{
 assert.equal((await judgeDemo(singleProcessHandler,singleProcessHandler)).verified,false);
 assert.equal((await judgeDemo(racyHandler,racyHandler)).verified,false);
 assert.equal((await judgeDemo(()=>async()=>{throw new Error('failure');})).verified,false);
});
test('judge CLI succeeds with explicit scope and rejects unknown arguments',()=>{
 const run=spawnSync(process.execPath,['--experimental-strip-types','scripts/judge-demo.mjs'],{encoding:'utf8'});
 assert.equal(run.status,0);assert.match(run.stdout,/DEMO VERIFIED/);assert.match(run.stdout,/not production safety/);assert.match(run.stdout,/7\/9.*9\/9/);
 const invalid=spawnSync(process.execPath,['--experimental-strip-types','scripts/judge-demo.mjs','--cloud'],{encoding:'utf8'});
 assert.equal(invalid.status,2);assert.doesNotMatch(invalid.stdout,/DEMO VERIFIED/);
});
