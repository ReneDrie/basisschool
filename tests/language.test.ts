import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import {
  activities,
  availableLevels,
  audioFragments,
  GROUPS,
  isCorrectAnswer,
  makeRound,
  questionBank,
  questionKey,
  repetitionKey,
  QUESTIONS_PER_ADVENTURE,
} from '../src/content.ts';
import { languageResponse, sentenceBuilderBank, wordFactoryBank, wordPieces } from '../src/learning/language.ts';
import { placeBoardTile } from '../src/learning/tiles.ts';
import { ART_KINDS } from '../src/art-catalog.ts';
import { emptyProfile, parseBackup, rememberQuestions, reward } from '../src/storage.ts';

const languages = (group: number) => (group === 2 ? ['woordfabriek' as const] : (['woordfabriek', 'zinnenbouwer'] as const));
test('Word factory has two age-specific levels; sentence building starts in group 3', () => {
  for (const group of GROUPS) {
    assert.deepEqual(wordFactoryBank(group), wordFactoryBank(group));
    if (group !== 2) assert.deepEqual(sentenceBuilderBank(group), sentenceBuilderBank(group));
    for (const skill of languages(group)) {
      assert.ok(activities(group).some((a) => a.id === skill));
      assert.deepEqual(availableLevels(group, skill), [1, 2]);
      const bank = questionBank(group, skill);
      assert.equal(new Set(bank.map(questionKey)).size, bank.length);
      for (const level of [1, 2])
        assert.ok(bank.filter((q) => q.difficulty === level).length >= QUESTIONS_PER_ADVENTURE[group] * 2);
      assert.ok(bank.every((q) => q.choices.length === 0 && !q.openAnswer));
    }
  }
  assert.ok(!activities(2).some((a) => a.id === 'zinnenbouwer'));
  assert.throws(() => questionBank(2, 'zinnenbouwer'));
});
test('Letters, word parts and punctuation form exactly the target and every clue is illustrated locally', () => {
  for (const group of GROUPS)
    for (const skill of languages(group))
      for (const q of questionBank(group, skill)) {
        const task = q.language!,
          ids = task.items.map((item) => item.id);
        assert.equal(new Set(ids).size, ids.length);
        assert.ok(task.items.every((item) => item.label.length > 0));
        assert.equal(languageResponse(task, ids), task.target);
        assert.ok(isCorrectAnswer(q, languageResponse(task, ids)));
        assert.equal(task.target, q.answer);
        assert.ok(task.items.length <= 12, q.id);
        assert.ok(ART_KINDS.includes(task.picture as (typeof ART_KINDS)[number]), `${q.id}: ${task.picture}`);
        for (const invalid of [[], ids.slice(1), [...ids.slice(1), 'invalid'], [...ids.slice(1), ids[1]]])
          assert.equal(languageResponse(task, invalid), 'nog-niet-klaar');
        const reversed = languageResponse(task, [...ids].reverse());
        if (reversed !== task.target) assert.ok(!isCorrectAnswer(q, reversed));
        assert.equal(task.model, group === 2);
        assert.equal(repetitionKey(q), repetitionKey({ ...q, language: { ...task, items: [...task.items].reverse() } }));
        if (task.kind === 'sentence') {
          assert.match(task.target, /^[A-Z].*[.?]$/);
          assert.equal(task.items.at(-1)!.label, task.target.at(-1));
          assert.equal(group >= 3, true);
        }
      }
});
test('Identical letters can swap places, while missing, reused and wrong letters fail', () => {
  const q = questionBank(3, 'woordfabriek').find((q) => q.answer === 'peer')!,
    task = q.language!,
    ids = task.items.map((item) => item.id);
  assert.deepEqual(
    task.items.map((i) => i.label),
    ['p', 'e', 'e', 'r'],
  );
  [ids[1], ids[2]] = [ids[2], ids[1]];
  assert.ok(isCorrectAnswer(q, languageResponse(task, ids)));
  ids[3] = ids[1];
  assert.equal(languageResponse(task, ids), 'nog-niet-klaar');
  const katten = questionBank(4, 'woordfabriek').find((q) => q.answer === 'katten')!.language!;
  const t = katten.items.filter((i) => i.label === 't');
  assert.equal(t.length, 2);
  const slots = katten.items.map((i) => i.id);
  const exchanged = placeBoardTile(katten.items, slots, t[0].id, slots.indexOf(t[1].id));
  assert.equal(languageResponse(katten, exchanged), 'katten');
  assert.equal(new Set(exchanged).size, katten.items.length);
});
test('Word groups preserve all characters and sentence punctuation has the right spacing', () => {
  for (const word of ['schrijven', 'nieuwsgierig', 'sneeuwpop', 'bibliotheek', 'vriendelijk', 'boodschappentas'])
    assert.equal(wordPieces(word).join(''), word);
  assert.deepEqual(wordPieces('schip'), ['sch', 'i', 'p']);
  const q = questionBank(5, 'zinnenbouwer').find((q) => q.answer.includes(','))!,
    task = q.language!;
  const result = languageResponse(
    task,
    task.items.map((i) => i.id),
  );
  assert.equal(result, q.answer);
  assert.ok(!result.includes(' ,'));
  assert.ok(!result.includes(' .'));
  const reversed = task.items.map((i) => i.id).reverse();
  assert.ok(!isCorrectAnswer(q, languageResponse(task, reversed)));
});
test('New rounds avoid the previous round and rewards and history survive backups', () => {
  for (const group of GROUPS)
    for (const skill of languages(group))
      for (const level of [1, 2] as const) {
        let profile = emptyProfile('Taalbouwer', '🦊', group);
        const seen = new Set<string>();
        for (let n = 0; n < 2; n++) {
          const key = `${group}:${skill}` as const,
            round = makeRound(group, skill, level, profile.recentQuestions?.[key], profile.recentConcepts?.[key]);
          assert.equal(round.length, QUESTIONS_PER_ADVENTURE[group]);
          for (const q of round) {
            assert.ok(!seen.has(questionKey(q)), q.id);
            seen.add(questionKey(q));
            assert.equal(q.difficulty, level);
          }
          profile = rememberQuestions(profile, round);
        }
        const won = reward(profile, skill);
        assert.equal(won.skills[skill], 1);
        assert.equal(won.stars, 1);
        assert.deepEqual(parseBackup(JSON.stringify({ app: 'kleine-ontdekkers', version: 1, profiles: [won] })), [won]);
      }
});
test('Instructions, hints and spoken target words and sentences have consistent local recordings', () => {
  const questions = GROUPS.flatMap((group) => languages(group).flatMap((skill) => questionBank(group, skill))),
    audio = audioFragments(questions);
  for (const q of questions) {
    assert.equal(audio.get(q.audio!), q.prompt);
    assert.equal(audio.get(q.hintAudio!), q.hint);
    assert.equal(audio.get(q.language!.targetAudio), q.answer);
  }
  for (const [path] of audio)
    if (path.startsWith('/audio/language-')) assert.ok(statSync(new URL(`../public${path}`, import.meta.url)).size > 1000, path);
});
