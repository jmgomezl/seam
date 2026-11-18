import test from 'node:test';
import assert from 'node:assert/strict';
import {firstRunStep} from '../src/first-run.ts';
import {compareFulfillment} from '../src/replay-ui.ts';
test('guided story never assumes a pass before execution',()=>{assert.equal(firstRunStep('sequential-redelivery',undefined,undefined).number,1);assert.equal(firstRunStep('sequential-redelivery',undefined,undefined).next,null);});
test('guided story derives transition from actual sequential results, then saves concurrent evidence',async()=>{const run=await compareFulfillment();const get=(id:string)=>[run.original.find(r=>r.id===id),run.reference.find(r=>r.id===id)] as const;assert.equal(firstRunStep('sequential-redelivery',...get('sequential-redelivery')).next,'concurrent-same-session');assert.equal(firstRunStep('concurrent-same-session',...get('concurrent-same-session')).number,3);const error={id:'sequential-redelivery',expected:[],actual:[],passed:false,error:'failed'};assert.equal(firstRunStep('sequential-redelivery',error,error).next,null);assert.equal(firstRunStep('sequential-redelivery',error,error).number,1);});
