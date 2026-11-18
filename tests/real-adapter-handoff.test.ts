import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {harnessSource} from '../src/lab.ts';
import {patchHarnessSource} from '../src/patch-lab.ts';

// Newly authored two-file developer examples, not imported from demo corrections.
// This is an integration challenge, not an external/customer holdout dataset.
const moneyService=`export function renderMinor(amount,currency){
 const units={USD:100,EUR:100,JPY:1,KRW:1,KWD:1000}[currency];
 if(!units)throw new Error('Unsupported contract');
 const places=Math.log10(units);
 return (amount<0?'-':'')+'$'+(Math.abs(amount)/units).toFixed(places)+' '+currency;
}`;
const patchService=`export function encodeUpdate(changes){return JSON.stringify({...changes});}`;
function workspace(run:(dir:string)=>void){const dir=mkdtempSync(join(tmpdir(),'seam developer challenge '));try{run(dir);}finally{rmSync(dir,{recursive:true,force:true});}}
function command(dir:string,filename:string,args:string[]){return spawnSync(process.execPath,[join(dir,filename),...args],{cwd:dir,encoding:'utf8',timeout:10000});}
test('actual downloaded harness runs a two-file money adapter outside the checkout and catches a scale regression',()=>workspace(dir=>{
 writeFileSync(join(dir,'money.test.mjs'),harnessSource());writeFileSync(join(dir,'service.mjs'),moneyService);
 writeFileSync(join(dir,'adapter.mjs'),`import {renderMinor} from './service.mjs'; export function formatAmount(amount,currency){return renderMinor(amount,currency);}`);
 const good=command(dir,'money.test.mjs',['--adapter','./adapter.mjs']);assert.equal(good.status,0,good.stderr);assert.match(good.stdout,/20\/20/);
 writeFileSync(join(dir,'service.mjs'),moneyService.replace('const units={USD:100,EUR:100,JPY:1,KRW:1,KWD:1000}[currency];','const units=100;'));
 const bad=command(dir,'money.test.mjs',['--adapter','./adapter.mjs']);assert.equal(bad.status,1,bad.stderr);assert.match(bad.stdout,/FAIL .*JPY/);
}));
test('actual downloaded patch harness imports a developer wrapper and detects omission changed to null',()=>workspace(dir=>{
 writeFileSync(join(dir,'patch.test.mjs'),patchHarnessSource());writeFileSync(join(dir,'service.mjs'),patchService);
 writeFileSync(join(dir,'adapter.mjs'),`import {encodeUpdate} from './service.mjs'; export default function(patch){return encodeUpdate(patch);}`);
 const good=command(dir,'patch.test.mjs',['--adapter','./adapter.mjs']);assert.equal(good.status,0,good.stderr);assert.match(good.stdout,/8\/8/);
 writeFileSync(join(dir,'service.mjs'),`export function encodeUpdate(changes){return JSON.stringify({deliveryNote:changes.deliveryNote??null});}`);
 const bad=command(dir,'patch.test.mjs',['--adapter','./adapter.mjs']);assert.equal(bad.status,1,bad.stderr);assert.match(bad.stdout,/FAIL omit-set/);
}));
test('CLI must not quietly pass bundled correction when adapter arguments are misspelled or mixed',()=>workspace(dir=>{
 for(const [name,source] of [['money.test.mjs',harnessSource()],['patch.test.mjs',patchHarnessSource()]]){
  writeFileSync(join(dir,name),source);
  for(const args of [['--fixed','--adpater','./bad.mjs'],['--fixed','--adapter','./bad.mjs'],['--adapter'],['--unknown'],['--fixed','extra']]){
   const result=command(dir,name,args);assert.equal(result.status,2,`${name} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);assert.match(result.stderr,/Usage:/);assert.doesNotMatch(result.stdout,/checks passed/);
  }
 }
}));
test('external load/export and async-return errors never produce a passing suite',()=>workspace(dir=>{
 for(const [name,source,exportName] of [['money.test.mjs',harnessSource(),'formatAmount'],['patch.test.mjs',patchHarnessSource(),'serializePatch']]){
  writeFileSync(join(dir,name),source);
  assert.notEqual(command(dir,name,['--adapter','./missing.mjs']).status,0);
  writeFileSync(join(dir,'wrong.mjs'),'export const unrelated=1;');assert.notEqual(command(dir,name,['--adapter','./wrong.mjs']).status,0);
  writeFileSync(join(dir,'async.mjs'),`export async function ${exportName}(){return '{}';}`);
  const result=command(dir,name,['--adapter','./async.mjs']);assert.equal(result.status,1);assert.match(result.stdout,/FAIL/);
 }
}));
