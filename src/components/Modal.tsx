import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Sparkles, X } from 'lucide-react';

/** A dialog that keeps focus inside, locks page scrolling and gives focus back when it closes. */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    container.current?.focus();
    return () => {
      document.body.style.overflow = bodyOverflow;
      previous?.focus();
    };
  }, []);
  function trap(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    const items = container.current?.querySelectorAll<HTMLElement>(
      'button:not(:disabled),input:not([hidden]),select:not(:disabled),[tabindex="0"]',
    );
    if (!items?.length) return;
    const first = items[0],
      last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === container.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={container}
        tabIndex={-1}
        onKeyDown={trap}
      >
        <button className="modal-close icon-button" onClick={onClose} aria-label="Venster sluiten">
          <X size={22} />
        </button>
        <span className="modal-spark">
          <Sparkles size={23} />
        </span>
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
