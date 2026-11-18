import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gate,type Route} from '../src/privacy.ts';

test('unknown runtime routes fail closed even with consent',()=>{
 for(const route of ['automatic','LOCAL','',undefined,null]){
  assert.throws(()=>gate(route as Route,true,true),/Unsupported inference route/);
  assert.throws(()=>gate(route as Route,true,false),/Unsupported inference route/);
 }
});
test('local unavailable does not authorize cloud routing',()=>{
 gate('local',true,false);
 assert.throws(()=>gate('cloud',true,false),/Explicit consent/);
});
test('adapter wiring retains strict modes before sending a prompt',()=>{
 const source=readFileSync(new URL('../src/firebase.ts',import.meta.url),'utf8');
 assert.match(source,/mode:route==='local'\?InferenceMode\.ONLY_ON_DEVICE:InferenceMode\.ONLY_IN_CLOUD/);
 assert.doesNotMatch(source,/InferenceMode\.PREFER_/);
 assert.ok(source.indexOf('gate(route,consent,cloudConsent)')<source.indexOf("await import('firebase/app')"));
 assert.match(source,/if\(route==='local'\)await model\.initializeDeviceModel\(\);/);
 assert.equal((source.match(/model\.generateContent\(/g)||[]).length,1);
});
