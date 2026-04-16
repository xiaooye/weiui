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
});
