import type { AuthoredQuestion } from './model.ts';

// Concrete words that a child can name from a picture, without having to read.
const pairs = [
  ['kat', 'rat'],
  ['maan', 'haan'],
  ['huis', 'muis'],
  ['haas', 'vaas'],
  ['beer', 'peer'],
  ['boek', 'koek'],
  ['bal', 'kwal'],
  ['sok', 'rok'],
  ['pet', 'net'],
  ['kip', 'wip'],
  ['dak', 'zak'],
  ['tak', 'pak'],
  ['neus', 'reus'],
  ['doek', 'broek'],
  ['hand', 'mand'],
  ['tas', 'jas'],
  ['kist', 'mist'],
  ['boot', 'noot'],
  ['slak', 'tak'],
  ['haai', 'kraai'],
  ['veer', 'beer'],
  ['steen', 'been'],
  ['trein', 'fontein'],
  ['bos', 'vos'],
  ['draak', 'haak'],
  ['pot', 'slot'],
  ['muur', 'vuur'],
  ['schaap', 'aap'],
  ['gras', 'jas'],
  ['pan', 'kan'],
  ['bel', 'spel'],
  ['mus', 'bus'],
  ['pop', 'sop'],
  ['mat', 'rat'],
  ['hoed', 'voet'],
  ['kaas', 'vaas'],
  ['kroon', 'boon'],
  ['peer', 'veer'],
  ['geit', 'krijt'],
  ['roos', 'doos'],
] as const;

const existing: Record<string, string> = {
  kat: 'cat',
  maan: 'moon',
  huis: 'house',
  muis: 'mouse',
  beer: 'bear',
  peer: 'pear',
  boek: 'book',
  sok: 'sock',
  kip: 'hen',
  boot: 'boat',
  vos: 'fox',
  bus: 'bus',
  roos: 'rose',
};
export const rhymePictures: Record<string, string> = Object.fromEntries(
  [...new Set(pairs.flat())].map((word) => [word, existing[word] ?? `word-${word}`]),
);
export const RHYME_ART_KINDS = Object.values(rhymePictures).filter((kind) => kind.startsWith('word-'));
// Final d/t and ij/ei sound alike in these regular Dutch rhyme words.
const ending = (word: string) =>
  word
    .match(/[aeiouy]+[^aeiouy]*$/)![0]
    .replaceAll('ij', 'ei')
    .replace(/d$/, 't');

export function rhymesBank(): AuthoredQuestion[] {
  const words = Object.keys(rhymePictures);
  return pairs.map(([word, answer], i) => {
    const offset = (i * 11) % words.length,
      rotated = [...words.slice(offset), ...words.slice(0, offset)];
    const id = i < 10 ? `rhyme-${i}` : `extra-rhyme-${i - 10}`;
    return {
      id,
      prompt: `Wat rijmt op ${word}?`,
      rhyme: { word },
      choices: [answer, ...rotated.filter((other) => ending(other) !== ending(word)).slice(0, 3)],
      answer,
      hint:
        i < 10
          ? `Luister naar het einde van ${word} en van de andere woorden.`
          : 'Luister goed naar het einde van de woorden. Welke woorden klinken aan het einde hetzelfde?',
      audio: `/audio/${id}.m4a`,
      ...(i >= 10 ? { hintAudio: '/audio/extra-rhyme-hint.m4a' } : {}),
    };
  });
}
