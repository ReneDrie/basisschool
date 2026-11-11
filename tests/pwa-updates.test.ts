import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activateAppUpdate, checkForAppUpdate } from '../src/pwa-updates.ts';

class Worker extends EventTarget {
  state = 'installing';
  messages: unknown[] = [];
  onMessage = () => {};
  transition(state: string) {
    this.state = state;
    this.dispatchEvent(new Event('statechange'));
  }
  postMessage(message: unknown) {
    this.messages.push(message);
    this.onMessage();
  }
}
class Registration extends EventTarget {
  installing: Worker | null = null;
  waiting: Worker | null = null;
  checks = 0;
  onUpdate: () => void | Promise<void> = () => {};
  async update() {
    this.checks++;
    await this.onUpdate();
    return this;
  }
}
const registration = (value: Registration) => value as unknown as ServiceWorkerRegistration;
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));

test('An unchanged version is reported current only after a successful server check', async () => {
  const reg = new Registration();
  assert.equal(await checkForAppUpdate(registration(reg)), false);
  assert.equal(reg.checks, 1);
});
test('Checking waits for the complete installation before offering a new version', async () => {
  const reg = new Registration(),
    worker = new Worker();
  reg.onUpdate = () => {
    reg.installing = worker;
    reg.dispatchEvent(new Event('updatefound'));
  };
  let finished = false;
  const result = checkForAppUpdate(registration(reg)).then((value) => {
    finished = true;
    return value;
  });
  await tick();
  assert.equal(finished, false, 'Downloading assets must not count as an available update');
  reg.installing = null;
  reg.waiting = worker;
  worker.transition('installed');
  assert.equal(await result, true);
  assert.deepEqual(worker.messages, [], 'Checking must never activate or reload');
});
test('A slow audio download can finish after several minutes without timing out', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const reg = new Registration(),
    worker = new Worker();
  reg.onUpdate = () => {
    reg.installing = worker;
    reg.dispatchEvent(new Event('updatefound'));
  };
  let finished = false;
  const result = checkForAppUpdate(registration(reg)).then((value) => {
    finished = true;
    return value;
  });
  await tick();
  t.mock.timers.tick(4 * 60_000);
  await tick();
  assert.equal(finished, false, 'Keep waiting while the offline bundle is still downloading');
  reg.installing = null;
  reg.waiting = worker;
  worker.transition('installed');
  assert.equal(await result, true);
});
test('A stalled update still times out after the five-minute download allowance', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const reg = new Registration();
  reg.onUpdate = () => new Promise(() => {});
  let failed = false;
  const result = assert.rejects(checkForAppUpdate(registration(reg)), /duurt te lang/).then(() => {
    failed = true;
  });
  await tick();
  t.mock.timers.tick(299_999);
  await tick();
  assert.equal(failed, false);
  t.mock.timers.tick(1);
  await result;
  assert.equal(failed, true);
});
test('An already waiting update is still checked against the server without activating it', async () => {
  const reg = new Registration(),
    worker = new Worker();
  worker.state = 'installed';
  reg.waiting = worker;
  assert.equal(await checkForAppUpdate(registration(reg)), true);
  assert.equal(reg.checks, 1);
  assert.deepEqual(worker.messages, []);
});
test('An update that fails while downloading is not reported as current or ready', async () => {
  const reg = new Registration(),
    worker = new Worker();
  reg.onUpdate = () => {
    reg.installing = worker;
    reg.dispatchEvent(new Event('updatefound'));
  };
  const result = assert.rejects(checkForAppUpdate(registration(reg)), /niet volledig/);
  await tick();
  worker.transition('redundant');
  await result;
});
test('Network failures and stalled requests leave a retryable error', async () => {
  const reg = new Registration();
  reg.onUpdate = () => {
    throw new Error('Server unavailable');
  };
  await assert.rejects(checkForAppUpdate(registration(reg)), /Geen verbinding/);
  reg.onUpdate = () => new Promise(() => {});
  await assert.rejects(checkForAppUpdate(registration(reg), 10), /duurt te lang/);
});
test('A late update cannot complete a check that already timed out', async () => {
  const reg = new Registration(),
    worker = new Worker();
  let release!: () => void;
  reg.onUpdate = () =>
    new Promise<void>((resolve) => {
      release = resolve;
    });
  await assert.rejects(checkForAppUpdate(registration(reg), 10), /duurt te lang/);
  reg.installing = worker;
  reg.dispatchEvent(new Event('updatefound'));
  reg.waiting = worker;
  worker.transition('installed');
  release();
  await tick();
  assert.deepEqual(worker.messages, []);
});
test('Activation sends skip-waiting and waits for activation to finish', async () => {
  const reg = new Registration(),
    worker = new Worker();
  worker.state = 'installed';
  reg.waiting = worker;
  let finished = false;
  const result = activateAppUpdate(registration(reg)).then((value) => {
    finished = true;
    return value;
  });
  await tick();
  assert.equal(finished, false);
  assert.deepEqual(worker.messages, [{ type: 'SKIP_WAITING' }]);
  worker.transition('activating');
  await tick();
  assert.equal(finished, false);
  worker.transition('activated');
  assert.equal(await result, true);
});
test('Activation gets a full minute, allowing a slow activation without waiting forever', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const reg = new Registration(),
    worker = new Worker();
  worker.state = 'installed';
  reg.waiting = worker;
  let finished = false;
  const result = activateAppUpdate(registration(reg)).then((value) => {
    finished = true;
    return value;
  });
  t.mock.timers.tick(30_000);
  await tick();
  assert.equal(finished, false);
  worker.transition('activated');
  assert.equal(await result, true);

  worker.state = 'installed';
  const stalled = assert.rejects(activateAppUpdate(registration(reg)), /duurt te lang/);
  t.mock.timers.tick(60_000);
  await stalled;
});
test('Reload without a waiting update does not message the active worker', async () => {
  assert.equal(await activateAppUpdate(registration(new Registration())), false);
});
test('Failed or stalled activation gives an error instead of requesting a stale reload', async () => {
  const reg = new Registration(),
    worker = new Worker();
  worker.state = 'installed';
  reg.waiting = worker;
  worker.onMessage = () => worker.transition('redundant');
  await assert.rejects(activateAppUpdate(registration(reg)), /niet worden geladen/);
  worker.state = 'installed';
  worker.onMessage = () => {};
  await assert.rejects(activateAppUpdate(registration(reg), 10), /duurt te lang/);
});
