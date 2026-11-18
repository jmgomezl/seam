import {replayEvidence} from '../src/replay-ui.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fulfillmentCases,runFulfillmentReplay,singleProcessHandler,type HandlerFactory} from '../src/fulfillment-replay.ts';
test('fixtures distinguish same-event delivery from different triggers for the same session',()=>{
 const cases=fulfillmentCases();
 const retry=cases.find(c=>c.id==='sequential-redelivery')!;
 assert.equal(retry.batches[0][0].eventId,retry.batches[1][0].eventId);
 const concurrent=cases.find(c=>c.id==='concurrent-same-session')!.batches[0];
 assert.equal(concurrent[0].sessionId,concurrent[1].sessionId);assert.equal(concurrent[0].trigger,'webhook');assert.equal(concurrent[1].trigger,'redirect');assert.equal(concurrent[1].eventId,undefined);
 const later=cases.find(c=>c.id==='replay-after-burst')!;
 assert.equal(later.batches[0][0].sessionId,later.batches[1][0].sessionId);assert.notEqual(later.batches[0][0].eventId,later.batches[1][0].eventId);
});
test('event-ID-only dedup passes duplicate delivery but fails distinct triggers and later event IDs',async()=>{
 // Authored negative control: correct event dedup is not session fulfillment dedup.
 const eventOnly:HandlerFactory=({recordFulfillment,checkpoint})=>{
  const seen=new Set<string>();return async r=>{
   if(r.paymentStatus==='unpaid')return;
   if(r.eventId){if(seen.has(r.eventId))return;seen.add(r.eventId);}
   await checkpoint();recordFulfillment(r.sessionId);
  };
 };
 const rows=await runFulfillmentReplay(eventOnly);
 assert.equal(rows.find(r=>r.id==='sequential-redelivery')!.passed,true);
 assert.equal(rows.find(r=>r.id==='concurrent-same-session')!.passed,false);
 assert.equal(rows.find(r=>r.id==='replay-after-burst')!.passed,false);
 assert.ok((await runFulfillmentReplay(singleProcessHandler)).every(r=>r.passed));
});
test('delayed payment snapshot can become paid without an unpaid attempt consuming fulfillment',async()=>{
 const fixture=fulfillmentCases().find(c=>c.id==='unpaid-then-paid')!;
 assert.equal(fixture.batches[0][0].eventType,'checkout.session.completed');assert.equal(fixture.batches[0][0].paymentStatus,'unpaid');
 assert.equal(fixture.batches[1][0].eventType,'checkout.session.async_payment_succeeded');assert.equal(fixture.batches[1][0].paymentStatus,'paid');
 const premature:HandlerFactory=({recordFulfillment})=>{const seen=new Set<string>();return async r=>{if(seen.has(r.sessionId))return;seen.add(r.sessionId);if(r.paymentStatus!=='unpaid')recordFulfillment(r.sessionId);};};
 const rows=await runFulfillmentReplay(premature);assert.equal(rows.find(r=>r.id==='unpaid-does-not-fulfill')!.passed,true);assert.equal(rows.find(r=>r.id==='unpaid-then-paid')!.passed,false);
});

test('browser evidence carries authored schedule metadata rather than implying actual webhook traffic',async()=>{
 const original=await runFulfillmentReplay(singleProcessHandler),e=replayEvidence({original,reference:original});
 assert.deepEqual(e.authoredSchedules,fulfillmentCases());
 assert.match(e.limits.join(' '),/Not live Stripe/);
 assert.equal(e.authoredSchedules.find(c=>c.id==='concurrent-same-session')!.batches[0][1].trigger,'redirect');
});
