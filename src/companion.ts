import type {ReviewBrief} from './review-brief.ts';
export type CompanionStep='compare'|'confirm'|'save';
export function companionState(review:ReviewBrief|null,confirmed:boolean){
 if(!review)return {step:'compare' as CompanionStep,title:'Let’s check a boundary.',message:'Pick Money or Missing vs null. I’ll walk you through the two bundled adapters.',action:'Compare adapters'};
 if(!confirmed)return {step:'confirm' as CompanionStep,title:`${review.total-review.originalPassed} original checks disagree.`,message:'Read the rule below. Does this interpretation fit the example you want to review?',action:'Confirm this interpretation'};
 return {step:'save' as CompanionStep,title:'Keep the proof, not just the answer.',message:'Save a review brief, then export the runnable test. These demo checks are not deployment approval.',action:'Save review brief'};
}
