import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activities } from '../src/content.ts';
import { makeAdaptiveRound } from '../src/learning/adaptive.ts';
import { MAX_REPEATS, newRound, revealed, willRepeat } from '../src/learning/round-state.ts';

const shapes = activities(2).find((activity) => activity.id === 'vormen')!;

test('A new round starts at the first question with nothing answered', () => {
  const questions = makeAdaptiveRound(2, 'vormen', 0, undefined);
  const round = newRound(shapes, questions, 3, 1);
  assert.equal(round.base, questions.length);
  assert.equal(round.index, 0);
  assert.equal(round.previousRounds, 3);
  assert.equal(round.difficulty, 1);
  assert.equal(revealed(round), false);
});

test('The answer is shown after two wrong tries and the question comes back at most twice per round', () => {
  const questions = makeAdaptiveRound(2, 'vormen', 0, undefined);
  const round = { ...newRound(shapes, questions, 0), tries: 2 };
  assert.equal(revealed(round), true);
  assert.equal(willRepeat(round), true);
  const full = { ...round, questions: [...questions, ...questions.slice(0, MAX_REPEATS)] };
  assert.equal(willRepeat(full), false);
  // A question that already came back is not added again.
  assert.equal(willRepeat({ ...round, index: round.base, questions: [...questions, questions[0]] }), false);
});
