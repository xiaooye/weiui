import { createContext, useContext } from "react";
import type { UseFloatingReturn } from "@floating-ui/react";

export interface PopoverContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  popoverId: string;
  triggerId: string;
  refs: UseFloatingReturn["refs"];
  floatingStyles: React.CSSProperties;
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext(): PopoverContextValue {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error("Popover components must be used within <Popover>");
  return ctx;
}
