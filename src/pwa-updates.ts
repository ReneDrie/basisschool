// A full audio refresh downloads more than a thousand files on slower iPads.
export const UPDATE_DOWNLOAD_TIMEOUT_MS = 5 * 60_000;
export const UPDATE_ACTIVATION_TIMEOUT_MS = 60_000;

/** Wait for the complete offline bundle before reporting an update as ready. */
export function checkForAppUpdate(
  registration: ServiceWorkerRegistration,
  timeoutMs = UPDATE_DOWNLOAD_TIMEOUT_MS,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let finished = false;
    let requestComplete = false;
    let candidate: ServiceWorker | null = null;
    const timer = setTimeout(() => finish(new Error('De controle duurt te lang. Probeer het straks opnieuw.')), timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      registration.removeEventListener('updatefound', onUpdateFound);
      candidate?.removeEventListener('statechange', onStateChange);
    }
    function finish(error?: Error, available = false) {
      if (finished) return;
      finished = true;
      cleanup();
      if (error) reject(error);
      else resolve(available);
    }
    function evaluate() {
      if (finished || !requestComplete) return;
      if (candidate?.state === 'redundant') {
        finish(new Error('De nieuwe versie kon niet volledig worden opgeslagen. De huidige app blijft beschikbaar.'));
      } else if (registration.waiting) {
        finish(undefined, true);
      } else if (!candidate || candidate.state === 'activated') {
        finish();
      }
    }
    function onStateChange() {
      queueMicrotask(evaluate);
    }
    function observe(worker: ServiceWorker | null) {
      if (!worker || worker === candidate || finished) return;
      candidate?.removeEventListener('statechange', onStateChange);
      candidate = worker;
      candidate.addEventListener('statechange', onStateChange);
    }
    function onUpdateFound() {
      observe(registration.installing);
    }

    registration.addEventListener('updatefound', onUpdateFound);
    observe(registration.installing);
    // update() uses the browser's update protocol, not a response from our offline cache.
    Promise.resolve()
      .then(() => registration.update())
      .then(() => {
        if (finished) return;
        requestComplete = true;
        observe(registration.installing);
        evaluate();
      })
      .catch(() => finish(new Error('Geen verbinding met de updateserver. Probeer het opnieuw wanneer je internet hebt.')));
  });
}

/** Activate only a fully downloaded version; never unregister or delete caches. */
export function activateAppUpdate(
  registration: ServiceWorkerRegistration,
  timeoutMs = UPDATE_ACTIVATION_TIMEOUT_MS,
): Promise<boolean> {
  const worker = registration.waiting;
  if (!worker) return Promise.resolve(false);
  return new Promise((resolve, reject) => {
    let finished = false;
    const timer = setTimeout(() => finish(new Error('De nieuwe versie laden duurt te lang. Probeer het opnieuw.')), timeoutMs);
    function finish(error?: Error) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      worker!.removeEventListener('statechange', onStateChange);
      if (error) reject(error);
      else resolve(true);
    }
    function onStateChange() {
      if (worker!.state === 'activated') finish();
      else if (worker!.state === 'redundant')
        finish(new Error('De update kon niet worden geladen. Probeer opnieuw op updates te controleren.'));
    }
    worker.addEventListener('statechange', onStateChange);
    try {
      worker.postMessage({ type: 'SKIP_WAITING' });
      onStateChange();
    } catch {
      finish(new Error('De update kon niet worden gestart. Probeer het opnieuw.'));
    }
  });
}
