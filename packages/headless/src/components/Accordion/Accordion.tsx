"use client";
import { type ReactNode } from "react";
import { createAccordionController } from "@civaria/core";
import { useCoreController } from "../../hooks/use-core-controller";
import { useId } from "../../hooks/use-id";
import { AccordionContext } from "./AccordionContext";

export interface AccordionProps {
  children: ReactNode;
  type?: "single" | "multiple";
  defaultValue?: string[];
}

export function Accordion({ children, type = "single", defaultValue = [] }: AccordionProps) {
  const id = useId("accordion");
  const [controller, state] = useCoreController(() =>
    createAccordionController({ id, type, defaultValue }),
  );
  return (
    <AccordionContext.Provider
      value={{ expandedItems: new Set(state.expanded), toggleItem: controller.toggle, type }}
    >
      <div data-civaria-component="accordion" data-part="root">{children}</div>
    </AccordionContext.Provider>
  );
}
