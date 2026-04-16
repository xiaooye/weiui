import { createContext, useContext } from "react";

export interface ComboboxContextValue {
  isOpen: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  selectedValue: string;
  selectedLabel: string;
  onSelect: (value: string, label: string) => void;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  onOpen: () => void;
  onClose: () => void;
  baseId: string;
  inputId: string;
  listboxId: string;
}

export const ComboboxContext = createContext<ComboboxContextValue | null>(null);

export function useComboboxContext(): ComboboxContextValue {
  const ctx = useContext(ComboboxContext);
  if (!ctx) throw new Error("Combobox components must be used within <Combobox>");
  return ctx;
}
