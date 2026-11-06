import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyticsDashboard, startAnalytics } from '../src/analytics.ts';

function setup({ online = true, standalone = false, safari = false, search = '', hostname = 'ontdekkers.example', dnt = '0' } = {}) {
  const browser = Object.assign(new EventTarget(), {
    location: { search, hostname },
    navigator: { onLine: online, standalone: safari, doNotTrack: dnt },
    matchMedia: () => ({ matches: standalone }),
    goatcounter: undefined as any,
  });
  const scripts: any[] = [];
  const counts: any[] = [];
  const doc = {
    createElement: () => ({ dataset: {}, remove() { scripts.splice(scripts.indexOf(this), 1); } }),
    head: { appendChild(script: any) { scripts.push(script); } },
  };
  function start(production = true, site = 'https://ontdekkers.goatcounter.com') {
    return startAnalytics({ site, production }, browser as any, doc as any);
  }
  function loaded() {
    assert.equal(browser.goatcounter.no_onload, true);
    browser.goatcounter.count = (data: unknown) => counts.push(data);
    scripts.at(-1).onload();
  }
  return { browser, scripts, counts, start, loaded };
}

test('Analytics only accepts the public hosted site URL', () => {
  assert.equal(analyticsDashboard(' https://my-app.goatcounter.com/ '), 'https://my-app.goatcounter.com/');
  for (const url of [undefined, '', 'http://a.goatcounter.com', 'https://a.goatcounter.com.evil.test', 'https://a.goatcounter.com/count', 'javascript:alert(1)']) {
    assert.equal(analyticsDashboard(url), undefined);
  }
});

test('Development, browser checks, localhost, Do Not Track and missing config send nothing', () => {
  for (const options of [{ search: '?test=1' }, { search: '?audio=on&test=1' }, { hostname: 'localhost' }, { hostname: '127.0.0.1' }, { hostname: '[::1]' }, { dnt: '1' }]) {
    const fixture = setup(options);
    fixture.start()('round-completed');
    fixture.browser.dispatchEvent(new Event('appinstalled'));
    fixture.browser.dispatchEvent(new Event('online'));
    assert.equal(fixture.scripts.length, 0);
  }
  for (const [production, site] of [[false, 'https://a.goatcounter.com'], [true, '']] as const) {
    const fixture = setup();
    fixture.start(production, site)('round-completed');
    assert.equal(fixture.scripts.length, 0);
  }
});

test('Counts one sanitized app visit and every completed round, including before script load', () => {
  const fixture = setup({ search: '?name=Private&answer=secret#profile' });
  const track = fixture.start();
  track('round-completed');
  assert.equal(fixture.scripts.length, 1);
  assert.equal(fixture.scripts[0].dataset.goatcounter, 'https://ontdekkers.goatcounter.com/count');
  assert.equal(fixture.scripts[0].referrerPolicy, 'no-referrer');
  fixture.loaded();
  track('round-completed');
  fixture.browser.dispatchEvent(new Event('online'));
  assert.deepEqual(fixture.counts.map(c => c.path), ['/', 'round-completed', 'round-completed']);
  assert.equal(fixture.counts[0].event, false);
  assert.equal(fixture.counts[0].no_session, false);
  for (const count of fixture.counts.slice(1)) {
    assert.equal(count.event, true);
    assert.equal(count.no_session, true);
  }
  for (const count of fixture.counts) assert.equal(count.referrer, '');
  assert.doesNotMatch(JSON.stringify(fixture.counts), /Private|secret|profile/);
});

test('Home-screen opens use standard display mode and the iPad Safari fallback', () => {
  for (const options of [{ standalone: true }, { safari: true }]) {
    const fixture = setup(options);
    fixture.start();
    fixture.loaded();
    assert.deepEqual(fixture.counts.map(c => c.path), ['/', 'home-screen-open']);
    fixture.browser.dispatchEvent(new Event('appinstalled'));
    fixture.browser.dispatchEvent(new Event('appinstalled'));
    assert.equal(fixture.counts.filter(c => c.path === 'app-installed').length, 1);
  }
});

test('Offline use remains usable, with a visit counted on reconnect and no offline round history uploaded', () => {
  const fixture = setup({ online: false, safari: true });
  const track = fixture.start();
  track('round-completed');
  fixture.browser.dispatchEvent(new Event('appinstalled'));
  assert.equal(fixture.scripts.length, 0);
  fixture.browser.navigator.onLine = true;
  fixture.browser.dispatchEvent(new Event('online'));
  fixture.loaded();
  assert.deepEqual(fixture.counts.map(c => c.path), ['/', 'home-screen-open']);
  fixture.browser.navigator.onLine = false;
  track('round-completed');
  assert.equal(fixture.counts.length, 2);
});

test('An unavailable analytics script can retry and never blocks playing', () => {
  const fixture = setup();
  const track = fixture.start();
  fixture.scripts[0].onerror();
  assert.equal(fixture.scripts.length, 0);
  track('round-completed');
  fixture.loaded();
  fixture.browser.goatcounter.count = () => { throw new Error('Analytics unavailable'); };
  assert.doesNotThrow(() => track('round-completed'));
});
