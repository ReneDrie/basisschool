import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  activities,
  availableLevels,
  GROUPS,
  makeRound,
  questionBank,
  questionKey,
  QUESTIONS_PER_ADVENTURE,
} from '../src/content.ts';
import {
  chooseTheme,
  discoveryThemes,
  discoveryTip,
  FALSE,
  inSeason,
  makeDiscoveryRound,
  TRUE,
} from '../src/learning/discovery-path.ts';

const november = new Date(2026, 10, 20),
  january = new Date(2027, 0, 10),
  july = new Date(2026, 6, 1);

test('The Ontdekpad is a game in Kijken & ontdekken for groep 4 and 5 only', () => {
  for (const group of GROUPS) {
    const game = activities(group).find((a) => a.id === 'ontdekpad');
    if (group >= 4) assert.equal(game?.world, 'ontdekken');
    else assert.equal(game, undefined);
  }
  assert.deepEqual(availableLevels(4, 'ontdekpad'), [1, 2]);
});

test('Every fact has a balanced pair of claims and every hint points to a word in the passage', () => {
  for (const theme of discoveryThemes) {
    assert.equal(theme.facts.length, 5, theme.title);
    assert.ok(theme.tip.length > 10, theme.title);
    for (const fact of theme.facts) {
      assert.deepEqual(
        fact.checks.map(([, isTrue]) => isTrue),
        [true, false],
        fact.text,
      );
      for (const keyword of [...fact.checks.map(([, , k]) => k), fact.ask[5]])
        assert.ok(fact.text.toLocaleLowerCase('nl').includes(keyword.toLocaleLowerCase('nl')), `${keyword} in ${fact.text}`);
    }
  }
  for (const q of questionBank(5, 'ontdekpad')) {
    assert.ok(q.passage && q.theme);
    if (q.difficulty === 1) assert.deepEqual([...q.choices].sort(), [TRUE, FALSE].sort());
  }
});

test('Themes follow the calendar, also across New Year', () => {
  const season = (date: Date) =>
    discoveryThemes
      .filter((t) => t.season && inSeason(t, date))
      .map((t) => t.title)
      .sort();
  assert.deepEqual(season(november), ['Herfst', 'Sinterklaas']);
  assert.deepEqual(season(new Date(2026, 11, 5)), ['Sinterklaas']);
  assert.deepEqual(season(new Date(2026, 11, 6)), ['Winter']);
  assert.deepEqual(season(january), ['Winter']);
  assert.deepEqual(season(july), ['Bijen']);
});

test('A round walks one theme in order: each fact, then its questions', () => {
  for (const group of [4, 5] as const)
    for (let run = 0; run < 20; run++) {
      const bank = questionBank(group, 'ontdekpad');
      const round = makeDiscoveryRound(bank, undefined, [], [], { hardCount: 3 }, november);
      assert.equal(round.length, QUESTIONS_PER_ADVENTURE[group]);
      assert.equal(new Set(round.map((q) => q.theme)).size, 1);
      // Fresh rounds first visit all five facts of the theme.
      assert.equal(new Set(round.map((q) => q.passage)).size, 5);
      const positions = round.map((q) => bank.indexOf(bank.find((b) => b.id === q.id)!));
      assert.deepEqual(
        positions,
        [...positions].sort((a, b) => a - b),
      );
      assert.ok(round.filter((q) => q.difficulty === 2).length <= 3);
      assert.ok(discoveryTip(round));
    }
});

test('A child starts with the season and then gets the theme played longest ago', () => {
  const bank = questionBank(4, 'ontdekpad');
  const first = chooseTheme(bank, undefined, [], november)!;
  assert.ok(['Sinterklaas', 'Herfst'].includes(first.title));
  // Play every theme that fits November once, the first one longest ago.
  const playable = discoveryThemes.filter((t) => inSeason(t, november));
  const order = [first, ...playable.filter((t) => t !== first)];
  const recent = order.flatMap((theme) => bank.filter((q) => q.theme === theme.title).map(questionKey));
  assert.equal(chooseTheme(bank, undefined, recent, november), first);
  assert.ok(!chooseTheme(bank, undefined, [], july)!.season || chooseTheme(bank, undefined, [], july)!.title === 'Bijen');
});

test('A fixed step 2 round takes the harder questions from several themes, still grouped per theme', () => {
  for (let run = 0; run < 10; run++) {
    const round = makeRound(5, 'ontdekpad', 2);
    assert.ok(round.every((q) => q.difficulty === 2 && q.choices.length === 4));
    const themes = round.map((q) => q.theme);
    assert.ok(new Set(themes).size > 1);
    // Each theme appears as one block.
    assert.equal(themes.filter((t, i) => t !== themes[i - 1]).length, new Set(themes).size);
    assert.equal(discoveryTip(round), undefined);
  }
});
