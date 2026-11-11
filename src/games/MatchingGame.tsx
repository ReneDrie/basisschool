import { useRef, useState, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, MoveHorizontal, RotateCcw } from 'lucide-react';
import { Art } from '../art/Art';
import { MatchCardFace } from './MatchCardFace';
import { shuffle } from '../content';
import { MATCH_COMPLETE, faceLabel, matches, matchingCards, type MatchCard, type MatchingTask } from '../learning/matching';

type DragGeometry = { width: number; height: number; offsetX: number; offsetY: number };

export function MatchingGame({
  task,
  correct,
  onAnswer,
}: {
  task: MatchingTask;
  correct: boolean;
  onAnswer: (value: string) => void;
}) {
  const [cards] = useState(() => {
    const all = matchingCards(task);
    if (task.mode === 'memory') return shuffle(all);
    const left = shuffle(all.filter((c) => c.side === 'left')),
      right = shuffle(all.filter((c) => c.side === 'right'));
    return left.flatMap((c, i) => [c, right[i]]);
  });
  const [selected, setSelected] = useState<string[]>([]),
    [found, setFound] = useState<string[]>([]),
    [mismatch, setMismatch] = useState(false),
    [announcement, setAnnouncement] = useState('');
  const gesture = useRef<(DragGeometry & { card: MatchCard; pointerId: number; x: number; y: number; moving: boolean }) | null>(
    null,
  );
  const suppressClick = useRef(false);
  const [drag, setDrag] = useState<(DragGeometry & { card: MatchCard; x: number; y: number; target?: string }) | null>(null);
  function connect(first: MatchCard, card: MatchCard) {
    if (matches(first, card)) {
      const next = [...found, card.pairId];
      setFound(next);
      setSelected([]);
      setAnnouncement(`Paar gevonden. ${next.length} van ${task.pairs.length} klaar.`);
      if (next.length === task.pairs.length) onAnswer(MATCH_COMPLETE);
    } else {
      setSelected([first.id, card.id]);
      setMismatch(true);
      setAnnouncement(
        task.mode === 'memory'
          ? 'Deze kaarten horen niet bij elkaar. Tik een volgend kaartje aan om verder te spelen.'
          : 'Deze kaarten horen niet bij elkaar. Kijk rustig en probeer opnieuw.',
      );
      // Discovering two different hidden cards is a normal memory turn.
      if (task.mode === 'pairs') onAnswer('probeer-opnieuw');
    }
  }
  function choose(card: MatchCard) {
    if (correct || found.includes(card.pairId)) return;
    if (mismatch) {
      if (task.mode === 'memory' && !selected.includes(card.id)) {
        setMismatch(false);
        setSelected([card.id]);
        setAnnouncement('Nieuw kaartje omgedraaid. Zoek het kaartje dat erbij hoort.');
      }
      return;
    }
    if (selected.includes(card.id)) {
      setSelected([]);
      return;
    }
    const first = cards.find((c) => c.id === selected[0]);
    if (!first || (task.mode === 'pairs' && first.side === card.side)) {
      setSelected([card.id]);
      return;
    }
    connect(first, card);
  }
  function dropTarget(x: number, y: number, source: MatchCard) {
    const id = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-match-card]')?.dataset.matchCard;
    return cards.find((card) => card.id === id && card.side !== source.side && !found.includes(card.pairId));
  }
  function startDrag(event: PointerEvent<HTMLButtonElement>, card: MatchCard) {
    if (
      task.mode !== 'pairs' ||
      correct ||
      mismatch ||
      found.includes(card.pairId) ||
      !event.isPrimary ||
      event.button !== 0 ||
      gesture.current
    )
      return;
    suppressClick.current = false;
    const bounds = event.currentTarget.getBoundingClientRect();
    gesture.current = {
      card,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moving: false,
      width: bounds.width,
      height: bounds.height,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (!current.moving && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 8) return;
    if (!current.moving) {
      setSelected([]);
      setAnnouncement('Sleep naar een kaart aan de andere kant.');
    }
    current.moving = true;
    suppressClick.current = true;
    setDrag({
      ...current,
      x: event.clientX,
      y: event.clientY,
      target: dropTarget(event.clientX, event.clientY, current.card)?.id,
    });
  }
  function endDrag(event: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    gesture.current = null;
    setDrag(null);
    if (!current.moving) return;
    suppressClick.current = true;
    const target = cancelled ? undefined : dropTarget(event.clientX, event.clientY, current.card);
    if (target && !correct && !mismatch) connect(current.card, target);
    else setAnnouncement('Geen paar gemaakt. Sleep de kaart naar de andere kant.');
  }
  return (
    <div className={`matching-game mode-${task.mode}`}>
      {task.mode === 'pairs' && (
        <p className="match-instruction">
          <MoveHorizontal size={22} aria-hidden="true" />
          Sleep de kaarten die bij elkaar horen op elkaar.<span>Je mag ook twee kaarten aantikken.</span>
        </p>
      )}
      <div className="match-progress" aria-label={`${found.length} van ${task.pairs.length} paren gevonden`}>
        <div aria-hidden="true">
          {task.pairs.map((p) => (
            <span key={p.id} className={found.includes(p.id) ? 'found' : ''}>
              {found.includes(p.id) ? <Check size={18} /> : <span />}
            </span>
          ))}
        </div>
        <strong aria-hidden="true">
          {found.length}/{task.pairs.length}
        </strong>
      </div>
      <div
        className="match-board"
        role="group"
        aria-label={task.mode === 'memory' ? 'Memorykaarten' : 'Kaarten die bij elkaar horen'}
      >
        {cards.map((card, i) => {
          const paired = found.includes(card.pairId),
            active = selected.includes(card.id),
            revealed = task.mode === 'pairs' || paired || active;
          return (
            <button
              type="button"
              key={card.id}
              data-match-card={card.id}
              className={`match-card ${revealed ? 'is-revealed' : 'is-hidden'} ${active ? 'is-selected' : ''} ${paired ? 'is-paired' : ''} ${mismatch && active ? 'is-mismatch' : ''} ${card.side === 'right' ? 'match-right' : 'match-left'} ${drag?.card.id === card.id ? 'is-dragging' : ''} ${drag && drag.card.side !== card.side && !paired ? 'is-drop-ready' : ''} ${drag?.target === card.id ? 'is-drop-target' : ''}`}
              aria-label={
                revealed
                  ? `${card.side === 'left' ? 'Linkerkaart' : 'Rechterkaart'}: ${faceLabel(card.face)}`
                  : `Kaart ${String.fromCharCode(65 + i)} omdraaien`
              }
              aria-pressed={active}
              disabled={correct || paired || (mismatch && (task.mode === 'pairs' || active))}
              onPointerDown={(event) => startDrag(event, card)}
              onPointerMove={moveDrag}
              onPointerUp={(event) => endDrag(event)}
              onPointerCancel={(event) => endDrag(event, true)}
              onLostPointerCapture={(event) => endDrag(event, true)}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && gesture.current) {
                  gesture.current = null;
                  setDrag(null);
                  setAnnouncement('Slepen gestopt.');
                }
              }}
              onClick={(event) => {
                if (event.detail > 0 && suppressClick.current) {
                  suppressClick.current = false;
                  return;
                }
                choose(card);
              }}
            >
              {revealed ? (
                <MatchCardFace face={card.face} />
              ) : (
                <span className="match-card-back" aria-hidden="true">
                  <Art kind="star" />
                  <strong>?</strong>
                </span>
              )}
              {paired && <Check className="match-card-check" size={21} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      {drag &&
        createPortal(
          <div
            className="match-card match-drag-preview"
            aria-hidden="true"
            style={{
              left: drag.x - drag.offsetX,
              top: drag.y - drag.offsetY,
              width: drag.width,
              height: drag.height,
              transformOrigin: `${drag.offsetX}px ${drag.offsetY}px`,
            }}
          >
            <MatchCardFace face={drag.card.face} />
          </div>,
          document.body,
        )}
      {mismatch && task.mode === 'pairs' && (
        <button
          type="button"
          className="secondary-button match-retry"
          onClick={() => {
            setSelected([]);
            setMismatch(false);
            setAnnouncement('Kies twee andere kaarten.');
          }}
        >
          <RotateCcw size={19} />
          Nog eens
        </button>
      )}
      <span className="sr-only" role="status">
        {announcement}
      </span>
    </div>
  );
}
