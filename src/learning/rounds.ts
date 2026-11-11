import { hashKey, repetitionKey } from './repetition.ts';
import { QUESTIONS_PER_ADVENTURE, type Difficulty, type Question } from './model.ts';

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
// A compact semantic key ignores answer order and choice/open presentation.
export function questionKey(q: Question): string {
  // Append interactive content only when present, preserving existing saved keys.
  const value = [
    q.group,
    q.topic,
    q.prompt,
    q.answer,
    q.visual,
    q.diagram,
    q.passage,
    ...(q.shop ? [q.shop] : []),
    ...(q.building ? [q.building] : []),
    ...(q.story ? [q.story] : []),
    ...(q.visualLayout ? [q.visualLayout] : []),
    ...(q.matching ? [q.matching] : []),
    ...(q.train ? [q.train] : []),
    ...(q.detective ? [q.detective] : []),
    ...(q.language ? [q.language] : []),
    ...(q.soundStudio ? [q.soundStudio] : []),
    ...(q.bus ? [q.bus] : []),
    ...(q.challengeGroup ? [q.challengeGroup] : []),
    ...(q.nature ? [q.nature] : []),
  ];
  return hashKey(value);
}
export function buildRound(
  bank: Question[],
  difficulty?: Difficulty,
  recent: readonly string[] = [],
  recentConcepts: readonly string[] = [],
  options?: { hardCount: number },
): Question[] {
  const questionCount = bank.length ? QUESTIONS_PER_ADVENTURE[bank[0].group] : 0;
  const eligible = bank.filter((q) => !difficulty || q.difficulty === difficulty);
  const unique = [...new Map(eligible.map((q) => [questionKey(q), q])).values()];
  if (!questionCount || unique.length < questionCount) throw new Error('Er zijn nog niet genoeg opdrachten voor dit niveau.');
  const rank = new Map(recent.map((key, index) => [key, index]));
  const concepts = new Map(recentConcepts.map((key, index) => [key, index]));
  const ranked = shuffle(unique)
    .map((q) => ({ q, key: questionKey(q), concept: repetitionKey(q) }))
    .sort(
      (a, b) =>
        (concepts.get(a.concept) ?? -1) - (concepts.get(b.concept) ?? -1) || (rank.get(a.key) ?? -1) - (rank.get(b.key) ?? -1),
    );
  const used = new Set<string>(),
    chosen = new Set<string>();
  const selected: Question[] = [];
  const easy = unique.filter((q) => q.difficulty === 1).length,
    hard = unique.length - easy;
  const hardQuota = options ? Math.max(questionCount - easy, Math.min(questionCount, hard, options.hardCount)) : questionCount;
  const quota = { 1: options ? questionCount - hardQuota : questionCount, 2: hardQuota },
    levels = { 1: 0, 2: 0 };
  const allowed = (entry: (typeof ranked)[number]) => levels[entry.q.difficulty] < quota[entry.q.difficulty];
  const categoryCounts = new Map<string, number>();
  const categoryOf = (q: Question) =>
    q.nature?.kind ?? q.matching?.category ?? (q.detective ? `${q.detective.category}:${q.detective.clue ?? ''}` : undefined);
  const add = (entry: (typeof ranked)[number]) => {
    levels[entry.q.difficulty]++;
    selected.push(entry.q);
    chosen.add(entry.key);
    used.add(entry.concept);
    const category = categoryOf(entry.q);
    if (category) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
  };
  const take = (entries: typeof ranked, distinctOnly: boolean) => {
    if (categoryOf(ranked[0].q)) {
      while (selected.length < questionCount) {
        const candidates = entries.filter((e) => allowed(e) && !chosen.has(e.key) && (!distinctOnly || !used.has(e.concept)));
        if (!candidates.length) break;
        const next = candidates.reduce((best, e) =>
          (categoryCounts.get(categoryOf(e.q)!) ?? 0) < (categoryCounts.get(categoryOf(best.q)!) ?? 0) ? e : best,
        );
        add(next);
      }
      return;
    }
    for (const entry of entries) {
      if (selected.length === questionCount) break;
      if (!allowed(entry) || chosen.has(entry.key) || (distinctOnly && used.has(entry.concept))) continue;
      add(entry);
    }
  };
  if (ranked[0]?.q.story) {
    take(ranked, true);
    take(ranked, false);
  } else {
    const fresh = ranked.filter((entry) => !rank.has(entry.key)),
      seen = ranked.filter((entry) => rank.has(entry.key));
    take(fresh, true);
    take(fresh, false);
    take(seen, true);
    take(seen, false);
  }
  const open = new Set(
    shuffle(selected.filter((q) => q.openAnswer))
      .slice(0, 3)
      .map((q) => q.id),
  );
  return shuffle(selected).map((q) => ({ ...q, answerMode: open.has(q.id) ? 'open' : 'choice', choices: shuffle(q.choices) }));
}
export function isCorrectAnswer(question: Question, input: string): boolean {
  const value = input.normalize('NFC').trim().toLocaleLowerCase('nl');
  if (!value) return false;
  if (question.answerMode === 'open' && question.openAnswer === 'number')
    return /^\d+$/.test(value) && Number(value) === Number(question.answer);
  return value === question.answer.normalize('NFC').trim().toLocaleLowerCase('nl');
}
