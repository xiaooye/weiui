import type { ReactNode } from "react";

type ToastVariant = "default" | "success" | "destructive" | "warning" | "loading";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  variant: ToastVariant;
  duration: number;
  action?: ToastAction;
}

type Listener = () => void;

let toasts: ToastItem[] = [];
let listeners: Listener[] = [];
let counter = 0;

function emit() { listeners.forEach((l) => l()); }

export function addToast(props: Omit<ToastItem, "id" | "duration"> & { duration?: number }): string {
  const id = `toast-${++counter}`;
  toasts = [...toasts, { ...props, id, duration: props.duration ?? 5000 }];
  emit();
  return id;
}

export function updateToast(id: string, partial: Partial<Omit<ToastItem, "id">>) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, ...partial } : t));
  emit();
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function getToasts(): ToastItem[] { return toasts; }
export function subscribe(listener: Listener): () => void {
  listeners = [...listeners, listener];
  return () => { listeners = listeners.filter((l) => l !== listener); };
}

// Convenience functions
export function toast(title: ReactNode, opts?: Partial<Omit<ToastItem, "id" | "title">>) {
  return addToast({ title, variant: "default", ...opts });
}
toast.success = (title: ReactNode, opts?: Partial<Omit<ToastItem, "id" | "title" | "variant">>) =>
  addToast({ title, variant: "success", ...opts });
toast.error = (title: ReactNode, opts?: Partial<Omit<ToastItem, "id" | "title" | "variant">>) =>
  addToast({ title, variant: "destructive", ...opts });
toast.warning = (title: ReactNode, opts?: Partial<Omit<ToastItem, "id" | "title" | "variant">>) =>
  addToast({ title, variant: "warning", ...opts });
toast.dismiss = (id?: string) => {
  if (id) {
    removeToast(id);
    return;
  }
  toasts = [];
  emit();
};

type PromiseMessages<T> = {
  loading: ReactNode;
  success: ReactNode | ((value: T) => ReactNode);
  error: ReactNode | ((err: unknown) => ReactNode);
};

toast.promise = function promise<T>(p: Promise<T>, messages: PromiseMessages<T>): Promise<T> {
  const id = addToast({
    title: messages.loading,
    variant: "loading",
    duration: 0, // persistent until resolved
  });
  p.then(
    (value) => {
      const title =
        typeof messages.success === "function"
          ? (messages.success as (v: T) => ReactNode)(value)
          : messages.success;
      updateToast(id, { title, variant: "success", duration: 4000 });
      setTimeout(() => removeToast(id), 4000);
    },
    (err) => {
      const title =
        typeof messages.error === "function"
          ? (messages.error as (e: unknown) => ReactNode)(err)
          : messages.error;
      updateToast(id, { title, variant: "destructive", duration: 6000 });
      setTimeout(() => removeToast(id), 6000);
    },
  );
  return p;
};
