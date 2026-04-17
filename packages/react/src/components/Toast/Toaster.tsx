"use client";
import { useSyncExternalStore, useEffect } from "react";
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

  return (
    <div
      className={cn("wui-toaster", `wui-toaster--${position}`)}
      role="region"
      aria-label="Notifications"
      data-position={position}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({
  toast: t,
}: {
  toast: {
    id: string;
    title: string;
    description?: string;
    variant: string;
    duration: number;
    action?: ToastAction;
  };
}) {
  useEffect(() => {
    if (t.duration <= 0) return;
    const timer = setTimeout(() => removeToast(t.id), t.duration);
    return () => clearTimeout(timer);
  }, [t.id, t.duration]);

  return (
    <div className={cn("wui-toast", `wui-toast--${t.variant}`)} role="alert">
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
      <button className="wui-toast__close" onClick={() => removeToast(t.id)} aria-label="Close notification">
        ×
      </button>
    </div>
  );
}
