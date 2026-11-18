import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
export const byteDigest=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
/** Metadata and fixed-fixture outcomes only. Never persist adapter outputs/error strings. */
export function replayReport({results,mode,adapterSha256,runnerSha256,startedAt}){
 return {format:'seam-fulfillment-report-v1',startedAt,nodeVersion:process.version,mode,entryModuleSha256:adapterSha256,replayModuleSha256:runnerSha256,passed:results.filter(r=>r.passed).length,total:results.length,checks:results.map((r,index)=>({fixture:index+1,passed:r.passed,expectedCount:r.expected.length,actualCount:r.actual.length,executionError:!!r.error,executionStatus:r.executionStatus??'completed'})),limits:['Authored synthetic fixtures; no production integration validated.','Digests identify file bytes read for this run, not authorship, integrity, execution proof or attestation.','Only entry and replay modules are hashed; imported dependencies and runtime environment are not attested.','No request inputs, source contents, ledger identifiers, adapter paths or error messages are included.','Finite single-process schedules do not prove durable, distributed or crash-safe behavior.']};
}
export function writeReplayReport(path,report){writeFileSync(path,JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});}
