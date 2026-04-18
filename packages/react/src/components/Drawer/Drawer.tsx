"use client";
import {
  createContext,
  useContext,
  forwardRef,
  useRef,
  useEffect,
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
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
  children: ReactNode;
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

export interface DrawerContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  onInteractOutside?: (event: MouseEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

export function DrawerContent({
  children,
  className,
  onKeyDown,
  onInteractOutside,
  onEscapeKeyDown,
  ...props
}: DrawerContentProps) {
  const { isOpen, onClose, side } = useDrawerContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

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
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const firstFocusable = contentRef.current && getFirstFocusable(contentRef.current);
      if (firstFocusable) {
        firstFocusable.focus();
      } else if (contentRef.current) {
        contentRef.current.focus();
      }
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="wui-drawer-overlay" onClick={onClose} aria-hidden="true" />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn("wui-drawer", `wui-drawer--${side}`, className)}
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
