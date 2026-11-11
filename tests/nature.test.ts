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
import { natureBank, natureLabelAudio, natureResponse } from '../src/learning/nature.ts';
import { ART_KINDS } from '../src/art-catalog.ts';
import { makeAdaptiveRound, type PracticeResult } from '../src/learning/adaptive.ts';
import { emptyProfile, rememberQuestions, reward, parseBackup } from '../src/storage.ts';

test('Nature missions have two stable levels in every group with varied questions and illustrations', () => {
  for (const group of GROUPS) {
    assert.ok(activities(group).some((a) => a.id === 'natuurmissies'));
    assert.deepEqual(availableLevels(group, 'natuurmissies'), [1, 2]);
    assert.deepEqual(natureBank(group), natureBank(group));
    const bank = questionBank(group, 'natuurmissies');
    assert.equal(new Set(bank.map(questionKey)).size, bank.length);
    for (const level of [1, 2])
      assert.ok(bank.filter((q) => q.difficulty === level).length >= QUESTIONS_PER_ADVENTURE[group] * 2);
    for (const q of bank) {
      assert.equal(q.choices.length, 0);
      assert.ok(!q.openAnswer);
      assert.ok(q.nature!.instruction.length > 10);
      for (const i of [...q.nature!.items, ...(q.nature!.targets ?? [])])
        assert.ok(ART_KINDS.includes(i.picture as (typeof ART_KINDS)[number]), i.picture);
    }
  }
});
test('Sorting and ordering require every distinct card exactly once; partial and duplicate boards fail', () => {
  for (const group of GROUPS)
    for (const q of questionBank(group, 'natuurmissies')) {
      const task = q.nature!;
      assert.equal(new Set(task.items.map((i) => i.id)).size, task.items.length);
      if (task.kind === 'choose') {
        assert.equal(task.items.length, 4);
        assert.equal(new Set(task.items.map((i) => i.label)).size, 4);
        assert.equal(task.items.filter((i) => i.id === q.answer).length, 1);
        for (const i of task.items) assert.equal(isCorrectAnswer(q, i.id), i.id === q.answer);
        const illustrated = task.items.filter((i) => i.picture !== 'nature-question').length;
        assert.ok(illustrated === 0 || illustrated === 4, 'Never illustrate only the correct answer');
      } else {
        const ids = task.items.map((i) => i.id);
        assert.ok(isCorrectAnswer(q, natureResponse(task, ids)));
        assert.ok(!isCorrectAnswer(q, natureResponse(task, [...ids].reverse())));
        for (const invalid of [[], ids.slice(1), [...ids.slice(1), ids[1]], [...ids.slice(1), 'unknown']])
          assert.equal(natureResponse(task, invalid), 'nog-niet-klaar');
        if (task.kind === 'sort') {
          assert.equal(task.targets!.length, ids.length);
          assert.equal(new Set(task.targets!.map((t) => t.label)).size, ids.length);
        } else assert.ok(/Begin bij|Begin wanneer/.test(task.instruction), 'Cycles must have an explicit starting point');
      }
      assert.equal(repetitionKey(q), repetitionKey({ ...q, nature: { ...task, items: [...task.items].reverse() } }));
    }
});
test('Life cycles, food chains and the starting season have the intended factual order', () => {
  const bank = questionBank(3, 'natuurmissies').filter((q) => q.nature?.kind === 'order');
  const order = (theme: string) => bank.find((q) => q.nature!.theme === theme)!.nature!.items.map((i) => i.label);
  assert.deepEqual(order('vlinder'), ['ei', 'rups', 'pop', 'vlinder']);
  assert.deepEqual(order('kikker'), ['kikkerdril', 'kikkervisje', 'jonge kikker met een staartje', 'volwassen kikker']);
  assert.deepEqual(order('seizoenen'), ['lente', 'zomer', 'herfst', 'winter']);
  assert.deepEqual(order('blad en rups'), ['blad', 'rups', 'koolmees', 'sperwer']);
  assert.deepEqual(order('gras en konijn'), ['gras', 'konijn', 'vos']);
  for (const q of questionBank(5, 'natuurmissies'))
    if (q.nature!.kind === 'order')
      assert.ok(
        !['vlinder', 'kip', 'seizoenen', 'kikker'].includes(q.nature!.theme),
        'Older groups use processes and food chains',
      );
});
test('Mixed missions, explicit steps and island progression stay within the chosen group and history survives backup', () => {
  const strong: PracticeResult[] = Array.from({ length: 24 }, () => ({ level: 2, independent: true }));
  for (const group of GROUPS) {
    let profile = emptyProfile('Boswachter', '🦊', group);
    const seen = new Set<string>();
    for (let n = 0; n < 2; n++) {
      const round = makeRound(
        group,
        'natuurmissies',
        undefined,
        profile.recentQuestions?.[`${group}:natuurmissies`],
        profile.recentConcepts?.[`${group}:natuurmissies`],
      );
      assert.equal(round.length, QUESTIONS_PER_ADVENTURE[group]);
      for (const q of round) {
        assert.ok(!seen.has(questionKey(q)));
        seen.add(questionKey(q));
      }
      profile = rememberQuestions(profile, round);
    }
    const advanced = makeAdaptiveRound(group, 'natuurmissies', 260, strong);
    assert.ok(advanced.every((q) => q.group === group && !q.challengeGroup));
    for (const level of [1, 2] as const)
      assert.ok(makeAdaptiveRound(group, 'natuurmissies', 260, strong, level).every((q) => q.difficulty === level));
    const won = reward(profile, 'natuurmissies');
    assert.equal(won.skills.natuurmissies, 1);
    assert.equal(won.stars, 1);
    assert.deepEqual(parseBackup(JSON.stringify({ app: 'kleine-ontdekkers', version: 1, profiles: [won] })), [won]);
  }
});
test('Every instruction, hint, option and target label has consistent local voice audio', () => {
  const all = GROUPS.flatMap((g) => questionBank(g, 'natuurmissies')),
    audio = audioFragments(all);
  for (const q of all) {
    assert.equal(audio.get(q.audio!), q.prompt);
    assert.equal(audio.get(q.hintAudio!), q.hint);
    assert.equal(audio.get(natureLabelAudio(q.nature!.instruction)), q.nature!.instruction);
    for (const item of [...q.nature!.items, ...(q.nature!.targets ?? [])])
      assert.equal(audio.get(natureLabelAudio(item.label)), item.label);
  }
  for (const [path] of audio)
    if (path.startsWith('/audio/nature-')) assert.ok(statSync(new URL(`../public${path}`, import.meta.url)).size > 1000, path);
});
