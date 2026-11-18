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
export type FulfillmentResult={id:string;expected:string[];actual:string[];passed:boolean;error?:string;executionStatus?:'completed'|'timed-out'|'not-run'};
/** Each fixture has fresh state; calls in one batch overlap at an await boundary. */
export async function runFulfillmentReplay(factory:HandlerFactory,options:{timeoutMs?:number}={}):Promise<FulfillmentResult[]>{
 const timeoutMs=options.timeoutMs??5000;
 if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>60000)throw new Error('Replay timeout must be an integer from 1 to 60000 ms.');
 const results:FulfillmentResult[]=[];
 let stopped=false;
 for(const fixture of fulfillmentCases()){
  if(stopped){results.push({id:fixture.id,expected:fixture.expected,actual:[],passed:false,executionStatus:'not-run',error:'Not run after an earlier asynchronous timeout.'});continue;}
  const actual:string[]=[];
  let recording=true,timer:ReturnType<typeof setTimeout>|undefined;
  const timeout=new Error(`Handler did not settle within ${timeoutMs} ms. Waiting stopped; adapter work was not canceled.`);
  try{
   const execute=async()=>{
    const handler=factory({recordFulfillment:id=>{if(typeof id!=='string')throw new Error('Fulfillment identifier must be a string.');if(recording)actual.push(id);},checkpoint:()=>Promise.resolve()});
    if(typeof handler!=='function')throw new Error('createHandler must return a function.');
    for(const batch of fixture.batches){
     // Wrap synchronous throws too, so all started siblings settle before normal reporting.
     const settled=await Promise.allSettled(batch.map(request=>Promise.resolve().then(()=>handler(structuredClone(request)))));
     if(!recording)return; // Do not start another batch after the waiting limit.
     const rejection=settled.find(r=>r.status==='rejected');
     if(rejection?.status==='rejected')throw rejection.reason;
    }
   };
   await Promise.race([execute(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(timeout),timeoutMs);})]);
   const expected=[...fixture.expected].sort(),observed=[...actual].sort();
   results.push({id:fixture.id,expected:fixture.expected,actual:[...actual],passed:JSON.stringify(expected)===JSON.stringify(observed)});
  }catch(error){
   stopped=error===timeout;
   results.push({id:fixture.id,expected:fixture.expected,actual:[...actual],passed:false,...(stopped?{executionStatus:'timed-out' as const}:{}),error:error instanceof Error?error.message:String(error)});
  }finally{recording=false;if(timer!==undefined)clearTimeout(timer);}
 }
 return results;
}
