type ToastVariant = "default" | "success" | "destructive" | "warning";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: string;
  title: string;
  description?: string;
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
export function toast(title: string, opts?: Partial<Omit<ToastItem, "id" | "title">>) {
  return addToast({ title, variant: "default", ...opts });
}
toast.success = (title: string, opts?: Partial<Omit<ToastItem, "id" | "title" | "variant">>) =>
  addToast({ title, variant: "success", ...opts });
toast.error = (title: string, opts?: Partial<Omit<ToastItem, "id" | "title" | "variant">>) =>
  addToast({ title, variant: "destructive", ...opts });
toast.warning = (title: string, opts?: Partial<Omit<ToastItem, "id" | "title" | "variant">>) =>
  addToast({ title, variant: "warning", ...opts });
