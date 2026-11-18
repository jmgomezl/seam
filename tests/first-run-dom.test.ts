import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {replayView} from '../src/replay-ui.ts';
// Minimal deterministic DOM double: exercises replayView's real event bindings/redraw.
class NodeDouble {
 dataset:Record<string,string>={}; open=false; onclick:(()=>void)|null=null;
 listeners:Record<string,()=>unknown>={}; focused=false; pressed=false; preventScroll:boolean|undefined;
 addEventListener(name:string,fn:()=>unknown){this.listeners[name]=fn;}
 focus(options?:{preventScroll?:boolean}){this.focused=true;this.preventScroll=options?.preventScroll;}
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
  for(const id of ['replay-results','replay-status']){if(html.includes(`id="${id}"`))this.nodes.set('#'+id,new NodeDouble());}this.nodes.set('a.lab-brand',new NodeDouble());
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
 assert.doesNotMatch(host.html,/Next step for your fulfillment handler/);
}));

test('completed demo offers fulfillment-specific handoff with separate other-checks navigation',()=>fixture(async(host,routes)=>{
 host.cases.find(n=>n.dataset.replayCase==='sequential-redelivery')!.onclick!();
 await host.querySelector('#replay-run')!.listeners.click();
 assert.doesNotMatch(host.html,/Next step for your fulfillment handler/);
 host.querySelector('#first-run-next')!.listeners.click();
 assert.match(host.html,/Next step for your fulfillment handler/);
 assert.match(host.html,/bundled examples, not your integration/);
 assert.match(host.html,/Test my fulfillment handler locally/);
 assert.match(host.html,/--adapter \.\/adapter\.mjs --report \.\/review-001\.json/);
 assert.match(host.html,/Export <code>createHandler/);
 assert.match(host.html,/Trusted code only, not a sandbox/);
 assert.match(host.html,/Explore other checks: currency &amp; merge patch/);
 assert.doesNotMatch(host.html,/Test my code locally/);
 const local=host.nav.filter(n=>n.dataset.nav==='lab').at(-1)!;local.onclick!();
 const home=host.nav.find(n=>n.dataset.nav==='start')!;home.onclick!();
 assert.deepEqual(routes,['lab','start']);
}));

test('guided hierarchy reveals actual counts only after execution and labels current step',()=>fixture(async host=>{
 assert.doesNotMatch(host.html,/class="replay-count/);
 assert.doesNotMatch(host.html,/Actual effect ledgers/);
 assert.match(host.html,/aria-current="step"><b>1/);
 assert.match(host.html,/<summary>More tools<\/summary>/);
 host.cases.find(n=>n.dataset.replayCase==='sequential-redelivery')!.onclick!();
 await host.querySelector('#replay-run')!.listeners.click();
 assert.match(host.html,/aria-current="step"><b>2/);
 assert.ok(host.html.indexOf('actual effect ledgers')>=0);assert.ok(host.html.indexOf('actual effect ledgers')<host.html.indexOf('Selected schedule finding'));
 host.querySelector('#first-run-next')!.listeners.click();
 assert.match(host.html,/aria-current="step"><b>2/);
 assert.match(host.html,/<strong>2<\/strong><span>fulfillment records/);
 assert.match(host.html,/<strong>1<\/strong><span>fulfillment records/);
 assert.match(host.html,/Inspect recorded order IDs/);
}));

 test('guided completed run and overlap reveal actual ledgers with schedule context',()=>fixture(async host=>{
 assert.equal(host.querySelector('#replay-results'),null);
 host.cases.find(n=>n.dataset.replayCase==='sequential-redelivery')!.onclick!();
 await host.querySelector('#replay-run')!.listeners.click();
 assert.equal(host.querySelector('#replay-results')!.focused,true);
 assert.equal(host.querySelector('#replay-results')!.preventScroll,false);
 assert.match(host.html,/tabindex="-1" aria-label="[^"]+: actual effect ledgers"/);
 host.querySelector('#first-run-next')!.listeners.click();
 assert.equal(host.querySelector('#replay-results')!.focused,true);
 assert.equal(host.querySelector('#replay-results')!.preventScroll,false);
}));

test('guided path keeps next action ahead of optional tools and review downloads',()=>fixture(async host=>{
 const first=host.html;
 assert.ok(first.indexOf('See what happens')<first.indexOf('Explore all nine schedules'));
 assert.match(first,/<details class="replay-review"><summary>Evidence, limits &amp; downloads/);
 assert.doesNotMatch(first,/<details class="replay-input-review"/);
 host.cases.find(n=>n.dataset.replayCase==='sequential-redelivery')!.onclick!();
 await host.querySelector('#replay-run')!.listeners.click();
 assert.match(host.html,/<details class="replay-input-review" ><summary>Review requests &amp; rerun/);
 assert.match(host.html,/id="first-run-next" class="primary"/);
 host.querySelector('#first-run-next')!.listeners.click();
 assert.ok(host.html.indexOf('Next step for your fulfillment handler')<host.html.indexOf('Explore all nine schedules'));
 assert.match(host.html,/<summary class="handoff-primary">Test my fulfillment handler locally/);
 assert.doesNotMatch(host.html,/Save these actual results/);
 assert.match(host.html,/<details class="handoff-other"><summary>Working on a different boundary/);
 assert.match(host.html,/Trusted code only, not a sandbox/);
}));

test('default demo shows the actual concurrent finding and local handoff in one run',()=>fixture(async host=>{
 assert.equal(host.cases.find(n=>n.pressed)!.dataset.replayCase,'concurrent-same-session');
 await host.querySelector('#replay-run')!.listeners.click();
 assert.match(host.html,/Sequential control: 1 race-prone \/ 1 reference records/);
 assert.match(host.html,/<strong>2<\/strong><span>fulfillment records/);
 assert.match(host.html,/Test my fulfillment handler locally/);
 assert.equal(host.querySelector('#first-run-next'),null);
}));

test('rerun keeps running feedback visible and labels retained results as previous',()=>fixture(async host=>{
 const first=host.querySelector('#replay-run')!.listeners.click();
 assert.match(host.html,/Running local replay… No result yet/);
 await first;
 const again=host.querySelector('#replay-run')!.listeners.click();
 assert.match(host.html,/<details class="replay-input-review" open>/);
 assert.match(host.html,/Results below are from the previous completed run/);
 assert.match(host.html,/id="replay-run"[^>]*disabled/);
 await again;
 assert.doesNotMatch(host.html,/Results below are from the previous completed run/);
 assert.match(host.html,/All nine schedules:/);
}));
