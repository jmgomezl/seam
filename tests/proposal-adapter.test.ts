import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {adapterPlan,proposalAdapterHarness} from '../src/proposal-adapter.ts';
const confirmed={producerScale:100,consumerScale:1,producerCurrency:'USD',consumerCurrency:'USD'};
test('adapter plan uses independent oracle, not wrong consumer declaration',()=>{assert.equal(adapterPlan(confirmed).probes.find(p=>p.amount===1000)!.expected,10);assert.throws(()=>adapterPlan({...confirmed,producerScale:1}));assert.throws(()=>adapterPlan({...confirmed,consumerCurrency:'EUR'}));assert.throws(()=>proposalAdapterHarness(confirmed,false));});
test('export actually executes required trusted external adapters and emits scoped artifact',()=>{
 const dir=mkdtempSync(join(tmpdir(),'seam-adapter-'));
 try{const runner=join(dir,'test.mjs');writeFileSync(runner,proposalAdapterHarness(confirmed,true));
 const run=(args:string[])=>spawnSync(process.execPath,[runner,...args],{encoding:'utf8',timeout:5000});
 assert.equal(run([]).status,2);assert.equal(run(['--fixed']).status,2);
 for(const [name,scale,exit] of [['correct',100,0],['wrong',1,1]] as const){const adapter=join(dir,name+'.mjs');writeFileSync(adapter,`export function formatAmount(n){return (n/${scale}).toFixed(2);}`);const result=run(['--adapter',adapter]);assert.equal(result.status,exit,result.stderr);const report=JSON.parse(result.stdout);assert.equal(report.results.length,4);assert.equal(report.results[0].expected,10);assert.equal(report.results[0].observed,1000/scale);assert.doesNotMatch(result.stdout,new RegExp(dir));assert.ok(report.limits.includes('Editable report, not a signed proof of execution'));}
 const bad=join(dir,'throw.mjs');writeFileSync(bad,"export function formatAmount(){throw new Error('secret-error-text')}");const result=run(['--adapter',bad]);assert.equal(result.status,1);assert.doesNotMatch(result.stdout,/secret-error-text/);assert.ok(JSON.parse(result.stdout).results.every((r:any)=>r.error&&!r.passed));
 for(const body of ["export default async function(){throw new Error('private-async-error')}","export default ()=>new Promise((_,reject)=>setTimeout(()=>reject(new Error('private-async-error')),5))", "export default ()=>({then(resolve,reject){reject(new Error('private-async-error'))}})"]){writeFileSync(bad,body);const asyncResult=run(['--adapter',bad]);assert.equal(asyncResult.status,1);assert.equal(asyncResult.stderr,'');assert.doesNotMatch(asyncResult.stdout,/private-async-error/);assert.ok(JSON.parse(asyncResult.stdout).results.every((r:any)=>r.error&&!r.passed));}
 writeFileSync(bad,'export const unrelated=1');assert.equal(run(['--adapter',bad]).status,2);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
