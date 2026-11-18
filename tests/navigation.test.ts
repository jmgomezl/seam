import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {appHeader,bindNavigation} from '../src/navigation.ts';
test('all routes use one set of primary names and one active destination',()=>{
 for(const route of ['start','lab','capture','proposals','incidents','evaluation','workbench','runtime']){
  const html=appHeader(route);for(const label of ['Start here','Example checks','Check payment units','More tools'])assert.ok(html.includes(label));
  assert.equal((html.match(/aria-current="page"/g)||[]).length,1);assert.match(html,new RegExp(`data-nav="${route}" aria-current="page"`));
 }
 assert.doesNotMatch(appHeader('<img>'),/<img>/);
});
test('header route and home bindings navigate without changing the feature state directly',()=>{
 const nodes=[{dataset:{nav:'capture'},onclick:null as null|(()=>void)}],brand={onclick:null as null|((e:{preventDefault:()=>void})=>void)};const routes:string[]=[];
 bindNavigation({querySelectorAll:()=>nodes,querySelector:()=>brand} as unknown as HTMLElement,r=>routes.push(r));nodes[0].onclick!();brand.onclick!({preventDefault(){}});assert.deepEqual(routes,['capture','start']);
});
test('workspace and both demo views render the shared shell instead of legacy sidebar',()=>{
 for(const file of ['main.ts','lab-ui.ts','replay-ui.ts']){const source=readFileSync(new URL('../src/'+file,import.meta.url),'utf8');assert.match(source,/appHeader\(/);assert.match(source,/bindNavigation\(/);}
 const main=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');assert.doesNotMatch(main,/<aside>/);assert.match(main,/workspace-shell/);
});

test('guided home is the only always-visible destination; supporting tools remain in a closed menu',()=>{
 for(const route of ['start','capture','proposals']){
  const html=appHeader(route),beforeMenu=html.slice(0,html.indexOf('<details'));
  assert.match(beforeMenu,/data-nav="start"/);
  assert.doesNotMatch(beforeMenu,/data-nav="(?:lab|capture|proposals)"/);
  assert.doesNotMatch(html,/<details[^>]*\bopen\b/);
  for(const tab of ['lab','capture','proposals','runtime'])assert.ok(html.includes(`data-nav="${tab}"`));
 }
});
