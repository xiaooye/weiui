import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "../Select";
import { SelectTrigger } from "../SelectTrigger";
import { SelectValue } from "../SelectValue";
import { SelectContent } from "../SelectContent";
import { SelectItem } from "../SelectItem";

function TestSelect({ onValueChange }: { onValueChange?: (v: string) => void }) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Choose..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe("Select", () => {
  it("shows placeholder initially", () => {
    render(<TestSelect />);
    expect(screen.getByText("Choose...")).toBeInTheDocument();
  });

  it("does not show listbox initially", () => {
    render(<TestSelect />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens on trigger click", async () => {
    render(<TestSelect />);
    await userEvent.setup().click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("shows options when open", async () => {
    render(<TestSelect />);
    await userEvent.setup().click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("selects item on click", async () => {
    const onValueChange = vi.fn();
    render(<TestSelect onValueChange={onValueChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("Banana"));
    expect(onValueChange).toHaveBeenCalledWith("banana");
    expect(screen.getByText("Banana")).toBeInTheDocument(); // displayed in trigger
  });

  it("closes after selection", async () => {
    render(<TestSelect />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("Apple"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    render(<TestSelect />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("has aria-haspopup on trigger", () => {
    render(<TestSelect />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-haspopup", "listbox");
  });

  it("has aria-expanded on trigger", async () => {
    render(<TestSelect />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.setup().click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("marks selected item with aria-selected", async () => {
    render(<TestSelect />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("Cherry"));
    // Re-open to check
    await user.click(screen.getByRole("combobox"));
    const cherryOption = screen.getByRole("option", { name: "Cherry" });
    expect(cherryOption).toHaveAttribute("aria-selected", "true");
  });

  it("navigates options with ArrowDown/ArrowUp and selects with Enter", async () => {
    const onValueChange = vi.fn();
    render(<TestSelect onValueChange={onValueChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Banana" })).toHaveAttribute(
      "data-highlighted",
      "true",
    );

    await user.keyboard("{End}");
    expect(screen.getByRole("option", { name: "Cherry" })).toHaveAttribute(
      "data-highlighted",
      "true",
    );

    await user.keyboard("{Home}");
    expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute(
      "data-highlighted",
      "true",
    );

    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("apple");
  });
});
