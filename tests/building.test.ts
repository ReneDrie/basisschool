import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  QUESTIONS_PER_ADVENTURE,
  activities,
  availableLevels,
  questionBank,
  makeRound,
  questionKey,
  audioFragments,
  isCorrectAnswer,
} from '../src/content.ts';
import { orderedPlanks, orderResponse, sortResponse } from '../src/learning/building.ts';
import { emptyProfile, rememberQuestions, reward, parseBackup } from '../src/storage.ts';

test('Construction has two varied levels for groups 2 and 4, with independent persistent progress', () => {
  for (const group of [2, 4] as const) {
    assert.ok(activities(group).some((a) => a.id === 'bouwen'));
    assert.deepEqual(availableLevels(group, 'bouwen'), [1, 2]);
    const bank = questionBank(group, 'bouwen');
    assert.equal(new Set(bank.map(questionKey)).size, bank.length);
    let profile = emptyProfile('Bouwer', '🦊', group);
    for (const level of [1, 2] as const)
      for (let n = 0; n < 6; n++) {
        const recent = profile.recentQuestions?.[`${group}:bouwen`] ?? [],
          round = makeRound(group, 'bouwen', level, recent);
        assert.equal(round.length, QUESTIONS_PER_ADVENTURE[group]);
        assert.ok(round.every((q) => q.building && q.difficulty === level && !recent.includes(questionKey(q))));
        profile = rememberQuestions(profile, round);
      }
    const updated = reward(profile, 'bouwen');
    assert.equal(updated.stars, 1);
    assert.equal(updated.skills.bouwen, 1);
    assert.deepEqual(parseBackup(JSON.stringify({ app: 'kleine-ontdekkers', version: 1, profiles: [updated] })), [updated]);
  }
  for (const group of [3, 5] as const) assert.ok(!activities(group).some((a) => a.id === 'bouwen'));
});
test('Plank ordering grades the complete permutation, with no equal lengths or fixed correct position', () => {
  const orders = new Set<string>();
  for (const q of questionBank(2, 'bouwen')) {
    const task = q.building!;
    if (task.kind !== 'order') continue;
    assert.equal(new Set(task.lengths).size, task.lengths.length);
    const order = orderedPlanks(task),
      lengths = order.map((i) => task.lengths[i]);
    assert.ok(lengths.every((n, i) => !i || (task.descending ? n < lengths[i - 1] : n > lengths[i - 1])));
    assert.ok(isCorrectAnswer(q, orderResponse(task, order)));
    for (const wrong of [order.slice(1), [...order].reverse(), Array(order.length).fill(0), [...order, -1]])
      assert.ok(!isCorrectAnswer(q, orderResponse(task, wrong)));
    assert.equal(task.lengths.length, q.difficulty === 1 ? 3 : 4);
    orders.add(q.answer);
  }
  assert.ok(orders.size >= 6);
});
test('Block sorting checks every destination, regardless of colour or placement order', () => {
  for (const q of questionBank(2, 'bouwen')) {
    const task = q.building!;
    if (task.kind !== 'sort') continue;
    assert.equal(new Set(task.pieces.map((p) => p.id)).size, task.pieces.length);
    assert.equal(task.bins.length, q.difficulty === 1 ? 2 : 3);
    assert.ok(task.pieces.every((piece) => task.bins.includes(piece.shape)));
    const placements = Object.fromEntries([...task.pieces].reverse().map((p) => [p.id, p.shape]));
    assert.ok(isCorrectAnswer(q, sortResponse(task, placements)));
    const piece = task.pieces[0];
    placements[piece.id] = task.bins.find((shape) => shape !== piece.shape)!;
    assert.ok(!isCorrectAnswer(q, sortResponse(task, placements)));
    delete placements[piece.id];
    assert.ok(!isCorrectAnswer(q, sortResponse(task, placements)));
  }
});
test('Bridge lengths match the ruler endpoints and exactly one labelled board fits, including decimetres', () => {
  let decimetres = 0;
  for (const q of questionBank(4, 'bouwen')) {
    const task = q.building!;
    assert.equal(task.kind, 'measure');
    if (task.kind !== 'measure') continue;
    assert.ok(task.start >= 0 && task.end > task.start && task.end <= task.max);
    assert.equal(Number(q.answer), task.end - task.start);
    assert.equal(task.options.length, 4);
    assert.equal(new Set(task.options.map((o) => o.cm)).size, 4);
    assert.equal(task.options.filter((o) => isCorrectAnswer(q, String(o.cm))).length, 1);
    for (const option of task.options) {
      const [number, unit] = option.label.split(' ');
      assert.equal(Number(number) * (unit === 'dm' ? 10 : 1), option.cm);
      assert.ok(option.cm > 0);
      if (unit === 'dm') decimetres++;
    }
    assert.equal(task.start === 0, q.difficulty === 1);
  }
  assert.ok(decimetres > 0);
});
test('Every construction instruction and hint has consistent local speech', () => {
  const questions = [...questionBank(2, 'bouwen'), ...questionBank(4, 'bouwen')],
    audio = audioFragments(questions);
  for (const q of questions) {
    assert.equal(audio.get(q.audio!), q.prompt);
    assert.equal(audio.get(q.hintAudio!), q.hint);
  }
});
