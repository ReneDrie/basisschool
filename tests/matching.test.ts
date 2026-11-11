import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import {
  QUESTIONS_PER_ADVENTURE,
  GROUPS,
  activities,
  availableLevels,
  questionBank,
  questionKey,
  repetitionKey,
  makeRound,
  isCorrectAnswer,
  audioFragments,
} from '../src/content.ts';
import { matchingBank, matchingCards, matches, faceLabel, MATCH_COMPLETE } from '../src/learning/matching.ts';
import { ART_KINDS } from '../src/art-catalog.ts';
import { emptyProfile, rememberQuestions, reward, parseBackup, validateProfiles } from '../src/storage.ts';

test('All four groups have both matching and memory with balanced, stable banks', () => {
  for (const group of GROUPS) {
    assert.ok(activities(group).some((a) => a.id === 'koppelen'));
    assert.deepEqual(availableLevels(group, 'koppelen'), [1, 2]);
    const bank = questionBank(group, 'koppelen');
    assert.ok(bank.length >= 280);
    assert.equal(new Set(bank.map(questionKey)).size, bank.length);
    assert.deepEqual(matchingBank(group), matchingBank(group));
    for (const level of [1, 2] as const) {
      const eligible = bank.filter((q) => q.difficulty === level);
      assert.ok(eligible.every((q) => q.matching!.mode === (level === 1 ? 'pairs' : 'memory')));
      for (const category of new Set(eligible.map((q) => q.matching!.category)))
        assert.equal(eligible.filter((q) => q.matching!.category === category).length, 70);
    }
  }
});
test('Each board has four unambiguous pairs, eight unique cards and only matching opposite cards succeed', () => {
  for (const group of GROUPS)
    for (const q of questionBank(group, 'koppelen')) {
      const task = q.matching!,
        cards = matchingCards(task);
      assert.equal(task.pairs.length, 4);
      assert.equal(cards.length, 8);
      assert.equal(new Set(cards.map((c) => c.id)).size, 8);
      assert.equal(new Set(task.pairs.map((p) => faceLabel(p.left))).size, 4, q.id);
      assert.equal(new Set(task.pairs.map((p) => faceLabel(p.right))).size, 4, q.id);
      const pictureNames = task.pairs.flatMap((p) => (p.left.kind === 'art' ? [p.left.label] : []));
      assert.ok(
        !(pictureNames.includes('bloem') && pictureNames.includes('roos')),
        'Generic flower and rose labels would overlap',
      );
      for (const a of cards) {
        const partners = cards.filter((b) => matches(a, b));
        assert.equal(partners.length, 1);
        assert.equal(partners[0].pairId, a.pairId);
        assert.notEqual(partners[0].side, a.side);
      }
      assert.ok(isCorrectAnswer(q, MATCH_COMPLETE));
      assert.ok(!isCorrectAnswer(q, 'probeer-opnieuw'));
      assert.ok(!q.openAnswer);
      for (const face of cards.map((c) => c.face)) {
        if (face.kind === 'art' || face.kind === 'count') assert.ok(ART_KINDS.includes(face.art), face.art);
      }
    }
});
test('Quantities, shadows, words, sums, clocks, fractions and measurements agree with their partners', () => {
  const measures: Record<string, [string, number]> = {
    m: ['length', 1000],
    dm: ['length', 100],
    cm: ['length', 10],
    mm: ['length', 1],
    dl: ['volume', 100],
    ml: ['volume', 1],
  };
  for (const group of GROUPS)
    for (const q of questionBank(group, 'koppelen'))
      for (const p of q.matching!.pairs) {
        const category = q.matching!.category,
          left = p.left,
          right = p.right;
        if (category === 'counts') {
          assert.equal(left.kind, 'count');
          assert.ok(left.kind === 'count' && right.kind === 'text' && left.count === Number(right.text));
        }
        if (category === 'shadows') {
          assert.ok(left.kind === 'art' && right.kind === 'art');
          assert.equal(left.art, right.art);
          assert.equal(right.shadow, true);
          assert.ok(!left.shadow);
        }
        if (category === 'words') {
          assert.ok(left.kind === 'art' && right.kind === 'text');
          assert.equal(left.label, right.text);
        }
        if (category === 'sums' || category === 'tables') {
          assert.ok(left.kind === 'text' && right.kind === 'text');
          const m = left.text.match(/(\d+) ([+−×]) (\d+)/)!;
          assert.ok(m);
          const a = Number(m[1]),
            b = Number(m[3]);
          assert.equal(Number(right.text), m[2] === '+' ? a + b : m[2] === '−' ? a - b : a * b);
          if (group === 3) assert.ok(Math.max(a, b, Number(right.text)) <= (q.difficulty === 1 ? 10 : 20));
        }
        if (category === 'clocks') {
          assert.ok(left.kind === 'diagram' && left.diagram.kind === 'clock' && right.kind === 'text');
          const { hour, minute } = left.diagram,
            next = (hour % 12) + 1;
          assert.equal(
            right.text,
            minute === 0
              ? `${hour} uur`
              : minute === 30
                ? `half ${next}`
                : minute === 15
                  ? `kwart over ${hour}`
                  : `kwart voor ${next}`,
          );
        }
        if (category === 'fractions') {
          assert.ok(left.kind === 'diagram' && left.diagram.kind === 'fraction' && right.kind === 'text');
          const { filled, parts } = left.diagram,
            [n, d] = right.text.split('/').map(Number);
          assert.ok(parts > 0 && filled >= 0 && filled <= parts && d > 0);
          assert.equal(filled / parts, n / d);
        }
        if (category === 'units') {
          assert.ok(left.kind === 'text' && right.kind === 'text');
          const [a, from] = left.text.split(' '),
            [b, to] = right.text.split(' ');
          assert.equal(measures[from][0], measures[to][0]);
          assert.equal(Number(a) * measures[from][1], Number(b) * measures[to][1]);
        }
      }
});
test('Varied matching rounds avoid previous boards and remain in the chosen game mode', () => {
  for (const group of GROUPS) {
    let p = emptyProfile('Koppelvriend', '🦊', group);
    const offered = new Set<string>();
    for (const level of [1, 2] as const)
      for (let n = 0; n < 6; n++) {
        const round = makeRound(
          group,
          'koppelen',
          level,
          p.recentQuestions?.[`${group}:koppelen`],
          p.recentConcepts?.[`${group}:koppelen`],
        );
        assert.equal(round.length, QUESTIONS_PER_ADVENTURE[group]);
        assert.ok(round.every((q) => q.matching && q.difficulty === level));
        const counts = [...new Set(questionBank(group, 'koppelen').map((q) => q.matching!.category))].map(
          (category) => round.filter((q) => q.matching!.category === category).length,
        );
        assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, 'Each round spreads the group-specific exercise types evenly');
        for (const q of round) {
          assert.ok(!offered.has(questionKey(q)));
          offered.add(questionKey(q));
        }
        p = rememberQuestions(p, round);
      }
    assert.equal(offered.size, 12 * QUESTIONS_PER_ADVENTURE[group]);
  }
});
test('Memory and face-up versions recognise the same underlying exercise and keep separate exact keys', () => {
  const q = questionBank(2, 'koppelen')[0],
    memory = { ...q, matching: { ...q.matching!, mode: 'memory' as const } };
  assert.equal(repetitionKey(q), repetitionKey(memory));
  assert.notEqual(questionKey(q), questionKey(memory));
});
test('New game history and rewards survive backups and older profiles still load', () => {
  const old = emptyProfile('Ontdekker', '🦊', 4);
  assert.deepEqual(validateProfiles([old]), [old]);
  const played = rememberQuestions(old, makeRound(4, 'koppelen', 2)),
    won = reward(played, 'koppelen');
  assert.equal(played.stars, 0);
  assert.equal(won.stars, 1);
  assert.equal(won.skills.koppelen, 1);
  assert.equal(won.recentQuestions!['4:koppelen']!.length, 10);
  assert.deepEqual(parseBackup(JSON.stringify({ app: 'kleine-ontdekkers', version: 1, profiles: [won] })), [won]);
});
test('Both modes and their shared hint have local voice instructions without conflicting text', () => {
  const all = GROUPS.flatMap((g) => questionBank(g, 'koppelen')),
    audio = audioFragments(all);
  for (const q of all) {
    assert.ok(audio.get(q.audio!)!.includes('kaarten'));
    assert.equal(audio.get(q.hintAudio!), q.hint);
  }
  for (const path of ['/audio/matching-pairs.m4a', '/audio/matching-memory.m4a', '/audio/matching-hint.m4a'])
    assert.ok(statSync(new URL(`../public${path}`, import.meta.url)).size > 1000);
});
