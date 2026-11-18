// Local trusted code only: --adapter imports and executes arbitrary JS, not a sandbox.
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {runFulfillmentReplay,racyHandler,singleProcessHandler} from '../src/fulfillment-replay.ts';
const args=process.argv.slice(2);
if(!(args.length===0||(args.length===1&&args[0]==='--reference')||(args.length===2&&args[0]==='--adapter'))){
 console.error('Usage: node --experimental-strip-types scripts/check-fulfillment.mjs [--reference | --adapter ./trusted-local-adapter.mjs]');process.exitCode=2;
}else{
 try{
  const factory=args[0]==='--adapter'?(await import(pathToFileURL(resolve(args[1])).href)).createHandler:args[0]==='--reference'?singleProcessHandler:racyHandler;
  if(typeof factory!=='function')throw new Error('Adapter must export createHandler(ports).');
  const results=await runFulfillmentReplay(factory);
  console.log(JSON.stringify({scope:'Synthetic single-process replay; no Stripe API, authentication, crash or production guarantee.',adapter:args[0]??'deliberately-racy',passed:results.filter(r=>r.passed).length,total:results.length,results},null,2));
  process.exitCode=results.every(r=>r.passed)?0:1;
 }catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=2;}
}
