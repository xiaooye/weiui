"use client";
import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { useTabsContext } from "./TabsContext";

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: ReactNode;
}

export function TabsTrigger({ value, children, onKeyDown, ...props }: TabsTriggerProps) {
  const { activeValue, onValueChange, baseId } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-trigger-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-content-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onValueChange(value)}
      onKeyDown={(e) => {
        // Arrow navigation handled at TabsList level or by parent
        onKeyDown?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
