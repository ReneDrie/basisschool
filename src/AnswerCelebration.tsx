import { useEffect, useRef, type CSSProperties } from 'react';
import { ArrowRight, Flag } from 'lucide-react';
import { Art } from './Art';

/** How long the celebration stays before the round moves on by itself. The button skips the wait. */
export const AUTO_ADVANCE_MS = 1400;

export function AnswerCelebration({
  helped,
  index,
  total,
  busy,
  error,
  onNext,
}: {
  helped: boolean;
  index: number;
  total: number;
  busy: boolean;
  error: string;
  onNext: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    next = useRef(onNext);
  next.current = onNext;
  const last = index === total - 1;
  const title = helped ? 'Goed doorgezet!' : ['Hoera, goed zo!', 'Helemaal goed!', 'Knap gedaan!', 'Ja, gelukt!'][index % 4];
  useEffect(() => {
    const element = dialog.current!;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    // Moves on once; after a save error the button stays for a retry.
    const timer = setTimeout(() => next.current(), AUTO_ADVANCE_MS);
    return () => {
      clearTimeout(timer);
      element.close();
      document.body.style.overflow = overflow;
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="answer-celebration"
      aria-labelledby="celebration-title"
      aria-describedby="celebration-detail"
      onCancel={(event) => event.preventDefault()}
    >
      <div className="celebration-sparks" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i}>✦</span>
        ))}
      </div>
      <div className="celebration-star" aria-hidden="true">
        <Art kind="star" />
      </div>
      <h2 id="celebration-title">{title}</h2>
      <p id="celebration-detail">{last ? 'Alle vragen zijn klaar!' : `Op naar vraag ${index + 2}!`}</p>
      <button
        autoFocus
        type="button"
        className="primary-button celebration-next"
        style={{ '--auto-advance': `${AUTO_ADVANCE_MS}ms` } as CSSProperties}
        disabled={busy}
        onClick={onNext}
      >
        {busy ? 'Even bewaren…' : last ? 'Rondje afronden' : 'Volgende vraag'}
        {last ? <Flag size={24} /> : <ArrowRight size={25} />}
      </button>
      {error && (
        <p className="celebration-error" role="alert">
          {error}
        </p>
      )}
    </dialog>
  );
}
