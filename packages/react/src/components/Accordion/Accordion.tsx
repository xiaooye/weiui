"use client";
import { createContext, useContext, forwardRef, useState, useId, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

interface AccordionContextValue {
  expandedItems: Set<string>;
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

interface AccordionItemContextValue {
  value: string;
  contentId: string;
  triggerId: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

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
      <AccordionContext.Provider value={{ expandedItems, toggle }}>
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
  ({ value, className, children, ...props }, ref) => {
    const id = useId();
    return (
      <AccordionItemContext.Provider value={{ value, contentId: `${id}-content`, triggerId: `${id}-trigger` }}>
        <div ref={ref} className={cn("wui-accordion__item", className)} {...props}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  },
);
AccordionItem.displayName = "AccordionItem";

export interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {}

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const accordion = useContext(AccordionContext);
    const item = useContext(AccordionItemContext);
    if (!accordion || !item) throw new Error("AccordionTrigger must be used within Accordion > AccordionItem");

    const isOpen = accordion.expandedItems.has(item.value);

    return (
      <button
        ref={ref}
        type="button"
        id={item.triggerId}
        className={cn("wui-accordion__trigger", className)}
        aria-expanded={isOpen}
        aria-controls={item.contentId}
        onClick={() => accordion.toggle(item.value)}
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

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {}

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const accordion = useContext(AccordionContext);
    const item = useContext(AccordionItemContext);
    if (!accordion || !item) throw new Error("AccordionContent must be used within Accordion > AccordionItem");

    if (!accordion.expandedItems.has(item.value)) return null;

    return (
      <div
        ref={ref}
        id={item.contentId}
        className={cn("wui-accordion__content", className)}
        role="region"
        aria-labelledby={item.triggerId}
        {...props}
      >
        {children}
      </div>
    );
  },
);
AccordionContent.displayName = "AccordionContent";
