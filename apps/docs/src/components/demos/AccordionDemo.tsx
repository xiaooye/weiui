"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@weiui/react";

export function AccordionDemo() {
  return (
    <Accordion type="single" defaultExpanded={["faq-1"]} style={{ width: "100%", maxWidth: "480px" }}>
      <AccordionItem value="faq-1">
        <AccordionTrigger>What is WeiUI?</AccordionTrigger>
        <AccordionContent>
          A business-level design system with CSS, headless, and styled React layers.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-2">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes — WCAG AAA contrast with full keyboard and screen-reader support.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-3">
        <AccordionTrigger>Does it support dark mode?</AccordionTrigger>
        <AccordionContent>
          Out of the box. Flip the <code>data-theme</code> attribute on <code>&lt;html&gt;</code> and every token swaps.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
