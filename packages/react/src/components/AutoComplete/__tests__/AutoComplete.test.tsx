import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoComplete } from "../AutoComplete";

const options = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

describe("AutoComplete", () => {
  it("renders the input", () => {
    render(<AutoComplete options={options} placeholder="Search..." />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("opens dropdown on focus", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={options} />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("filters options based on input", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={options} />);
    await user.type(screen.getByRole("combobox"), "an");
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.queryByText("Apple")).not.toBeInTheDocument();
    expect(screen.queryByText("Cherry")).not.toBeInTheDocument();
  });

  it("shows empty text when no options match", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={options} emptyText="Nothing found" />);
    await user.type(screen.getByRole("combobox"), "xyz");
    expect(screen.getByText("Nothing found")).toBeInTheDocument();
  });

  it("selects option on click and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AutoComplete options={options} onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("Banana"));
    expect(onChange).toHaveBeenCalledWith("banana");
    expect(screen.getByRole("combobox")).toHaveValue("Banana");
  });

  it("closes dropdown on Escape", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={options} />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("calls onInputChange when typing", async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    render(<AutoComplete options={options} onInputChange={onInputChange} />);
    await user.type(screen.getByRole("combobox"), "ap");
    expect(onInputChange).toHaveBeenCalledWith("ap");
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<AutoComplete ref={ref} options={options} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
