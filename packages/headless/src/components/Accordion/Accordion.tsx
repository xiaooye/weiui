"use client";
import { type ReactNode, useState, useCallback } from "react";
import { AccordionContext } from "./AccordionContext";

export interface AccordionProps {
  children: ReactNode;
  type?: "single" | "multiple";
  defaultValue?: string[];
}

export function Accordion({ children, type = "single", defaultValue = [] }: AccordionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(defaultValue));

  const toggleItem = useCallback(
    (value: string) => {
      setExpandedItems((prev) => {
        const next = new Set(prev);
        if (next.has(value)) {
          next.delete(value);
        } else {
          if (type === "single") {
            next.clear();
          }
          next.add(value);
        }
        return next;
      });
    },
    [type],
  );

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem, type }}>
      <div>{children}</div>
    </AccordionContext.Provider>
  );
}
