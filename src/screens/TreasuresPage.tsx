import { useState } from 'react';
import { ArrowRight, Check, LockKeyhole, Play, Trophy } from 'lucide-react';
import { Art } from '../art/Art';
import { stickers } from '../content';
import { islandProgress, islandRegions } from '../progression';

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
