import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
// A tiny test-only DOM surface and SDK stub exercise asynchronous view lifetimes.
class Element {
 value='';checked=false;disabled=false;textContent='';onclick:(()=>Promise<void>|void)|null=null;listeners=new Map<string,()=>void>();
 addEventListener(event:string,fn:()=>void){this.listeners.set(event,fn);}focus(){}replaceChildren(){this.textContent='';}innerHTML='';
}
class Root {
 isConnected=true;firstElementChild:object|null=null;nodes=new Map<string,Element>();html='';
 set innerHTML(value:string){this.html=value;this.firstElementChild={};this.nodes.clear();for(const match of value.matchAll(/id="([^"]+)"/g))this.nodes.set('#'+match[1],new Element());}
 get innerHTML(){return this.html;}
 querySelector(id:string){return this.nodes.get(id)??null;}
}
async function viewFactory(){const bundled=await build({entryPoints:[new URL('../src/proposal-ui.ts',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'test-only-sdk',setup(b){b.onResolve({filter:/\/firebase\.ts$/},()=>({path:'sdk',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const firebaseConfigured=()=>true; export const inferText=(...args)=>globalThis.__seamTestTransport(...args);',loader:'js'}));}}]});return (await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'))).proposalView as (root:Root)=>void;}
function prepare(root:Root){root.querySelector('#proposal-producer')!.value='Public synthetic USD cents: 100 units per dollar.';root.querySelector('#proposal-consumer')!.value='Public synthetic USD dollars: 1 unit per dollar.';root.querySelector('#proposal-route')!.value='local';root.querySelector('#proposal-public')!.checked=true;root.querySelector('#proposal-consent')!.checked=true;}
test('pending SDK rejection cannot touch a detached, cleared or replaced proposal view',async()=>{
 const view=await viewFactory();
 for(const mode of ['detached','cleared','replaced']){
  let reject!:(reason:Error)=>void;(globalThis as any).__seamTestTransport=()=>new Promise((_,r)=>{reject=r;});
  const root=new Root();view(root);prepare(root);const pending=root.querySelector('#proposal-run')!.onclick!();
  if(mode==='detached')root.isConnected=false;else if(mode==='cleared')root.innerHTML='<main>Other view</main>';else{view(root);root.querySelector('#proposal-status')!.textContent='New view';root.querySelector('#proposal-run')!.disabled=true;}
  reject(new Error('SDK rejected'));await pending;
  if(mode==='replaced'){assert.equal(root.querySelector('#proposal-status')!.textContent,'New view');assert.equal(root.querySelector('#proposal-run')!.disabled,true);}
 }
 delete (globalThis as any).__seamTestTransport;
});
test('consent edits discard pending results without pretending to cancel requests',async()=>{
 const view=await viewFactory();let resolve!:(v:unknown)=>void;let calls=0;(globalThis as any).__seamTestTransport=()=>{calls++;return new Promise(r=>{resolve=r;});};
 const root=new Root();view(root);prepare(root);assert.ok(!root.innerHTML.includes('No model has run yet'));const pending=root.querySelector('#proposal-run')!.onclick!();
 const cloud=root.querySelector('#proposal-cloud')!;cloud.checked=true;cloud.listeners.get('input')!();assert.equal(cloud.checked,true);assert.match(root.querySelector('#proposal-status')!.textContent,/cannot be recalled/);
 resolve({text:JSON.stringify({status:'abstain',reason:'Insufficient units'}),source:'on_device'});await pending;
 assert.equal(calls,1);assert.equal(root.querySelector('#proposal-result')!.innerHTML,'');assert.match(root.querySelector('#proposal-status')!.textContent,/discarded/);assert.equal(root.querySelector('#proposal-run')!.disabled,false);
 delete (globalThis as any).__seamTestTransport;
});
