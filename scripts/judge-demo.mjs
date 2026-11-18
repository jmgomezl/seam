// Reproduce the authored demo, not a production readiness check.
import {pathToFileURL} from 'node:url';
import {runFulfillmentReplay,racyHandler,singleProcessHandler} from '../src/fulfillment-replay.ts';

export async function judgeDemo(original=racyHandler,reference=singleProcessHandler){
 const before=await runFulfillmentReplay(original),after=await runFulfillmentReplay(reference);
 const expectedFailures=['concurrent-same-session','five-call-burst'];
 const observedFailures=before.filter(r=>!r.passed).map(r=>r.id);
 const sequential=before.find(r=>r.id==='sequential-redelivery');
 const overlap=before.find(r=>r.id==='concurrent-same-session');
 const repaired=after.find(r=>r.id==='concurrent-same-session');
 const verified=before.length===9&&after.length===9&&before.every(r=>!r.error)&&after.every(r=>!r.error&&r.passed)
  &&JSON.stringify(observedFailures)===JSON.stringify(expectedFailures)
  &&sequential?.actual.length===1&&overlap?.actual.length===2&&repaired?.actual.length===1;
 return {verified,scope:'Authored synthetic single-process handlers; no Stripe API, AI inference, production fix or crash recovery tested.',
  original:{passed:before.filter(r=>r.passed).length,total:before.length,failures:observedFailures},
  reference:{passed:after.filter(r=>r.passed).length,total:after.length},
  witness:{sequentialEffects:sequential?.actual.length,overlappingEffects:overlap?.actual.length,referenceOverlappingEffects:repaired?.actual.length},
  results:{original:before,reference:after}};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const args=process.argv.slice(2);
 if(args.length){console.error('Usage: npm run demo (no arguments). For raw evidence use scripts/check-fulfillment.mjs.');process.exitCode=2;}
 else try{
  const evidence=await judgeDemo();
  console.log('SEAM · reproducible fulfillment demo\n');
  console.log(`Sequential retry: ${evidence.witness.sequentialEffects} effect`);
  console.log(`Webhook + redirect overlap: ${evidence.witness.overlappingEffects} effects (expected 1)`);
  console.log(`Single-process reference overlap: ${evidence.witness.referenceOverlappingEffects} effect`);
  console.log(`Original: ${evidence.original.passed}/${evidence.original.total} · reference: ${evidence.reference.passed}/${evidence.reference.total}`);
  console.log(`\n${evidence.verified?'DEMO VERIFIED: expected bug reproduced; authored reference passes.':'DEMO MISMATCH: observed behavior differs from the expected demonstration.'}`);
  console.log(evidence.scope);
  console.log('Exit 0 verifies this demonstration, not production safety. Run npm test for the full test suite.');
  process.exitCode=evidence.verified?0:1;
 }catch(error){console.error('Demo failed:',error instanceof Error?error.message:String(error));process.exitCode=2;}
}
