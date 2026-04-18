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
}

export function Tooltip({ children, delay = 0, closeDelay = 0 }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId("tooltip");
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const arrowRef = useRef<HTMLElement | null>(null);

  const { refs, floatingStyles, middlewareData, placement } = useFloatingMenu({
    open: isOpen,
    placement: "top",
    offsetPx: 8,
    collisionPadding: 8,
    arrowRef,
  });

  const open = useCallback(() => {
    clearTimeout(closeTimeoutRef.current);
    if (delay > 0) {
      openTimeoutRef.current = setTimeout(() => setIsOpen(true), delay);
    } else {
      setIsOpen(true);
    }
  }, [delay]);

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
