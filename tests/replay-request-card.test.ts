import test from 'node:test';
import assert from 'node:assert/strict';
import {replayRequestCard} from '../src/replay-ui.ts';
import {fulfillmentCases,type FulfillmentRequest} from '../src/fulfillment-replay.ts';
import {firstRunStep} from '../src/first-run.ts';
test('same-session cards visibly distinguish webhook and redirect without claiming live events',()=>{
 const batch=fulfillmentCases().find(c=>c.id==='concurrent-same-session')!.batches[0];
 const [webhook,redirect]=batch.map(replayRequestCard);
 assert.match(webhook,/>Webhook</);assert.match(webhook,/Event: evt_demo/);assert.match(webhook,/Checkout completed/);
 assert.match(redirect,/>Redirect</);assert.match(redirect,/No event ID/);assert.ok(!redirect.includes('Checkout completed'));
 assert.ok(webhook.includes(batch[0].sessionId)&&redirect.includes(batch[0].sessionId));
});
test('retry and delayed success cards expose actual fixture identity',()=>{
 const retry=fulfillmentCases().find(c=>c.id==='sequential-redelivery')!;
 assert.equal(replayRequestCard(retry.batches[0][0]),replayRequestCard(retry.batches[1][0]));
 const delayed=fulfillmentCases().find(c=>c.id==='unpaid-then-paid')!;
 assert.match(replayRequestCard(delayed.batches[0][0]),/>unpaid</);
 assert.match(replayRequestCard(delayed.batches[1][0]),/Async payment succeeded/);
 const success={id:'sequential-redelivery',expected:['x'],actual:['x'],passed:true};
 assert.equal(firstRunStep('sequential-redelivery',success,success).label,'Compare webhook + redirect');
});
test('card labels escape data and absent metadata remains explicitly synthetic',()=>{
 const request={sessionId:'<img src=x onerror=alert(1)>',paymentStatus:'paid',eventId:'<script>alert(1)</script>'} as FulfillmentRequest;
 const html=replayRequestCard(request);assert.ok(!html.includes('<img'));assert.ok(!html.includes('<script>'));assert.match(html,/&lt;script&gt;/);assert.match(html,/Synthetic call/);
 assert.match(replayRequestCard({sessionId:'demo',paymentStatus:'unpaid'}),/No event metadata/);
});
