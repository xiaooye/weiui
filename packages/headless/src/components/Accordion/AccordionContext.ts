import { createContext, useContext } from "react";

export interface AccordionContextValue {
  expandedItems: Set<string>;
  toggleItem: (value: string) => void;
  type: "single" | "multiple";
}

export const AccordionContext = createContext<AccordionContextValue | null>(null);

export function useAccordionContext(): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion components must be used within <Accordion>");
  return ctx;
}

export interface AccordionItemContextValue {
  value: string;
  isExpanded: boolean;
  triggerId: string;
  contentId: string;
}

export const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

export function useAccordionItemContext(): AccordionItemContextValue {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) throw new Error("AccordionTrigger/Content must be used within <AccordionItem>");
  return ctx;
}
