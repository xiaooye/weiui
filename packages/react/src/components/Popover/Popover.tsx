"use client";
import {
  createContext,
  useContext,
  useRef,
  useEffect,
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MutableRefObject,
} from "react";
import {
  useDisclosure,
  useFocusTrap,
  useOutsideClick,
  getFirstFocusable,
  useId,
  useFloatingMenu,
  type UseDisclosureProps,
} from "@weiui/headless";
import { Portal } from "../Portal";

type PopoverSide = "top" | "right" | "bottom" | "left";
type PopoverAlign = "start" | "center" | "end";

type FloatingPlacement =
  | "top" | "right" | "bottom" | "left"
  | "top-start" | "top-end"
  | "right-start" | "right-end"
  | "bottom-start" | "bottom-end"
  | "left-start" | "left-end";

function toPlacement(side: PopoverSide, align: PopoverAlign): FloatingPlacement {
  if (align === "center") return side;
  return `${side}-${align}` as FloatingPlacement;
}

interface PopoverContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  popoverId: string;
  triggerId: string;
  refs: ReturnType<typeof useFloatingMenu>["refs"];
  floatingStyles: CSSProperties;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(): PopoverContextValue {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error("Popover components must be used within <Popover>");
  return ctx;
}

export interface PopoverProps extends UseDisclosureProps {
  children: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
}

export function Popover({
  children,
  side = "bottom",
  align = "start",
  ...disclosureProps
}: PopoverProps) {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure(disclosureProps);
  const baseId = useId("popover");
  const popoverId = `${baseId}-content`;
  const triggerId = `${baseId}-trigger`;

  const { refs, floatingStyles } = useFloatingMenu({
    open: isOpen,
    placement: toPlacement(side, align),
    offsetPx: 8,
    collisionPadding: 8,
  });

  return (
    <PopoverContext.Provider
      value={{ isOpen, onOpen, onClose, onToggle, popoverId, triggerId, refs, floatingStyles }}
    >
      {children}
    </PopoverContext.Provider>
  );
}

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    const { onToggle, isOpen, popoverId, triggerId, refs } = usePopoverContext();
    const setRef = (el: HTMLButtonElement | null) => {
      refs.setReference(el);
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as MutableRefObject<HTMLButtonElement | null>).current = el;
    };
    return (
      <button
        id={triggerId}
        ref={setRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        onClick={(e) => {
          onToggle();
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </button>
    );
  },
);
PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function PopoverContent({ children, style, onKeyDown, ...props }: PopoverContentProps) {
  const { isOpen, onClose, popoverId, refs, floatingStyles } = usePopoverContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const setRefs = (el: HTMLDivElement | null) => {
    (contentRef as MutableRefObject<HTMLDivElement | null>).current = el;
    refs.setFloating(el);
  };

  useFocusTrap(contentRef, isOpen);
  useOutsideClick(contentRef, onClose, isOpen);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const firstFocusable = contentRef.current && getFirstFocusable(contentRef.current);
      if (firstFocusable) firstFocusable.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        ref={setRefs}
        id={popoverId}
        style={{ ...floatingStyles, ...style }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
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

export interface PopoverCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(
  ({ children, onClick, ...props }, ref) => {
    const { onClose } = usePopoverContext();
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
PopoverClose.displayName = "PopoverClose";
