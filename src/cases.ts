import type {Boundary,Spec,Verdict} from './engine.ts';
const amount=(value:number,p:number|null,c:number|null,pc='USD',cc=pc):Spec=>({kind:'amount',value,producerScale:p,consumerScale:c,producerCurrency:pc,consumerCurrency:cc});
const patch=(input:'absent'|'null',serialize:boolean,previous='Cedar'):Spec=>({kind:'patch',input,serializeAbsentAsNull:serialize,previous,producerAbsent:'preserve',consumerAbsent:'preserve',producerNull:'clear',consumerNull:'clear'});
const time=(value:string,p:number|null,c:number|null):Spec=>({kind:'time',value,producerOffset:p,consumerOffset:c});
const state=(status:number,p:string,c:string):Spec=>({kind:'state',status,producerMeaning:p,consumerMeaning:c});
const definitions:Array<[string,Spec,Verdict]>=[
 ['R17',amount(1250,100,1),'mismatch'],['R42',patch('absent',true),'mismatch'],['R09',time('2026-06-01T12:00:00',0,120),'mismatch'],['R61',state(202,'pending','paid'),'mismatch'],['R28',amount(1250,100,100),'aligned'],['R35',patch('null',true),'aligned'],['R73',time('2026-06-01T12:00:00Z',0,120),'aligned'],['R84',amount(42,null,100),'ambiguous'],
 ['R71c4',patch('null',true),'aligned'],['Rb2e9',amount(1750,null,100,'GBP','CHF'),'mismatch'],['R0f63',time('2028-01-18T23:55:00',-210,null),'ambiguous'],['Ra85d',amount(0,100,1),'mismatch'],['R34bf',time('2028-02-29T00:05:00+05:45',null,null),'aligned'],['Rec27',state(200,'pending','paid'),'mismatch'],['R5d90',amount(-1250,1000,1000,'CHF'),'aligned'],['R998a',patch('absent',true,'Juniper'),'mismatch'],['R460e',state(202,'pending','pending'),'aligned'],['Rd17f',time('2028-02-29T00:05:00',345,330),'mismatch'],['R6ac2',amount(42,null,100,'CAD'),'ambiguous'],['Rf308',patch('absent',false,'Aspen'),'aligned']];
function describe(s:Spec):[string,string,string]{
 if(s.kind==='amount')return [`Amount is ${s.producerCurrency}; ${s.producerScale??'unspecified'} wire units per major unit. Zero and credits are permitted.`,`Amount is ${s.consumerCurrency}; ${s.consumerScale??'unspecified'} wire units per major unit. No currency or unit conversion.`,JSON.stringify({amount:s.value})];
 if(s.kind==='patch')return [`Caller ${s.input==='absent'?'omits nickname to preserve it':'supplies null to clear it'}. Previous nickname: ${s.previous}.`,`Receiver preserves omission and clears null. Serializer ${s.serializeAbsentAsNull?'converts absence to null':'preserves omission'}; explicit null is unchanged.`,s.input==='absent'&&!s.serializeAbsentAsNull?'{}':'{"nickname":null}'];
 if(s.kind==='time')return [`Explicit offsets are authoritative. Otherwise interpret using UTC offset ${s.producerOffset??'unknown'} minutes.`,`Explicit offsets are authoritative. Otherwise interpret using UTC offset ${s.consumerOffset??'unknown'} minutes.`,JSON.stringify({timestamp:s.value})];
 return [`HTTP ${s.status} means ${s.producerMeaning}.`,`For this operation, HTTP ${s.status} is interpreted as ${s.consumerMeaning}.`,JSON.stringify({status:s.status})];
}
export const cases:Boundary[]=definitions.map(([id,spec],i)=>{const [producer,consumer,wire]=describe(spec);return {id,spec,producer,consumer,wire,group:i<8?'examples':'reconstructed'};});
// These expected values are reconstruction regression expectations, not a withheld oracle.
export const expected=Object.fromEntries(definitions.map(([id,,verdict])=>[id,verdict]));
