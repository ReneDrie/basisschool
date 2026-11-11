import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Flag,
  LockKeyhole,
  Move,
  Play,
  RotateCcw,
  Trophy,
  Map,
  ChevronLeft,
} from 'lucide-react';
import { activities, stickers, worlds, type Activity, type Group, type Skill, type World } from './content';
import { Art, AvatarArt } from './Art';
import { islandProgress, islandRegions, type IslandReward } from './progression';
import { DAILY_ROUNDS } from './learning/today';
import type { Spot } from './learning/island-layout';
import { Island, ActivityArt } from './Island';
import type { Profile } from './storage';

export type AppPage = 'island' | 'lessons' | 'treasures';
export function topicLabel(activity: Activity, group: Group): string {
  const labels: Record<Skill, string> = {
    natuurmissies: 'Natuurmissies',
    klankstudio: 'Klankstudio',
    rekenbus: 'Rekenbus',
    woordfabriek: 'Woordfabriek',
    zinnenbouwer: 'Zinnenbouwer',
    getallentrein: 'Getallentrein',
    speurneus: 'Speurneus',
    koppelen: 'Koppelplein',
    verhalen: 'Verhalenpad',
    bouwen: 'Bouwplaats',
    winkel: 'Eilandwinkel',
    rekenen: group === 2 ? 'Tellen' : 'Rekenen',
    taal: group === 2 ? 'Rijmen' : group === 3 ? 'Woorden' : 'Spelling',
    tafels: 'Tafels',
    lezen: 'Lezen',
    vormen: 'Vormen',
    klanken: 'Letters',
    vergelijken: 'Vergelijken',
    patronen: 'Patronen',
    klok: 'Klokkijken',
    geld: 'Geld',
    breuken: 'Breuken',
    grafieken: 'Grafieken',
  };
  return labels[activity.id];
}
export function AppTabs({ page, onChange }: { page: AppPage; onChange: (page: AppPage) => void }) {
  return (
    <nav className="app-tabs" aria-label="Hoofdnavigatie">
      {(
        [
          ['island', 'Eiland', Flag],
          ['lessons', 'Lessen', BookOpen],
          ['treasures', 'Schatten', Trophy],
        ] as const
      ).map(([id, title, Icon]) => (
        <button
          key={id}
          className={page === id ? 'selected' : ''}
          aria-current={page === id ? 'page' : undefined}
          onClick={() => onChange(id)}
        >
          <span>
            <Icon size={27} />
          </span>
          {title}
        </button>
      ))}
    </nav>
  );
}
export function IslandHome({
  profile,
  loaded,
  disabled,
  today,
  celebrate,
  onPlay,
  onTreasures,
  onProfile,
  onPlace,
  onResetLayout,
}: {
  profile?: Profile;
  loaded: boolean;
  disabled: boolean;
  today: number;
  celebrate?: IslandReward;
  onPlay: () => void;
  onTreasures: () => void;
  onProfile: () => void;
  onPlace: (rewardId: string, spot: Spot) => void;
  onResetLayout: (regionId: string) => void;
}) {
  const rounds = profile?.rounds ?? 0,
    progress = islandProgress(rounds);
  const [selected, setSelected] = useState(progress.currentRegion.id),
    [showMap, setShowMap] = useState(false),
    [named, setNamed] = useState<IslandReward | null>(null),
    [decorating, setDecorating] = useState(false);
  useEffect(() => {
    setSelected(islandProgress(rounds).currentRegion.id);
    setShowMap(false);
  }, [profile?.id, progress.currentRegion.id]);
  useEffect(() => {
    setNamed(null);
    setDecorating(false);
  }, [profile?.id, selected]);
  const region = islandRegions.find((r) => r.id === selected && r.unlockAt <= rounds) ?? progress.currentRegion;
  const nextRegion = islandRegions.find((r) => r.unlockAt > rounds),
    doneToday = !!profile && today >= DAILY_ROUNDS;
  const fresh = celebrate && celebrate.regionId === region.id ? celebrate : undefined;
  const hasTreasures = region.rewards.some((reward) => reward.rounds <= rounds),
    moved = region.rewards.some((reward) => profile?.layout?.[reward.id]);
  const bubble = named
    ? `${named.name}!`
    : decorating
      ? 'Sleep je schatten!'
      : fresh
        ? `Nieuw: ${fresh.name}!`
        : doneToday
          ? 'Tot morgen!'
          : 'Ga je mee?';
  const title = showMap
    ? 'Jouw eilanden'
    : !profile
      ? 'Jouw avontuur begint hier!'
      : decorating
        ? 'Versier je eiland'
        : doneToday
          ? 'Klaar voor vandaag!'
          : `Hoi ${profile.name}!`;
  return (
    <section className={`island-home theme-${region.theme}`} aria-labelledby="home-title">
      <div className="home-heading">
        <h1 id="home-title" tabIndex={-1}>
          {title}
        </h1>
        <span className="home-spark" aria-hidden="true">
          ✦
        </span>
      </div>
      <div className="island-toolbar">
        {profile && !decorating && (
          <span
            className={`today-dots ${doneToday ? 'is-done' : ''}`}
            role="img"
            aria-label={`Vandaag ${Math.min(today, DAILY_ROUNDS)} van de ${DAILY_ROUNDS} rondjes gespeeld`}
          >
            {Array.from({ length: DAILY_ROUNDS }, (_, i) => (
              <i key={i} className={i < today ? 'filled' : ''} />
            ))}
          </span>
        )}
        {!decorating && (
          <button className="world-map-button" onClick={() => setShowMap(!showMap)}>
            {showMap ? <ChevronLeft size={18} /> : <Map size={18} />} {showMap ? 'Terug' : 'Wereldkaart'}
          </button>
        )}
        {profile && hasTreasures && !showMap && !decorating && (
          <button
            className="world-map-button decorate-button"
            onClick={() => {
              setNamed(null);
              setDecorating(true);
            }}
          >
            <Move size={18} /> Versieren
          </button>
        )}
      </div>
      {showMap ? (
        <div className="island-map" aria-label="Eilandenwereld">
          {islandRegions.map((r, index) => {
            // Only the next island shows how far away it is; later ones simply stay a surprise.
            const unlocked = rounds >= r.unlockAt,
              next = r === nextRegion,
              left = r.unlockAt - rounds,
              distance = `Nog ${left} ${left === 1 ? 'rondje' : 'rondjes'}`;
            return (
              <button
                key={r.id}
                className={`island-map-card ${unlocked ? 'open' : 'locked'} ${region.id === r.id ? 'current' : ''}`}
                disabled={!unlocked}
                aria-label={`${r.name}${unlocked ? '' : next ? `, ${distance.toLowerCase()}` : ', nog geheim'}`}
                onClick={() => {
                  setSelected(r.id);
                  setShowMap(false);
                }}
              >
                <span className="map-number">{index + 1}</span>
                <Island discoveries={rounds} region={r} layout={profile?.layout} />
                <strong>{r.name}</strong>
                <span className="map-card-status">
                  {unlocked ? (
                    `${r.rewards.filter((reward) => reward.rounds <= rounds).length} / ${r.rewards.length} schatten`
                  ) : (
                    <>
                      <LockKeyhole size={14} />
                      {next ? distance : 'Nog geheim'}
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <div className="island-scene">
            <div className="scene-sun" aria-hidden="true">
              <Art kind={region.theme === 'stars' ? 'moon' : 'sun'} />
            </div>
            <div className="scene-cloud cloud-one" aria-hidden="true" />
            <div className="scene-cloud cloud-two" aria-hidden="true" />
            <div className="home-island">
              <Island
                discoveries={rounds}
                region={region}
                highlight={decorating ? undefined : fresh?.art}
                onTreasure={profile ? setNamed : undefined}
                layout={profile?.layout}
                editing={decorating ? { onPlace } : undefined}
              />
            </div>
            <div className="island-buddy" aria-live="polite">
              <AvatarArt avatar={profile?.avatar} />
              <i key={bubble}>{bubble}</i>
            </div>
            <span className="island-name">{region.name}</span>
          </div>
          {decorating ? (
            <div className="home-actions">
              <button
                className="big-play"
                onClick={() => {
                  setNamed(null);
                  setDecorating(false);
                }}
              >
                <Check size={26} />
                Klaar
              </button>
              {moved && (
                <button className="next-treasure" onClick={() => onResetLayout(region.id)}>
                  <RotateCcw size={20} />
                  <span>Alles terug</span>
                </button>
              )}
            </div>
          ) : (
            <div className="home-actions">
              <button className="big-play" disabled={!loaded || disabled} onClick={profile ? onPlay : onProfile}>
                <Play size={26} fill="currentColor" />
                {!profile ? 'Kies je vriendje' : doneToday ? 'Nog een keer' : 'Ga spelen'}
                <ArrowRight size={25} />
              </button>
              {profile && (
                <button className="next-treasure" onClick={onTreasures}>
                  <Art kind={progress.nextReward?.art ?? 'gem'} />
                  <span>
                    Nog {progress.nextAt - rounds} {progress.nextAt - rounds === 1 ? 'rondje' : 'rondjes'}
                  </span>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
export function LessonsPage({
  group,
  disabled,
  onChoose,
}: {
  group: Group;
  disabled: boolean;
  onChoose: (activity: Activity) => void;
}) {
  const [world, setWorld] = useState<World | null>(null);
  useEffect(() => setWorld(null), [group]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.getElementById('lessons-title')?.focus({ preventScroll: true });
  }, [world]);
  const available = activities(group),
    selected = worlds.find((item) => item.id === world);
  return (
    <section className="lessons-page" aria-labelledby="lessons-title">
      <div className="page-heading">
        {world ? (
          <button className="round-back" onClick={() => setWorld(null)} aria-label="Terug naar alle lessen">
            <ArrowLeft size={25} />
          </button>
        ) : (
          <span className="heading-badge">
            <BookOpen size={26} />
          </span>
        )}
        <h1 id="lessons-title" tabIndex={-1}>
          {selected?.title ?? 'Wat wil je spelen?'}
        </h1>
        <span className="group-badge">Groep {group}</span>
      </div>
      {!world ? (
        <div className="world-doors">
          {worlds
            .filter((w) => available.some((a) => a.world === w.id))
            .map((w) => (
              <button
                className={`world-door door-${w.id}`}
                key={w.id}
                onClick={() => {
                  const topics = available.filter((a) => a.world === w.id);
                  if (topics.length === 1) onChoose(topics[0]);
                  else setWorld(w.id);
                }}
              >
                <div className="door-art">
                  <ActivityArt kind={w.id === 'rekenen' ? '123' : w.id === 'taal' ? 'Aa' : 'shapes'} />
                  <span className="door-spark" aria-hidden="true">
                    ✦
                  </span>
                </div>
                <strong>{w.id === 'taal' ? 'Taal & lezen' : w.id === 'ontdekken' ? 'Ontdekken' : 'Rekenen'}</strong>
                <span className="door-go">
                  <Play size={20} fill="currentColor" />
                </span>
              </button>
            ))}
        </div>
      ) : (
        <div className="lesson-tiles">
          {available
            .filter((a) => a.world === world)
            .map((a) => (
              <button key={a.id} className={`lesson-tile ${a.color}`} onClick={() => onChoose(a)} disabled={disabled}>
                <ActivityArt kind={a.symbol} />
                <strong>{topicLabel(a, group)}</strong>
                <span className="tile-play">
                  <Play size={19} fill="currentColor" />
                </span>
              </button>
            ))}
        </div>
      )}
    </section>
  );
}
export function TreasuresPage({ rounds, disabled, onPlay }: { rounds: number; disabled: boolean; onPlay: () => void }) {
  const progress = islandProgress(rounds),
    [selected, setSelected] = useState(progress.currentRegion.id);
  const region = islandRegions.find((r) => r.id === selected) ?? islandRegions[0];
  return (
    <section className="treasures-page" aria-labelledby="treasures-title">
      <div className="page-heading">
        <span className="heading-badge treasure-heading">
          <Trophy size={27} />
        </span>
        <h1 id="treasures-title" tabIndex={-1}>
          Jouw schatten
        </h1>
      </div>
      <div className="region-picker" role="group" aria-label="Kies een eiland">
        {islandRegions.map((r) => (
          <button key={r.id} aria-pressed={selected === r.id} onClick={() => setSelected(r.id)}>
            <Art kind={r.art} />
            <span>{r.name}</span>
            {r.unlockAt > rounds && <LockKeyhole size={13} />}
          </button>
        ))}
      </div>
      <div className="region-heading">
        <h2>{region.name}</h2>
        <span>
          {region.rewards.filter((r) => r.rounds <= rounds).length} / {region.rewards.length}
        </span>
      </div>
      <div className="treasure-shelf">
        {region.rewards.map((s) => (
          <div key={s.id} className={`treasure-card ${rounds >= s.rounds ? 'earned' : 'locked'}`}>
            <div className="treasure-token">
              <Art kind={s.art} />
            </div>
            <h2>{s.name}</h2>
            {rounds >= s.rounds ? (
              <span className="treasure-owned">
                <Check size={17} />
                Verzameld!
              </span>
            ) : (
              <span className="treasure-lock">
                <LockKeyhole size={16} />
                {s === progress.nextReward
                  ? `Nog ${s.rounds - rounds} ${s.rounds - rounds === 1 ? 'rondje' : 'rondjes'}`
                  : 'Nog geheim'}
              </span>
            )}
          </div>
        ))}
      </div>
      {rounds >= stickers.at(-1)!.rounds && (
        <div className="expedition-card">
          <Art kind="gem" />
          <div>
            <h2>Verkennersrang {progress.expeditionRank + 1}</h2>
            <p>
              {progress.expeditionRank} {progress.expeditionRank === 1 ? 'edelsteen' : 'edelstenen'} · Nog{' '}
              {progress.nextAt - rounds} rondjes
            </p>
          </div>
        </div>
      )}
      <button className="big-play treasure-play" disabled={disabled} onClick={onPlay}>
        <Play fill="currentColor" size={23} />
        Ga spelen
        <ArrowRight size={24} />
      </button>
    </section>
  );
}
