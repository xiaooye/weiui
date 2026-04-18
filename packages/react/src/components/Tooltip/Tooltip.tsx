"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  cloneElement,
  isValidElement,
  type MutableRefObject,
  type ReactNode,
  type HTMLAttributes,
  type CSSProperties,
} from "react";
import { useId, useFloatingMenu } from "@weiui/headless";
import { Portal } from "../Portal";

type TooltipSide = "top" | "right" | "bottom" | "left";
type TooltipAlign = "start" | "center" | "end";

type FloatingPlacement =
  | "top" | "right" | "bottom" | "left"
  | "top-start" | "top-end"
  | "right-start" | "right-end"
  | "bottom-start" | "bottom-end"
  | "left-start" | "left-end";

function toPlacement(side: TooltipSide, align: TooltipAlign): FloatingPlacement {
  if (align === "center") return side;
  return `${side}-${align}` as FloatingPlacement;
}

interface TooltipProviderValue {
  delayDuration: number;
  skipDelayDuration: number;
}

// Default `delayDuration: 0` when no provider is used keeps backward
// compatibility with the pre-provider Tooltip behaviour (no open delay).
const TooltipProviderContext = createContext<TooltipProviderValue>({
  delayDuration: 0,
  skipDelayDuration: 300,
});

export interface TooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
}

export function TooltipProvider({
  children,
  delayDuration = 700,
  skipDelayDuration = 300,
}: TooltipProviderProps) {
  return (
    <TooltipProviderContext.Provider value={{ delayDuration, skipDelayDuration }}>
      {children}
    </TooltipProviderContext.Provider>
  );
}
TooltipProvider.displayName = "TooltipProvider";

interface TooltipContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  tooltipId: string;
  refs: ReturnType<typeof useFloatingMenu>["refs"];
  floatingStyles: CSSProperties;
  arrowRef: MutableRefObject<HTMLElement | null>;
  arrowData: { x?: number; y?: number } | undefined;
  placement: string;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext(): TooltipContextValue {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be used within <Tooltip>");
  return ctx;
}

export interface TooltipProps {
  children: ReactNode;
  delay?: number;
  closeDelay?: number;
  side?: TooltipSide;
  align?: TooltipAlign;
  offset?: number;
}

export function Tooltip({
  children,
  delay,
  closeDelay = 0,
  side = "top",
  align = "center",
  offset = 8,
}: TooltipProps) {
  const providerValue = useContext(TooltipProviderContext);
  const resolvedDelay = delay ?? providerValue.delayDuration;

  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId("tooltip");
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const arrowRef = useRef<HTMLElement | null>(null);

  const { refs, floatingStyles, middlewareData, placement } = useFloatingMenu({
    open: isOpen,
    placement: toPlacement(side, align),
    offsetPx: offset,
    collisionPadding: 8,
    arrowRef,
  });

  const open = useCallback(() => {
    clearTimeout(closeTimeoutRef.current);
    if (resolvedDelay > 0) {
      openTimeoutRef.current = setTimeout(() => setIsOpen(true), resolvedDelay);
    } else {
      setIsOpen(true);
    }
  }, [resolvedDelay]);

  const close = useCallback(() => {
    clearTimeout(openTimeoutRef.current);
    if (closeDelay > 0) {
      closeTimeoutRef.current = setTimeout(() => setIsOpen(false), closeDelay);
    } else {
      setIsOpen(false);
    }
  }, [closeDelay]);

  // Clear any pending open/close timers when unmounted so they don't fire
  // setState on a dead component.
  useEffect(
    () => () => {
      clearTimeout(openTimeoutRef.current);
      clearTimeout(closeTimeoutRef.current);
    },
    [],
  );

  // Escape closes tooltip globally while open
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        clearTimeout(openTimeoutRef.current);
        clearTimeout(closeTimeoutRef.current);
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <TooltipContext.Provider
      value={{
        isOpen,
        open,
        close,
        tooltipId,
        refs,
        floatingStyles,
        arrowRef,
        arrowData: middlewareData.arrow,
        placement,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}
Tooltip.displayName = "Tooltip";

export interface TooltipTriggerProps {
  children: ReactNode;
}

export function TooltipTrigger({ children }: TooltipTriggerProps) {
  const { open, close, isOpen, tooltipId, refs } = useTooltipContext();

  if (isValidElement(children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cloneElement(children as React.ReactElement<any>, {
      ref: refs.setReference,
      onPointerEnter: open,
      onPointerLeave: close,
      onFocus: open,
      onBlur: close,
      "aria-describedby": isOpen ? tooltipId : undefined,
    });
  }

  return (
    <span
      ref={refs.setReference as React.Ref<HTMLSpanElement>}
      onPointerEnter={open}
      onPointerLeave={close}
      onFocus={open}
      onBlur={close}
      aria-describedby={isOpen ? tooltipId : undefined}
    >
      {children}
    </span>
  );
}
TooltipTrigger.displayName = "TooltipTrigger";

export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function TooltipContent({ children, style, ...props }: TooltipContentProps) {
  const { isOpen, tooltipId, refs, floatingStyles } = useTooltipContext();

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        ref={refs.setFloating}
        id={tooltipId}
        role="tooltip"
        style={{ ...floatingStyles, ...style }}
        {...props}
      >
        {children}
      </div>
    </Portal>
  );
}
TooltipContent.displayName = "TooltipContent";

export interface TooltipArrowProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

export function TooltipArrow({ size = 8, style, ...props }: TooltipArrowProps) {
  const { arrowRef, arrowData, placement } = useTooltipContext();
  const side = placement.split("-")[0] as TooltipSide;
  const staticSide: TooltipSide = (
    { top: "bottom", right: "left", bottom: "top", left: "right" } as const
  )[side];

  return (
    <span
      ref={(el) => {
        arrowRef.current = el;
      }}
      aria-hidden="true"
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
TooltipArrow.displayName = "TooltipArrow";
