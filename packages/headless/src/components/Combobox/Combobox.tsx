"use client";
import { type ReactNode } from "react";
import { createComboboxController } from "@weiui/core";
import { useCoreController, useLatest } from "../../hooks/use-core-controller";
import { useId } from "../../hooks/use-id";
import { ComboboxContext } from "./ComboboxContext";

export interface ComboboxProps {
  children: ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function Combobox({ children, defaultValue = "", onValueChange }: ComboboxProps) {
  const baseId = useId("combobox");
  const callbackRef = useLatest(onValueChange);
  const [controller, state] = useCoreController(() => createComboboxController({
    id: baseId,
    defaultValue,
    onValueChange: (next) => callbackRef.current?.(next),
  }));
  const onSelect = (value: string, label: string) => {
    // Legacy React items provide the visible label through children. Keep that
    // adapter concern here while Core owns the semantic state shape.
    controller.syncInputValue(label);
    controller.select(value);
  };
  return (
    <ComboboxContext.Provider value={{
      isOpen: state.open,
      inputValue: state.inputValue,
      setInputValue: controller.setInputValue,
      selectedValue: state.value,
      selectedLabel: state.inputValue,
      onSelect,
      highlightedIndex: state.highlightedIndex,
      setHighlightedIndex: controller.highlight,
      onOpen: controller.open,
      onClose: controller.close,
      baseId,
      inputId: `${baseId}-input`,
      listboxId: `${baseId}-listbox`,
    }}>
      {children}
    </ComboboxContext.Provider>
  );
}
