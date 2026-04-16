"use client";
import { type InputHTMLAttributes } from "react";
import { useComboboxContext } from "./ComboboxContext";
import { Keys } from "../../utils/keyboard";

export interface ComboboxInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value"> {
  placeholder?: string;
}

export function ComboboxInput({ placeholder, onKeyDown, onChange, ...props }: ComboboxInputProps) {
  const { inputValue, setInputValue, isOpen, onOpen, onClose, inputId, listboxId } = useComboboxContext();

  return (
    <input
      id={inputId}
      type="text"
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={isOpen}
      aria-controls={isOpen ? listboxId : undefined}
      value={inputValue}
      placeholder={placeholder}
      onChange={(e) => {
        setInputValue(e.target.value);
        onChange?.(e);
      }}
      onFocus={onOpen}
      onKeyDown={(e) => {
        if (e.key === Keys.Escape) {
          e.preventDefault();
          onClose();
        }
        onKeyDown?.(e);
      }}
      {...props}
    />
  );
}
