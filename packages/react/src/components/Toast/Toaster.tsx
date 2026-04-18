"use client";
import { useSyncExternalStore, useEffect, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import { getToasts, subscribe, removeToast, type ToastAction } from "./toast-store";
import { cn } from "../../utils/cn";

export type ToasterPosition =
  | "top-left" | "top-center" | "top-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

export interface ToasterProps {
  /** Viewport corner where toasts stack. @default "bottom-right" */
  position?: ToasterPosition;
}

export function Toaster({ position = "bottom-right" }: ToasterProps = {}) {
  const toasts = useSyncExternalStore(subscribe, getToasts, getToasts);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn("wui-toaster", `wui-toaster--${position}`)}
      role="region"
      aria-label="Notifications"
      data-position={position}
      data-expanded={expanded || undefined}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {toasts.map((t, index) => (
        <ToastItem key={t.id} toast={t} index={index} expanded={expanded} total={toasts.length} />
      ))}
    </div>
  );
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  return Boolean(mq && mq.matches);
}

function ToastItem({
  toast: t,
  index,
  expanded,
  total,
}: {
  toast: {
    id: string;
    title: ReactNode;
    description?: ReactNode;
    variant: string;
    duration: number;
    action?: ToastAction;
  };
  index: number;
  expanded: boolean;
  total: number;
}) {
  const remainingRef = useRef<number>(t.duration);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [paused, setPaused] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startTime: number;
    lastX: number;
    lastY: number;
    lastTime: number;
    element: HTMLElement;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  function armTimer(ms: number) {
    clearTimeout(timerRef.current);
    if (ms <= 0) return;
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => removeToast(t.id), ms);
  }

  useEffect(() => {
    remainingRef.current = t.duration;
    armTimer(t.duration);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.id, t.duration]);

  function onEnter() {
    if (!startedAtRef.current) return;
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    clearTimeout(timerRef.current);
    setPaused(true);
  }
  function onLeave() {
    armTimer(remainingRef.current);
    setPaused(false);
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion()) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const target = e.currentTarget;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTime: performance.now(),
      lastX: e.clientX,
      lastY: e.clientY,
      lastTime: performance.now(),
      element: target,
    };
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const s = dragRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.lastTime = performance.now();
    setDragOffset({ x: e.clientX - s.startX, y: e.clientY - s.startY });
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const s = dragRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const dx = s.lastX - s.startX;
    const dy = s.lastY - s.startY;
    const dist = Math.hypot(dx, dy);
    const duration = Math.max(1, s.lastTime - s.startTime);
    const velocity = dist / duration; // px/ms
    dragRef.current = null;
    setDragOffset(null);
    try {
      s.element.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const isFlick = velocity >= 0.3 && dist >= 10;
    if (dist >= 50 || isFlick) {
      removeToast(t.id);
    }
  }

  // Stacking: non-expanded items scale/translate behind the front one
  const stackIndex = total - 1 - index; // front of stack = 0
  const stackStyle =
    expanded || dragOffset
      ? undefined
      : {
          transform: `translateY(${-stackIndex * 4}px) scale(${1 - stackIndex * 0.04})`,
          opacity: stackIndex === 0 ? 1 : 0.85,
          zIndex: 100 - stackIndex,
        };

  // While dragging, override with pointer translation + fade.
  const dragStyle = dragOffset
    ? {
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        opacity: Math.max(0.2, 1 - Math.hypot(dragOffset.x, dragOffset.y) / 200),
        zIndex: 200,
      }
    : undefined;

  return (
    <div
      className={cn("wui-toast", `wui-toast--${t.variant}`)}
      role="alert"
      data-paused={paused || undefined}
      data-dragging={dragOffset ? "" : undefined}
      style={dragStyle ?? stackStyle}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="wui-toast__content">
        <div className="wui-toast__title">{t.title}</div>
        {t.description && <div className="wui-toast__description">{t.description}</div>}
      </div>
      {t.action && (
        <button
          type="button"
          className="wui-toast__action"
          onClick={() => {
            t.action!.onClick();
            removeToast(t.id);
          }}
        >
          {t.action.label}
        </button>
      )}
      <button
        className="wui-toast__close"
        onClick={() => removeToast(t.id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
