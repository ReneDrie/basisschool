import { islandRegions } from '../progression.ts';
import { makeRound, availableLevels, questionBank, variantBank, questionKey, repetitionKey, shuffle } from '../content.ts';
import type { Difficulty, Group, Question, Skill } from './model.ts';
import { QUESTIONS_PER_ADVENTURE } from './model.ts';

export type PracticeResult = { level: Difficulty; independent: boolean; challenge?: boolean };
export type PracticeHistory = Partial<Record<`${Group}:${Skill}`, PracticeResult[]>>;
export const PRACTICE_WINDOW = 24;
export function practicePlan(group: Group, rounds: number, results: readonly PracticeResult[] = [], hasHardLevel = true) {
  const island = Math.max(0, islandRegions.filter((r) => r.unlockAt <= rounds).length - 1);
  const base = results.filter((r) => !r.challenge),
    recent = base.slice(-6);
  const success = recent.length ? recent.filter((r) => r.independent).length / recent.length : 0;
  const settled = recent.length >= 6,
    comfortable = settled && success >= 0.8;
  let hardCount = Math.round(QUESTIONS_PER_ADVENTURE[group] * [0.15, 0.22, 0.3, 0.38, 0.45, 0.55][island]);
  if (!settled) hardCount = Math.min(1, hardCount);
  if (recent.length >= 3 && success < 0.5) hardCount = 0;
  else if (settled && success < 0.75) hardCount = Math.min(1, hardCount);
  const effectiveIsland = comfortable ? island : Math.min(island, 1);
  const magnitude = (
    {
      2: [6, 7, 8, 9, 10, 10],
      3: [10, 12, 14, 16, 18, 20],
      4: [30, 40, 55, 70, 85, 100],
      5: [200, 350, 500, 650, 800, 1000],
    } as const
  )[group][effectiveIsland];
  const lastChallenge = results
    .map((r, i) => (r.challenge ? i : -1))
    .filter((i) => i >= 0)
    .at(-1);
  const recovered =
    lastChallenge === undefined ||
    results[lastChallenge].independent ||
    results.slice(lastChallenge + 1).filter((r) => !r.challenge && r.independent).length >= 6;
  const bridge =
    group < 5 &&
    recovered &&
    island === 5 &&
    comfortable &&
    base.length >= 12 &&
    (!hasHardLevel || base.filter((r) => r.level === 2 && r.independent).length >= 6);
  return { island, hardCount, magnitude, bridge };
}
function bridgeQuestion(
  group: Group,
  skill: Skill,
  round: Question[],
  recent: readonly string[],
  concepts: readonly string[],
): Question | undefined {
  if (group === 5 || !['rekenen', 'woordfabriek'].includes(skill)) return;
  const next = (group + 1) as Group,
    ceiling = group === 2 ? 12 : group === 3 ? 25 : 120;
  let bank = variantBank(questionBank(next, skill));
  if (skill === 'rekenen')
    bank = bank.filter((q) => {
      const match = q.prompt.match(/^Hoeveel is (\d+) \+ (\d+)\?$/);
      if (!match || q.missing) return false;
      const a = Number(match[1]),
        b = Number(match[2]),
        max = group === 2 ? 10 : group === 3 ? 20 : 100;
      return a > 0 && b > 0 && a <= max && b <= max && a + b > max && a + b <= ceiling;
    });
  else bank = bank.filter((q) => q.difficulty === 1 && q.language && q.language.items.length <= 6 && q.answer.length <= 10);
  const candidates = shuffle(bank)
    .map((q) => ({
      ...q,
      group,
      challengeGroup: next,
      answerMode: 'choice' as const,
      ...(skill === 'rekenen'
        ? {
            choices: [0, -1, 1, -2, 2, -3, 3]
              .map((offset) => Number(q.answer) + offset)
              .filter((n) => n >= 0 && n <= ceiling)
              .slice(0, 4)
              .map(String),
          }
        : {}),
      ...(skill === 'rekenen' && group <= 3
        ? {
            audio: undefined,
            audioSequence: [
              '/audio/sum-start.m4a',
              `/audio/number-${q.prompt.match(/\d+/g)![0]}.m4a`,
              '/audio/sum-plus.m4a',
              `/audio/number-${q.prompt.match(/\d+/g)![1]}.m4a`,
            ],
            hint: 'Begin bij het eerste getal en tel het tweede getal erbij.',
            hintAudio: '/audio/sum-hint-plus.m4a',
          }
        : {}),
    }))
    .filter((q) => !round.some((other) => repetitionKey(other) === repetitionKey(q)));
  const chosen =
    candidates.find((q) => !recent.includes(questionKey(q)) && !concepts.includes(repetitionKey(q))) ??
    candidates.find((q) => !recent.includes(questionKey(q))) ??
    candidates[0];
  return chosen ? { ...chosen, choices: shuffle(chosen.choices) } : undefined;
}
export function makeAdaptiveRound(
  group: Group,
  skill: Skill,
  rounds: number,
  results: readonly PracticeResult[] = [],
  difficulty?: Difficulty,
  recent: readonly string[] = [],
  concepts: readonly string[] = [],
): Question[] {
  if (difficulty) return makeRound(group, skill, difficulty, recent, concepts);
  const plan = practicePlan(group, rounds, results, availableLevels(group, skill).includes(2));
  const round = makeRound(group, skill, undefined, recent, concepts, {
    hardCount: plan.hardCount,
    ...(skill === 'rekenen' ? { magnitudeLimit: plan.magnitude } : {}),
  });
  const challenge = plan.bridge ? bridgeQuestion(group, skill, round, recent, concepts) : undefined;
  if (!challenge) return round;
  const replace =
    round
      .map((q, i) => (q.difficulty === 2 ? i : -1))
      .filter((i) => i >= 0)
      .at(-1) ?? 0;
  return shuffle(round.map((q, i) => (i === replace ? challenge : q)));
}
