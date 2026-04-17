"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  cloneElement,
  isValidElement,
  type ReactNode,
  type HTMLAttributes,
  type CSSProperties,
} from "react";
import { useId, useFloatingMenu } from "@weiui/headless";
import { Portal } from "../Portal";

interface TooltipContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  tooltipId: string;
  refs: ReturnType<typeof useFloatingMenu>["refs"];
  floatingStyles: CSSProperties;
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

  const { refs, floatingStyles } = useFloatingMenu({
    open: isOpen,
    placement: "top",
    offsetPx: 8,
    collisionPadding: 8,
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

  return (
    <TooltipContext.Provider
      value={{ isOpen, open, close, tooltipId, refs, floatingStyles }}
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
