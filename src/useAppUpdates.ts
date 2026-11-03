import { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { activateAppUpdate, checkForAppUpdate } from './pwa-updates';

type UpdateStatus = { phase: 'idle' | 'checking' | 'current' | 'available' | 'reloading' | 'error'; message: string };

export function useAppUpdates() {
  const supported = 'serviceWorker' in navigator;
  const [pwaError, setPwaError] = useState(false);
  const [hasOfflineCopy, setHasOfflineCopy] = useState(false);
  const [externalUpdate, setExternalUpdate] = useState(false);
  const activatedElsewhere = useRef(false);
  const [status, setStatus] = useState<UpdateStatus>({ phase: 'idle', message: '' });
  const inProgress = useRef(false);
  const { offlineReady: [offlineReady], needRefresh: [needRefresh, setNeedRefresh] } = useRegisterSW({
    onRegisterError: () => setPwaError(true),
    // Reload only after an explicit click here, even if another tab activates an update.
    onNeedReload: () => { activatedElsewhere.current = true; setExternalUpdate(true); },
  });
  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    navigator.serviceWorker.ready.then(registration => {
      if (!cancelled && registration.active) setHasOfflineCopy(true);
    }).catch(() => { if (!cancelled) setPwaError(true); });
    return () => { cancelled = true; };
  }, [supported]);

  async function discover() {
    if (!supported) throw new Error('Open de app in Safari op je iPad om updates en offline gebruik te ondersteunen.');
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) throw new Error('De app wordt nog klaargemaakt. Probeer het over een paar seconden opnieuw.');
    if (!navigator.onLine) {
      if (registration.waiting) return { registration, available: true };
      throw new Error('Je bent offline. Je kunt gewoon blijven oefenen. Controleer opnieuw wanneer je internet hebt.');
    }
    const available = await checkForAppUpdate(registration) || activatedElsewhere.current;
    setPwaError(false);
    return { registration, available };
  }
  async function run(reload: boolean) {
    if (inProgress.current) return;
    inProgress.current = true;
    setStatus({ phase: 'checking', message: 'We zoeken de nieuwste versie en slaan nieuwe bestanden op. Een grote update kan enkele minuten duren. Laat de app even open…' });
    try {
      const { registration, available } = await discover();
      setNeedRefresh(available);
      if (reload) {
        setStatus({ phase: 'reloading', message: 'De app wordt opnieuw geladen. Je profielen en voortgang blijven bewaard.' });
        await activateAppUpdate(registration);
        window.location.reload();
      } else {
        setStatus(available
          ? { phase: 'available', message: 'Een nieuwe versie staat klaar. Tik op ‘Nieuwe versie laden’ om deze te openen.' }
          : { phase: 'current', message: 'Je gebruikt de nieuwste versie.' });
      }
    } catch (error) {
      setStatus({ phase: 'error', message: error instanceof Error ? error.message : 'Controleren is niet gelukt. Probeer het opnieuw.' });
    } finally {
      inProgress.current = false;
    }
  }
  return {
    offlineSupported: supported, readyForOffline: offlineReady || hasOfflineCopy, pwaError, needRefresh: needRefresh || externalUpdate, status,
    updating: status.phase === 'checking' || status.phase === 'reloading',
    checkForUpdates: () => run(false), reloadApp: () => run(true),
  };
}
