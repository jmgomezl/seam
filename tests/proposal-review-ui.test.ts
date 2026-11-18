import test from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';
// Test-only minimal DOM. Exercises bindings; not a browser accessibility/layout audit.
class Node {
 value='';checked=false;disabled=false;textContent='';html='';onclick:(()=>Promise<void>|void)|null=null;listeners=new Map<string,()=>void>();
 owner:Root;constructor(owner:Root){this.owner=owner;}
 set innerHTML(value:string){this.html=value;this.owner.addNodes(value);}get innerHTML(){return this.html;}
 addEventListener(event:string,fn:()=>void){this.listeners.set(event,fn);}focus(){}replaceChildren(){this.html='';this.textContent='';}
}
class Root {
 isConnected=true;firstElementChild:object|null=null;nodes=new Map<string,Node>();html='';
 addNodes(html:string){for(const match of html.matchAll(/id="([^"]+)"/g))this.nodes.set('#'+match[1],new Node(this));}
 set innerHTML(value:string){this.html=value;this.firstElementChild={};this.nodes.clear();this.addNodes(value);}get innerHTML(){return this.html;}
 querySelector(id:string){return this.nodes.get(id)??null;}
}
test('candidate review has no preselected answer; mismatch, edits and reject cannot leave a usable witness',async()=>{
 const bundle=await build({entryPoints:[new URL('../src/proposal-ui.ts',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'test-sdk-only',setup(b){b.onResolve({filter:/\/firebase\.ts$/},()=>({path:'sdk',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:`export const firebaseConfigured=()=>true; export const inferText=async prompt=>{const input=JSON.parse(prompt.slice(prompt.lastIndexOf('\\n')+1));return {source:'on_device',text:JSON.stringify({status:'candidate',producer:{unitsPerMajor:100,currency:'USD',quote:input.producer},consumer:{unitsPerMajor:1,currency:'USD',quote:input.consumer},reason:'TEST ONLY'})}};`,loader:'js'}));}}]});
 const {proposalView}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
 const root=new Root();proposalView(root);const node=(id:string)=>root.querySelector('#'+id)!;
 node('proposal-producer').value='Synthetic USD display uses cents, 100 units per dollar.';node('proposal-consumer').value='Synthetic USD display uses dollars, 1 unit per dollar.';node('proposal-route').value='local';node('proposal-public').checked=true;node('proposal-consent').checked=true;
 await node('proposal-run').onclick!();assert.match(node('proposal-result').innerHTML,/Check meaning/);assert.doesNotMatch(node('proposal-result').innerHTML,/ selected| checked|value="USD"/);
 await node('proposal-witness').onclick!();assert.match(node('proposal-status').textContent,/same display field/);
 node('proposal-scope').checked=true;node('proposal-producer-scale').value='1';node('proposal-producer-currency').value='USD';node('proposal-consumer-scale').value='1';node('proposal-consumer-currency').value='USD';
 await node('proposal-witness').onclick!();assert.match(node('proposal-status').textContent,/differs/);assert.equal(node('proposal-witnesses').innerHTML,'');
 node('proposal-producer-scale').value='100';await node('proposal-witness').onclick!();assert.match(node('proposal-witnesses').innerHTML,/not production execution/);
 node('proposal-consumer-currency').value='EUR';node('proposal-consumer-currency').listeners.get('input')!();assert.equal(node('proposal-witnesses').innerHTML,'');
 await node('proposal-reject').onclick!();assert.equal(node('proposal-result').innerHTML,'');assert.match(node('proposal-status').textContent,/Candidate rejected/);
});
