"use client";
import { createContext, useContext, forwardRef, useState, useId, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

interface AccordionContextValue {
  expandedItems: Set<string>;
  toggle: (id: string) => void;
  type: "single" | "multiple";
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionItem must be used within <Accordion>");
  return ctx;
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  defaultExpanded?: string[];
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = "single", defaultExpanded = [], className, children, ...props }, ref) => {
    const [expandedItems, setExpandedItems] = useState(new Set(defaultExpanded));

    const toggle = (id: string) => {
      setExpandedItems((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (type === "single") next.clear();
          next.add(id);
        }
        return next;
      });
    };

    return (
      <AccordionContext.Provider value={{ expandedItems, toggle, type }}>
        <div ref={ref} className={cn("wui-accordion", className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  },
);
Accordion.displayName = "Accordion";

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, children, ...props }, ref) => (
    <div ref={ref} className={cn("wui-accordion__item", className)} {...props}>
      {children}
    </div>
  ),
);
AccordionItem.displayName = "AccordionItem";

export interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ value, className, children, ...props }, ref) => {
    const { expandedItems, toggle } = useAccordionContext();
    const isOpen = expandedItems.has(value);
    const contentId = useId();

    return (
      <button
        ref={ref}
        type="button"
        className={cn("wui-accordion__trigger", className)}
        aria-expanded={isOpen}
        aria-controls={`${contentId}-content`}
        onClick={() => toggle(value)}
        {...props}
      >
        {children}
        <span className="wui-accordion__icon" aria-hidden="true">
          {"\u25BE"}
        </span>
      </button>
    );
  },
);
AccordionTrigger.displayName = "AccordionTrigger";

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const { expandedItems } = useAccordionContext();
    if (!expandedItems.has(value)) return null;

    return (
      <div ref={ref} className={cn("wui-accordion__content", className)} role="region" {...props}>
        {children}
      </div>
    );
  },
);
AccordionContent.displayName = "AccordionContent";
