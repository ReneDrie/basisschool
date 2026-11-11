export type BoardTile = { id: string; label: string };
export function placeBoardTile(
  items: readonly BoardTile[],
  slots: readonly (string | null)[],
  id: string,
  target: number | null,
): (string | null)[] {
  if (
    !items.some((item) => item.id === id) ||
    slots.length !== items.length ||
    (target !== null && (!Number.isInteger(target) || target < 0 || target >= slots.length))
  )
    return [...slots];
  const next = [...slots],
    source = next.indexOf(id);
  if (source === target) return next;
  const displaced = target === null ? null : next[target];
  if (source >= 0) next[source] = displaced;
  if (target !== null) next[target] = id;
  return next;
}
