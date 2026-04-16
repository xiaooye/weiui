"use client";
import { type ReactNode, type HTMLAttributes } from "react";
import { useSelectContext } from "./SelectContext";

export interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export function SelectItem({ value, children, onClick, ...props }: SelectItemProps) {
  const { selectedValue, onSelect } = useSelectContext();
  const isSelected = selectedValue === value;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      data-selected={isSelected || undefined}
      onClick={(e) => {
        onSelect(value, typeof children === "string" ? children : value);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
}
