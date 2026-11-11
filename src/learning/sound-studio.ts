import type { AuthoredQuestion } from './model.ts';
import { rhymePictures } from './rhymes.ts';

// IPA is used only by the authoring tool. The app plays local sound files.
// In particular m, n and s must be sounds, never the letter names em, en, es.
export const PHONEMES: Record<string, string> = {
  a: 'ɑ',
  e: 'ɛ',
  i: 'ɪ',
  o: 'ɔ',
  u: 'ʏ',
  aa: 'aː',
  ee: 'eː',
  oo: 'oː',
  uu: 'yː',
  oe: 'uː',
  eu: 'øː',
  ui: 'œy',
  ei: 'ɛi',
  ij: 'ɛi',
  m: 'mː',
  n: 'nː',
  s: 'sː',
  v: 'vː',
  f: 'fː',
  h: 'h',
  r: 'r',
  l: 'lː',
  k: 'k',
  t: 't',
  p: 'p',
  b: 'b',
  d: 'd',
  z: 'zː',
  j: 'j',
  w: 'ʋ',
  g: 'ɣ',
  ch: 'x',
};
export const phonemeAudio = (sound: string) => `/audio/klank-phoneme-${sound}.m4a`;
export type SoundTask = { word: string; sounds: string[]; options: { word: string; picture: string }[]; wordAudio: string };
const short = [
  ['kat', 'k a t'],
  ['rat', 'r a t'],
  ['bal', 'b a l'],
  ['sok', 's o k'],
  ['rok', 'r o k'],
  ['pet', 'p e t'],
  ['net', 'n e t'],
  ['kip', 'k i p'],
  ['dak', 'd a k'],
  ['zak', 'z a k'],
  ['tak', 't a k'],
  ['pak', 'p a k'],
  ['tas', 't a s'],
  ['jas', 'j a s'],
  ['vos', 'v o s'],
  ['pan', 'p a n'],
  ['kan', 'k a n'],
  ['bel', 'b e l'],
  ['mus', 'm u s'],
  ['bus', 'b u s'],
  ['pop', 'p o p'],
  ['mat', 'm a t'],
  ['pot', 'p o t'],
] as const;
const long = [
  ['maan', 'm aa n'],
  ['haan', 'h aa n'],
  ['huis', 'h ui s'],
  ['muis', 'm ui s'],
  ['haas', 'h aa s'],
  ['vaas', 'v aa s'],
  ['beer', 'b ee r'],
  ['peer', 'p ee r'],
  ['boek', 'b oe k'],
  ['koek', 'k oe k'],
  ['boot', 'b oo t'],
  ['noot', 'n oo t'],
  ['neus', 'n eu s'],
  ['doek', 'd oe k'],
  ['voet', 'v oe t'],
  ['roos', 'r oo s'],
  ['doos', 'd oo s'],
  ['muur', 'm uu r'],
  ['vuur', 'v uu r'],
] as const;
const clusters = [
  ['kwal', 'k w a l'],
  ['kist', 'k i s t'],
  ['mist', 'm i s t'],
  ['spel', 's p e l'],
  ['draak', 'd r aa k'],
  ['kroon', 'k r oo n'],
  ['krijt', 'k r ij t'],
  ['gras', 'g r a s'],
  ['slak', 's l a k'],
  ['slot', 's l o t'],
  ['steen', 's t ee n'],
  ['trein', 't r ei n'],
  ['broek', 'b r oe k'],
  ['schaap', 's ch aa p'],
  ['plant', 'p l a n t'],
  ['fontein', 'f o n t ei n'],
] as const;
const all = [...short, ...long, ...clusters];
const picture = (word: string) => (word === 'plant' ? 'sprout' : rhymePictures[word]);
export function soundStudioBank(group: 2 | 3): AuthoredQuestion[] {
  return ([1, 2] as const).flatMap((level) => {
    const pool = group === 2 ? (level === 1 ? short : long) : level === 1 ? long : clusters;
    return pool.map(([word, sounds], index) => {
      const distractors = all.filter(([other]) => other !== word).map(([other]) => other);
      const offset = (index * 7 + group * 11 + level) % distractors.length;
      const others = [...distractors.slice(offset), ...distractors.slice(0, offset)].slice(0, 3);
      const soundStudio: SoundTask = {
        word,
        sounds: sounds.split(' '),
        options: [word, ...others].map((word) => ({ word, picture: picture(word) })),
        wordAudio: `/audio/klank-word-${word}.m4a`,
      };
      return {
        id: `studio-${group}-${level}-${word}`,
        difficulty: level,
        prompt: 'Welk woord hoor je? Luister naar de losse klanken.',
        choices: [],
        answer: word,
        soundStudio,
        hint: 'Luister naar elke klank en zeg ze daarna achter elkaar. Welk woord hoor je? Je kunt de klanken ook laten zien.',
        audio: '/audio/klank-prompt.m4a',
        hintAudio: '/audio/klank-hint.m4a',
        learningGoal: 'Losse spraakklanken samenvoegen tot een woord en het bijbehorende plaatje herkennen.',
      };
    });
  });
}
