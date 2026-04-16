"use client";
import { type ReactNode, useState } from "react";
import { useDisclosure } from "../../hooks/use-disclosure";
import { useControllable } from "../../hooks/use-controllable";
import { useId } from "../../hooks/use-id";
import { SelectContext } from "./SelectContext";

export interface SelectProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Select({ children, defaultValue = "", value, onValueChange }: SelectProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedValue, setSelectedValue] = useControllable({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedLabel, setSelectedLabel] = useState("");
  const baseId = useId("select");

  const onSelect = (val: string, label: string) => {
    setSelectedValue(val);
    setSelectedLabel(label);
    onClose();
  };

  return (
    <SelectContext.Provider
      value={{
        isOpen, onOpen, onClose,
        selectedValue, onSelect,
        highlightedIndex, setHighlightedIndex,
        baseId,
        triggerId: `${baseId}-trigger`,
        listboxId: `${baseId}-listbox`,
        selectedLabel,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}
