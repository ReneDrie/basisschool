// Native IPA synthesis, never letter-name TTS. Output is local AAC for offline use.
import { existsSync, mkdtempSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { PHONEMES, phonemeAudio } from '../src/learning/sound-studio.ts';
const temporary = mkdtempSync(join(tmpdir(), 'ontdekkers-phonemes-'));
const pending = Object.entries(PHONEMES)
  .filter(
    ([sound]) => process.argv.includes('--force') || !existsSync(new URL(`../public${phonemeAudio(sound)}`, import.meta.url)),
  )
  .map(([sound, ipa]) => ({
    sound,
    ipa,
    // Xander's phoneme inventory uses this alias for Dutch short u; verified
    // against the vowel in naturally synthesized mus, bus and put.
    engineIPA: sound === 'u' ? 'ʌ' : ipa,
    voiceName: sound === 'p' ? 'Ellen' : 'Xander',
  }));
function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 180000 });
  if (result.status !== 0) throw new Error(`${command}: ${result.stderr || result.error}`);
}
try {
  if (pending.length) {
    writeFileSync(join(temporary, 'manifest.json'), JSON.stringify(pending));
    const binary = join(temporary, 'generate');
    run('clang', [
      '-fobjc-arc',
      '-fblocks',
      '-framework',
      'Foundation',
      '-framework',
      'AVFoundation',
      fileURLToPath(new URL('generate-phonemes.m', import.meta.url)),
      '-o',
      binary,
    ]);
    run(binary, [join(temporary, 'manifest.json'), temporary]);
    for (const { sound } of pending) {
      const encoded = join(temporary, `${sound}.m4a`);
      run('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '64000', join(temporary, `${sound}.caf`), encoded]);
      renameSync(encoded, new URL(`../public${phonemeAudio(sound)}`, import.meta.url));
    }
  }
  console.log(`${pending.length} lokale klankfragmenten gemaakt met Nederlandse IPA-uitspraak.`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
