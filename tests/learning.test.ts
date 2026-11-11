import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GROUPS,
  activities,
  availableLevels,
  makeRound,
  questionBank,
  QUESTIONS_PER_ADVENTURE,
  isCorrectAnswer,
  audioFragments,
} from '../src/content.ts';
import { parseBackup, reward, validateProfiles, type Profile } from '../src/storage.ts';
import { buildRound } from '../src/learning/rounds.ts';

const allQuestions = GROUPS.flatMap((group) => activities(group).flatMap((activity) => questionBank(group, activity.id)));
test('Every advertised topic has a complete bank with unique IDs, answers and learning metadata', () => {
  assert.equal(new Set(allQuestions.map((q) => q.id)).size, allQuestions.length);
  for (const group of GROUPS)
    for (const activity of activities(group)) {
      const questions = questionBank(group, activity.id);
      assert.ok(questions.length >= QUESTIONS_PER_ADVENTURE[group]);
      for (const question of questions) {
        assert.equal(question.group, group);
        assert.equal(question.topic, activity.id);
        assert.ok(question.learningGoal.length > 10);
        assert.ok([1, 2].includes(question.difficulty));
        if (
          !question.shop &&
          !question.building &&
          !question.story &&
          !question.matching &&
          !question.train &&
          !question.detective &&
          !question.language &&
          !question.soundStudio &&
          !question.bus &&
          !question.nature
        ) {
          assert.equal(question.choices.length, 4, question.id);
          assert.equal(new Set(question.choices).size, 4, question.id);
          assert.equal(question.choices.filter((choice) => choice === question.answer).length, 1, question.id);
        } else assert.equal(question.choices.length, 0);
        assert.ok(question.hint.length > 5);
        if (group <= 3) {
          assert.ok(question.audio);
          assert.notEqual(question.openAnswer, 'word');
        }
      }
    }
});
test('Mixed and level-specific adventures contain the group-specific number of distinct, eligible assignments', () => {
  for (const [group, count] of [
    [2, 6],
    [3, 8],
    [4, 10],
    [5, 10],
  ] as const)
    for (const activity of activities(group))
      for (const level of [undefined, ...availableLevels(group, activity.id)]) {
        for (let run = 0; run < 10; run++) {
          const round = makeRound(group, activity.id, level);
          assert.equal(round.length, count);
          assert.equal(new Set(round.map((q) => q.id)).size, count);
          if (level) assert.ok(round.every((q) => q.difficulty === level));
          const expected = Math.min(3, round.filter((q) => q.openAnswer).length);
          assert.equal(round.filter((q) => q.answerMode === 'open').length, expected);
          assert.equal(round.filter((q) => q.answerMode === 'choice').length, count - expected);
          for (const q of round) {
            assert.ok(isCorrectAnswer(q, q.answer));
            if (q.answerMode === 'open') assert.ok(q.openAnswer);
          }
        }
      }
  assert.throws(() => makeRound(2, 'tafels'));
  assert.throws(() => makeRound(4, 'taal', 2));
});
test('Small banks require a full group-specific round of unique eligible questions', () => {
  assert.throws(() => buildRound([]), /niet genoeg opdrachten/);
  for (const [group, count] of [
    [2, 6],
    [3, 8],
    [4, 10],
    [5, 10],
  ] as const) {
    const bank = questionBank(group, 'rekenen')
      .filter((q) => q.difficulty === 1)
      .slice(0, count);
    assert.equal(buildRound(bank, 1).length, count);
    assert.throws(() => buildRound(bank.slice(1), 1), /niet genoeg opdrachten/);
    assert.throws(() => buildRound([...bank.slice(1), bank[1]], 1), /niet genoeg opdrachten/);
    assert.throws(() => buildRound(bank, 2), /niet genoeg opdrachten/);
  }
});
test('Six new topics and the four group 3 topics have at least twenty questions on two complete levels', () => {
  for (const [group, skill] of [
    [2, 'vergelijken'],
    [2, 'patronen'],
    [4, 'klok'],
    [4, 'geld'],
    [5, 'breuken'],
    [5, 'grafieken'],
    ...activities(3).map((a) => [3, a.id]),
  ] as const) {
    const bank = questionBank(group, skill);
    assert.ok(bank.length >= 20);
    assert.deepEqual(availableLevels(group, skill), [1, 2]);
    assert.ok(bank.filter((q) => q.difficulty === 1).length >= 10);
    assert.ok(bank.filter((q) => q.difficulty === 2).length >= 10);
  }
});
test('Typed words accept capitals and surrounding whitespace but require correct spelling', () => {
  const question = makeRound(4, 'taal').find((q) => q.answerMode === 'open')!;
  assert.ok(isCorrectAnswer(question, `  ${question.answer.toUpperCase()}  `));
  for (const invalid of ['', `${question.answer}x`, question.answer.split('').join(' ')])
    assert.ok(!isCorrectAnswer(question, invalid));
});
test('Open numbers reject blank, partial, fractional and expression input', () => {
  const question = { ...questionBank(3, 'rekenen')[0], answerMode: 'open' as const };
  assert.ok(isCorrectAnswer(question, ` 00${question.answer} `));
  for (const invalid of ['', ' ', `${question.answer} appels`, `${question.answer}.0`, `${question.answer}+0`, 'Infinity'])
    assert.ok(!isCorrectAnswer(question, invalid), invalid);
  assert.ok(!isCorrectAnswer(question, String(Number(question.answer) + 1)));
  assert.ok(isCorrectAnswer({ ...question, answer: '0' }, '0'));
});
test('Arithmetic matches the displayed calculation and stays within the stated group 3 range', () => {
  for (const group of [3, 4, 5] as const)
    for (const skill of group === 3 ? (['rekenen'] as const) : (['rekenen', 'tafels'] as const)) {
      for (const q of questionBank(group, skill)) {
        const match = q.prompt.match(/(\d+) ([+−×:]) (\d+)/)!;
        assert.ok(match);
        const a = Number(match[1]),
          b = Number(match[3]);
        const expected = match[2] === '+' ? a + b : match[2] === '−' ? a - b : match[2] === '×' ? a * b : a / b;
        assert.equal(Number(q.answer), expected, q.prompt);
        assert.ok(expected >= 0);
        if (group === 3) assert.ok(Math.max(a, b, expected) <= (q.difficulty === 1 ? 10 : 20));
      }
    }
});
test('Coins, clocks, fractions, comparisons and charts agree with their visual data', () => {
  for (const q of allQuestions) {
    const d = q.diagram;
    if (!d) continue;
    if (d.kind === 'money')
      assert.equal(
        Number(q.answer),
        d.cents.reduce((a, b) => a + b, 0),
      );
    if (d.kind === 'fraction') {
      assert.ok(d.filled >= 0 && d.filled <= d.parts);
      assert.equal(q.answer, `${q.difficulty === 1 ? d.filled : d.parts - d.filled}/${d.parts}`);
      const values = q.choices.map((choice) => {
        const [a, b] = choice.split('/').map(Number);
        return a / b;
      });
      assert.equal(new Set(values).size, 4, 'Equivalent fraction options would be ambiguous');
    }
    if (d.kind === 'clock') {
      const next = (d.hour % 12) + 1;
      const expected =
        d.minute === 0
          ? `${d.hour} uur`
          : d.minute === 30
            ? `half ${next}`
            : d.minute === 15
              ? `kwart over ${d.hour}`
              : `kwart voor ${next}`;
      assert.equal(q.answer, expected);
    }
    if (d.kind === 'comparison') {
      const chosen = d.rows.find((row) => row.label === q.answer)!;
      assert.ok(chosen);
      const sizes = d.rows.map((row) => row.objects.length);
      if (q.difficulty === 2) assert.equal(chosen.objects.length, d.rows[0].objects.length);
      else assert.equal(chosen.objects.length, q.prompt.includes('meeste') ? Math.max(...sizes) : Math.min(...sizes));
    }
    if (d.kind === 'chart') {
      const expected = q.prompt.includes('totaal')
        ? d.rows.reduce((sum, r) => sum + r.value, 0)
        : q.prompt.includes('meer heeft')
          ? Math.max(...d.rows.map((r) => r.value)) - Math.min(...d.rows.map((r) => r.value))
          : d.rows.find((row) => q.prompt.includes(row.label))!.value;
      assert.equal(Number(q.answer), expected);
    }
  }
});
test('Patterns have a consistent visible cycle and new banks do not repeat the same assignment', () => {
  for (const group of GROUPS)
    for (const activity of activities(group)) {
      const bank = questionBank(group, activity.id);
      if (group !== 3 && !['vergelijken', 'patronen', 'klok', 'geld', 'breuken', 'grafieken'].includes(activity.id)) continue;
      const signatures = bank.map((q) =>
        JSON.stringify([
          q.prompt,
          q.diagram,
          q.passage,
          q.choices,
          q.matching,
          q.train,
          q.detective,
          q.language,
          q.soundStudio,
          q.bus,
          q.nature,
        ]),
      );
      assert.equal(new Set(signatures).size, bank.length, `${group}: ${activity.id}`);
      for (const q of bank) {
        const d = q.diagram;
        if (d?.kind !== 'pattern') continue;
        const visible = d.items.slice(0, -1);
        const cycleLength = [2, 3].find((size) => visible.every((item, i) => item === visible[i % size]));
        assert.ok(cycleLength, q.id);
        assert.equal(q.answer, visible[visible.length % cycleLength]);
      }
    }
});
test('Audio manifest covers every spoken prompt, hint and enabled answer option, with no conflicting recordings', () => {
  const merged = audioFragments(allQuestions);
  for (const q of allQuestions)
    for (const [path, text] of audioFragments([q])) {
      assert.equal(merged.get(path), text);
      assert.ok(path.startsWith('/audio/'));
      assert.ok(path.endsWith('.m4a'));
    }
  for (const group of [2, 3] as const)
    for (const a of activities(group))
      for (const q of questionBank(group, a.id)) assert.ok(merged.has(q.hintAudio ?? `/audio/hint-${q.id}.m4a`));
});
const profile: Profile = { id: 'test-1', name: 'Ontdekker', avatar: '🦊', group: 5, rounds: 2, stars: 2, skills: { rekenen: 2 } };
test('An adventure rewards effort and preserves existing progress without mutation', () => {
  const updated = reward(profile, 'breuken');
  assert.equal(updated.stars, 3);
  assert.equal(updated.rounds, 3);
  assert.deepEqual(updated.skills, { rekenen: 2, breuken: 1 });
  assert.equal(profile.rounds, 2);
});
test('Old backups remain compatible, and new group 3 profiles and topics round-trip', () => {
  const source = [
    profile,
    { ...profile, id: 'test-2', group: 2, skills: { patronen: 1 } },
    { ...profile, id: 'test-3', group: 3 },
    { ...profile, id: 'test-4', group: 4, skills: { klok: 2, geld: 3 } },
  ];
  assert.deepEqual(parseBackup(JSON.stringify({ app: 'kleine-ontdekkers', version: 1, profiles: source })), source);
  assert.deepEqual(parseBackup(JSON.stringify({ app: 'kleine-ontdekkers', version: 1, profiles: [profile] })), [profile]);
  for (const invalid of [
    [{ ...profile, group: 6 }],
    [{ ...profile, stars: -1 }],
    [{ ...profile, name: '' }],
    [profile, profile],
    [{ ...profile, skills: { unexpected: 4 } }],
    [{ ...profile, avatar: 'unknown' }],
  ])
    assert.throws(() => validateProfiles(invalid));
  assert.throws(() => parseBackup('{"version":2,"profiles":[]}'));
  assert.throws(() => parseBackup('not json'));
});
