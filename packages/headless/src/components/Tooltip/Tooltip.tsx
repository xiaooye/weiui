"use client";
import { type ReactNode, useState, useCallback, useRef } from "react";
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";
import { useId } from "../../hooks/use-id";
import { TooltipContext } from "./TooltipContext";

export interface TooltipProps {
  children: ReactNode;
  delay?: number;
}

export function Tooltip({ children, delay = 0 }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId("tooltip");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const open = useCallback(() => {
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => setIsOpen(true), delay);
    } else {
      setIsOpen(true);
    }
  }, [delay]);

  const close = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsOpen(false);
  }, []);

  return (
    <TooltipContext.Provider
      value={{ isOpen, open, close, tooltipId, refs, floatingStyles }}
    >
      {children}
    </TooltipContext.Provider>
  );
}
