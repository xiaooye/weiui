import { createContext, useContext } from "react";

export interface SelectContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  selectedValue: string;
  onSelect: (value: string, label: string) => void;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  baseId: string;
  triggerId: string;
  listboxId: string;
  selectedLabel: string;
}

export const SelectContext = createContext<SelectContextValue | null>(null);

export function useSelectContext(): SelectContextValue {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("Select components must be used within <Select>");
  return ctx;
}
