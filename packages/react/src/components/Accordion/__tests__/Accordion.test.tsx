import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../Accordion";

describe("Accordion", () => {
  it("renders triggers", () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item1">
          <AccordionTrigger>Title 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByRole("button", { name: /Title 1/i })).toBeInTheDocument();
  });

  it("content is hidden by default", () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item1">
          <AccordionTrigger>Title 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
  });

  it("clicking trigger shows content", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single">
        <AccordionItem value="item1">
          <AccordionTrigger>Title 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    await user.click(screen.getByRole("button", { name: /Title 1/i }));
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  describe("single mode", () => {
    it("only one item open at a time", async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single">
          <AccordionItem value="item1">
            <AccordionTrigger>Title 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item2">
            <AccordionTrigger>Title 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      await user.click(screen.getByRole("button", { name: /Title 1/i }));
      expect(screen.getByText("Content 1")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /Title 2/i }));
      expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
      expect(screen.getByText("Content 2")).toBeInTheDocument();
    });
  });

  describe("multiple mode", () => {
    it("multiple items can be open", async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="multiple">
          <AccordionItem value="item1">
            <AccordionTrigger>Title 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item2">
            <AccordionTrigger>Title 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      await user.click(screen.getByRole("button", { name: /Title 1/i }));
      await user.click(screen.getByRole("button", { name: /Title 2/i }));
      expect(screen.getByText("Content 1")).toBeInTheDocument();
      expect(screen.getByText("Content 2")).toBeInTheDocument();
    });
  });

  it("defaultExpanded opens items on mount", () => {
    render(
      <Accordion type="single" defaultExpanded={["item1"]}>
        <AccordionItem value="item1">
          <AccordionTrigger>Title 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("trigger has aria-expanded reflecting state", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single">
        <AccordionItem value="item1">
          <AccordionTrigger>Title 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole("button", { name: /Title 1/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("content has role region", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single">
        <AccordionItem value="item1">
          <AccordionTrigger>Title 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    await user.click(screen.getByRole("button", { name: /Title 1/i }));
    expect(screen.getByRole("region")).toBeInTheDocument();
    expect(screen.getByRole("region")).toHaveTextContent("Content 1");
  });
});
