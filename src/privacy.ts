import type {Verdict} from './engine.ts';
export type Route='local'|'cloud';
export function gate(route:Route,consent:boolean,cloudConsent:boolean){if(route!=='local'&&route!=='cloud')throw new Error('Unsupported inference route.');if(!consent)throw new Error('Consent is required before Firebase initialization.');if(route==='cloud'&&!cloudConsent)throw new Error('Explicit consent for this cloud request is required.');}
export function parseHypotheses(raw:string,id:string):Array<{id:string;verdict:Verdict;evidence:string;minimalProbe:string;status:'hypothesis'}>{
 const data:unknown=JSON.parse(raw);if(!Array.isArray(data)||data.length>1)throw new Error('Expected at most one hypothesis.');
 return data.map((r)=>{if(!r||typeof r!=='object'||r.id!==id||!['mismatch','aligned','ambiguous'].includes(r.verdict)||typeof r.evidence!=='string'||typeof r.minimalProbe!=='string'||r.evidence.length>8000||r.minimalProbe.length>8000)throw new Error('Invalid hypothesis.');return {id,verdict:r.verdict,evidence:r.evidence,minimalProbe:r.minimalProbe,status:'hypothesis'};});
}
