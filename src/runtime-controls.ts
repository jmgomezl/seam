import {review,firebaseConfigured} from './firebase.ts';
import type {Boundary} from './engine.ts';
// Legacy Runtime requests share one slot across navigation away and back.
let pendingRuntime:Promise<unknown>|null=null;
export function bindRuntimeControls(host:HTMLElement,boundary:Boundary){
 const view=host.firstElementChild;
 const active=()=>host.isConnected&&host.firstElementChild===view;
 const el=<T extends HTMLElement>(id:string)=>host.querySelector<T>('#'+id)!;
 const output=el('ai-output'),device=el('device');
 const local=el<HTMLButtonElement>('local'),cloud=el<HTMLButtonElement>('cloud');
 const consent=el<HTMLInputElement>('consent'),cloudConsent=el<HTMLInputElement>('cloud-consent');
 const availability=el<HTMLButtonElement>('availability');
 const snapshot=structuredClone(boundary);
 let revision=0,checking=false;
 const refresh=()=>{if(active()){local.disabled=cloud.disabled=!!pendingRuntime||!firebaseConfigured();}};
 refresh();
 if(pendingRuntime){
  output.textContent='An earlier Runtime request is still running. New Runtime requests are blocked until it settles. Leaving this view does not cancel inference or download.';
  pendingRuntime.then(refresh,refresh);
 }
 for(const input of [consent,cloudConsent])input.addEventListener('input',()=>{
  revision++;
  if(pendingRuntime&&active())output.textContent='Pending result discarded after consent changed. Inference or download may continue; sent cloud data cannot be recalled.';
 });
 for(const route of ['local','cloud'] as const)el(route).onclick=async()=>{
  if(!active()||pendingRuntime)return;
  const requestRevision=++revision,allowed=consent.checked,cloudAllowed=cloudConsent.checked;
  cloudConsent.checked=false;
  output.textContent='Checking consent and configuration…';
  // Keep SDK initialization and strict route enforcement inside the existing adapter.
  const request=Promise.resolve().then(()=>review(snapshot,route,allowed,cloudAllowed));
  const tracked=request.finally(()=>{if(pendingRuntime===tracked)pendingRuntime=null;});
  pendingRuntime=tracked;refresh();
  try{
   const result=await tracked;
   if(active()&&revision===requestRevision)output.textContent=JSON.stringify(result,null,2);
  }catch(error){
   if(active()&&revision===requestRevision)output.textContent=error instanceof Error?error.message:'Inference failed; no verified result.';
  }finally{refresh();}
 };
 availability.onclick=async()=>{
  if(!active()||checking)return;checking=true;availability.disabled=true;
  try{
   const lm=(globalThis as unknown as {LanguageModel?:{availability:()=>Promise<string>}}).LanguageModel;
   const result=lm?await lm.availability():'Prompt API unavailable in this browser.';
   if(active())device.textContent=result;
  }catch{if(active())device.textContent='Availability check failed; no model initialized.';}
  finally{checking=false;if(active())availability.disabled=false;}
 };
}
