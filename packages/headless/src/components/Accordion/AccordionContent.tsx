import { type ReactNode, type HTMLAttributes } from "react";
import { useAccordionItemContext } from "./AccordionContext";

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function AccordionContent({ children, ...props }: AccordionContentProps) {
  const { isExpanded, contentId, triggerId } = useAccordionItemContext();

  if (!isExpanded) return null;

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      {...props}
    >
      <div>{children}</div>
    </div>
  );
}
