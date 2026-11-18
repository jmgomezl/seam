// Adapt ONLY a local/synthetic handler. Do not wire production fulfillment here.
// This intentionally racy example should FAIL concurrent fixtures.
export function createHandler({recordFulfillment,checkpoint}){
 const fulfilled=new Set();
 return async ({sessionId,paymentStatus})=>{
  if(paymentStatus==='unpaid'||fulfilled.has(sessionId))return;
  await checkpoint(); // Represents an async I/O boundary, without network access.
  recordFulfillment(sessionId); // Injected in-memory observation, not shipping/billing.
  fulfilled.add(sessionId);
 };
}
