import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox } from "../Combobox";
import { ComboboxInput } from "../ComboboxInput";
import { ComboboxContent } from "../ComboboxContent";
import { ComboboxItem } from "../ComboboxItem";
import { ComboboxEmpty } from "../ComboboxEmpty";
import { useState } from "react";

function TestCombobox({ onValueChange }: { onValueChange?: (v: string) => void }) {
  const items = ["Apple", "Banana", "Cherry", "Date"];
  const [query, setQuery] = useState("");

  const filtered = items.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Combobox onValueChange={onValueChange}>
      <ComboboxInput
        placeholder="Search fruits..."
        onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
      />
      <ComboboxContent>
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <ComboboxItem key={item} value={item.toLowerCase()}>
              {item}
            </ComboboxItem>
          ))
        ) : (
          <ComboboxEmpty>No results</ComboboxEmpty>
        )}
      </ComboboxContent>
    </Combobox>
  );
}

describe("Combobox", () => {
  it("shows placeholder", () => {
    render(<TestCombobox />);
    expect(screen.getByPlaceholderText("Search fruits...")).toBeInTheDocument();
  });

  it("opens on focus", async () => {
    render(<TestCombobox />);
    await userEvent.setup().click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("shows all options initially", async () => {
    render(<TestCombobox />);
    await userEvent.setup().click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("selects item on click", async () => {
    const onValueChange = vi.fn();
    render(<TestCombobox onValueChange={onValueChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("Banana"));
    expect(onValueChange).toHaveBeenCalledWith("banana");
  });

  it("closes after selection", async () => {
    render(<TestCombobox />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("Apple"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("updates input value after selection", async () => {
    render(<TestCombobox />);
    const user = userEvent.setup();
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.click(screen.getByText("Cherry"));
    expect(input).toHaveValue("Cherry");
  });

  it("closes on Escape", async () => {
    render(<TestCombobox />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("has correct ARIA attributes", async () => {
    render(<TestCombobox />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await userEvent.setup().click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls");
  });
});
