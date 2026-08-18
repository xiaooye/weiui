"use client";
import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { usePopoverContext } from "./PopoverContext";

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function PopoverTrigger({ children, onClick, ...props }: PopoverTriggerProps) {
  const { onToggle, isOpen, popoverId, triggerId, refs } = usePopoverContext();

  return (
    <button
      id={triggerId}
      ref={refs.setReference as React.Ref<HTMLButtonElement>}
      type="button"
      aria-haspopup="true"
      aria-expanded={isOpen}
      aria-controls={isOpen ? popoverId : undefined}
      data-civaria-component="popover"
      data-part="trigger"
      data-state={isOpen ? "open" : "closed"}
      onClick={(e) => {
        onToggle();
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
