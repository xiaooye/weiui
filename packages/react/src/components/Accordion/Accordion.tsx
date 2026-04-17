"use client";
import { createContext, useContext, forwardRef, useState, useId, useRef, useCallback, type HTMLAttributes, type ReactNode, type KeyboardEvent } from "react";
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

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  type?: "single" | "multiple";
  defaultExpanded?: string[];
  /** Controlled expanded values. When provided, `defaultExpanded` is ignored. */
  value?: string[];
  /** Called with the new expanded-values array whenever an item toggles. */
  onValueChange?: (value: string[]) => void;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = "single", defaultExpanded = [], value, onValueChange, className, children, onKeyDown, ...props }, ref) => {
    const [uncontrolledExpanded, setUncontrolledExpanded] = useState(new Set(defaultExpanded));
    const isControlled = value !== undefined;
    const expandedItems = isControlled ? new Set(value) : uncontrolledExpanded;
    const rootRef = useRef<HTMLDivElement | null>(null);

    const toggle = useCallback(
      (id: string) => {
        const next = new Set(expandedItems);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (type === "single") next.clear();
          next.add(id);
        }
        if (!isControlled) setUncontrolledExpanded(next);
        onValueChange?.(Array.from(next));
      },
      [expandedItems, type, isControlled, onValueChange],
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;

        const root = rootRef.current;
        if (!root) return;
        const triggers = Array.from(
          root.querySelectorAll<HTMLButtonElement>(
            '.wui-accordion__trigger:not([disabled])',
          ),
        );
        if (triggers.length === 0) return;

        const currentIdx = triggers.findIndex((t) => t === document.activeElement);
        let nextIdx = currentIdx;
        if (e.key === "ArrowDown") nextIdx = currentIdx < 0 ? 0 : (currentIdx + 1) % triggers.length;
        else if (e.key === "ArrowUp")
          nextIdx = currentIdx < 0 ? triggers.length - 1 : (currentIdx - 1 + triggers.length) % triggers.length;
        else if (e.key === "Home") nextIdx = 0;
        else if (e.key === "End") nextIdx = triggers.length - 1;

        if (nextIdx !== currentIdx && triggers[nextIdx]) {
          e.preventDefault();
          triggers[nextIdx]!.focus();
        }
      },
      [onKeyDown],
    );

    return (
      <AccordionContext.Provider value={{ expandedItems, toggle }}>
        <div
          ref={(el) => {
            rootRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }}
          className={cn("wui-accordion", className)}
          onKeyDown={handleKeyDown}
          {...props}
        >
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
