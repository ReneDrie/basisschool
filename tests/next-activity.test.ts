import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GROUPS, activities } from '../src/content.ts';
import { nextActivity } from '../src/learning/next-activity.ts';
import { reward, emptyProfile, parseBackup, validateProfiles } from '../src/storage.ts';

test('Ga spelen rotates through the worlds and favours activities that were played least', () => {
  for (const group of GROUPS) {
    let profile = emptyProfile('Test', '🦊', group);
    const seen = new Set<string>(),
      worldsInOrder: string[] = [];
    const total = activities(group).length;
    for (let i = 0; i < total * 2; i++) {
      const activity = nextActivity(group, profile.skills, profile.rounds);
      assert.ok(
        activities(group).some((item) => item.id === activity.id),
        `${activity.id} is offered in groep ${group}`,
      );
      seen.add(activity.id);
      worldsInOrder.push(activity.world);
      profile = reward(profile, activity.id);
    }
    assert.equal(seen.size, total, `every activity in groep ${group} comes up`);
    for (let i = 1; i < worldsInOrder.length; i++)
      assert.notEqual(worldsInOrder[i], worldsInOrder[i - 1], 'two rounds in a row use different worlds');
  }
});

test('A child who played one activity a lot gets a different one from that world next', () => {
  const first = nextActivity(2, {}, 0);
  const next = nextActivity(2, { [first.id]: 5 }, 3);
  assert.equal(next.world, first.world);
  assert.notEqual(next.id, first.id);
});

test('The parent choice to pick a step survives a backup and rejects bad values', () => {
  const profile = { ...emptyProfile('Test', '🦊', 2), chooseLevel: true };
  const [restored] = parseBackup(JSON.stringify({ app: 'kleine-ontdekkers', version: 1, profiles: [profile] }));
  assert.equal(restored.chooseLevel, true);
  const [plain] = parseBackup(
    JSON.stringify({ app: 'kleine-ontdekkers', version: 1, profiles: [emptyProfile('Test', '🦊', 2)] }),
  );
  assert.equal('chooseLevel' in plain, false);
  assert.throws(() => validateProfiles([{ ...profile, chooseLevel: 'ja' }]));
});
