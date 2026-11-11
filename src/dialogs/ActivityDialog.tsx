import { ArrowRight } from 'lucide-react';
import { Art } from '../art/Art';
import { availableLevels, type Activity, type Difficulty, type Group } from '../content';

/** Choosing a fixed step, for Koppelplein and for children whose parent turned on choosing a step. */
export function ActivityDialog({
  activity,
  group,
  disabled,
  onStart,
}: {
  activity: Activity;
  group: Group;
  disabled: boolean;
  onStart: (difficulty?: Difficulty) => void;
}) {
  const matching = activity.id === 'koppelen';
  return (
    <>
      <p className="choose-step">{matching ? 'Kies je spel' : 'Kies je stap'}</p>
      <p className="adaptive-intro">Met ‘Verras me!’ groeit de uitdaging rustig mee met jouw eiland en hoe dit spel gaat.</p>
      <div className="level-picker">
        {availableLevels(group, activity.id).map((level) => (
          <button key={level} className="secondary-button" disabled={disabled} onClick={() => onStart(level)}>
            <strong>
              <span aria-hidden="true">
                <Art kind={level === 1 ? 'sprout' : 'tree'} />
              </span>{' '}
              {matching ? (level === 1 ? 'Koppelen' : 'Memory') : `Stap ${level}`}
            </strong>
            <ArrowRight size={18} />
          </button>
        ))}
        <button className="primary-button" disabled={disabled} onClick={() => onStart()}>
          Verras me!
          <ArrowRight size={18} />
        </button>
      </div>
    </>
  );
}
