import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampSpot, resetRegion, validateLayout, zoneOf } from '../src/learning/island-layout.ts';
import { emptyProfile, parseBackup, validateProfiles } from '../src/storage.ts';

test('Dragged treasures stay on the grass, in the sky or in the water', () => {
  assert.deepEqual(clampSpot({ x: 280, y: 240 }, 'ground'), { x: 280, y: 240 });
  const offIsland = clampSpot({ x: 20, y: 350 }, 'ground');
  assert.ok(offIsland.x >= 109 && offIsland.y <= 282, 'pulled back onto the grass');
  assert.deepEqual(clampSpot({ x: 0, y: 0 }, 'sky'), { x: 70, y: 70 });
  assert.deepEqual(clampSpot({ x: 600, y: 200 }, 'water'), { x: 490, y: 300 });
  assert.equal(zoneOf({ y: 265 }), 'ground');
  assert.equal(zoneOf({ y: 108, grounded: false }), 'sky');
  assert.equal(zoneOf({ y: 315, grounded: false }), 'water');
});

test('Resetting one island keeps the treasures moved on other islands', () => {
  const layout = { 'garden-butterfly': { x: 200, y: 120 }, 'bay-shell': { x: 250, y: 250 } };
  assert.deepEqual(resetRegion(layout, 'garden'), { 'bay-shell': { x: 250, y: 250 } });
  assert.deepEqual(resetRegion(undefined, 'garden'), {});
});

test('The island layout survives a backup and rejects unknown treasures or spots outside the drawing', () => {
  const profile = { ...emptyProfile('Test', '🦊', 2), layout: { 'garden-sprout': { x: 180, y: 250 } } };
  const [restored] = parseBackup(JSON.stringify({ app: 'kleine-ontdekkers', version: 1, profiles: [profile] }));
  assert.deepEqual(restored.layout, { 'garden-sprout': { x: 180, y: 250 } });
  assert.equal('layout' in validateProfiles([emptyProfile('Test', '🦊', 2)])[0], false);
  assert.throws(() => validateLayout({ 'garden-dragon': { x: 1, y: 1 } }));
  assert.throws(() => validateLayout({ 'garden-sprout': { x: 900, y: 1 } }));
  assert.throws(() => validateLayout({ 'garden-sprout': { x: '1', y: 1 } }));
});
