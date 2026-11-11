import { test } from 'node:test';
import assert from 'node:assert/strict';
import { islandRegions, stickers, islandProgress, discoveriesBetween, EXPEDITION_ROUNDS } from '../src/progression.ts';
import { ART_KINDS, avatarKinds, pictureKinds } from '../src/art-catalog.ts';
import { GROUPS, activities, questionBank } from '../src/content.ts';
import { avatars, validateProfiles, parseBackup, reward, type Profile } from '../src/storage.ts';

test('Six distinct islands have 36 ordered, illustrated rewards and preserve the original collection', () => {
  assert.equal(islandRegions.length, 6);
  assert.equal(stickers.length, 36);
  assert.equal(new Set(stickers.map((r) => r.id)).size, 36);
  assert.deepEqual(
    stickers.slice(0, 6).map((r) => [r.rounds, r.name]),
    [
      [1, 'Eerste spruit'],
      [3, 'Fladdervriend'],
      [5, 'Paddenstoelpaleis'],
      [8, 'Regenboog'],
      [12, 'Bosvriend'],
      [20, 'Droomkasteel'],
    ],
  );
  let previous = 0;
  for (const region of islandRegions) {
    assert.equal(region.rewards.length, 6);
    assert.ok(ART_KINDS.includes(region.art as (typeof ART_KINDS)[number]));
    for (const r of region.rewards) {
      assert.ok(r.rounds > previous);
      assert.ok(r.rounds >= region.unlockAt);
      assert.equal(r.regionId, region.id);
      assert.ok(ART_KINDS.includes(r.art as (typeof ART_KINDS)[number]));
      previous = r.rounds;
    }
  }
});
test('Every unlock boundary preserves earlier rewards and unlocks precisely one region', () => {
  for (const region of islandRegions.slice(1)) {
    const before = islandProgress(region.unlockAt - 1),
      after = islandProgress(region.unlockAt);
    assert.notEqual(before.currentRegion.id, region.id);
    assert.equal(after.currentRegion.id, region.id);
    assert.ok(after.earned.length >= before.earned.length);
    const discoveries = discoveriesBetween(region.unlockAt - 1, region.unlockAt);
    assert.deepEqual(
      discoveries.regions.map((r) => r.id),
      [region.id],
    );
    assert.equal(discoveries.rewards.length, 1);
  }
  for (let rounds = 0; rounds < 500; rounds++) {
    const p = islandProgress(rounds);
    assert.ok(p.nextAt > rounds);
    assert.ok(p.progress >= 0 && p.progress < 1);
    assert.equal(p.earned.length, stickers.filter((r) => r.rounds <= rounds).length);
  }
});
test('Explorer ranks continue beyond the last island and new rank notifications occur exactly at their milestones', () => {
  const last = stickers.at(-1)!.rounds;
  assert.equal(last, 360);
  assert.equal(islandProgress(last).nextAt, last + EXPEDITION_ROUNDS);
  for (let rank = 1; rank <= 100; rank++) {
    const rounds = last + rank * EXPEDITION_ROUNDS,
      p = islandProgress(rounds);
    assert.equal(p.expeditionRank, rank);
    assert.equal(p.nextAt, rounds + EXPEDITION_ROUNDS);
    assert.equal(p.earned.length, 36);
    assert.equal(discoveriesBetween(rounds - 1, rounds).ranks, 1);
    assert.equal(discoveriesBetween(rounds, rounds + 1).ranks, 0);
  }
});
test('Existing saves derive all islands from completed rounds and each adventure still awards one star', () => {
  const profile: Profile = {
    id: 'original',
    name: 'Proef',
    avatar: '🦊',
    group: 3,
    rounds: 24,
    stars: 24,
    skills: { rekenen: 24 },
  };
  const restored = parseBackup(JSON.stringify({ app: 'kleine-ontdekkers', version: 1, profiles: [profile] }))[0];
  assert.deepEqual(validateProfiles([profile]), [profile]);
  assert.deepEqual(restored, profile);
  const next = reward(restored, 'rekenen');
  assert.equal(next.stars, 25);
  assert.equal(next.rounds, 25);
  assert.equal(islandProgress(next.rounds).currentRegion.id, 'bay');
  assert.equal(islandProgress(next.rounds).earned.length, 7);
  assert.equal(restored.rounds, 24);
});
test('All existing avatar IDs and lesson picture symbols have local vector artwork', () => {
  assert.ok(avatars.every((a) => avatarKinds[a]));
  for (const kind of [...Object.values(avatarKinds), ...Object.values(pictureKinds)])
    assert.ok(ART_KINDS.includes(kind as (typeof ART_KINDS)[number]), kind);
});

test('Every pictorial exercise uses a mapped vector illustration, including counting variants', () => {
  for (const group of GROUPS)
    for (const a of activities(group))
      for (const q of questionBank(group, a.id)) {
        for (const symbol of Array.from(q.visual ?? '').filter((c) => c !== '\ufe0f'))
          assert.ok(pictureKinds[symbol], `${q.id}: ${symbol}`);
        if (q.diagram?.kind === 'picture') assert.ok(pictureKinds[q.diagram.symbol], q.id);
        if (q.diagram?.kind === 'pattern')
          assert.ok(
            q.diagram.items.every((s) => s === '?' || pictureKinds[s]),
            q.id,
          );
        if (q.diagram?.kind === 'comparison')
          assert.ok(
            q.diagram.rows.every((row) => row.objects.every((s) => pictureKinds[s])),
            q.id,
          );
      }
});
