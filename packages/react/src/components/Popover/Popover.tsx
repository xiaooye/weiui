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
  modal: boolean;
  arrowRef: MutableRefObject<HTMLElement | null>;
  arrowData: { x?: number; y?: number } | undefined;
  placement: string;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(): PopoverContextValue {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error("Popover components must be used within <Popover>");
  return ctx;
}

export interface PopoverProps extends UseDisclosureProps {
  /** PopoverTrigger / PopoverContent / PopoverArrow sub-components. */
  children: ReactNode;
  /** Preferred side of the trigger to position the popover on. @default "bottom" */
  side?: PopoverSide;
  /** Alignment along the chosen side. @default "start" */
  align?: PopoverAlign;
  /** Distance in pixels between trigger and content. @default 8 */
  offset?: number;
  /** Viewport padding (px) used by collision detection when flipping/shifting. @default 8 */
  collisionPadding?: number;
  /** When true, traps focus inside the popover while open. @default false */
  modal?: boolean;
}

export function Popover({
  children,
  side = "bottom",
  align = "start",
  offset = 8,
  collisionPadding = 8,
  modal = false,
  ...disclosureProps
}: PopoverProps) {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure(disclosureProps);
  const baseId = useId("popover");
  const popoverId = `${baseId}-content`;
  const triggerId = `${baseId}-trigger`;
  const arrowRef = useRef<HTMLElement | null>(null);

  const { refs, floatingStyles, middlewareData, placement } = useFloatingMenu({
    open: isOpen,
    placement: toPlacement(side, align),
    offsetPx: offset,
    collisionPadding,
    arrowRef,
  });

  return (
    <PopoverContext.Provider
      value={{
        isOpen, onOpen, onClose, onToggle, popoverId, triggerId, refs, floatingStyles,
        modal, arrowRef, arrowData: middlewareData.arrow, placement,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
}
Popover.displayName = "Popover";

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Trigger content (typically a `<Button>`). */
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
  /** Popover body content. */
  children: ReactNode;
  /** Called when a pointerdown fires outside the popover. Call `event.preventDefault()` to keep it open. */
  onInteractOutside?: (event: MouseEvent) => void;
  /** Called when Escape is pressed. Call `event.preventDefault()` to keep the popover open. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Called after open before initial auto-focus. Call `event.preventDefault()` to skip focusing. */
  onOpenAutoFocus?: (event: Event) => void;
  /** Called before focus returns to the trigger on close. Call `event.preventDefault()` to skip restore. */
  onCloseAutoFocus?: (event: Event) => void;
}

export function PopoverContent({
  children,
  style,
  onKeyDown,
  onInteractOutside,
  onEscapeKeyDown,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: PopoverContentProps) {
  const { isOpen, onClose, popoverId, refs, floatingStyles, modal } = usePopoverContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const setRefs = (el: HTMLDivElement | null) => {
    (contentRef as MutableRefObject<HTMLDivElement | null>).current = el;
    refs.setFloating(el);
  };

  useFocusTrap(contentRef, isOpen && modal);

  // Custom outside-click that respects onInteractOutside preventDefault
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (!contentRef.current) return;
      if (contentRef.current.contains(e.target as Node)) return;
      const preventable = new Event("interactoutside", { cancelable: true });
      Object.defineProperty(preventable, "target", { value: e.target });
      onInteractOutside?.(preventable as unknown as MouseEvent);
      if (!preventable.defaultPrevented) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose, onInteractOutside]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const openEvent = new Event("openautofocus", { cancelable: true });
      onOpenAutoFocus?.(openEvent);
      if (!openEvent.defaultPrevented) {
        const firstFocusable = contentRef.current && getFirstFocusable(contentRef.current);
        if (firstFocusable) firstFocusable.focus();
      }
    } else if (previousFocusRef.current) {
      const closeEvent = new Event("closeautofocus", { cancelable: true });
      onCloseAutoFocus?.(closeEvent);
      if (!closeEvent.defaultPrevented) {
        previousFocusRef.current.focus();
      }
      previousFocusRef.current = null;
    }
  }, [isOpen, onOpenAutoFocus, onCloseAutoFocus]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        ref={setRefs}
        id={popoverId}
        style={{ ...floatingStyles, ...style }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            const escEvent = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
            onEscapeKeyDown?.(escEvent);
            if (!escEvent.defaultPrevented) {
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
PopoverContent.displayName = "PopoverContent";

export interface PopoverCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content (text or icon). */
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

export interface PopoverArrowProps extends HTMLAttributes<HTMLSpanElement> {
  /** Arrow size in pixels. @default 8 */
  size?: number;
}

export function PopoverArrow({ size = 8, style, ...props }: PopoverArrowProps) {
  const { arrowRef, arrowData, placement } = usePopoverContext();
  const side = placement.split("-")[0] as PopoverSide;
  const staticSide: PopoverSide = (
    { top: "bottom", right: "left", bottom: "top", left: "right" } as const
  )[side];

  return (
    <span
      ref={(el) => { arrowRef.current = el; }}
      aria-hidden="true"
      className="wui-popover__arrow"
      style={{
        position: "absolute",
        width: size,
        height: size,
        background: "inherit",
        left: arrowData?.x != null ? `${arrowData.x}px` : undefined,
        top: arrowData?.y != null ? `${arrowData.y}px` : undefined,
        [staticSide]: `-${size / 2}px`,
        transform: "rotate(45deg)",
        ...style,
      }}
      {...props}
    />
  );
}
PopoverArrow.displayName = "PopoverArrow";
