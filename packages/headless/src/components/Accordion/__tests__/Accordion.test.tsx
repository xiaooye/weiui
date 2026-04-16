import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion } from "../Accordion";
import { AccordionItem } from "../AccordionItem";
import { AccordionTrigger } from "../AccordionTrigger";
import { AccordionContent } from "../AccordionContent";

function TestAccordion({ type = "single" }: { type?: "single" | "multiple" }) {
  return (
    <Accordion type={type}>
      <AccordionItem value="a">
        <AccordionTrigger>Section A</AccordionTrigger>
        <AccordionContent>Content A</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Section B</AccordionTrigger>
        <AccordionContent>Content B</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion", () => {
  it("starts with all items collapsed", () => {
    render(<TestAccordion />);
    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
    expect(screen.queryByText("Content B")).not.toBeInTheDocument();
  });

  it("expands on trigger click", async () => {
    render(<TestAccordion />);
    await userEvent.setup().click(screen.getByText("Section A"));
    expect(screen.getByText("Content A")).toBeInTheDocument();
  });

  it("collapses on second click", async () => {
    render(<TestAccordion />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Section A"));
    await user.click(screen.getByText("Section A"));
    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
  });

  it("single mode: only one item open at a time", async () => {
    render(<TestAccordion type="single" />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Section A"));
    await user.click(screen.getByText("Section B"));
    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
    expect(screen.getByText("Content B")).toBeInTheDocument();
  });

  it("multiple mode: multiple items can be open", async () => {
    render(<TestAccordion type="multiple" />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Section A"));
    await user.click(screen.getByText("Section B"));
    expect(screen.getByText("Content A")).toBeInTheDocument();
    expect(screen.getByText("Content B")).toBeInTheDocument();
  });

  it("has correct ARIA attributes", async () => {
    render(<TestAccordion />);
    const trigger = screen.getByText("Section A");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.setup().click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls");
    const content = screen.getByText("Content A").parentElement;
    expect(content).toHaveAttribute("role", "region");
  });
});
