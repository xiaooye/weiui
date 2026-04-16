"use client";
import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { useAccordionContext, useAccordionItemContext } from "./AccordionContext";

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function AccordionTrigger({ children, onClick, ...props }: AccordionTriggerProps) {
  const { toggleItem } = useAccordionContext();
  const { value, isExpanded, triggerId, contentId } = useAccordionItemContext();

  return (
    <h3>
      <button
        type="button"
        id={triggerId}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={(e) => {
          toggleItem(value);
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </button>
    </h3>
  );
}
