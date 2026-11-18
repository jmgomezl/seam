import test from 'node:test';
import assert from 'node:assert/strict';
import {companionState} from '../src/companion.ts';
import {createReviewBrief} from '../src/review-brief.ts';
test('companion starts without claiming execution or AI inference',()=>{const s=companionState(null,false);assert.equal(s.step,'compare');assert.match(s.message,/bundled adapters/);assert.equal(companionState(null,true).step,'compare');});
test('confirmation uses actual comparison counts and precedes saving',()=>{for(const scenario of ['money','patch'] as const){const b=createReviewBrief(scenario),s=companionState(b,false);assert.equal(s.step,'confirm');assert.match(s.title,new RegExp(String(b.total-b.originalPassed)));assert.equal(companionState(b,true).step,'save');assert.match(companionState(b,true).message,/not deployment approval/);}});
