import { useRef } from 'react';
import { Download, Plus, RefreshCw, Trash2, Upload } from 'lucide-react';
import { AvatarArt } from '../art/Art';
import { GROUPS, type Group } from '../content';
import type { useAppUpdates } from '../app/useAppUpdates';
import type { Profile } from '../storage';
import { ParentInsights } from './ParentInsights';

/** Settings for parents: the child's group and step choice, insights, backups, updates and deleting a profile. */
export function ParentsDialog({
  profile,
  loaded,
  busy,
  online,
  updates,
  onInstall,
  onManageProfiles,
  onChangeGroup,
  onChangeChooseLevel,
  onExport,
  onImport,
  onDelete,
}: {
  profile?: Profile;
  loaded: boolean;
  busy: boolean;
  online: boolean;
  updates: ReturnType<typeof useAppUpdates>;
  onInstall: () => void;
  onManageProfiles: () => void;
  onChangeGroup: (group: Group) => void;
  onChangeChooseLevel: (value: boolean) => void;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
  onDelete: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { offlineSupported, pwaError, readyForOffline, needRefresh, status, updating, checkForUpdates, reloadApp } = updates;
  const locked = busy || updating;
  const offlineLabel = !offlineSupported
    ? 'Open in Safari voor offline'
    : pwaError
      ? 'Offline opslaan niet gelukt'
      : readyForOffline
        ? 'Klaar voor offline spelen'
        : online
          ? 'Offline voorbereiden…'
          : 'Offline';
  async function importFile(file?: File) {
    if (!file || busy) return;
    await onImport(file);
    if (fileRef.current) fileRef.current.value = '';
  }
  return (
    <>
      <div className="parent-app-status" role="status">
        {offlineLabel}
      </div>
      <button className="secondary-button" onClick={onInstall}>
        <Download size={18} />
        Op je iPad zetten
      </button>
      <div className="parent-section">
        <h3>Profiel & niveau</h3>
        {profile ? (
          <>
            <div className="parent-profile">
              <span>
                <AvatarArt avatar={profile.avatar} />
              </span>
              <div>
                <strong>{profile.name}</strong>
                <p>
                  {profile.rounds} {profile.rounds === 1 ? 'rondje' : 'rondjes'} · {profile.stars}{' '}
                  {profile.stars === 1 ? 'ster' : 'sterren'}
                </p>
              </div>
            </div>
            <label className="field-label">
              Huidige groep
              <select value={profile.group} onChange={(e) => onChangeGroup(Number(e.target.value) as Group)} disabled={locked}>
                {GROUPS.map((g) => (
                  <option key={g} value={g}>
                    Groep {g}
                  </option>
                ))}
              </select>
            </label>
            <label className="parent-toggle">
              <input
                type="checkbox"
                checked={!!profile.chooseLevel}
                disabled={locked}
                onChange={(e) => onChangeChooseLevel(e.target.checked)}
              />
              <span>Mijn kind kiest zelf stap 1 of stap 2</span>
            </label>
            <p className="small-text">
              De groep is de basis. Een spel start meteen en de uitdaging groeit mee met het eiland en de recente resultaten per
              spel. Zet het vinkje aan als je kind zelf een vaste stap wil kiezen. Vanaf Wolkenrijk kan bij rekenen en
              Woordfabriek één proefvraag richting de volgende groep verschijnen als het spel goed gaat. Verdiende sterren en
              stickers blijven behouden.
            </p>
            <ParentInsights profile={profile} />
          </>
        ) : (
          <p>Maak eerst een kinderprofiel om te beginnen.</p>
        )}
        <button className="text-button" onClick={onManageProfiles}>
          <Plus size={17} />
          Profielen beheren
        </button>
      </div>
      <div className="parent-section">
        <h3>Voortgang veilig bewaren</h3>
        <p>
          Profielen staan alleen in deze app op dit apparaat. Ze worden niet gedeeld met andere iPads. Maak af en toe een
          reservekopie: gewiste websitegegevens kunnen ook de voortgang verwijderen.
        </p>
        <div className="backup-actions">
          <button className="secondary-button" onClick={onExport} disabled={!loaded || locked}>
            <Download size={16} />
            Reservekopie
          </button>
          <button className="secondary-button" onClick={() => fileRef.current?.click()} disabled={!loaded || locked}>
            <Upload size={16} />
            Terugzetten
          </button>
          <input
            type="file"
            ref={fileRef}
            accept=".json,application/json"
            hidden
            onChange={(e) => void importFile(e.target.files?.[0])}
          />
        </div>
      </div>
      <div className="parent-section app-updates">
        <h3>De nieuwste versie</h3>
        <p>Zoek naar nieuwe opdrachten en verbeteringen. Je profielen, sterren en stickers blijven bewaard.</p>
        <p className="app-version">
          Appversie:{' '}
          {new Intl.DateTimeFormat('nl-NL', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(__APP_BUILD_TIME__))}
        </p>
        <div className="update-actions">
          <button className="secondary-button" disabled={locked} onClick={() => void checkForUpdates()}>
            <RefreshCw size={16} className={updating ? 'spinning' : ''} />
            {updating ? 'Even controleren…' : 'Controleer op updates'}
          </button>
          <button className="primary-button" disabled={locked} onClick={() => void reloadApp()}>
            {status.phase === 'reloading' ? 'App wordt geladen…' : needRefresh ? 'Nieuwe versie laden' : 'App opnieuw laden'}
          </button>
        </div>
        <p className={`update-status ${status.phase === 'error' ? 'update-error' : ''}`} role="status">
          {status.message ||
            (needRefresh ? 'Er staat een nieuwe versie klaar.' : 'Je kunt hier op elk moment controleren of er een update is.')}
        </p>
      </div>
      <div className="parent-section">
        <h3>Fijn om te weten</h3>
        <p>
          Elke afgeronde ronde verdient één ster, ook met hints. Er is geen tijdsdruk. De oefeningen zijn een startaanbod; stem
          het niveau af op wat je kind op school oefent.
        </p>
        <p>Luisterfragmenten voor groep 2 en 3 worden mee opgeslagen voor offline gebruik.</p>
      </div>
      {profile && (
        <button className="danger-button" disabled={locked} onClick={onDelete}>
          <Trash2 size={16} />
          Profiel van {profile.name} verwijderen
        </button>
      )}
    </>
  );
}
