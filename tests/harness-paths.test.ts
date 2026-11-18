import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,symlinkSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {harnessSource} from '../src/lab.ts';
import {patchHarnessSource} from '../src/patch-lab.ts';
test('runnable exports execute through symlinked directory paths',()=>{
 const dir=mkdtempSync(join(tmpdir(),'seam-path-'));
 try {symlinkSync(dir,join(dir,'alias'),'dir');for(const [name,source] of [['money',harnessSource()],['patch',patchHarnessSource()]]){writeFileSync(join(dir,`${name}.mjs`),source);const file=join(dir,'alias',`${name}.mjs`);const original=spawnSync(process.execPath,[file],{encoding:'utf8'});assert.equal(original.status,1,original.stderr);assert.match(original.stdout,/passed/);assert.equal(spawnSync(process.execPath,[file,'--fixed']).status,0);}}finally{rmSync(dir,{recursive:true,force:true});}
});
