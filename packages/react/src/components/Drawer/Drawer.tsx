"use client";
import {
  createContext,
  useContext,
  forwardRef,
  useRef,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useDisclosure, useFocusTrap, getFirstFocusable, type UseDisclosureProps } from "@weiui/headless";
import { Portal } from "../Portal";
import { cn } from "../../utils/cn";

type DrawerSide = "left" | "right" | "top" | "bottom";

interface DrawerContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  side: DrawerSide;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawerContext(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("Drawer compound components must be used within <Drawer>");
  return ctx;
}

export interface DrawerProps extends UseDisclosureProps {
  /** DrawerTrigger / DrawerContent / DrawerClose sub-components. */
  children: ReactNode;
  /** Edge the drawer slides in from. @default "right" */
  side?: DrawerSide;
}

export function Drawer({ children, side = "right", ...disclosureProps }: DrawerProps) {
  const { isOpen, onOpen, onClose } = useDisclosure(disclosureProps);

  return (
    <DrawerContext.Provider value={{ isOpen, onOpen, onClose, side }}>
      {children}
    </DrawerContext.Provider>
  );
}

export interface DrawerTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Trigger content (typically a `<Button>`). */
  children: ReactNode;
}

export const DrawerTrigger = forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    const { onOpen, isOpen } = useDrawerContext();

    return (
      <button
        ref={ref}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={(e) => {
          onOpen();
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </button>
    );
  },
);
DrawerTrigger.displayName = "DrawerTrigger";

/**
 * Pointer-drag-to-dismiss hook. Tracks pointer from drag start, translates
 * the element toward the close edge (capped so the user cannot drag past
 * the open position), and fires `onDismiss` when the release exceeds
 * 50px translation OR 0.3+ px/ms velocity.
 *
 * Disabled automatically when `prefers-reduced-motion: reduce`.
 */
export function useSwipeToDismiss({
  side,
  onDismiss,
  enabled = true,
}: {
  side: DrawerSide;
  onDismiss: () => void;
  enabled?: boolean;
}) {
  const stateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startTime: number;
    lastX: number;
    lastY: number;
    lastTime: number;
    element: HTMLElement;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const axis: "x" | "y" = side === "left" || side === "right" ? "x" : "y";
  const closeDirection: 1 | -1 = side === "right" || side === "bottom" ? 1 : -1;

  const prefersReducedMotion = (): boolean => {
    if (typeof window === "undefined") return false;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    return Boolean(mq && mq.matches);
  };

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || prefersReducedMotion()) return;
      // Only primary button / touch / pen
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const target = e.currentTarget;
      stateRef.current = {
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
        // Some test envs don't support pointer capture; not critical.
      }
    },
    [enabled],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const s = stateRef.current;
      if (!s || s.pointerId !== e.pointerId) return;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.lastTime = performance.now();
      const delta = axis === "x" ? e.clientX - s.startX : e.clientY - s.startY;
      // Cap so the user cannot drag past the open position
      const toward = closeDirection === 1 ? Math.max(0, delta) : Math.min(0, delta);
      setDragOffset(toward);
    },
    [axis, closeDirection],
  );

  const endDrag = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const s = stateRef.current;
      if (!s || s.pointerId !== e.pointerId) return;
      const deltaRaw = axis === "x" ? s.lastX - s.startX : s.lastY - s.startY;
      const delta = closeDirection === 1 ? Math.max(0, deltaRaw) : Math.min(0, deltaRaw);
      const duration = Math.max(1, s.lastTime - s.startTime);
      const velocity = Math.abs(delta) / duration; // px/ms
      stateRef.current = null;
      setDragOffset(0);
      try {
        s.element.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      // Fire dismiss on: (a) clear distance threshold, OR (b) a flick —
      // fast velocity paired with at least some travel so stray taps in
      // low-resolution test environments don't register.
      const isFlick = velocity >= 0.3 && Math.abs(delta) >= 10;
      if (Math.abs(delta) >= 50 || isFlick) {
        onDismiss();
      }
    },
    [axis, closeDirection, onDismiss],
  );

  const handlers = enabled
    ? {
        onPointerDown,
        onPointerMove,
        onPointerUp: endDrag,
        onPointerCancel: endDrag,
      }
    : {};

  // Inline transform only during drag so we don't fight the enter animation.
  const style =
    dragOffset !== 0
      ? axis === "x"
        ? { transform: `translateX(${dragOffset}px)` }
        : { transform: `translateY(${dragOffset}px)` }
      : undefined;

  return { handlers, style, isDragging: dragOffset !== 0 };
}

export interface DrawerContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Drawer body content. */
  children: ReactNode;
  /** Called when a pointerdown fires outside the drawer content. Call `event.preventDefault()` to keep it open. */
  onInteractOutside?: (event: MouseEvent) => void;
  /** Called when Escape is pressed. Call `event.preventDefault()` to keep the drawer open. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

export function DrawerContent({
  children,
  className,
  onKeyDown,
  onInteractOutside,
  onEscapeKeyDown,
  style,
  ...props
}: DrawerContentProps) {
  const { isOpen, onClose, side } = useDrawerContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  // Tracks whether the drawer DOM is present. Stays mounted during the
  // exit animation; set to `false` on `animationend` when state is "closed".
  const [mounted, setMounted] = useState(isOpen);
  const [dataState, setDataState] = useState<"open" | "closed">(isOpen ? "open" : "closed");

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Defer to next tick so the element is present and the "open"
      // animation can start from scratch.
      requestAnimationFrame(() => setDataState("open"));
      return;
    }
    if (!mounted) return;
    setDataState("closed");
    // If the runtime has no active CSS animation (jsdom, reduced motion,
    // animations disabled), unmount immediately so consumers don't see
    // a stale dialog. Otherwise rely on onAnimationEnd, with a 300ms
    // fallback matching `--wui-motion-duration-base`.
    const el = contentRef.current;
    const hasAnim =
      el && typeof window !== "undefined"
        ? (() => {
            const name = window.getComputedStyle(el).animationName;
            return Boolean(name) && name !== "none";
          })()
        : false;
    if (!hasAnim) {
      setMounted(false);
      return;
    }
    const t = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useFocusTrap(contentRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    function handler(e: MouseEvent) {
      if (!contentRef.current) return;
      if (contentRef.current.contains(e.target as Node)) return;
      const ev = new Event("interactoutside", { cancelable: true });
      Object.defineProperty(ev, "target", { value: e.target });
      onInteractOutside?.(ev as unknown as MouseEvent);
      if (!ev.defaultPrevented) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, onInteractOutside]);

  useEffect(() => {
    if (isOpen && mounted) {
      // Only capture the previous activeElement once when the drawer
      // first becomes open.
      if (!previousFocusRef.current) {
        previousFocusRef.current = document.activeElement as HTMLElement;
      }
      const firstFocusable = contentRef.current && getFirstFocusable(contentRef.current);
      if (firstFocusable) {
        firstFocusable.focus();
      } else if (contentRef.current) {
        contentRef.current.focus();
      }
    } else if (!isOpen && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen, mounted]);

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  const swipe = useSwipeToDismiss({ side, onDismiss: onClose, enabled: isOpen });

  const handleAnimationEnd = () => {
    if (dataState === "closed") setMounted(false);
  };

  if (!mounted) return null;

  // Merge user-provided style with swipe drag transform (drag wins for clarity).
  const mergedStyle = swipe.style ? { ...style, ...swipe.style } : style;

  return (
    <Portal>
      {isOpen && <div className="wui-drawer-overlay" onClick={onClose} aria-hidden="true" />}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        data-state={dataState}
        className={cn("wui-drawer", `wui-drawer--${side}`, className)}
        style={mergedStyle}
        onAnimationEnd={handleAnimationEnd}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            const ev = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
            onEscapeKeyDown?.(ev);
            if (!ev.defaultPrevented) {
              e.stopPropagation();
              onClose();
            }
          }
          onKeyDown?.(e);
        }}
        {...swipe.handlers}
        {...props}
      >
        {children}
      </div>
    </Portal>
  );
}

export const DrawerHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-drawer__header", className)} {...props} />
  ),
);
DrawerHeader.displayName = "DrawerHeader";

export const DrawerFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-drawer__footer", className)} {...props} />
  ),
);
DrawerFooter.displayName = "DrawerFooter";

export interface DrawerCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content (text or icon). */
  children: ReactNode;
}

export const DrawerClose = forwardRef<HTMLButtonElement, DrawerCloseProps>(
  ({ children, onClick, ...props }, ref) => {
    const { onClose } = useDrawerContext();

    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          onClose();
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </button>
    );
  },
);
DrawerClose.displayName = "DrawerClose";
