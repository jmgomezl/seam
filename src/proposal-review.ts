import {confirmProposal,type ProposalReceipt,type Excerpts} from './proposal.ts';
/** Deliberate human re-entry, not semantic verification or a second AI oracle. */
export type HumanUnitReview={scopeConfirmed:boolean;producerScale:string;producerCurrency:string;consumerScale:string;consumerCurrency:string};
export function confirmReviewedProposal(receipt:ProposalReceipt,current:Excerpts,review:HumanUnitReview){
 if(!review.scopeConfirmed)throw new Error('Confirm both excerpts describe the same display field and operation. If unsure, reject the candidate.');
 const p=receipt.proposal;
 if(p.status!=='candidate'||!p.producer||!p.consumer)throw new Error('No candidate is available to review.');
 for(const side of ['producer','consumer'] as const){
  const scale=review[`${side}Scale`],currency=review[`${side}Currency`].trim().toUpperCase();
  if(!['1','100','1000'].includes(scale)||!currency)throw new Error(`Read the full ${side} excerpt and enter its currency and units before continuing.`);
  if(Number(scale)!==p[side]!.unitsPerMajor||currency!==p[side]!.currency)throw new Error(`Your ${side} interpretation differs from the candidate. No witnesses generated; reject it or revise the excerpts and extract again.`);
 }
 return confirmProposal(receipt,current,true);
}
