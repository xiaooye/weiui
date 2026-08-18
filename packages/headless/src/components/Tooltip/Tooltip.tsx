"use client";
import { type ReactNode } from "react";
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";
import { createTooltipController } from "@civaria/core";
import { useCoreController } from "../../hooks/use-core-controller";
import { useId } from "../../hooks/use-id";
import { TooltipContext } from "./TooltipContext";

export interface TooltipProps { children: ReactNode; delay?: number; }

export function Tooltip({ children, delay = 0 }: TooltipProps) {
  const tooltipId = useId("tooltip");
  const [controller, state] = useCoreController(() => createTooltipController({ id: tooltipId, delay }));
  const { refs, floatingStyles } = useFloating({
    open: state.open,
    onOpenChange: (open) => open ? controller.open() : controller.close(),
    placement: "top",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  return (
    <TooltipContext.Provider value={{ isOpen: state.open, open: controller.open, close: controller.close, tooltipId, refs, floatingStyles }}>
      {children}
    </TooltipContext.Provider>
  );
}
