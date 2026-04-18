import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoComplete } from "../AutoComplete";

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
];

describe("AutoComplete", () => {
  it("renders input with role=combobox", () => {
    render(<AutoComplete options={options} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("typing filters options", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={options} />);
    await user.type(screen.getByRole("combobox"), "Rea");
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.queryByText("Vue")).not.toBeInTheDocument();
    expect(screen.queryByText("Angular")).not.toBeInTheDocument();
  });

  it("ArrowDown navigates to first option", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={options} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{ArrowDown}");
    // After opening, first item should be highlighted
    const firstOption = screen.getAllByRole("option")[0];
    expect(firstOption).toHaveAttribute("data-highlighted", "true");
  });

  it("ArrowDown then ArrowUp navigates options", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={options} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    // Move down twice then up once
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowUp}");
    const allOptions = screen.getAllByRole("option");
    expect(allOptions[0]).toHaveAttribute("data-highlighted", "true");
  });

  it("Enter selects highlighted option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AutoComplete options={options} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("react");
  });

  it("Escape closes dropdown", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={options} />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("aria-expanded reflects open state", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={options} />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("selected option fills input", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={options} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("Vue"));
    expect(screen.getByRole("combobox")).toHaveValue("Vue");
  });

  it("shows empty text when no matches", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={options} emptyText="No results" />);
    await user.type(screen.getByRole("combobox"), "zzzzz");
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("uses default empty text when not specified", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={options} />);
    await user.type(screen.getByRole("combobox"), "zzzzz");
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("closes dropdown after selecting an option", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={options} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("Angular"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("renders loading indicator when loading=true", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={[]} loading />);
    await user.click(screen.getByRole("combobox"));
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent(/loading/i);
  });

  it("applies floating placement styles to dropdown", async () => {
    const user = userEvent.setup();
    render(<AutoComplete options={[{ value: "a", label: "A" }]} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    const listbox = screen.getByRole("listbox");
    expect(listbox.style.position).toBe("absolute");
  });

  describe("P1 features", () => {
    it("controlled open/onOpenChange", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<AutoComplete options={options} open onOpenChange={onOpenChange} />);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      await user.click(screen.getByRole("combobox"));
      await user.keyboard("{Escape}");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("controlled inputValue/onInputChange", async () => {
      const user = userEvent.setup();
      const onInputChange = vi.fn();
      render(<AutoComplete options={options} inputValue="Re" onInputChange={onInputChange} />);
      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("Re");
      await user.click(input);
      await user.keyboard("a");
      expect(onInputChange).toHaveBeenCalled();
    });

    it("custom filter narrows shown options", async () => {
      const user = userEvent.setup();
      const filter = (q: string, opt: { value: string; label: string }) =>
        opt.value.startsWith(q);
      render(<AutoComplete options={options} filter={filter} />);
      await user.type(screen.getByRole("combobox"), "a");
      expect(screen.getByText("Angular")).toBeInTheDocument();
      expect(screen.queryByText("React")).not.toBeInTheDocument();
    });

    it("renderOption customizes item rendering", async () => {
      const user = userEvent.setup();
      render(
        <AutoComplete
          options={options}
          renderOption={(opt) => <span data-testid={`opt-${opt.value}`}>{opt.label}!</span>}
        />,
      );
      await user.click(screen.getByRole("combobox"));
      expect(screen.getByTestId("opt-react")).toHaveTextContent("React!");
    });

    it("emptyState replaces default empty slot", async () => {
      const user = userEvent.setup();
      render(
        <AutoComplete
          options={options}
          emptyState={<div data-testid="empty-slot">Nothing found</div>}
        />,
      );
      await user.type(screen.getByRole("combobox"), "zzz");
      expect(screen.getByTestId("empty-slot")).toBeInTheDocument();
    });

    it("clearable renders button that clears input", async () => {
      const user = userEvent.setup();
      const onInputChange = vi.fn();
      render(<AutoComplete options={options} clearable defaultInputValue="React" onInputChange={onInputChange} />);
      const clear = screen.getByLabelText("Clear");
      await user.click(clear);
      expect(onInputChange).toHaveBeenCalledWith("");
    });

    it("allowsCustomValue fires onChange with the typed input on Enter", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<AutoComplete options={options} allowsCustomValue onChange={onChange} />);
      const input = screen.getByRole("combobox");
      await user.type(input, "xxx");
      await user.keyboard("{Enter}");
      expect(onChange).toHaveBeenCalledWith("xxx");
    });
  });
});
