export interface FocusTarget {
  disabled?: boolean;
  focus(options?: { preventScroll?: boolean }): void;
}

export interface FocusKeyEvent {
  key?: string;
  shiftKey?: boolean;
  preventDefault?(): void;
}

export function nextFocusIndex(current: number, count: number, direction: 1 | -1, loop = true): number {
  if (count <= 0) return -1;
  const next = current + direction;
  if (next >= 0 && next < count) return next;
  if (!loop) return Math.max(0, Math.min(count - 1, next));
  return direction === 1 ? 0 : count - 1;
}

export function focusFirst(targets: readonly FocusTarget[], preventScroll = true): boolean {
  const target = targets.find((entry) => !entry.disabled);
  if (!target) return false;
  target.focus({ preventScroll });
  return true;
}

export function trapTabKey(event: FocusKeyEvent, targets: readonly FocusTarget[], activeIndex: number): number {
  if (event.key !== "Tab" || targets.length === 0) return activeIndex;
  event.preventDefault?.();
  const next = nextFocusIndex(activeIndex, targets.length, event.shiftKey ? -1 : 1, true);
  targets[next]?.focus({ preventScroll: true });
  return next;
}
