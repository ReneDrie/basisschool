// Authoring only: playback on a child's device never uses a speech service.
// By default create missing files; use --force after changing existing speech text.
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { GROUPS, activities, audioFragments, questionBank } from '../src/content.ts';

const publicDirectory = new URL('../public/', import.meta.url);
mkdirSync(new URL('audio/', publicDirectory), { recursive: true });
const questions=GROUPS.flatMap(group=>activities(group).flatMap(activity=>questionBank(group,activity.id)));
const fragments=audioFragments(questions);
const prefix=process.argv.find(arg=>arg.startsWith('--prefix='))?.slice('--prefix='.length);
const temporary=mkdtempSync(join(tmpdir(),'ontdekkers-audio-'));
let created=0;
try {
  for (const [path, text] of fragments) {
    if(prefix&&!path.startsWith(`/audio/${prefix}`))continue;
    const target=new URL(path.slice(1),publicDirectory);
    if(existsSync(target)&&!process.argv.includes('--force'))continue;
    const intermediate=join(temporary,'speech.aiff');
    for (const [command,args] of [
      ['say', ['-v', 'Xander', '-r', '155', '-o', intermediate, text]],
      ['ffmpeg', ['-loglevel', 'error', '-y', '-i', intermediate, '-c:a', 'aac', '-b:a', '64k', target.pathname]]
    ]) {
      const result=spawnSync(command,args,{encoding:'utf8'});
      if(result.status!==0) throw new Error(`${command}: ${result.stderr||result.error}`);
    }
    created++;
    if(created%25===0)console.log(`${created} nieuwe luisterfragmenten gemaakt…`);
  }
} finally { rmSync(temporary,{recursive:true,force:true}); }
console.log(`${created} luisterfragmenten gemaakt; ${fragments.size} fragmenten in het volledige aanbod.`);
