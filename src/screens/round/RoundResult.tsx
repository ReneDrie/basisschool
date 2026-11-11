import { ArrowRight, RotateCcw, Star } from 'lucide-react';
import { Art, AvatarArt } from '../../art/Art';
import { stickers } from '../../content';
import { DAILY_ROUNDS } from '../../learning/today';
import type { Round } from '../../learning/round-state';
import type { discoveriesBetween } from '../../progression';

/** The end of a round: the star, any new treasure or island, and what to do next. */
export function RoundResult({
  round,
  avatar,
  discoveries,
  today,
  onShowIsland,
  onReplay,
}: {
  round: Round;
  avatar?: string;
  discoveries: ReturnType<typeof discoveriesBetween> | null;
  today: number;
  onShowIsland: () => void;
  onReplay: () => void;
}) {
  return (
    <section className="result-card">
      <div className="confetti" aria-hidden="true">
        ✦ <span>✷</span> ✦ <span>✷</span> ✦
      </div>
      <span className="result-avatar">
        <AvatarArt avatar={avatar} />
      </span>
      <h1 tabIndex={-1}>Hoera, gelukt!</h1>
      <div className="earned-star">
        <Star fill="currentColor" /> +1 ontdekster
      </div>
      <p className="result-detail">
        {round.correct === round.base
          ? 'Alles zonder hulp opgelost. Knap gedaan!'
          : `${round.correct} van de ${round.base} zonder hulp opgelost. Goed geoefend!`}
      </p>
      {stickers
        .filter((s) => s.rounds > round.previousRounds && s.rounds <= round.previousRounds + 1)
        .map((s) => (
          <div className="new-sticker" key={s.name}>
            <span>
              <Art kind={s.art} />
            </span>
            <div>
              <strong>Nieuwe schat!</strong>
              <p>{s.name} mag op jouw eiland.</p>
            </div>
          </div>
        ))}
      {discoveries?.regions.map((region) => (
        <div className="new-region" key={region.id}>
          <Art kind={region.art} />
          <div>
            <strong>Een nieuw eiland!</strong>
            <p>{region.name}</p>
          </div>
        </div>
      ))}
      {!!discoveries?.ranks && (
        <div className="new-region">
          <Art kind="gem" />
          <strong>Een nieuwe verkennersrang!</strong>
        </div>
      )}
      {today === DAILY_ROUNDS && (
        <div className="day-done">
          <Art kind="sun" />
          <div>
            <strong>Klaar voor vandaag!</strong>
            <p>Je hebt {DAILY_ROUNDS} rondjes gespeeld. Tot morgen!</p>
          </div>
        </div>
      )}
      <div className="result-actions">
        <button className="primary-button" onClick={onShowIsland}>
          Bekijk mijn eiland <ArrowRight size={18} />
        </button>
        {today !== DAILY_ROUNDS && (
          <button className="text-button" onClick={onReplay}>
            <RotateCcw size={17} />
            Nog een rondje
          </button>
        )}
      </div>
    </section>
  );
}
