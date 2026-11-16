import { makeAdaptiveRound, type PracticeHistory, type PracticeResult } from './adaptive.ts';
import { activities } from './catalog.ts';
import { shuffle } from './rounds.ts';
import { QUESTIONS_PER_ADVENTURE, type Activity, type Group, type Question, type Skill } from './model.ts';
import type { RecentQuestions } from '../storage.ts';

/** The Grabbelton: one round with a question from a different game each time. */
export type MixActivity = Omit<Activity, 'id' | 'world'> & { id: 'grabbelton' };
/** What a round is about: one game, or the Grabbelton. */
export type PlayActivity = Activity | MixActivity;

export const GRABBELTON: MixActivity = {
  id: 'grabbelton',
  title: 'De Grabbelton',
  subtitle: 'Van elk spel een opdracht',
  tag: 'Alles door elkaar',
  color: 'peach',
  symbol: 'grab-bag',
  learningGoal: 'Herhalen wat je in de verschillende spellen hebt geleerd.',
};

/** The most open answers in one round, the same as in a normal round. */
const MAX_OPEN = 3;

export const isMixed = (activity: PlayActivity): activity is MixActivity => activity.id === 'grabbelton';

/** The game a question comes from; in a Grabbelton round each question has its own. */
export function questionActivity(activity: PlayActivity, question: Question): Activity {
  if (!isMixed(activity)) return activity;
  return activities(question.group).find((a) => a.id === question.topic) ?? activities(question.group)[0];
}

/**
 * Builds a Grabbelton round: every game of the group in a random order, one question each.
 * When a group has fewer games than questions, the order wraps around, so a game never comes twice in a row.
 * Each question comes from that game's own adaptive round, so its level and repeat history still apply.
 * Koppelplein only uses Koppelen: one Memory board takes much longer than a normal question.
 */
export function makeMixedRound(
  group: Group,
  profile: {
    rounds: number;
    practice?: PracticeHistory;
    recentQuestions?: RecentQuestions;
    recentConcepts?: RecentQuestions;
  },
): Question[] {
  const count = QUESTIONS_PER_ADVENTURE[group];
  const skills = shuffle(activities(group).map((a) => a.id));
  const order = Array.from({ length: count }, (_, i) => skills[i % skills.length]);
  const picks = new Map<Skill, Question[]>();
  for (const skill of new Set(order)) {
    const key = `${group}:${skill}` as const;
    const round = makeAdaptiveRound(
      group,
      skill,
      profile.rounds,
      profile.practice?.[key],
      skill === 'koppelen' ? 1 : undefined,
      profile.recentQuestions?.[key],
      profile.recentConcepts?.[key],
    );
    picks.set(skill, round);
  }
  let open = 0;
  return order.map((skill) => {
    const question = picks.get(skill)!.shift()!;
    if (question.answerMode !== 'open') return question;
    open++;
    return open > MAX_OPEN ? { ...question, answerMode: 'choice' } : question;
  });
}

/** Splits a round's practice results per game; results line up with the planned questions. */
export function practiceByTopic(
  questions: readonly Question[],
  results: readonly PracticeResult[],
): Map<Skill, PracticeResult[]> {
  const byTopic = new Map<Skill, PracticeResult[]>();
  results.forEach((result, i) => {
    const topic = questions[i].topic;
    byTopic.set(topic, [...(byTopic.get(topic) ?? []), result]);
  });
  return byTopic;
}
