// Optional authoring utility for macOS. Runtime playback uses the generated files,
// never a speech service or a system voice on the child's device.
import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { questionBank } from '../src/content.ts';
const directory = new URL('../public/audio/', import.meta.url);
mkdirSync(directory, { recursive: true });
const fragments = new Map();
for (const skill of ['rekenen', 'taal', 'vormen', 'klanken']) {
  for (const question of questionBank(2, skill)) {
    fragments.set(question.id, question.prompt);
    fragments.set(`hint-${question.id}`, question.hint);
    if (skill === 'taal') for (const word of question.choices) fragments.set(`word-${word}`, word);
  }
}
for (const [name, text] of fragments) {
  const temporary = `/private/tmp/ontdekkers-audio-${name}.aiff`;
  for (const [command,args] of [
    ['say', ['-v', 'Xander', '-r', '155', '-o', temporary, text]],
    ['ffmpeg', ['-loglevel', 'error', '-y', '-i', temporary, '-c:a', 'aac', '-b:a', '64k', new URL(`${name}.m4a`, directory).pathname]]
  ]) {
    const result=spawnSync(command,args,{encoding:'utf8'});
    if(result.status!==0) throw new Error(`${command}: ${result.stderr}`);
  }
}
console.log(`${fragments.size} Nederlandse luisterfragmenten gemaakt.`);
