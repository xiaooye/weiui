"use client";
import { useSyncExternalStore, useEffect, useRef, useState, type ReactNode } from "react";
import { getToasts, subscribe, removeToast, type ToastAction } from "./toast-store";
import { cn } from "../../utils/cn";

export type ToasterPosition =
  | "top-left" | "top-center" | "top-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

export interface ToasterProps {
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

  // Stacking: non-expanded items scale/translate behind the front one
  const stackIndex = total - 1 - index; // front of stack = 0
  const stackStyle = expanded
    ? undefined
    : {
        transform: `translateY(${-stackIndex * 4}px) scale(${1 - stackIndex * 0.04})`,
        opacity: stackIndex === 0 ? 1 : 0.85,
        zIndex: 100 - stackIndex,
      };

  return (
    <div
      className={cn("wui-toast", `wui-toast--${t.variant}`)}
      role="alert"
      data-paused={paused || undefined}
      style={stackStyle}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
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
