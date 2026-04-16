"use client";
import { type ReactNode, type HTMLAttributes } from "react";
import { useComboboxContext } from "./ComboboxContext";

export interface ComboboxItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export function ComboboxItem({ value, children, onClick, ...props }: ComboboxItemProps) {
  const { selectedValue, onSelect } = useComboboxContext();
  const isSelected = selectedValue === value;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      data-selected={isSelected || undefined}
      onClick={(e) => {
        const label = typeof children === "string" ? children : value;
        onSelect(value, label);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
}
