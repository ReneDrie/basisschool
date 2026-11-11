import { useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check, Leaf, RotateCcw, Volume2 } from 'lucide-react';
import { Art } from '../art/Art';
import { shuffle } from '../content';
import { useTileBoard } from './useTileBoard';
import { natureLabelAudio, natureResponse, type NatureTask } from '../learning/nature';

type Props = {
  task: NatureTask;
  correct: boolean;
  selected: string | null;
  onAnswer: (value: string) => void;
  onSpeak: (value: string) => void;
};
export function NatureGame(props: Props) {
  return props.task.kind === 'choose' ? <NatureChoice {...props} /> : <NatureArrange {...props} />;
}
function NatureChoice({ task, correct, selected, onAnswer, onSpeak }: Props) {
  const [options] = useState(() => shuffle(task.items));
  return (
    <div className="nature-game nature-choice">
      <div className="nature-banner">
        <Art kind="nature-mission" />
        <div>
          <strong>{task.theme}</strong>
          <p>{task.instruction}</p>
        </div>
      </div>
      <div
        className={`nature-choices ${options.some((item) => item.label.length > 55) ? 'nature-long-choices' : ''}`}
        role="group"
        aria-label="Kies je antwoord"
      >
        {options.map((item, index) => (
          <div className="nature-answer" key={item.id}>
            <button
              type="button"
              data-nature-choice={item.id}
              className={selected === item.id ? (correct ? 'is-correct' : 'is-incorrect') : ''}
              disabled={correct}
              aria-label={item.label}
              onClick={() => onAnswer(item.id)}
            >
              <small aria-hidden="true">{String.fromCharCode(65 + index)}</small>
              {item.picture !== 'nature-question' && <Art kind={item.picture} />}
              <span>{item.label}</span>
              {correct && selected === item.id && <Check size={22} />}
            </button>
            <button
              type="button"
              className="nature-listen"
              disabled={correct}
              aria-label={`Luister naar antwoord ${String.fromCharCode(65 + index)}`}
              onClick={() => onSpeak(natureLabelAudio(item.label))}
            >
              <Volume2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
function NatureArrange({ task, correct, onAnswer, onSpeak }: Props) {
  const { items, slots, selected, announcement, board, drag, hover, complete, place, choose, click, handlers, reset, onKeyDown } =
    useTileBoard(task.items, correct, 'Plek', true);
  const sort = task.kind === 'sort';
  const picture = (id: string) => task.items.find((i) => i.id === id)!.picture;
  return (
    <div className={`nature-game nature-arrange ${sort ? 'nature-sort' : 'nature-order'}`} ref={board} onKeyDown={onKeyDown}>
      <div className="nature-banner">
        <Art kind="nature-mission" />
        <div>
          <strong>{task.theme}</strong>
          <p>{task.instruction}</p>
          <button
            className="nature-listen"
            type="button"
            aria-label="Luister naar de aanwijzing"
            onClick={() => onSpeak(natureLabelAudio(task.instruction))}
          >
            <Volume2 size={19} />
            Luister
          </button>
        </div>
      </div>
      <div className="nature-board">
        <div className="nature-bank" data-board-bank="true" role="group" aria-label="Kaartjes om neer te leggen">
          {(items.every((item) => slots.includes(item.id)) ? [] : items).map((item) =>
            slots.includes(item.id) ? (
              <div className="nature-card-wrap tile-placeholder" key={item.id} aria-hidden="true">
                <button type="button" className="nature-tile" tabIndex={-1} disabled>
                  <Art kind={picture(item.id)} />
                  <span>{item.label}</span>
                </button>
              </div>
            ) : (
              <div className="nature-card-wrap" key={item.id}>
                <button
                  type="button"
                  data-nature-item={item.id}
                  className={`nature-tile ${selected === item.id ? 'is-selected' : ''} ${drag?.item.id === item.id ? 'is-dragging' : ''}`}
                  disabled={correct}
                  aria-label={`Kaartje ${item.label}`}
                  aria-pressed={selected === item.id}
                  {...handlers(item)}
                  onClick={(event) => click(event, () => choose(item.id))}
                >
                  <Art kind={picture(item.id)} />
                  <span>{item.label}</span>
                </button>
                <button
                  className="nature-listen"
                  type="button"
                  disabled={correct}
                  aria-label={`Luister naar ${item.label}`}
                  onClick={() => onSpeak(natureLabelAudio(item.label))}
                >
                  <Volume2 size={18} />
                </button>
              </div>
            ),
          )}
          {complete && (
            <span className="nature-bank-ready">
              <Check size={20} />
              Alle kaartjes liggen klaar!
            </span>
          )}
        </div>
        <div
          className="nature-targets"
          style={sort ? undefined : ({ '--nature-columns': Math.min(slots.length, 4) } as CSSProperties)}
          role="group"
          aria-label={sort ? 'Plekken voor de kaartjes' : 'Volgorde van links naar rechts en van boven naar beneden'}
        >
          {slots.map((id, index) => {
            const item = items.find((item) => item.id === id),
              target = task.targets?.[index];
            return (
              <div className="nature-target-wrap" key={index} data-board-slot={index}>
                <button
                  type="button"
                  className={`nature-target ${item ? 'has-card' : ''} ${hover === index && drag ? 'is-drop-target' : ''} ${id && selected === id ? 'is-selected' : ''} ${id && drag?.item.id === id ? 'is-dragging' : ''}`}
                  data-board-slot={index}
                  disabled={correct}
                  aria-label={`${target?.label ?? `Plek ${index + 1}`}${item ? `: ${item.label}` : ', leeg'}`}
                  aria-pressed={!!id && selected === id}
                  {...(item ? handlers(item) : {})}
                  onClick={(event) =>
                    click(event, () => {
                      if (selected) place(selected, index);
                      else if (id) choose(id);
                    })
                  }
                >
                  {target ? (
                    <>
                      <span className="nature-target-heading">
                        <Art kind={target.picture} />
                        <strong>{target.label}</strong>
                      </span>
                      {item && (
                        <span className="nature-placed">
                          <Art kind={picture(item.id)} />
                          <span>{item.label}</span>
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <small>{index + 1}</small>
                      {item ? (
                        <>
                          <Art kind={picture(item.id)} />
                          <span>{item.label}</span>
                        </>
                      ) : (
                        <Leaf size={28} className="nature-empty" aria-hidden="true" />
                      )}
                    </>
                  )}
                </button>
                {target && (
                  <button
                    className="nature-listen"
                    type="button"
                    disabled={correct}
                    aria-label={`Luister naar plek ${index + 1}`}
                    onClick={() => onSpeak(natureLabelAudio(target.label))}
                  >
                    <Volume2 size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="nature-tap-tip">Je mag slepen of een kaartje en daarna een plek aantikken.</p>
      <div className="language-controls">
        <button type="button" className="secondary-button" disabled={correct || slots.every((id) => id === null)} onClick={reset}>
          <RotateCcw size={18} />
          Opnieuw
        </button>
        <button
          type="button"
          className="primary-button"
          disabled={correct || !complete}
          onClick={() => onAnswer(natureResponse(task, slots))}
        >
          Missie klaar!
          <ArrowRight size={21} />
        </button>
      </div>
      <span className="sr-only" role="status">
        {announcement}
      </span>
      {drag &&
        createPortal(
          <div
            className="nature-tile nature-drag-preview"
            aria-hidden="true"
            style={{ left: drag.x - drag.offsetX, top: drag.y - drag.offsetY, width: drag.width, height: drag.height }}
          >
            <Art kind={picture(drag.item.id)} />
            <span>{drag.item.label}</span>
          </div>,
          document.body,
        )}
    </div>
  );
}
