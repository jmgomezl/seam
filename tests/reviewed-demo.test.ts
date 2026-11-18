import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {runReviewedDemo,reviewedDemoHarness} from '../src/reviewed-demo.ts';
const jpy={producerScale:1,consumerScale:1,producerCurrency:'JPY',consumerCurrency:'JPY'};
test('agreeing JPY declarations still expose actual bundled implementation failure',()=>{
 const result=runReviewedDemo(jpy);assert.equal(result.original.length,4);
 assert.equal(result.original.filter(r=>r.passed).length,1);assert.equal(result.corrected.filter(r=>r.passed).length,4);
 const witness=result.original.find(r=>r.amount===1000)!;assert.equal(witness.expected,1000);assert.equal(witness.observed,10);
 assert.equal(result.source.beforeRevision,'8d46e6b0da0425b5cd9db208a100a96f4feff3fa');
 assert.throws(()=>runReviewedDemo({...jpy,producerScale:100}));
});
test('downloaded reviewed regression reproduces same four original/corrected checks',()=>{
 const dir=mkdtempSync(join(tmpdir(),'seam-reviewed-demo-'));
 try{const file=join(dir,'demo.mjs');writeFileSync(file,reviewedDemoHarness(jpy));
 const before=spawnSync(process.execPath,[file],{encoding:'utf8'}),fixed=spawnSync(process.execPath,[file,'--fixed'],{encoding:'utf8'});
 assert.equal(before.status,1);assert.match(before.stdout,/1\/4 numeric contract checks passed/);
 assert.equal(fixed.status,0);assert.match(fixed.stdout,/4\/4 numeric contract checks passed/);
 assert.match(reviewedDemoHarness(jpy),/MIT License/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
