import { useCallback, useEffect, useRef } from "react";

export const DRAG_THRESHOLD = 4;

export type DragPhase = "idle" | "pressed" | "dragging";

export interface DragMachineState {
  phase: DragPhase;
  startX: number;
  startY: number;
  wasClick?: boolean;
}

export type DragEvent =
  | { type: "down"; x: number; y: number }
  | { type: "move"; x: number; y: number }
  | { type: "up"; x: number; y: number }
  | { type: "cancel" };

export function computeDragState(
  state: DragMachineState,
  event: DragEvent,
): DragMachineState {
  switch (event.type) {
    case "down":
      return { phase: "pressed", startX: event.x, startY: event.y };
    case "move": {
      if (state.phase === "pressed") {
        const dx = event.x - state.startX;
        const dy = event.y - state.startY;
        if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
          return { ...state, phase: "dragging" };
        }
      }
      return state;
    }
    case "up":
      return {
        phase: "idle",
        startX: state.startX,
        startY: state.startY,
        wasClick: state.phase === "pressed",
      };
    case "cancel":
      return { phase: "idle", startX: state.startX, startY: state.startY };
  }
}

export interface PointerDragHandlers<E extends HTMLElement = HTMLElement> {
  onPointerDown: (e: React.PointerEvent<E>) => void;
}

export interface UsePointerDragOptions {
  onDragStart: (coords: { x: number; y: number }) => void;
  onDragMove: (coords: { x: number; y: number }) => void;
  onDragEnd: (coords: { x: number; y: number }) => void;
  onClick?: (coords: { x: number; y: number }) => void;
}

export function usePointerDrag<E extends HTMLElement = HTMLElement>(
  opts: UsePointerDragOptions,
): PointerDragHandlers<E> {
  const stateRef = useRef<DragMachineState>({ phase: "idle", startX: 0, startY: 0 });
  const optsRef = useRef(opts);
  optsRef.current = opts;

  // Stable ref-held handlers avoid mutually-recursive useCallback TDZ issues.
  const handlersRef = useRef<{
    move: (e: PointerEvent) => void;
    up: (e: PointerEvent) => void;
    cancel: () => void;
  } | null>(null);

  const detach = useCallback(() => {
    const h = handlersRef.current;
    if (!h) return;
    window.removeEventListener("pointermove", h.move);
    window.removeEventListener("pointerup", h.up);
    window.removeEventListener("pointercancel", h.cancel);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<E>) => {
      if (e.button !== 0) return;
      stateRef.current = computeDragState(stateRef.current, {
        type: "down",
        x: e.clientX,
        y: e.clientY,
      });

      const move = (ev: PointerEvent) => {
        const prev = stateRef.current;
        const next = computeDragState(prev, { type: "move", x: ev.clientX, y: ev.clientY });
        stateRef.current = next;
        if (prev.phase === "pressed" && next.phase === "dragging") {
          optsRef.current.onDragStart({ x: ev.clientX, y: ev.clientY });
        }
        if (next.phase === "dragging") {
          optsRef.current.onDragMove({ x: ev.clientX, y: ev.clientY });
        }
      };

      const up = (ev: PointerEvent) => {
        const prev = stateRef.current;
        const next = computeDragState(prev, { type: "up", x: ev.clientX, y: ev.clientY });
        stateRef.current = next;
        detach();
        if (prev.phase === "dragging") {
          optsRef.current.onDragEnd({ x: ev.clientX, y: ev.clientY });
        } else if (prev.phase === "pressed") {
          optsRef.current.onClick?.({ x: ev.clientX, y: ev.clientY });
        }
      };

      const cancel = () => {
        stateRef.current = computeDragState(stateRef.current, { type: "cancel" });
        detach();
      };

      handlersRef.current = { move, up, cancel };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", cancel);
    },
    [detach],
  );

  useEffect(() => detach, [detach]);

  return { onPointerDown };
}
