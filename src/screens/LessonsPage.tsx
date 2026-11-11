import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Play } from 'lucide-react';
import { activities, worlds, type Activity, type Group, type World } from '../content';
import { ActivityArt } from '../island/Island';
import { topicLabel } from '../learning/topic-labels';

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
