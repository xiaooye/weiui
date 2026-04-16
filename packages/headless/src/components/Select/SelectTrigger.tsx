"use client";
import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { useSelectContext } from "./SelectContext";

export interface SelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function SelectTrigger({ children, onClick, ...props }: SelectTriggerProps) {
  const { isOpen, onOpen, onClose, triggerId, listboxId } = useSelectContext();

  return (
    <button
      type="button"
      id={triggerId}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls={isOpen ? listboxId : undefined}
      onClick={(e) => {
        isOpen ? onClose() : onOpen();
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
