type Count = {
  path: string;
  title: string;
  referrer: string;
  event: boolean;
  no_session: boolean;
};

type AnalyticsWindow = Window & {
  goatcounter?: { no_onload?: boolean; count?: (data: Count) => void };
};

export type AnalyticsEvent = 'home-screen-open' | 'app-installed' | 'round-completed';
const titles: Record<AnalyticsEvent, string> = {
  'home-screen-open': 'Geopend vanaf het beginscherm',
  'app-installed': 'Installatie gemeld door de browser',
  'round-completed': 'Rondje afgerond',
};

// Only accept a hosted GoatCounter site; this URL is public, never an API key.
export function analyticsDashboard(site: string | undefined): string | undefined {
  const value = site?.trim().replace(/\/$/, '');
  return value && /^https:\/\/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.goatcounter\.com$/.test(value)
    ? `${value}/` : undefined;
}

export function startAnalytics(
  options: { site?: string; production: boolean },
  browser: AnalyticsWindow = window,
  doc: Document = document,
): (event: AnalyticsEvent) => void {
  const dashboard = analyticsDashboard(options.site);
  const local = /^(localhost|127(?:\.\d+){3}|\[::1\])$/.test(browser.location.hostname);
  if (!dashboard || !options.production || local ||
      new URLSearchParams(browser.location.search).get('test') === '1' ||
      browser.navigator.doNotTrack === '1') return () => {};

  let loading = false;
  let opened = false;
  const pending: AnalyticsEvent[] = [];
  const standalone = () => browser.matchMedia('(display-mode: standalone)').matches ||
    (browser.navigator as Navigator & { standalone?: boolean }).standalone === true;

  function count(path: string, title: string, event: boolean) {
    // Explicit constants prevent URL queries, profile names, answers or referrers leaking.
    try {
      browser.goatcounter?.count?.({ path, title, referrer: '', event, no_session: event });
    } catch { /* Analytics must never interrupt playing or saving progress. */ }
  }

  function flush() {
    if (!browser.navigator.onLine || !browser.goatcounter?.count) return;
    if (!opened) {
      opened = true;
      count('/', 'Kleine Ontdekkers', false);
      if (standalone()) count('home-screen-open', titles['home-screen-open'], true);
    }
    for (const event of pending.splice(0)) count(event, titles[event], true);
  }

  function load() {
    if (!browser.navigator.onLine) return;
    if (browser.goatcounter?.count) { flush(); return; }
    if (loading) return;
    loading = true;
    browser.goatcounter = { no_onload: true };
    const script = doc.createElement('script');
    script.async = true;
    script.src = 'https://gc.zgo.at/count.js';
    script.referrerPolicy = 'no-referrer';
    script.dataset.goatcounter = `${dashboard}count`;
    script.onload = () => { loading = false; flush(); };
    script.onerror = () => { loading = false; script.remove(); };
    doc.head.appendChild(script);
  }

  function track(event: AnalyticsEvent) {
    if (!browser.navigator.onLine) return;
    // Bound this short, in-memory queue while the optional script downloads.
    if (pending.length < 20) pending.push(event);
    load();
  }

  browser.addEventListener('appinstalled', () => track('app-installed'), { once: true });
  browser.addEventListener('online', load);
  load();
  return track;
}
