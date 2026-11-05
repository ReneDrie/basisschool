// Authoring only: playback on a child's device never uses a speech service.
// By default create missing files; use --force after changing existing speech text.
import { existsSync, mkdirSync, mkdtempSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { GROUPS, activities, audioFragments, questionBank } from '../src/content.ts';

const publicDirectory = new URL('../public/', import.meta.url);
mkdirSync(new URL('audio/', publicDirectory), { recursive: true });
const questions=GROUPS.flatMap(group=>activities(group).flatMap(activity=>questionBank(group,activity.id)));
const fragments=audioFragments(questions);
const prefix=process.argv.find(arg=>arg.startsWith('--prefix='))?.slice('--prefix='.length);
const voice=process.argv.find(arg=>arg.startsWith('--voice='))?.slice('--voice='.length)??'Ellen';
const rate=Number(process.argv.find(arg=>arg.startsWith('--rate='))?.slice('--rate='.length)??125);
const encoder=process.argv.find(arg=>arg.startsWith('--encoder='))?.slice('--encoder='.length)??'ffmpeg';
if(!['ffmpeg','afconvert'].includes(encoder))throw new Error('Gebruik --encoder=ffmpeg of --encoder=afconvert.');
if(!voice||!Number.isInteger(rate)||rate<80||rate>220)throw new Error('Kies een stem en een geheel spreektempo tussen 80 en 220 woorden per minuut.');
// Independent shards can be generated in parallel without sharing temporary files.
const shard=process.argv.find(arg=>arg.startsWith('--shard='))?.slice('--shard='.length)??'0/1';
if(!/^\d+\/\d+$/.test(shard))throw new Error('Gebruik --shard=0/4 tot en met --shard=3/4 voor vier parallelle delen.');
const [shardIndex,shardCount]=shard.split('/').map(Number);
if(!Number.isSafeInteger(shardCount)||shardCount<1||shardIndex>=shardCount)throw new Error('Ongeldig deelnummer.');
const temporary=mkdtempSync(join(tmpdir(),'ontdekkers-audio-'));
let created=0;
console.log(`Stem: ${voice}; tempo: ${rate} woorden per minuut; 180 ms aanloop en 320 ms rust na elk fragment.`);
try {
  for (const [index,[path, text]] of [...fragments].entries()) {
    if(index%shardCount!==shardIndex)continue;
    if(prefix&&!path.startsWith(`/audio/${prefix}`))continue;
    const target=new URL(path.slice(1),publicDirectory);
    if(existsSync(target)&&!process.argv.includes('--force'))continue;
    const intermediate=join(temporary,'speech.aiff');
    const encoded=join(temporary,'speech.m4a');
    const spokenText=encoder==='afconvert'?`[[slnc 180]] ${text} [[slnc 320]]`:text;
    for (const [command,args] of [
      ['say', ['-v', voice, '-r', String(rate), '-o', intermediate, spokenText]],
      encoder==='afconvert'?['afconvert',['-f','m4af','-d','aac','-b','64000',intermediate,encoded]]:
        ['ffmpeg', ['-loglevel', 'error', '-y', '-i', intermediate, '-af', 'adelay=180:all=1,apad=pad_dur=0.32', '-c:a', 'aac', '-b:a', '64k', encoded]]
    ]) {
      const result=spawnSync(command,args,{encoding:'utf8'});
      if(result.status!==0) throw new Error(`${command}: ${result.stderr||result.error}`);
    }
    renameSync(encoded,target);
    created++;
    if(created%25===0)console.log(`${created} nieuwe luisterfragmenten gemaakt…`);
  }
} finally { rmSync(temporary,{recursive:true,force:true}); }
console.log(`${created} luisterfragmenten gemaakt; ${fragments.size} fragmenten in het volledige aanbod.`);
