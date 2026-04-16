import { createContext, useContext } from "react";
import type { UseFloatingReturn } from "@floating-ui/react";

export interface TooltipContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  tooltipId: string;
  refs: UseFloatingReturn["refs"];
  floatingStyles: React.CSSProperties;
}

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltipContext(): TooltipContextValue {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be used within <Tooltip>");
  return ctx;
}
