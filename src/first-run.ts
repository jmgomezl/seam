import type {FulfillmentResult} from './fulfillment-replay.ts';
export function firstRunStep(selected:string,original:FulfillmentResult|undefined,reference:FulfillmentResult|undefined){
 if(!original||!reference)return {number:1,label:'Run the checks',next:null};
 if(original.error||reference.error)return {number:1,label:'Inspect the execution error',next:null};
 if(selected==='sequential-redelivery'&&original.passed&&reference.passed)return {number:2,label:'Now overlap the same calls',next:'concurrent-same-session'};
 return {number:3,label:'Keep the actual evidence',next:null};
}
