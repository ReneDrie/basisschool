import type { Profile } from '../storage';

/** Downloads all profiles as a JSON file that parseBackup can read back. */
export function downloadBackup(profiles: Profile[]) {
  const blob = new Blob([JSON.stringify({ app: 'kleine-ontdekkers', version: 1, profiles }, null, 2)], {
      type: 'application/json',
    }),
    url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = `ontdekkers-reservekopie-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
