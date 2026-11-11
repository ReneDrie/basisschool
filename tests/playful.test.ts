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
import { detectiveBank, placeTrainItem, trainBank, trainOrder, trainResponse } from '../src/learning/playful.ts';
import { ART_KINDS } from '../src/art-catalog.ts';
import { emptyProfile, parseBackup, rememberQuestions, reward } from '../src/storage.ts';

const games = ['getallentrein', 'speurneus'] as const;
test('Both games offer two stable, varied levels in every group', () => {
  for (const group of GROUPS) {
    assert.deepEqual(trainBank(group), trainBank(group));
    assert.deepEqual(detectiveBank(group), detectiveBank(group));
    for (const skill of games) {
      assert.ok(activities(group).some((a) => a.id === skill));
      assert.deepEqual(availableLevels(group, skill), [1, 2]);
      const bank = questionBank(group, skill);
      assert.equal(new Set(bank.map(questionKey)).size, bank.length);
      for (const level of [1, 2])
        assert.ok(bank.filter((q) => q.difficulty === level).length >= 48, `${group} ${skill} ${level}`);
      assert.ok(bank.every((q) => q.choices.length === 0 && !q.openAnswer));
    }
  }
});
test('Train checks the complete permutation, compares fraction values and keeps numbers appropriate to the group', () => {
  for (const group of GROUPS)
    for (const q of questionBank(group, 'getallentrein')) {
      const task = q.train!,
        order = trainOrder(task);
      assert.ok(isCorrectAnswer(q, trainResponse(task, order)));
      assert.ok(!isCorrectAnswer(q, trainResponse(task, [...order].reverse())));
      for (const invalid of [[], order.slice(1), [...order.slice(1), order[1]], [...order.slice(1), 'unknown']])
        assert.equal(trainResponse(task, invalid), 'nog-niet-klaar');
      const values = order.map((id) => {
        const item = task.items.find((i) => i.id === id)!;
        assert.ok(item.denominator > 0);
        return item.numerator / item.denominator;
      });
      assert.equal(new Set(values).size, values.length);
      for (let i = 1; i < values.length; i++) assert.ok(task.descending ? values[i - 1] > values[i] : values[i - 1] < values[i]);
      if (group <= 4)
        assert.ok(values.every((value) => Number.isInteger(value) && value <= (group === 2 ? 10 : group === 3 ? 20 : 100)));
      if (group === 5 && q.difficulty === 2) assert.ok(task.items.some((item) => item.denominator > 1));
      assert.equal(repetitionKey(q), repetitionKey({ ...q, train: { ...task, items: [...task.items].reverse() } }));
    }
});
test('Moving train cards supports swapping, replacing and returning cards without duplication', () => {
  const task = questionBank(2, 'getallentrein')[0].train!,
    [a, b, c] = task.items.map((i) => i.id);
  let slots = task.items.map(() => null) as (string | null)[];
  slots = placeTrainItem(task, slots, a, 0);
  slots = placeTrainItem(task, slots, b, 1);
  assert.deepEqual(placeTrainItem(task, slots, a, 1), [b, a, null]);
  assert.deepEqual(placeTrainItem(task, slots, c, 0), [c, b, null]);
  assert.deepEqual(placeTrainItem(task, slots, a, null), [null, b, null]);
  assert.deepEqual(placeTrainItem(task, slots, 'invalid', 0), slots);
  assert.deepEqual(placeTrainItem(task, slots, a, 99), slots);
  assert.deepEqual(placeTrainItem(task, slots, a, 0), slots);
  assert.deepEqual(slots, [a, b, null]);
});
test('Every detective board has exactly one outlier for its stated rule', () => {
  const animalNames = new Set(['vos', 'konijn', 'kat', 'vis', 'koe', 'leeuw', 'beer', 'kikker']);
  const fruitNames = new Set(['appel', 'peer', 'banaan', 'druif', 'sinaasappel', 'aardbei']);
  const singles = new Set(['boek', 'stoel', 'fiets', 'hond', 'kat', 'boom', 'bloem', 'huis']);
  for (const group of GROUPS)
    for (const q of questionBank(group, 'speurneus')) {
      const task = q.detective!;
      assert.equal(task.cards.length, 4);
      assert.equal(new Set(task.cards.map((c) => c.id)).size, 4);
      const values = task.cards.map((card) => {
        const face = card.face;
        if (face.kind === 'art') {
          assert.ok(ART_KINDS.includes(face.art as (typeof ART_KINDS)[number]));
          return (task.category === 'animals' ? animalNames : fruitNames).has(face.label) ? 1 : 0;
        }
        if (face.kind === 'count') {
          assert.ok(face.count > 0 && face.count <= 8);
          assert.ok(ART_KINDS.includes(face.art as (typeof ART_KINDS)[number]));
          return face.count;
        }
        assert.equal(face.kind, 'text');
        if (face.kind !== 'text') throw new Error('Unexpected diagram');
        if (task.category === 'words') return (task.clue === 'Dieren' ? animalNames : fruitNames).has(face.text) ? 1 : 0;
        if (task.category === 'sums') {
          const [a, b] = face.text.split(' + ').map(Number);
          assert.ok(a >= 0 && b >= 0 && a + b <= 20);
          return a + b;
        }
        if (task.category === 'tables') return Number(face.text) % Number(task.clue!.match(/\d+/)![0]) === 0 ? 1 : 0;
        if (task.category === 'plurals') return singles.has(face.text) ? 0 : 1;
        if (task.category === 'fractions') {
          const [n, d] = face.text.split('/').map(Number);
          assert.ok(d > 0);
          return n / d;
        }
        const [n, unit] = face.text.split(' ');
        return Number(n) * { m: 1000, dm: 100, cm: 10, mm: 1 }[unit]!;
      });
      const oddIndex = values.findIndex((value) => values.filter((other) => other === value).length === 1);
      assert.ok(oddIndex >= 0, `${q.id}: ${values}`);
      assert.equal(values.filter((value) => value !== values[oddIndex]).length, 3);
      assert.equal(new Set(values.filter((_, i) => i !== oddIndex)).size, 1);
      assert.equal(q.answer, task.cards[oddIndex].id);
      for (const card of task.cards) assert.equal(isCorrectAnswer(q, card.id), card.id === q.answer);
      assert.equal(repetitionKey(q), repetitionKey({ ...q, detective: { ...task, cards: [...task.cards].reverse() } }));
    }
});
test('Fresh rounds avoid earlier puzzles, balance detective categories, and new progress survives a backup', () => {
  for (const group of GROUPS)
    for (const skill of games)
      for (const level of [1, 2] as const) {
        let profile = emptyProfile('Speurneus', '🦊', group);
        const seen = new Set<string>();
        for (let n = 0; n < 3; n++) {
          const key = `${group}:${skill}` as const,
            round = makeRound(group, skill, level, profile.recentQuestions?.[key], profile.recentConcepts?.[key]);
          assert.equal(round.length, QUESTIONS_PER_ADVENTURE[group]);
          for (const q of round) {
            assert.ok(!seen.has(questionKey(q)));
            seen.add(questionKey(q));
            assert.equal(q.difficulty, level);
          }
          if (group === 2 && skill === 'speurneus' && level === 1)
            assert.equal(round.filter((q) => q.detective?.category === 'fruit').length, 3);
          profile = rememberQuestions(profile, round);
        }
        const won = reward(profile, skill);
        assert.equal(won.stars, 1);
        assert.equal(won.skills[skill], 1);
        assert.deepEqual(parseBackup(JSON.stringify({ app: 'kleine-ontdekkers', version: 1, profiles: [won] })), [won]);
      }
});
test('Shared local recordings have consistent instructions and exist for both games', () => {
  const questions = GROUPS.flatMap((group) => games.flatMap((skill) => questionBank(group, skill))),
    audio = audioFragments(questions);
  for (const q of questions) {
    assert.equal(audio.get(q.audio!), q.prompt);
    assert.equal(audio.get(q.hintAudio!), q.hint);
  }
  for (const path of audio.keys())
    if (path.startsWith('/audio/train-') || path.startsWith('/audio/detective-'))
      assert.ok(statSync(new URL(`../public${path}`, import.meta.url)).size > 1000, path);
});
