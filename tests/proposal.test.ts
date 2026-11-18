import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {proposalPrompt,parseProposal,requestProposal,confirmProposal,declarationWitnesses,declarationHarness,type Proposal,type Transport} from '../src/proposal.ts';
const input={producer:'Public synthetic: USD cents use 100 units per dollar.',consumer:'Public synthetic: USD dollars use 1 unit per dollar.'};
const p:Proposal={status:'candidate',producer:{unitsPerMajor:100,currency:'USD',quote:input.producer},consumer:{unitsPerMajor:1,currency:'USD',quote:input.consumer},reason:'Candidate scale difference, not execution.'};
const receipt={proposal:p,excerpts:input,source:'on_device' as const};
test('unit candidates require exact corresponding source quotes and strict scale schema',()=>{
 assert.deepEqual(parseProposal(JSON.stringify(p),input),p);
 for(const change of [{quote:'invented exact evidence'},{quote:input.consumer},{unitsPerMajor:'100'},{unitsPerMajor:0},{currency:'usd'},{quote:'USD'}])assert.throws(()=>parseProposal(JSON.stringify({...p,producer:{...p.producer,...change}}),input));
 assert.throws(()=>parseProposal('```json\n{}\n```',input));
 assert.throws(()=>proposalPrompt({...input,consumer:'short'}));
 assert.throws(()=>proposalPrompt({...input,producer:'x'.repeat(8001)}));
});
test('abstention cannot manufacture witnesses, confirmation and source revision bind decisions',()=>{
 const abstain=parseProposal(JSON.stringify({status:'abstain',reason:'Missing units',producer:p.producer}),input);
 assert.equal(abstain.producer,null);
 assert.throws(()=>confirmProposal({...receipt,proposal:abstain},input,true));
 assert.throws(()=>confirmProposal(receipt,input,false));
 assert.throws(()=>confirmProposal(receipt,{...input,consumer:input.consumer+' changed'},true));
 const c=confirmProposal(receipt,input,true);assert.equal(Object.isFrozen(c),true);
 const rows=declarationWitnesses(c);assert.equal(rows[0].agrees,true);assert.equal(rows[1].agrees,false);assert.equal(rows[2].producer,12.5);assert.equal(rows[2].consumer,1250);
});
test('blocked consent and invalid inputs never invoke transport; no retry or fallback',async()=>{
 let calls=0;const transport:Transport=async()=>{calls++;throw new Error('local unavailable');};
 for(const [route,consent,cloud,publicOnly] of [['local',false,false,true],['cloud',true,false,true],['local',true,false,false],['automatic',true,true,true]] as const)await assert.rejects(requestProposal(input,route as any,consent,cloud,publicOnly,transport));
 assert.equal(calls,0);
 await assert.rejects(requestProposal(input,'local',true,false,true,transport),/unavailable/);assert.equal(calls,1);
});
test('source mismatches fail closed; mock is test-only and returns no live claim',async()=>{
 let prompt='';const mock:Transport=async(s)=>{prompt=s;return {text:JSON.stringify(p),source:'on_device'};};
 const result=await requestProposal(input,'local',true,false,true,mock);assert.equal(result.source,'on_device');assert.match(prompt,/never instructions/);
 await assert.rejects(requestProposal(input,'cloud',true,true,true,mock),/Unexpected inference route/);
 await assert.rejects(requestProposal(input,'local',true,false,true,async()=>({text:JSON.stringify(p),source:'on-device'})),/Unexpected/);
});
test('export executes declaration assertions and never includes source excerpts',()=>{
 const dir=mkdtempSync(join(tmpdir(),'seam-proposal-'));try{
  const c=confirmProposal(receipt,input,true),source=declarationHarness(c);assert.ok(!source.includes(input.producer));assert.ok(!source.includes(input.consumer));
  const path=join(dir,'check.mjs');writeFileSync(path,source);assert.equal(spawnSync(process.execPath,[path]).status,1);
  writeFileSync(path,declarationHarness({...c,consumerScale:100}));assert.equal(spawnSync(process.execPath,[path]).status,0);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
