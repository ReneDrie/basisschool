import { test } from 'node:test';
import assert from 'node:assert/strict';
import { questionBank, makeRound, questionKey, audioFragments, choiceAudioPath } from '../src/content.ts';
import { rhymePictures } from '../src/learning/rhymes.ts';
import { ART_KINDS, pictureKinds } from '../src/art-catalog.ts';
import { emptyProfile, rememberQuestions } from '../src/storage.ts';

// Spoken rhyme families, independent of how the question bank picks distractors.
const families = [
  'kat rat mat',
  'maan haan',
  'huis muis',
  'haas vaas kaas',
  'beer peer veer',
  'boek koek doek broek',
  'bal kwal',
  'sok rok',
  'pet net',
  'kip wip',
  'dak zak tak pak slak',
  'neus reus',
  'hand mand',
  'tas jas gras',
  'kist mist',
  'boot noot',
  'haai kraai',
  'steen been',
  'trein fontein',
  'bos vos',
  'draak haak',
  'pot slot',
  'muur vuur',
  'schaap aap',
  'pan kan',
  'bel spel',
  'mus bus',
  'pop sop',
  'hoed voet',
  'kroon boon',
  'geit krijt',
  'roos doos',
].map((words) => words.split(' '));

test('Every rhyme prompt and all four answers have native illustrations and matching optional speech', () => {
  const bank = questionBank(2, 'taal'),
    fragments = audioFragments(bank);
  assert.equal(bank.length, 40);
  for (const q of bank) {
    assert.ok(q.rhyme);
    assert.equal(q.prompt, `Wat rijmt op ${q.rhyme.word}?`);
    for (const word of [q.rhyme.word, ...q.choices]) {
      assert.ok(rhymePictures[word], `${q.id}: missing picture for ${word}`);
      assert.ok(ART_KINDS.includes(rhymePictures[word]), word);
    }
    assert.equal(
      new Set([q.rhyme.word, ...q.choices].map((word) => rhymePictures[word])).size,
      5,
      'Each option and the prompt need distinguishable artwork',
    );
    assert.equal(fragments.get(q.audio!), q.prompt);
    assert.equal(q.choiceAudio, true);
    for (const word of q.choices) assert.equal(fragments.get(choiceAudioPath(word)), word);
    const family = families.find((words) => words.includes(q.rhyme!.word));
    assert.ok(family, q.rhyme.word);
    assert.deepEqual(
      q.choices.filter((word) => family.includes(word)),
      [q.answer],
      q.prompt,
    );
  }
});
test('Picture-rhyme adventures exhaust fresh questions before reusing them and preserve existing semantic keys', () => {
  let profile = emptyProfile('Rijmer', '🦊', 2);
  const seen = new Set<string>();
  for (let i = 0; i < 6; i++) {
    const round = makeRound(2, 'taal', 1, profile.recentQuestions?.['2:taal'], profile.recentConcepts?.['2:taal']);
    for (const q of round) {
      assert.ok(q.rhyme);
      assert.equal(q.answerMode, 'choice');
      assert.ok(!seen.has(questionKey(q)));
      seen.add(questionKey(q));
    }
    profile = rememberQuestions(profile, round);
  }
  assert.equal(seen.size, 36);
  const next = makeRound(2, 'taal', 1, profile.recentQuestions?.['2:taal'], profile.recentConcepts?.['2:taal']);
  assert.equal(next.filter((q) => !seen.has(questionKey(q))).length, 4);
  for (const q of next) seen.add(questionKey(q));
  assert.equal(seen.size, 40);
  const kat = questionBank(2, 'taal').find((q) => q.rhyme!.word === 'kat')!;
  assert.equal(
    questionKey(kat),
    questionKey({ ...kat, rhyme: undefined }),
    'Adding a picture must not erase the earlier question history',
  );
});
test('Reading and spelling exercises retain word choices without picture clues', () => {
  for (const word of Object.keys(rhymePictures))
    assert.equal(pictureKinds[word], undefined, 'Rhyme images must not globally replace written words');
  for (const group of [3, 4, 5] as const)
    for (const q of questionBank(group, 'taal')) {
      assert.equal(q.rhyme, undefined);
    }
});
