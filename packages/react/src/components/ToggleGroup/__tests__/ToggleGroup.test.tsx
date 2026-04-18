import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleGroup, ToggleGroupItem } from "../ToggleGroup";

describe("ToggleGroup", () => {
  it("renders items", () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  describe("single mode", () => {
    it("clicking an item selects it", async () => {
      const user = userEvent.setup();
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>,
      );

      await user.click(screen.getByText("A"));
      expect(screen.getByText("A").closest("button")).toHaveAttribute("aria-pressed", "true");
    });

    it("clicking the selected item deselects it", async () => {
      const user = userEvent.setup();
      render(
        <ToggleGroup type="single" defaultValue="a">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>,
      );

      expect(screen.getByText("A").closest("button")).toHaveAttribute("aria-pressed", "true");
      await user.click(screen.getByText("A"));
      expect(screen.getByText("A").closest("button")).toHaveAttribute("aria-pressed", "false");
    });

    it("clicking another item deselects the previous", async () => {
      const user = userEvent.setup();
      render(
        <ToggleGroup type="single" defaultValue="a">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>,
      );

      await user.click(screen.getByText("B"));
      expect(screen.getByText("A").closest("button")).toHaveAttribute("aria-pressed", "false");
      expect(screen.getByText("B").closest("button")).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("multiple mode", () => {
    it("clicking items toggles them independently", async () => {
      const user = userEvent.setup();
      render(
        <ToggleGroup type="multiple">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>,
      );

      await user.click(screen.getByText("A"));
      await user.click(screen.getByText("B"));
      expect(screen.getByText("A").closest("button")).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByText("B").closest("button")).toHaveAttribute("aria-pressed", "true");

      await user.click(screen.getByText("A"));
      expect(screen.getByText("A").closest("button")).toHaveAttribute("aria-pressed", "false");
      expect(screen.getByText("B").closest("button")).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("disabled group prevents interaction", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleGroup type="single" disabled onChange={onChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );

    await user.click(screen.getByText("A"));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("A").closest("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("aria-pressed reflects selected state", () => {
    render(
      <ToggleGroup type="single" defaultValue="a">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(screen.getByText("A").closest("button")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("B").closest("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("onChange fires with correct value in single mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleGroup type="single" onChange={onChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );

    await user.click(screen.getByText("A"));
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("onChange fires with correct values in multiple mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleGroup type="multiple" onChange={onChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );

    await user.click(screen.getByText("A"));
    expect(onChange).toHaveBeenCalledWith(["a"]);

    await user.click(screen.getByText("B"));
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
  });

  describe("keyboard navigation", () => {
    it("applies roving tabindex (only one item is tabbable at a time)", () => {
      render(
        <ToggleGroup type="single" defaultValue="b">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
          <ToggleGroupItem value="c">C</ToggleGroupItem>
        </ToggleGroup>,
      );
      const a = screen.getByText("A").closest("button")!;
      const b = screen.getByText("B").closest("button")!;
      const c = screen.getByText("C").closest("button")!;
      // Selected item is the tab-stop; the others get tabindex="-1".
      expect(a.getAttribute("tabindex")).toBe("-1");
      expect(b.getAttribute("tabindex")).toBe("0");
      expect(c.getAttribute("tabindex")).toBe("-1");
    });

    it("arrow-right moves focus to next item", async () => {
      const user = userEvent.setup();
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>,
      );
      const a = screen.getByText("A").closest("button")!;
      a.focus();
      await user.keyboard("{ArrowRight}");
      expect(screen.getByText("B").closest("button")).toHaveFocus();
    });

    it("arrow-left moves focus to previous item with wrap", async () => {
      const user = userEvent.setup();
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>,
      );
      const a = screen.getByText("A").closest("button")!;
      a.focus();
      await user.keyboard("{ArrowLeft}");
      expect(screen.getByText("B").closest("button")).toHaveFocus();
    });

    it("Home/End jump to first/last", async () => {
      const user = userEvent.setup();
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
          <ToggleGroupItem value="c">C</ToggleGroupItem>
        </ToggleGroup>,
      );
      const b = screen.getByText("B").closest("button")!;
      b.focus();
      await user.keyboard("{End}");
      expect(screen.getByText("C").closest("button")).toHaveFocus();
      await user.keyboard("{Home}");
      expect(screen.getByText("A").closest("button")).toHaveFocus();
    });

    it("when no item selected, first item is the tab-stop", () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>,
      );
      const a = screen.getByText("A").closest("button")!;
      const b = screen.getByText("B").closest("button")!;
      expect(a.getAttribute("tabindex")).toBe("0");
      expect(b.getAttribute("tabindex")).toBe("-1");
    });

    it("vertical orientation uses ArrowDown/ArrowUp, ignores left/right", async () => {
      const user = userEvent.setup();
      render(
        <ToggleGroup type="single" orientation="vertical">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>,
      );
      const a = screen.getByText("A").closest("button")!;
      a.focus();
      await user.keyboard("{ArrowDown}");
      expect(screen.getByText("B").closest("button")).toHaveFocus();
      await user.keyboard("{ArrowUp}");
      expect(screen.getByText("A").closest("button")).toHaveFocus();
    });
  });

  it("applies vertical orientation class and data attribute", () => {
    render(
      <ToggleGroup type="single" orientation="vertical">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const group = screen.getByRole("group");
    expect(group).toHaveClass("wui-toggle-group--vertical");
    expect(group).toHaveAttribute("data-orientation", "vertical");
  });
});
