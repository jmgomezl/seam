import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';
import {runFulfillmentReplay,type HandlerFactory} from '../src/fulfillment-replay.ts';
import {replayReport} from '../scripts/replay-report.mjs';
test('never-settling handler fails boundedly and remaining fixtures explicitly do not run',async()=>{
 let factories=0;
 const results=await runFulfillmentReplay(()=>{factories++;return ()=>new Promise(()=>{});},{timeoutMs:20});
 assert.equal(factories,1);assert.equal(results.length,9);assert.equal(results[0].executionStatus,'timed-out');
 assert.match(results[0].error!,/not canceled/);assert.ok(results.slice(1).every(r=>!r.passed&&r.executionStatus==='not-run'));
 const report=replayReport({results,mode:'local-adapter',adapterSha256:'synthetic',runnerSha256:'synthetic',startedAt:'synthetic'});
 assert.equal(report.checks[0].executionStatus,'timed-out');assert.equal(report.checks[1].executionStatus,'not-run');
});
test('late completion cannot mutate returned evidence or start later batches',async()=>{
 let release!:()=>void,calls=0;
 const results=await runFulfillmentReplay(({recordFulfillment})=>async r=>{calls++;await new Promise<void>(resolve=>{release=resolve;});recordFulfillment(r.sessionId);},{timeoutMs:20});
 const snapshot=JSON.stringify(results);release();await new Promise(r=>setTimeout(r,0));
 assert.equal(JSON.stringify(results),snapshot);assert.equal(calls,1);
});
test('synchronous throw still waits for already-started sibling effects',async()=>{
 const factory:HandlerFactory=({recordFulfillment})=>{let calls=0;return r=>{calls++;if(calls===2)throw new Error('synchronous failure');return new Promise(resolve=>setTimeout(()=>{recordFulfillment(r.sessionId);resolve();},5));};};
 const results=await runFulfillmentReplay(factory,{timeoutMs:1000});
 const concurrent=results.find(r=>r.id==='concurrent-same-session')!;
 assert.equal(concurrent.passed,false);assert.equal(concurrent.error,'synchronous failure');assert.deepEqual(concurrent.actual,['cs_demo_a']);
 const snapshot=JSON.stringify(results);await new Promise(r=>setTimeout(r,10));assert.equal(JSON.stringify(results),snapshot);
});
test('invalid waiting bounds are rejected before executing an adapter',async()=>{
 let calls=0;const factory:HandlerFactory=()=>{calls++;return async()=>{};};
 for(const timeoutMs of [0,-1,NaN,Infinity,1.5,60001])await assert.rejects(runFulfillmentReplay(factory,{timeoutMs}));
 assert.equal(calls,0);
});

test('actual CLI exits 1 and reports timeout versus skipped checks for unresolved handler',()=>{
 const dir=mkdtempSync(join(tmpdir(),'seam-replay-timeout-'));
 try{
  const adapter=join(dir,'adapter.mjs'),report=join(dir,'report.json');
  writeFileSync(adapter,'export const createHandler=()=>()=>new Promise(()=>{});');
  const result=spawnSync(process.execPath,['--experimental-strip-types','scripts/check-fulfillment.mjs','--adapter',adapter,'--report',report],{encoding:'utf8',timeout:12000});
  assert.equal(result.status,1,result.stderr);assert.equal(result.error,undefined);
  const output=JSON.parse(result.stdout),metadata=JSON.parse(readFileSync(report,'utf8'));
  assert.equal(output.results[0].executionStatus,'timed-out');assert.equal(metadata.checks[0].executionStatus,'timed-out');
  assert.ok(metadata.checks.slice(1).every((r:any)=>r.executionStatus==='not-run'));
 }finally{rmSync(dir,{recursive:true,force:true});}
});
