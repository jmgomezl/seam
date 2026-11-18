// Local trusted code only: --adapter imports and executes arbitrary JS, not a sandbox.
import {pathToFileURL,fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {runFulfillmentReplay,racyHandler,singleProcessHandler} from '../src/fulfillment-replay.ts';
import {byteDigest,replayReport,writeReplayReport} from './replay-report.mjs';
const args=process.argv.slice(2);
let mode='deliberately-racy',adapterPath,reportPath,valid=true,chosen=false;
for(let i=0;i<args.length;i++){
 const arg=args[i];
 if(arg==='--reference'&&!chosen){mode='reference';chosen=true;}
 else if(arg==='--adapter'&&!chosen&&args[i+1]&&!args[i+1].startsWith('--')){mode='local-adapter';chosen=true;adapterPath=resolve(args[++i]);}
 else if(arg==='--report'&&!reportPath&&args[i+1]&&!args[i+1].startsWith('--')){reportPath=resolve(args[++i]);}
 else{valid=false;break;}
}
if(!valid){
 console.error('Usage: node --experimental-strip-types scripts/check-fulfillment.mjs [--reference | --adapter ./trusted-local-adapter.mjs] [--report ./new-report.json]');process.exitCode=2;
}else{
 try{
  const startedAt=new Date().toISOString();
  const runnerPath=fileURLToPath(new URL('../src/fulfillment-replay.ts',import.meta.url));
  // Opt-in metadata; never store source bytes or a local path in the report.
  const runnerSha256=reportPath?byteDigest(runnerPath):undefined;
  const entryPath=adapterPath??runnerPath;
  const adapterSha256=reportPath?byteDigest(entryPath):undefined;
  const factory=adapterPath?(await import(pathToFileURL(adapterPath).href)).createHandler:mode==='reference'?singleProcessHandler:racyHandler;
  if(typeof factory!=='function')throw new Error('Adapter must export createHandler(ports).');
  const results=await runFulfillmentReplay(factory);
  console.log(JSON.stringify({scope:'Synthetic single-process replay; no Stripe API, authentication, crash or production guarantee.',adapter:adapterPath?'--adapter':mode==='reference'?'--reference':'deliberately-racy',passed:results.filter(r=>r.passed).length,total:results.length,results},null,2));
  if(reportPath){
   if(byteDigest(entryPath)!==adapterSha256||byteDigest(runnerPath)!==runnerSha256)throw new Error('Source changed during replay. No report written; rerun after changes stop.');
   writeReplayReport(reportPath,replayReport({results,mode,adapterSha256,runnerSha256,startedAt}));
   console.error('Metadata report saved. File hashes are not execution proof.');
  }
  process.exitCode=results.every(r=>r.passed)?0:1;
 }catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=2;}
}
