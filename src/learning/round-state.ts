import type { PracticeResult } from './adaptive.ts';
import type { Activity, Difficulty, Question } from './model.ts';

/**
 * One round in progress.
 * base: the planned questions; anything after it is a question that comes back after the answer was shown.
 * tries: wrong tries on the current question.
 */
export type Round = {
  results: PracticeResult[];
  difficulty?: Difficulty;
  activity: Activity;
  questions: Question[];
  base: number;
  index: number;
  selected: string | null;
  tries: number;
  mistakes: number;
  hint: boolean;
  correct: number;
  helped: boolean;
  done: boolean;
  saved: boolean;
  previousRounds: number;
};

export const MAX_REPEATS = 2;

export function newRound(activity: Activity, questions: Question[], previousRounds: number, difficulty?: Difficulty): Round {
  return {
    results: [],
    activity,
    difficulty,
    questions,
    base: questions.length,
    index: 0,
    selected: null,
    tries: 0,
    mistakes: 0,
    hint: false,
    correct: 0,
    helped: false,
    done: false,
    saved: false,
    previousRounds,
  };
}

/** Plain multiple-choice and open questions can show their answer after two wrong tries; the games keep their own hints. */
export function revealable(question: Question): boolean {
  return !(
    question.nature ||
    question.soundStudio ||
    question.bus ||
    question.language ||
    question.train ||
    question.detective ||
    question.matching ||
    question.story ||
    question.building ||
    question.shop
  );
}

/** After two wrong tries the answer is shown, and the question comes back once at the end of the round. */
export const revealed = (round: Round) => round.tries >= 2 && revealable(round.questions[round.index]);
export const willRepeat = (round: Round) =>
  revealed(round) && round.index < round.base && round.questions.length - round.base < MAX_REPEATS;
