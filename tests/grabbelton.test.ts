import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activities, GROUPS, questionKey, QUESTIONS_PER_ADVENTURE } from '../src/content.ts';
import type { PracticeResult } from '../src/learning/adaptive.ts';
import { GRABBELTON, makeMixedRound, practiceByTopic, questionActivity } from '../src/learning/grabbelton.ts';
import { emptyProfile, recordPractice, rememberQuestions, reward } from '../src/storage.ts';

test('A Grabbelton round takes each question from a different game of the group', () => {
  for (const group of GROUPS)
    for (let attempt = 0; attempt < 5; attempt++) {
      const round = makeMixedRound(group, emptyProfile('Sam', '🦊', group));
      const games = activities(group).map((a) => a.id);
      assert.equal(round.length, QUESTIONS_PER_ADVENTURE[group]);
      assert.equal(new Set(round.map(questionKey)).size, round.length);
      assert.ok(round.every((q) => q.group === group && games.includes(q.topic)));
      // Every group has at least as many games as questions, so no game comes twice.
      assert.equal(new Set(round.map((q) => q.topic)).size, round.length);
      assert.ok(round.filter((q) => q.answerMode === 'open').length <= 3);
      assert.ok(
        round.every((q) => !q.matching || q.difficulty === 1),
        'Koppelplein only offers Koppelen, no Memory',
      );
    }
});

test('Grabbelton questions use the game history and colours of the game they come from', () => {
  const profile = emptyProfile('Sam', '🦊', 4);
  const round = makeMixedRound(4, profile);
  const saved = rememberQuestions(profile, round);
  for (const q of round) {
    assert.ok(saved.recentQuestions?.[`4:${q.topic}`]?.includes(questionKey(q)));
    const game = questionActivity(GRABBELTON, q);
    assert.equal(game.id, q.topic);
  }
  // A new round avoids the questions that were just asked.
  const next = makeMixedRound(4, saved);
  const asked = new Set(round.map(questionKey));
  assert.ok(next.filter((q) => asked.has(questionKey(q))).length <= 1);
});

test('A finished Grabbelton round earns one star and records practice per game, without a play count', () => {
  const profile = emptyProfile('Sam', '🦊', 2);
  const round = makeMixedRound(2, profile);
  const results: PracticeResult[] = round.map((q, i) => ({ level: q.difficulty, independent: i % 2 === 0 }));
  const byTopic = practiceByTopic(round, results);
  assert.equal(byTopic.size, round.length);
  const won = [...byTopic].reduce((next, [topic, list]) => recordPractice(next, 2, topic, list), reward(profile, undefined));
  assert.equal(won.stars, 1);
  assert.equal(won.rounds, 1);
  assert.deepEqual(won.skills, {});
  round.forEach((q, i) => assert.deepEqual(won.practice?.[`2:${q.topic}`], [results[i]]));
});
