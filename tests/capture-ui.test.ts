import test from 'node:test';
import assert from 'node:assert/strict';
import {captureView} from '../src/capture-ui.ts';
class Element {
 html=''; textContent=''; value=''; dataset:Record<string,string>={}; focused=false;
 nodes=new Map<string,Element>(); listeners:Record<string,()=>void>={};
 oninput:(()=>void)|null=null; onchange:(()=>void)|null=null; onsubmit:((event:{preventDefault:()=>void})=>void)|null=null;
 set innerHTML(value:string){this.html=value;this.nodes.clear();for(const m of value.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)){const el=new Element();const f=m[0].match(/data-field="([^"]+)"/);if(f)el.dataset.field=f[1];this.nodes.set('#'+m[1],el);}}
 get innerHTML(){return this.html;}
 querySelector(selector:string):Element|null{return this.nodes.get(selector)??null;}
 querySelectorAll(){return [...this.nodes.values()].filter(el=>el.dataset.field);}
 addEventListener(event:string,fn:()=>void){this.listeners[event]=fn;}
 focus(){this.focused=true;}
 scrollIntoView(){}
}
test('payload result guides preview, preserves original and hides export detail until requested',()=>{
 const host=new Element();captureView(host as unknown as HTMLElement);
 host.querySelector('#capture-reset')!.listeners.click();
 host.querySelector('#capture-form')!.onsubmit!({preventDefault(){}});
 const result=host.querySelector('#capture-result')!;
 assert.match(result.html,/01 · YOUR DECLARATIONS/);
 assert.match(result.html,/id="capture-preview" class="primary"/);
 assert.match(result.html,/<details class="capture-downloads"><summary>Export this check/);
 assert.doesNotMatch(result.html,/<details open/);
 result.querySelector('#capture-preview')!.listeners.click();
 assert.match(result.html,/02 · HYPOTHETICAL PREVIEW/);
 assert.match(result.html,/does not modify your actual code/);
 assert.match(result.html,/Export this preview/);
 assert.equal(result.focused,true);
 result.querySelector('#capture-preview')!.listeners.click();
 assert.match(result.html,/01 · YOUR DECLARATIONS/);
 result.querySelector('#capture-edit')!.listeners.click();
 assert.equal(host.querySelector('#capture-producerUnits')!.focused,true);
 host.querySelector('#capture-producerUnits')!.value='';host.querySelector('#capture-producerUnits')!.oninput!();
 assert.equal(result.html,'');
 host.querySelector('#capture-form')!.onsubmit!({preventDefault(){}});
 assert.match(result.html,/Complete declarations ↑/);
 assert.doesNotMatch(result.html,/id="capture-preview"/);
 assert.match(result.html,/id="capture-test" disabled/);
 host.querySelector('#capture-reset')!.listeners.click();
});
