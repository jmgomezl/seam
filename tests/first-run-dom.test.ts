import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {replayView} from '../src/replay-ui.ts';
// Minimal deterministic DOM double: exercises replayView's real event bindings/redraw.
class NodeDouble {
 dataset:Record<string,string>={}; open=false; onclick:(()=>void)|null=null;
 listeners:Record<string,()=>unknown>={}; focused=false; pressed=false;
 addEventListener(name:string,fn:()=>unknown){this.listeners[name]=fn;}
 focus(){this.focused=true;}
 setAttribute(){}
}
class HostDouble {
 html=''; nodes=new Map<string,NodeDouble>(); nav:NodeDouble[]=[]; cases:NodeDouble[]=[];
 set innerHTML(html:string){
  this.html=html;this.nodes.clear();this.nav=[];this.cases=[];
  for(const m of html.matchAll(/<button\b([^>]*)>/g)){
   const node=new NodeDouble(),attrs=m[1];
   const route=attrs.match(/data-nav="([^"]+)"/);if(route){node.dataset.nav=route[1];this.nav.push(node);}
   const id=attrs.match(/id="([^"]+)"/);if(id)this.nodes.set('#'+id[1],node);
   const c=attrs.match(/data-replay-case="([^"]+)"/);if(c){node.dataset.replayCase=c[1];node.pressed=attrs.includes('aria-pressed="true"');this.cases.push(node);}
  }
  const details=html.match(/<details class="first-run-all"([^>]*)>/);if(details){const n=new NodeDouble();n.open=/\bopen\b/.test(details[1]);this.nodes.set('.first-run-all',n);}
  this.nodes.set('a.lab-brand',new NodeDouble());
 }
 querySelector(selector:string){if(selector==='[data-replay-case][aria-pressed="true"]')return this.cases.find(n=>n.pressed);return this.nodes.get(selector)??null;}
 querySelectorAll(selector:string){if(selector==='[data-nav]')return this.nav;if(selector==='[data-replay-case]')return this.cases;return [];}
}
function fixture(run:(host:HostDouble,routes:string[])=>unknown){
 const prior=Object.getOwnPropertyDescriptor(globalThis,'document');const host=new HostDouble(),routes:string[]=[];
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement:()=>host}});
 try{replayView({replaceChildren(){},contains:()=>true} as unknown as HTMLElement,r=>routes.push(r),true);return run(host,routes);}finally{if(prior)Object.defineProperty(globalThis,'document',prior);else Reflect.deleteProperty(globalThis,'document');}
}
test('first-run AI proposal control routes to implemented proposals view',()=>fixture((host,routes)=>{
 const button=host.nav.find(n=>n.dataset.nav==='proposals');assert.ok(button);button.onclick!();assert.deepEqual(routes,['proposals']);
 const main=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');assert.match(main,/tab==='proposals'\)proposalView/);
}));
test('guided schedule selection preserves open disclosure and visible keyboard focus across redraw',()=>fixture(host=>{
 const details=host.querySelector('.first-run-all')!;assert.equal(details.open,false);details.open=true;
 host.cases.find(n=>n.dataset.replayCase==='five-call-burst')!.onclick!();
 assert.equal(host.querySelector('.first-run-all')!.open,true);
 const selected=host.querySelector('[data-replay-case][aria-pressed="true"]')!;assert.equal(selected.dataset.replayCase,'five-call-burst');assert.equal(selected.focused,true);
 host.cases.find(n=>n.dataset.replayCase==='unpaid-does-not-fulfill')!.onclick!();assert.equal(host.querySelector('.first-run-all')!.open,true);assert.equal(host.querySelector('[data-replay-case][aria-pressed="true"]')!.focused,true);
}));

test('first read names the user, rule and scope without an executed finding',()=>fixture(host=>{
 assert.match(host.html,/FOR DEVELOPERS CONNECTING SYSTEMS/);
 assert.match(host.html,/The rule: fulfill each paid order once/);
 assert.match(host.html,/Does it fulfill twice/);
 assert.match(host.html,/See what happens/);
 assert.match(host.html,/No API requests, shipments or payments/);
 assert.doesNotMatch(host.html,/Next step for your code/);
}));

test('completed demo hands off to the existing scoped local lab and home stays reachable',()=>fixture(async(host,routes)=>{
 await host.querySelector('#replay-run')!.listeners.click();
 assert.match(host.html,/Next step for your code/);
 assert.match(host.html,/bundled examples, not your integration/);
 assert.match(host.html,/trusted local formatter or JSON-patch adapter/);
 const local=host.nav.filter(n=>n.dataset.nav==='lab').at(-1)!;local.onclick!();
 const home=host.nav.find(n=>n.dataset.nav==='start')!;home.onclick!();
 assert.deepEqual(routes,['lab','start']);
}));
