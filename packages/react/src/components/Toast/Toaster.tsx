"use client";
import { useSyncExternalStore, useEffect } from "react";
import { getToasts, subscribe, removeToast } from "./toast-store";
import { cn } from "../../utils/cn";

export function Toaster() {
  const toasts = useSyncExternalStore(subscribe, getToasts, getToasts);

  return (
    <div className="wui-toaster" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t }: { toast: { id: string; title: string; description?: string; variant: string; duration: number } }) {
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
      <button className="wui-toast__close" onClick={() => removeToast(t.id)} aria-label="Close notification">
        ×
      </button>
    </div>
  );
}
