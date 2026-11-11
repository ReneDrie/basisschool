import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { shuffle } from '../content';
import { placeBoardTile, type BoardTile } from '../learning/tiles';

type Drag = {
  item: BoardTile;
  pointerId: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  fontSize: string;
  moving: boolean;
};
export function useTileBoard(source: readonly BoardTile[], correct: boolean, slotName: string, autoScroll = false) {
  const [items] = useState(() => shuffle(source));
  const [slots, setSlots] = useState<(string | null)[]>(() => source.map(() => null));
  const [selected, setSelected] = useState<string | null>(null),
    [announcement, setAnnouncement] = useState('');
  const gesture = useRef<Drag | null>(null),
    suppressClick = useRef(false),
    board = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null),
    [hover, setHover] = useState<number | null>(null);
  function place(id: string, target: number | null) {
    setSlots((previous) => placeBoardTile(items, previous, id, target));
    setSelected(null);
    setAnnouncement(target === null ? 'Kaartje teruggelegd.' : `Kaartje op ${slotName.toLowerCase()} ${target + 1}.`);
  }
  function choose(id: string) {
    setSelected(selected === id ? null : id);
    setAnnouncement(`Kaartje ${items.find((item) => item.id === id)!.label}. Tik op een lege plek om het neer te leggen.`);
  }
  function targetAt(x: number, y: number) {
    const element = document.elementFromPoint(x, y);
    if (!element || !board.current?.contains(element)) return undefined;
    const slot = element.closest<HTMLElement>('[data-board-slot]');
    if (slot) return Number(slot.dataset.boardSlot);
    return element.closest('[data-board-bank]') ? null : undefined;
  }
  function start(event: PointerEvent<HTMLButtonElement>, item: BoardTile) {
    if (correct || !event.isPrimary || event.button !== 0 || gesture.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    suppressClick.current = false;
    gesture.current = {
      item,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
      width: bounds.width,
      height: bounds.height,
      fontSize: getComputedStyle(event.currentTarget).fontSize,
      moving: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (!current.moving && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 8) return;
    current.moving = true;
    current.x = event.clientX;
    current.y = event.clientY;
    suppressClick.current = true;
    setSelected(null);
    setDrag({ ...current, x: event.clientX, y: event.clientY });
    setHover(targetAt(event.clientX, event.clientY) ?? null);
  }
  useEffect(() => {
    if (!autoScroll || !drag) return;
    let frame = 0;
    function scroll() {
      const current = gesture.current;
      if (!current?.moving) return;
      const edge = 64,
        y = current.y,
        delta =
          y < edge ? -Math.min(10, (edge - y) / 5) : y > innerHeight - edge ? Math.min(10, (y - innerHeight + edge) / 5) : 0;
      if (delta) {
        window.scrollBy(0, delta);
        setHover(targetAt(current.x, current.y) ?? null);
      }
      frame = requestAnimationFrame(scroll);
    }
    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
    // The loop reads the latest pointer from a ref; it only starts and stops with a drag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoScroll, !!drag]);
  function end(event: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    gesture.current = null;
    setDrag(null);
    setHover(null);
    if (!current.moving) return;
    suppressClick.current = true;
    const target = cancelled ? undefined : targetAt(event.clientX, event.clientY);
    if (target !== undefined && !correct) place(current.item.id, target);
  }
  function click(event: MouseEvent, action: () => void) {
    if (event.detail > 0 && suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    action();
  }
  const handlers = (item: BoardTile) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => start(event, item),
    onPointerMove: move,
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => end(event),
    onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => end(event, true),
    onLostPointerCapture: (event: PointerEvent<HTMLButtonElement>) => end(event, true),
  });
  function reset() {
    setSlots(source.map(() => null));
    setSelected(null);
    setAnnouncement('Alle kaartjes liggen weer klaar.');
  }
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      gesture.current = null;
      setDrag(null);
      setHover(null);
      setSelected(null);
    }
  }
  return {
    items,
    slots,
    selected,
    announcement,
    board,
    drag,
    hover,
    complete: slots.every((id) => id !== null),
    place,
    choose,
    click,
    handlers,
    reset,
    onKeyDown,
  };
}
