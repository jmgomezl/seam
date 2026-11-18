import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Schema} from 'firebase/ai';
import {proposalResponseSchema,localProposalResponseSchema} from '../src/proposal-schema.ts';
import {parseProposal} from '../src/proposal.ts';
const env={VITE_FIREBASE_API_KEY:'synthetic',VITE_FIREBASE_PROJECT_ID:'synthetic',VITE_FIREBASE_APP_ID:'synthetic',VITE_RECAPTCHA_SITE_KEY:'synthetic',VITE_FIREBASE_MODEL:'explicit-test-model'};
let serial=0;
async function adapter(config:Record<string,string>=env){
 const state={imports:[] as string[],configs:[] as any[],prompts:[] as string[],initialized:0,fail:false,source:'on_device',Schema};
 (globalThis as any).__seamStructuredTest=state;
 const bundle=await build({entryPoints:[new URL('../src/firebase.ts',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'node',define:{'import.meta.env':JSON.stringify(config)},plugins:[{name:'test-only-firebase',setup(b){
  b.onResolve({filter:/^firebase\//},args=>({path:args.path,namespace:'test-sdk'}));
  b.onLoad({filter:/.*/,namespace:'test-sdk'},args=>({contents:`const s=globalThis.__seamStructuredTest; s.imports.push(${JSON.stringify(args.path)});\n`+({
   'firebase/app':'export const initializeApp=()=>({});',
   'firebase/app-check':'export class ReCaptchaEnterpriseProvider{}; export const initializeAppCheck=()=>{};',
   'firebase/ai':`export const Schema=s.Schema; export const InferenceMode={ONLY_ON_DEVICE:'local-only',ONLY_IN_CLOUD:'cloud-only'}; export const InferenceSource={ON_DEVICE:'on_device',IN_CLOUD:'in_cloud'}; export class GoogleAIBackend{}; export const getAI=()=>({}); export function getGenerativeModel(ai,config){s.configs.push(config);return {initializeDeviceModel:async()=>{s.initialized++;},generateContent:async(prompt)=>{s.prompts.push(prompt);if(s.fail)throw new Error('SDK failure');return {response:{inferenceSource:s.source,text:()=>'{"status":"abstain","reason":"test-only"}'}};}};}`
  }[args.path]??''),loader:'js'}));
 }}]});
 const module=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text+`\n// instance ${serial++}`).toString('base64'));
 return {state,infer:module.inferText};
}
test('actual adapter gives only selected strict route its proposal schema',async()=>{
 const {state,infer}=await adapter();
 await infer('synthetic public text','local',true,false,'proposal');
 const local=state.configs[0];assert.equal(local.mode,'local-only');assert.equal(local.inCloudParams,undefined);assert.deepEqual(local.onDeviceParams.promptOptions.responseConstraint,localProposalResponseSchema(Schema));assert.equal(state.initialized,1);
 state.source='in_cloud';await infer('synthetic public text','cloud',true,true,'proposal');
 const cloud=state.configs[1];assert.equal(cloud.mode,'cloud-only');assert.equal(cloud.onDeviceParams,undefined);assert.equal(cloud.inCloudParams.model,'explicit-test-model');assert.equal(cloud.inCloudParams.generationConfig.responseMimeType,'application/json');
 assert.ok(cloud.inCloudParams.generationConfig.responseSchema instanceof Schema);
 assert.deepEqual(local.onDeviceParams.promptOptions.responseConstraint.properties.producer.type,['object','null']);
 assert.equal(cloud.inCloudParams.generationConfig.responseSchema.properties.producer.nullable,true);
 assert.equal(state.initialized,1);assert.equal(state.prompts.length,2);
 // Legacy boundary-review format remains unchanged.
 await infer('legacy prompt','cloud',true,true);assert.equal(state.configs[2].inCloudParams.generationConfig,undefined);
 delete (globalThis as any).__seamStructuredTest;
});
test('denied consent and missing config prevent any SDK imports, request or schema setup',async()=>{
 const {state,infer}=await adapter();
 await assert.rejects(infer('private','local',false,false,'proposal'));
 await assert.rejects(infer('private','cloud',true,false,'proposal'));
 await assert.rejects(infer('private','automatic',true,true,'proposal'));
 assert.deepEqual(state.imports,[]);assert.deepEqual(state.prompts,[]);
 const missing=await adapter({});await assert.rejects(missing.infer('public','local',true,false,'proposal'));assert.deepEqual(missing.state.imports,[]);
 delete (globalThis as any).__seamStructuredTest;
});
test('schema/runtime failure does not retry without constraints or fall back to cloud',async()=>{
 const {state,infer}=await adapter();state.fail=true;
 await assert.rejects(infer('public','local',true,false,'proposal'),/SDK failure/);
 assert.equal(state.prompts.length,1);assert.equal(state.configs.length,1);assert.equal(state.configs[0].inCloudParams,undefined);
 state.fail=false;state.source='in_cloud';await assert.rejects(infer('public','local',true,false,'proposal'),/Unexpected inference route/);
 assert.equal(state.prompts.length,2);delete (globalThis as any).__seamStructuredTest;
});
test('schema construction failure sends no prompt and never retries unconstrained',async()=>{
 const {state,infer}=await adapter();
 state.Schema={object(){throw new Error('Unsupported schema');},enumString(){return {};},integer(){return {};},string(){return {};}} as any;
 await assert.rejects(infer('public','local',true,false,'proposal'),/Unsupported schema/);
 assert.equal(state.prompts.length,0);assert.equal(state.configs.length,0);
 delete (globalThis as any).__seamStructuredTest;
});
test('SDK schema permits abstention and does not replace quote or scale validation',()=>{
 const schema=JSON.parse(JSON.stringify(proposalResponseSchema(Schema)));
 assert.deepEqual(schema.properties.status.enum,['candidate','abstain']);
 assert.equal(schema.properties.producer.nullable,true);assert.equal(schema.properties.consumer.nullable,true);
 assert.deepEqual(new Set(schema.required),new Set(['status','producer','consumer','reason']));
 const input={producer:'Synthetic USD cents use 100 units per dollar.',consumer:'Synthetic USD dollars use 1 unit per dollar.'};
 const invalid={status:'candidate',producer:{unitsPerMajor:2,currency:'USD',quote:input.producer},consumer:{unitsPerMajor:1,currency:'USD',quote:input.consumer},reason:'Schema-shaped is not supported semantics.'};
 assert.throws(()=>parseProposal(JSON.stringify(invalid),input));
 invalid.producer.unitsPerMajor=100;invalid.producer.quote='Invented supporting quotation';assert.throws(()=>parseProposal(JSON.stringify(invalid),input));
});
test('local schema translates both nullable sides without changing cloud schema',()=>{
 const local:any=localProposalResponseSchema(Schema),cloud=JSON.parse(JSON.stringify(proposalResponseSchema(Schema)));
 for(const side of ['producer','consumer']){
  assert.deepEqual(local.properties[side].type,['object','null']);
  assert.deepEqual(local.properties[side].required,cloud.properties[side].required);
  assert.equal(local.properties[side].properties.quote.type,'string');
  assert.equal(cloud.properties[side].nullable,true);
 }
 assert.ok(!JSON.stringify(local).includes('nullable'));
 assert.deepEqual(local.required,cloud.required);assert.deepEqual(local.properties.status.enum,cloud.properties.status.enum);
});
