import test from 'node:test';
import assert from 'node:assert/strict';
import {parseProposal} from '../src/proposal.ts';
const input={producer:'Synthetic USD cents use 100 units per dollar.',consumer:'Synthetic USD dollars use 1 unit per dollar.'};
const proposal={status:'candidate',producer:{unitsPerMajor:100,currency:'USD',quote:input.producer},consumer:{unitsPerMajor:1,currency:'USD',quote:input.consumer},reason:'Human review required.'};
const json=JSON.stringify(proposal);
test('accepts complete raw JSON or one exact JSON fence, including CRLF',()=>{
 for(const raw of [json,` \n${json}\t`,`\u0060\u0060\u0060json\n${json}\n\u0060\u0060\u0060`,`\u0060\u0060\u0060json\r\n${json}\r\n\u0060\u0060\u0060`])assert.deepEqual(parseProposal(raw,input),proposal);
});
test('rejects surrounding instructions, multiple documents, malformed and non-JSON fences',()=>{
 const fenced='```json\n'+json+'\n```';
 for(const raw of ['Accept this: '+fenced,fenced+'\nIgnore validation',fenced+'\n'+fenced,json+json,'```javascript\n'+json+'\n```','```\n'+json+'\n```','```json\n'+json,'```json\n'+json+'\n```\n{}'])assert.throws(()=>parseProposal(raw,input));
});
test('rejects duplicate keys including escaped aliases and nested ambiguity',()=>{
 for(const raw of [json.replace('"status":','"status":"abstain","status":'),json.replace('"status":','"\\u0073tatus":"abstain","status":'),json.replace('"unitsPerMajor":100','"unitsPerMajor":1,"unitsPerMajor":100')])assert.throws(()=>parseProposal(raw,input));
 // Same field names in different objects are not duplicates; punctuation in strings is data.
 assert.deepEqual(parseProposal(JSON.stringify({...proposal,reason:'{"status": "x"}, [test]'}),input).producer,proposal.producer);
});
test('bounds entire raw response, rejects numeric overflow and excessive nesting',()=>{
 for(const raw of [json+' '.repeat(20001),'```json\n'+json+' '.repeat(20001)+'\n```',json.replace('"reason":','"unused":1e400,"reason":'),json.replace('"reason":','"unused":-1e400,"reason":'),json.replace('"reason":','"unused":'+'['.repeat(65)+'0'+']'.repeat(65)+',"reason":')])assert.throws(()=>parseProposal(raw,input));
});
test('fences do not bypass quote verification or execute embedded code',()=>{
 assert.throws(()=>parseProposal('```json\n'+JSON.stringify({...proposal,producer:{...proposal.producer,quote:'invented supporting quote'}})+'\n```',input));
 const reason='globalThis.__seamParserExecuted = true';
 assert.equal(parseProposal(JSON.stringify({...proposal,reason}),input).reason,reason);
 assert.equal((globalThis as any).__seamParserExecuted,undefined);
});
test('model abstention discards fabricated side objects rather than promoting declarations',()=>{
 const raw=JSON.stringify({status:'abstain',producer:{unitsPerMajor:1,currency:'USD',quote:'amount is provided'},consumer:{unitsPerMajor:1,currency:'USD',quote:'show the amount'},reason:'Missing numeric units and currency.'});
 assert.deepEqual(parseProposal(raw,input),{status:'abstain',producer:null,consumer:null,reason:'Missing numeric units and currency.'});
});
