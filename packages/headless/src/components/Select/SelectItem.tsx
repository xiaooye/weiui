"use client";
import { type ReactNode, type HTMLAttributes } from "react";
import { useSelectContext } from "./SelectContext";

export interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
  /** Internal: injected by SelectContent to wire up keyboard navigation. */
  _selectIndex?: number;
}

export function SelectItem({
  value,
  children,
  onClick,
  _selectIndex,
  ...props
}: SelectItemProps) {
  const { selectedValue, onSelect, highlightedIndex, baseId } = useSelectContext();
  const isSelected = selectedValue === value;
  const isHighlighted = _selectIndex !== undefined && _selectIndex === highlightedIndex;
  const id = _selectIndex !== undefined ? `${baseId}-item-${_selectIndex}` : undefined;

  return (
    <div
      id={id}
      role="option"
      aria-selected={isSelected}
      data-selected={isSelected || undefined}
      data-highlighted={isHighlighted || undefined}
      data-select-index={_selectIndex}
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
