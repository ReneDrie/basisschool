import { useEffect, useRef, useState } from 'react';
import type { IslandLayout } from '../learning/island-layout';
import { loadProfiles, saveProfiles, type Profile } from '../storage';

/** The profiles on this device, the active one, and saving changes to them. */
export function useProfiles(notify: (message: string) => void) {
  const [profiles, setProfiles] = useState<Profile[]>([]),
    [activeId, setActiveId] = useState(''),
    [loaded, setLoaded] = useState(false);
  useEffect(() => {
    loadProfiles()
      .then((items) => {
        setProfiles(items);
        setActiveId(items[0]?.id ?? '');
        setLoaded(true);
      })
      .catch(() => {
        notify('We kunnen je profielen niet openen. Controleer of deze browser websitegegevens mag bewaren en herlaad de app.');
      });
    // Loads once on start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const profile = profiles.find((p) => p.id === activeId);

  async function persist(next: Profile[]) {
    await saveProfiles(next);
    setProfiles(next);
  }
  /** Saves a change to the active profile. */
  function updateProfile(change: (profile: Profile) => Profile) {
    return persist(profiles.map((p) => (p.id === profile?.id ? change(p) : p)));
  }

  // Island moves come quickly one after another (arrow keys), so they build on the latest profiles instead of the last render.
  const latestProfiles = useRef(profiles);
  latestProfiles.current = profiles;
  function changeLayout(change: (layout: IslandLayout) => IslandLayout) {
    if (!profile) return;
    const next = latestProfiles.current.map((p) => {
      if (p.id !== profile.id) return p;
      const { layout: _, ...rest } = p,
        layout = change(p.layout ?? {});
      return Object.keys(layout).length ? { ...rest, layout } : rest;
    });
    latestProfiles.current = next;
    setProfiles(next);
    saveProfiles(next).catch(() => notify('Je eiland kon niet worden bewaard.'));
  }

  return { profiles, profile, activeId, setActiveId, loaded, persist, updateProfile, changeLayout };
}
