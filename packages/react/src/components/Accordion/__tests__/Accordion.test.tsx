import { describe, it, expect, vi } from "vitest";
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

  describe("controlled value (P0)", () => {
    it("opens items based on controlled `value` prop", () => {
      render(
        <Accordion type="single" value={["item1"]}>
          <AccordionItem value="item1">
            <AccordionTrigger>Title 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.getByText("Content 1")).toBeInTheDocument();
    });

    it("doesn't change internal state when controlled and click happens", async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" value={[]}>
          <AccordionItem value="item1">
            <AccordionTrigger>Title 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      await user.click(screen.getByRole("button", { name: /Title 1/i }));
      expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
    });

    it("calls onValueChange with new expanded ids", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Accordion type="single" onValueChange={onValueChange}>
          <AccordionItem value="item1">
            <AccordionTrigger>Title 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      await user.click(screen.getByRole("button", { name: /Title 1/i }));
      expect(onValueChange).toHaveBeenCalledWith(["item1"]);
    });

    it("reflects controlled prop change", () => {
      const { rerender } = render(
        <Accordion type="single" value={[]}>
          <AccordionItem value="item1">
            <AccordionTrigger>Title 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.queryByText("Content 1")).not.toBeInTheDocument();

      rerender(
        <Accordion type="single" value={["item1"]}>
          <AccordionItem value="item1">
            <AccordionTrigger>Title 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.getByText("Content 1")).toBeInTheDocument();
    });
  });

  describe("arrow key navigation (P0)", () => {
    function ThreeItems() {
      return (
        <Accordion type="single">
          <AccordionItem value="a">
            <AccordionTrigger>Trigger A</AccordionTrigger>
            <AccordionContent>Content A</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Trigger B</AccordionTrigger>
            <AccordionContent>Content B</AccordionContent>
          </AccordionItem>
          <AccordionItem value="c">
            <AccordionTrigger>Trigger C</AccordionTrigger>
            <AccordionContent>Content C</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    it("ArrowDown moves focus to next trigger", async () => {
      const user = userEvent.setup();
      render(<ThreeItems />);
      screen.getByRole("button", { name: /Trigger A/i }).focus();
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("button", { name: /Trigger B/i })).toHaveFocus();
    });

    it("ArrowUp moves focus to previous trigger", async () => {
      const user = userEvent.setup();
      render(<ThreeItems />);
      screen.getByRole("button", { name: /Trigger B/i }).focus();
      await user.keyboard("{ArrowUp}");
      expect(screen.getByRole("button", { name: /Trigger A/i })).toHaveFocus();
    });

    it("Home moves focus to first trigger", async () => {
      const user = userEvent.setup();
      render(<ThreeItems />);
      screen.getByRole("button", { name: /Trigger C/i }).focus();
      await user.keyboard("{Home}");
      expect(screen.getByRole("button", { name: /Trigger A/i })).toHaveFocus();
    });

    it("End moves focus to last trigger", async () => {
      const user = userEvent.setup();
      render(<ThreeItems />);
      screen.getByRole("button", { name: /Trigger A/i }).focus();
      await user.keyboard("{End}");
      expect(screen.getByRole("button", { name: /Trigger C/i })).toHaveFocus();
    });

    it("ArrowDown loops at end", async () => {
      const user = userEvent.setup();
      render(<ThreeItems />);
      screen.getByRole("button", { name: /Trigger C/i }).focus();
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("button", { name: /Trigger A/i })).toHaveFocus();
    });
  });

  describe("disabled item (P1)", () => {
    it("disables the trigger button and skips keyboard focus", async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single">
          <AccordionItem value="a">
            <AccordionTrigger>Trigger A</AccordionTrigger>
            <AccordionContent>Content A</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b" disabled>
            <AccordionTrigger>Trigger B</AccordionTrigger>
            <AccordionContent>Content B</AccordionContent>
          </AccordionItem>
          <AccordionItem value="c">
            <AccordionTrigger>Trigger C</AccordionTrigger>
            <AccordionContent>Content C</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      const b = screen.getByRole("button", { name: /Trigger B/i });
      expect(b).toBeDisabled();
      // From A, ArrowDown skips B and lands on C.
      screen.getByRole("button", { name: /Trigger A/i }).focus();
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("button", { name: /Trigger C/i })).toHaveFocus();
    });

    it("clicking a disabled trigger does not expand", async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single">
          <AccordionItem value="b" disabled>
            <AccordionTrigger>Trigger B</AccordionTrigger>
            <AccordionContent>Content B</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      const btn = screen.getByRole("button", { name: /Trigger B/i });
      await user.click(btn);
      expect(screen.queryByText("Content B")).not.toBeInTheDocument();
    });

    it("adds data-disabled to the item wrapper", () => {
      render(
        <Accordion type="single">
          <AccordionItem value="b" disabled data-testid="item-b">
            <AccordionTrigger>Trigger B</AccordionTrigger>
            <AccordionContent>Content B</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.getByTestId("item-b")).toHaveAttribute("data-disabled");
    });
  });
});
