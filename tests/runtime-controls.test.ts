import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {cases} from '../src/cases.ts';
class Element{checked=false;disabled=false;textContent='';onclick:(()=>Promise<void>|void)|null=null;listeners=new Map<string,()=>void>();addEventListener(e:string,f:()=>void){this.listeners.set(e,f);}}
class Root{isConnected=true;firstElementChild:object|null={};nodes=new Map(['local','cloud','consent','cloud-consent','ai-output','device','availability'].map(k=>['#'+k,new Element()]));querySelector(id:string){return this.nodes.get(id)!;}}
async function binder(){const bundle=await build({entryPoints:[new URL('../src/runtime-controls.ts',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'test-only-runtime',setup(b){b.onResolve({filter:/\/firebase\.ts$/},()=>({path:'sdk',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const firebaseConfigured=()=>true;export const review=(...args)=>globalThis.__runtimeReviewTest(...args);',loader:'js'}));}}]});return (await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'))).bindRuntimeControls as (root:Root,boundary:typeof cases[number])=>void;}
const tick=()=>Promise.resolve();
test('late Runtime success and failure do not mutate detached, replaced or navigated views',async()=>{
 const bind=await binder();
 for(const mode of ['detached','replaced','new-view'])for(const outcome of ['success','failure']){
  let resolve!:(v:unknown)=>void,reject!:(e:Error)=>void;
  (globalThis as any).__runtimeReviewTest=()=>new Promise((yes,no)=>{resolve=yes;reject=no;});
  const root=new Root();bind(root,cases[0]);const pending=root.querySelector('#local').onclick!();await tick();
  if(mode==='detached')root.isConnected=false;else root.firstElementChild={};
  if(mode==='new-view')bind(root,cases[1]);root.querySelector('#ai-output').textContent='New view content';
  if(outcome==='success')resolve({hypotheses:['stale']});else reject(new Error('stale rejection'));await pending;
  assert.equal(root.querySelector('#ai-output').textContent,'New view content');
 }
 delete (globalThis as any).__runtimeReviewTest;
});
test('local/cloud double clicks and navigation back share one pending Runtime request',async()=>{
 const bind=await binder();let resolve!:(v:unknown)=>void,calls=0;
 (globalThis as any).__runtimeReviewTest=()=>{calls++;return new Promise(yes=>{resolve=yes;});};
 const root=new Root();bind(root,cases[0]);const pending=root.querySelector('#local').onclick!();await tick();
 await root.querySelector('#cloud').onclick!();assert.equal(calls,1);assert.equal(root.querySelector('#cloud').disabled,true);
 root.firstElementChild={};bind(root,cases[1]);await root.querySelector('#local').onclick!();assert.equal(calls,1);
 resolve({hypotheses:[]});await pending;assert.equal(root.querySelector('#local').disabled,false);
 const next=root.querySelector('#cloud').onclick!();await tick();assert.equal(calls,2);resolve({hypotheses:['current']});await next;assert.match(root.querySelector('#ai-output').textContent,/current/);
 delete (globalThis as any).__runtimeReviewTest;
});
test('consent edits invalidate results and cloud approval is single-use with source snapshot',async()=>{
 const bind=await binder();let resolve!:(v:unknown)=>void,args:any[]=[];
 (globalThis as any).__runtimeReviewTest=(...a:any[])=>{args=a;return new Promise(yes=>{resolve=yes;});};
 const root=new Root(),boundary=structuredClone(cases[0]);bind(root,boundary);root.querySelector('#consent').checked=true;root.querySelector('#cloud-consent').checked=true;
 const pending=root.querySelector('#cloud').onclick!();await tick();assert.equal(root.querySelector('#cloud-consent').checked,false);assert.deepEqual(args.slice(1),['cloud',true,true]);
 boundary.id='mutated';assert.notEqual(args[0].id,'mutated');
 root.querySelector('#consent').checked=false;root.querySelector('#consent').listeners.get('input')!();resolve({hypotheses:['discarded']});await pending;
 assert.match(root.querySelector('#ai-output').textContent,/cannot be recalled/);assert.ok(!root.querySelector('#ai-output').textContent.includes('hypotheses'));
 delete (globalThis as any).__runtimeReviewTest;
});
test('availability late rejection or success cannot overwrite replacement view and duplicate checks are blocked',async()=>{
 const bind=await binder();
 for(const fail of [false,true]){
  let resolve!:(v:string)=>void,reject!:(e:Error)=>void,calls=0;
  (globalThis as any).LanguageModel={availability:()=>{calls++;return new Promise((yes,no)=>{resolve=yes;reject=no;});}};
  const root=new Root();bind(root,cases[0]);const pending=root.querySelector('#availability').onclick!();await root.querySelector('#availability').onclick!();assert.equal(calls,1);
  root.firstElementChild={};root.querySelector('#device').textContent='New device view';
  if(fail)reject(new Error('failure'));else resolve('available');await pending;assert.equal(root.querySelector('#device').textContent,'New device view');
 }
 delete (globalThis as any).LanguageModel;
});
