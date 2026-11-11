import { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, LockKeyhole, Map, Move, Play, RotateCcw } from 'lucide-react';
import { Art, AvatarArt } from '../art/Art';
import { Island } from '../island/Island';
import { islandProgress, islandRegions, type IslandReward } from '../progression';
import { DAILY_ROUNDS } from '../learning/today';
import type { Spot } from '../learning/island-layout';
import type { Profile } from '../storage';

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
    // Jump to the current island only for another child or a newly reached island, not after every round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
