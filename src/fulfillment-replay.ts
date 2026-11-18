/** Synthetic, single-process fulfillment boundary. No Stripe SDK/API or credentials. */
export type FulfillmentRequest = {sessionId:string; paymentStatus:'paid'|'unpaid'|'no_payment_required'};
export type ReplayPorts = {recordFulfillment:(sessionId:string)=>void; checkpoint:()=>Promise<void>};
export type FulfillmentHandler = (request:FulfillmentRequest)=>Promise<void>;
export type HandlerFactory = (ports:ReplayPorts)=>FulfillmentHandler;
export type FulfillmentCase = {id:string; batches:FulfillmentRequest[][]; expected:string[]};
const paid = (sessionId:string):FulfillmentRequest=>({sessionId,paymentStatus:'paid'});
/** Independently authored expectations; never inferred from the adapter under test. */
export function fulfillmentCases():FulfillmentCase[]{return [
 {id:'one-paid-session',batches:[[paid('cs_demo_a')]],expected:['cs_demo_a']},
 {id:'sequential-redelivery',batches:[[paid('cs_demo_a')],[paid('cs_demo_a')]],expected:['cs_demo_a']},
 {id:'concurrent-same-session',batches:[[paid('cs_demo_a'),paid('cs_demo_a')]],expected:['cs_demo_a']},
 {id:'five-call-burst',batches:[Array.from({length:5},()=>paid('cs_demo_a'))],expected:['cs_demo_a']},
 {id:'distinct-sessions',batches:[[paid('cs_demo_a'),paid('cs_demo_b')]],expected:['cs_demo_a','cs_demo_b']},
 {id:'unpaid-does-not-fulfill',batches:[[{sessionId:'cs_demo_a',paymentStatus:'unpaid'}]],expected:[]},
 {id:'unpaid-then-paid',batches:[[{sessionId:'cs_demo_a',paymentStatus:'unpaid'}],[paid('cs_demo_a')]],expected:['cs_demo_a']},
 {id:'no-payment-required',batches:[[{sessionId:'cs_demo_a',paymentStatus:'no_payment_required'}]],expected:['cs_demo_a']},
 {id:'replay-after-burst',batches:[[paid('cs_demo_a'),paid('cs_demo_b')],[paid('cs_demo_a'),paid('cs_demo_b')]],expected:['cs_demo_a','cs_demo_b']},
 ];}
/** Deliberate bug: read -> async work -> write allows concurrent duplicates. */
export const racyHandler:HandlerFactory=({recordFulfillment,checkpoint})=>{
 const done=new Set<string>();
 return async request=>{
  if(request.paymentStatus==='unpaid'||done.has(request.sessionId))return;
  await checkpoint();
  recordFulfillment(request.sessionId);
  done.add(request.sessionId);
 };
};
/** Reference ONLY for this in-memory model, not a production locking solution. */
export const singleProcessHandler:HandlerFactory=({recordFulfillment,checkpoint})=>{
 const done=new Set<string>();
 const pending=new Map<string,Promise<void>>();
 return async request=>{
  if(request.paymentStatus==='unpaid'||done.has(request.sessionId))return;
  const prior=pending.get(request.sessionId);
  if(prior){await prior;return;}
  const task=(async()=>{await checkpoint();recordFulfillment(request.sessionId);done.add(request.sessionId);})();
  pending.set(request.sessionId,task);
  try{await task;}finally{pending.delete(request.sessionId);}
 };
};
export type FulfillmentResult={id:string;expected:string[];actual:string[];passed:boolean;error?:string};
/** Each fixture has fresh state; calls in one batch overlap at an await boundary. */
export async function runFulfillmentReplay(factory:HandlerFactory):Promise<FulfillmentResult[]>{
 const results:FulfillmentResult[]=[];
 for(const fixture of fulfillmentCases()){
  const actual:string[]=[];
  try{
   const handler=factory({recordFulfillment:id=>{if(typeof id!=='string')throw new Error('Fulfillment identifier must be a string.');actual.push(id);},checkpoint:()=>Promise.resolve()});
   if(typeof handler!=='function')throw new Error('createHandler must return a function.');
   for(const batch of fixture.batches){
    // All settle before reading the ledger, including failures. No real side effects.
    const settled=await Promise.allSettled(batch.map(request=>handler(structuredClone(request))));
    const rejection=settled.find(r=>r.status==='rejected');
    if(rejection?.status==='rejected')throw rejection.reason;
   }
   const expected=[...fixture.expected].sort(),observed=[...actual].sort();
   results.push({id:fixture.id,expected:fixture.expected,actual,passed:JSON.stringify(expected)===JSON.stringify(observed)});
  }catch(error){results.push({id:fixture.id,expected:fixture.expected,actual,passed:false,error:error instanceof Error?error.message:String(error)});}
 }
 return results;
}
