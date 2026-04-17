import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiSelect } from "../MultiSelect";

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
];

describe("MultiSelect", () => {
  it("renders trigger with placeholder", () => {
    render(<MultiSelect options={options} placeholder="Pick frameworks" />);
    expect(screen.getByText("Pick frameworks")).toBeInTheDocument();
  });

  it("opens dropdown on trigger click", async () => {
    const user = userEvent.setup();
    render(<MultiSelect options={options} label="Frameworks" />);

    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vue")).toBeInTheDocument();
  });

  it("toggles selection when clicking an option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiSelect options={options} onChange={onChange} label="Frameworks" />);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "React" }));

    expect(onChange).toHaveBeenCalledWith(["react"]);
  });

  it("shows selected items as tags in trigger", async () => {
    const user = userEvent.setup();
    render(<MultiSelect options={options} label="Frameworks" />);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "React" }));

    // The tag should appear in the trigger area
    expect(screen.getByRole("button", { name: "Remove React" })).toBeInTheDocument();
  });

  it("removes selection when clicking tag remove button", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiSelect options={options} onChange={onChange} label="Frameworks" />);

    // Select React
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("React"));

    // Remove it via the tag remove button
    const removeBtn = screen.getByRole("button", { name: "Remove React" });
    await user.click(removeBtn);

    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("navigates options with ArrowDown and ArrowUp", async () => {
    const user = userEvent.setup();
    render(<MultiSelect options={options} label="Frameworks" />);

    const trigger = screen.getByRole("combobox");
    // Open dropdown via click -- highlightedIndex starts at -1
    await user.click(trigger);

    // ArrowDown from -1 goes to index 0 (React)
    await user.keyboard("{ArrowDown}");
    const firstOption = screen.getByText("React").closest("[role='option']")!;
    expect(firstOption).toHaveAttribute("data-highlighted", "true");

    // ArrowDown again goes to index 1 (Vue)
    await user.keyboard("{ArrowDown}");
    const secondOption = screen.getByText("Vue").closest("[role='option']")!;
    expect(secondOption).toHaveAttribute("data-highlighted", "true");

    // ArrowUp should go back to index 0 (React)
    await user.keyboard("{ArrowUp}");
    expect(firstOption).toHaveAttribute("data-highlighted", "true");
  });

  it("closes dropdown on Escape", async () => {
    const user = userEvent.setup();
    render(<MultiSelect options={options} label="Frameworks" />);

    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("calls onChange with updated value array", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiSelect options={options} onChange={onChange} label="Frameworks" />);

    await user.click(screen.getByRole("combobox"));
    // Dropdown is open, click React option
    await user.click(screen.getByRole("option", { name: "React" }));
    expect(onChange).toHaveBeenCalledWith(["react"]);

    // Dropdown is still open, click Vue option
    await user.click(screen.getByRole("option", { name: "Vue" }));
    expect(onChange).toHaveBeenCalledWith(["react", "vue"]);
  });

  it("filters options by typing in the search input", async () => {
    const user = userEvent.setup();
    render(
      <MultiSelect
        options={[
          { value: "a", label: "Apple" },
          { value: "b", label: "Banana" },
        ]}
        label="Fruits"
      />,
    );
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    const search = screen.getByPlaceholderText(/search/i);
    await user.type(search, "app");
    expect(screen.queryByText("Banana")).not.toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("applies floating placement to dropdown", async () => {
    const user = userEvent.setup();
    render(<MultiSelect options={[{ value: "a", label: "A" }]} label="Items" />);
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    const listbox = screen.getByRole("listbox");
    expect(listbox.style.position).toBe("absolute");
  });
});
