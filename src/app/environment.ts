import { muteTestAudio } from './audio-settings';
import { startAnalytics } from './analytics';

/** True in development and with ?test=1: voice clips and answer sounds stay silent. */
export const silentTestAudio = muteTestAudio(import.meta.env.DEV, window.location.search);

const analyticsSite = import.meta.env.VITE_GOATCOUNTER_URL ?? 'https://renedrie.goatcounter.com';
// Initialized once when the module loads, outside React StrictMode's repeated effect setup.
export const trackAnalytics = startAnalytics({ site: analyticsSite, production: import.meta.env.PROD });
