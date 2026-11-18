const primary=[['start','Start here'],['lab','Example checks'],['capture','Your payload']] as const;
const advanced=[['proposals','Contract proposals'],['incidents','Public evidence'],['evaluation','Method & limits'],['workbench','Recorded examples'],['runtime','AI readiness']] as const;
const status:Record<string,string>={start:'LOCAL SIMULATION · NOT YOUR CODE',replay:'LOCAL SIMULATION · NOT YOUR CODE',lab:'LOCAL DEMOS · NO AI',capture:'LOCAL DECLARATION CHECK',proposals:'REVIEW BEFORE EXECUTION',runtime:'RUNTIME VALIDATION',incidents:'RECORDED EVIDENCE',evaluation:'METHOD & LIMITS',workbench:'AUTHORED EXAMPLES'};
/** Closed route labels only; no user input enters shell markup. */
export function appHeader(route:string){
 const button=([id,label]:readonly[string,string])=>`<button data-nav="${id}" ${route===id?'aria-current="page"':''}>${label}</button>`;
 return `<header class="lab-header app-header"><a class="lab-brand" href="#" aria-label="Seam home">seam<span> / integration checks</span></a><nav aria-label="Main navigation">${primary.map(button).join('')}<details class="app-more" ${advanced.some(([id])=>id===route)?'open':''}><summary>More tools</summary><div>${advanced.map(button).join('')}</div></details></nav><span class="lab-local">${status[route]??'EXPERIMENTAL · REVIEW LIMITS'}</span></header>`;
}
export function bindNavigation(root:HTMLElement,navigate:(tab:string)=>void){
 root.querySelectorAll<HTMLButtonElement>('[data-nav]').forEach(b=>b.onclick=()=>navigate(b.dataset.nav!));
 root.querySelector<HTMLAnchorElement>('a.lab-brand')!.onclick=e=>{e.preventDefault();navigate('start');};
}
