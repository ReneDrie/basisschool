import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GROUPS, SKILLS, activities } from '../src/content.ts';
import { DAILY_ROUNDS, countRoundToday, dateKey, roundsToday } from '../src/learning/today.ts';
import { homeTips, parentInsights } from '../src/learning/parent-insights.ts';
import { emptyProfile, parseBackup, reward, validateProfiles } from '../src/storage.ts';

test('Rounds today count up during a day and start again on the next day', () => {
  const morning = new Date(2026, 10, 11, 9),
    evening = new Date(2026, 10, 11, 20),
    tomorrow = new Date(2026, 10, 12, 8);
  assert.equal(dateKey(morning), '2026-11-11');
  let profile = emptyProfile('Test', '🦊', 2);
  for (let i = 0; i < DAILY_ROUNDS; i++) profile = reward(profile, 'rekenen', morning);
  assert.equal(roundsToday(profile.today, evening), DAILY_ROUNDS);
  assert.equal(roundsToday(profile.today, tomorrow), 0);
  assert.deepEqual(countRoundToday(profile.today, tomorrow), { date: '2026-11-12', rounds: 1 });
});

test('The daily count survives a backup and invalid values are rejected', () => {
  const profile = reward(emptyProfile('Test', '🦊', 2), 'rekenen', new Date(2026, 10, 11));
  const [restored] = parseBackup(JSON.stringify({ app: 'kleine-ontdekkers', version: 1, profiles: [profile] }));
  assert.deepEqual(restored.today, { date: '2026-11-11', rounds: 1 });
  assert.throws(() => validateProfiles([{ ...profile, today: { date: 'gisteren', rounds: 1 } }]));
  assert.throws(() => validateProfiles([{ ...profile, today: { date: '2026-11-11', rounds: -1 } }]));
});

test('Every skill has a tip for at home', () => {
  for (const skill of SKILLS) assert.ok(homeTips[skill].length > 20, skill);
});

test('Parent insights rank goals by how they are going and only show played activities', () => {
  const independent = (n: number, of: number) =>
    Array.from({ length: of }, (_, i) => ({ level: 1 as const, independent: i < n }));
  const practice = {
    '2:rekenen': independent(10, 10),
    '2:taal': independent(6, 10),
    '2:vormen': independent(2, 10),
    '2:winkel': independent(2, 2),
  };
  const insights = parentInsights(2, { rekenen: 3, taal: 3, vormen: 3, winkel: 1 }, practice);
  assert.deepEqual(
    insights.map((item) => [item.activity.id, item.status]),
    [
      ['vormen', 'lastig'],
      ['taal', 'groeit'],
      ['winkel', 'nieuw'],
      ['rekenen', 'goed'],
    ],
  );
  assert.equal(insights[0].tip, homeTips.vormen);
  for (const group of GROUPS) assert.deepEqual(parentInsights(group, {}, undefined), []);
  assert.ok(activities(2).some((activity) => activity.id === 'vormen'));
});

test('Proefvragen from the next group do not count towards how a goal is going', () => {
  const practice = {
    '4:rekenen': [
      ...Array.from({ length: 6 }, () => ({ level: 1 as const, independent: true })),
      ...Array.from({ length: 6 }, () => ({ level: 2 as const, independent: false, challenge: true })),
    ],
  };
  assert.equal(parentInsights(4, { rekenen: 2 }, practice)[0].status, 'goed');
});
