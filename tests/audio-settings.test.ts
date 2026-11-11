import { test } from 'node:test';
import assert from 'node:assert/strict';
import { muteTestAudio } from '../src/audio-settings.ts';

test('The ordinary production app keeps its audio, including on localhost previews', () => {
  for (const search of ['', '?test=0', '?audio=on', '?other=value']) assert.equal(muteTestAudio(false, search), false);
});
test('Development and explicit production test runs stay silent', () => {
  assert.equal(muteTestAudio(true, ''), true);
  assert.equal(muteTestAudio(true, '?other=value'), true);
  assert.equal(muteTestAudio(false, '?test=1'), true);
  assert.equal(muteTestAudio(false, '?other=value&test=1'), true);
  assert.equal(muteTestAudio(true, '?test=1&audio=on'), true);
});
test('An intentional listening check can enable development audio without changing the build', () => {
  assert.equal(muteTestAudio(true, '?audio=on'), false);
  assert.equal(muteTestAudio(false, '?test=1&audio=on'), true, 'An explicit test run always stays silent');
});
