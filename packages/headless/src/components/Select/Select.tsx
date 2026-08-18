"use client";
import { type ReactNode, useEffect, useState } from "react";
import { createSelectController } from "@weiui/core";
import { useCoreController, useLatest } from "../../hooks/use-core-controller";
import { useId } from "../../hooks/use-id";
import { SelectContext } from "./SelectContext";

export interface SelectProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Select({ children, defaultValue = "", value, onValueChange }: SelectProps) {
  const baseId = useId("select");
  const callbackRef = useLatest(onValueChange);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [controller, state] = useCoreController(() => createSelectController({
    id: baseId,
    defaultValue,
    onValueChange: (next) => callbackRef.current?.(next),
  }));
  useEffect(() => {
    if (value !== undefined && state.value !== value) {
      controller.store.setState({ ...controller.getState(), value });
    }
  }, [controller, state.value, value]);
  const selectedValue = value ?? state.value;
  const onSelect = (next: string, label: string) => { setSelectedLabel(label); controller.select(next); };
  return (
    <SelectContext.Provider value={{
      isOpen: state.open,
      onOpen: controller.open,
      onClose: controller.close,
      selectedValue,
      onSelect,
      highlightedIndex: state.highlightedIndex,
      setHighlightedIndex: controller.highlight,
      baseId,
      triggerId: `${baseId}-trigger`,
      listboxId: `${baseId}-listbox`,
      selectedLabel,
    }}>
      {children}
    </SelectContext.Provider>
  );
}
