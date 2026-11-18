import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {InferenceSource} from 'firebase/ai';
import {REQUIRED_FIREBASE_FIELDS,missingFirebaseFields,assertRuntimeConfigured} from '../src/runtime-readiness.ts';
const config=Object.fromEntries(REQUIRED_FIREBASE_FIELDS.map(k=>[k,'synthetic-placeholder']));
test('readiness reports only field names and rejects blank configuration',()=>{
 assert.deepEqual(missingFirebaseFields({}),[...REQUIRED_FIREBASE_FIELDS]);
 assert.deepEqual(missingFirebaseFields({...config,VITE_FIREBASE_APP_ID:'  '}),['VITE_FIREBASE_APP_ID']);
 assert.throws(()=>assertRuntimeConfigured({...config,VITE_FIREBASE_APP_ID:''},'local'),e=>e instanceof Error&&e.message.includes('VITE_FIREBASE_APP_ID')&&!e.message.includes('synthetic-placeholder'));
 assert.doesNotThrow(()=>assertRuntimeConfigured(config,'local'));
 assert.throws(()=>assertRuntimeConfigured(config,'cloud'),/authorized cloud model/);
 assert.throws(()=>assertRuntimeConfigured({...config,VITE_FIREBASE_MODEL:' '},'cloud'),/authorized cloud model/);
 assert.doesNotThrow(()=>assertRuntimeConfigured({...config,VITE_FIREBASE_MODEL:'test-model'},'cloud'));
});
test('SDK inference source constants and actual adapter check remain aligned',()=>{
 assert.equal(InferenceSource.ON_DEVICE,'on_device');assert.equal(InferenceSource.IN_CLOUD,'in_cloud');
 const source=readFileSync(new URL('../src/firebase.ts',import.meta.url),'utf8');
 assert.match(source,/route==='local'\?InferenceSource\.ON_DEVICE:InferenceSource\.IN_CLOUD/);
 assert.match(source,/result.response.inferenceSource!==expectedSource/);
 assert.ok(source.indexOf('gate(route,consent,cloudConsent)')<source.indexOf('assertRuntimeConfigured(e,route)'));
 assert.ok(source.indexOf('assertRuntimeConfigured(e,route)')<source.indexOf("await import('firebase/app')"));
});
