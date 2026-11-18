import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {incidentChecks,incidentPacket,sourceExecution,summarizeChecks} from '../src/incidents.ts';
test('preserved execution bytes agree with upstream evidence',()=>{const original=JSON.parse(readFileSync(new URL('../evidence/source-execution-004.json',import.meta.url),'utf8'));assert.deepEqual(sourceExecution,original);});
test('before and after totals preserve the residual failure',()=>{assert.deepEqual(summarizeChecks(sourceExecution.checks.filter(c=>c.revision==='before')),{total:13,passed:6,failed:7});assert.deepEqual(summarizeChecks(sourceExecution.checks.filter(c=>c.revision==='after')),{total:13,passed:12,failed:1});});
test('JPY roundtrip hides boundary mismatch',()=>{const c=incidentChecks('invoice','before').find(c=>c.id.endsWith('JPY'))!;assert.equal(c.pass,false);assert.equal(c.roundtripPass,true);assert.equal(c.actual,100*c.expected);});
test('both project and revision filters are exact',()=>{assert.equal(incidentChecks('invoice','after').length,3);assert.equal(incidentChecks('link','before').length,10);assert(incidentChecks('link','after').every(c=>c.pass));});
test('export retains both revisions and caveats, not an invented live run',()=>{const p=incidentPacket('invoice');assert.equal(p.checks.length,6);assert.match(p.kind,/not a new run/);assert.equal(p.limitations.length,4);});
