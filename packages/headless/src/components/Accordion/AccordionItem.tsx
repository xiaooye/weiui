import { type ReactNode } from "react";
import { useAccordionContext, AccordionItemContext } from "./AccordionContext";
import { useId } from "../../hooks/use-id";

export interface AccordionItemProps {
  value: string;
  children: ReactNode;
}

export function AccordionItem({ value, children }: AccordionItemProps) {
  const { expandedItems } = useAccordionContext();
  const baseId = useId("accordion");
  const isExpanded = expandedItems.has(value);

  return (
    <AccordionItemContext.Provider
      value={{
        value,
        isExpanded,
        triggerId: `${baseId}-trigger`,
        contentId: `${baseId}-content`,
      }}
    >
      <div
        data-wui-component="accordion"
        data-part="item"
        data-state={isExpanded ? "open" : "closed"}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}
