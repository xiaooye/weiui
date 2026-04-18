import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "../DatePicker";

describe("DatePicker", () => {
  it("renders trigger button with placeholder", () => {
    render(<DatePicker placeholder="Pick date" />);
    expect(screen.getByText("Pick date")).toBeInTheDocument();
  });

  it("clicking trigger opens calendar dropdown", async () => {
    const user = userEvent.setup();
    render(<DatePicker placeholder="Pick date" label="Date" />);
    await user.click(screen.getByRole("button", { name: "Date" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("selecting a date closes dropdown and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker placeholder="Pick date" label="Date" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Date" }));
    // Find a day button inside the dialog and click it
    const dialog = screen.getByRole("dialog");
    const dayButton = within(dialog).getByText("15", {
      selector: ".wui-calendar__day-btn",
    });
    await user.click(dayButton);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0]).toBeInstanceOf(Date);
    // Dropdown should be closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("displays formatted date after selection", () => {
    const date = new Date(2025, 5, 15);
    render(<DatePicker value={date} placeholder="Pick date" />);
    // The component formats as "short" month, numeric day, numeric year
    expect(screen.getByRole("button")).toHaveTextContent("Jun 15, 2025");
  });

  it("has aria-haspopup=dialog on trigger", () => {
    render(<DatePicker placeholder="Pick date" />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("aria-expanded reflects open state", async () => {
    const user = userEvent.setup();
    render(<DatePicker placeholder="Pick date" label="Date" />);
    const trigger = screen.getByRole("button", { name: "Date" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("shows placeholder when no value is provided", () => {
    render(<DatePicker placeholder="Select date..." />);
    expect(screen.getByText("Select date...")).toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<DatePicker placeholder="Pick date" disabled />);
    const trigger = screen.getByRole("button");
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // Wave 5d P0: locale prop flows through to trigger + calendar
  it("displays date in provided locale", () => {
    const date = new Date(2025, 5, 15);
    render(<DatePicker value={date} locale="fr-FR" placeholder="Pick date" />);
    // French: "15 juin 2025" or similar — shouldn't show English "Jun"
    const btn = screen.getByRole("button");
    expect(btn.textContent?.toLowerCase()).not.toContain("jun 15");
    expect(btn.textContent?.toLowerCase()).toMatch(/juin|15/);
  });

  it("passes locale through to Calendar dropdown", async () => {
    const user = userEvent.setup();
    render(<DatePicker placeholder="Pick date" label="Date" locale="fr-FR" />);
    await user.click(screen.getByRole("button", { name: "Date" }));
    // Dialog is open; month label should be in French
    const dialog = screen.getByRole("dialog");
    // Look for any French month substring in the dialog header
    expect(dialog.textContent?.toLowerCase()).toMatch(
      /janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre/,
    );
  });

  // Wave 5d P0: floating placement via Floating UI
  it("uses Floating UI for dropdown positioning (dropdown is portaled)", async () => {
    const user = userEvent.setup();
    render(<DatePicker placeholder="Pick date" label="Date" />);
    await user.click(screen.getByRole("button", { name: "Date" }));
    const dialog = screen.getByRole("dialog");
    // Dropdown must be portaled into body, not a child of the trigger container
    expect(dialog.parentElement).toBe(document.body);
    // And must have inline positioning from Floating UI (position: absolute)
    const style = dialog.getAttribute("style") || "";
    expect(style).toMatch(/position\s*:\s*absolute/i);
  });

  describe("P1 features", () => {
    it("typed input variant exposes a text input", () => {
      render(<DatePicker variant="input" placeholder="MM/DD/YYYY" label="Date" />);
      const inputs = screen.getAllByRole("textbox");
      expect(inputs.length).toBeGreaterThan(0);
    });

    it("clearable renders clear button and resets value", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePicker clearable value={new Date(2025, 0, 1)} onChange={onChange} />);
      const clear = screen.getByLabelText("Clear date");
      await user.click(clear);
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("range mode renders two date fields and onRangeChange fires", async () => {
      const user = userEvent.setup();
      const onRangeChange = vi.fn();
      render(<DatePicker mode="range" onRangeChange={onRangeChange} label="Range" />);
      await user.click(screen.getByRole("button", { name: "Range" }));
      const dialog = screen.getByRole("dialog");
      const start = within(dialog).getByText("10", { selector: ".wui-calendar__day-btn" });
      await user.click(start);
      const end = within(dialog).getByText("20", { selector: ".wui-calendar__day-btn" });
      await user.click(end);
      expect(onRangeChange).toHaveBeenCalled();
      const call = onRangeChange.mock.calls.at(-1)![0];
      expect(Array.isArray(call)).toBe(true);
      expect(call[0]).toBeInstanceOf(Date);
      expect(call[1]).toBeInstanceOf(Date);
    });

    it("presets render clickable chips and clicking sets the value", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const preset = new Date(2024, 5, 1);
      render(
        <DatePicker
          onChange={onChange}
          label="Date"
          presets={[{ label: "Jun 1", value: preset }]}
        />,
      );
      await user.click(screen.getByRole("button", { name: "Date" }));
      await user.click(screen.getByRole("button", { name: "Jun 1" }));
      expect(onChange).toHaveBeenCalledWith(preset);
    });

    it("year/month dropdowns render and can change the view", async () => {
      const user = userEvent.setup();
      render(<DatePicker label="Date" showYearMonthDropdowns />);
      await user.click(screen.getByRole("button", { name: "Date" }));
      const dialog = screen.getByRole("dialog");
      const monthSelect = within(dialog).getByLabelText(/select month/i) as HTMLSelectElement;
      const yearSelect = within(dialog).getByLabelText(/select year/i) as HTMLSelectElement;
      expect(monthSelect.tagName).toBe("SELECT");
      expect(yearSelect.tagName).toBe("SELECT");
      await user.selectOptions(monthSelect, "0");
      // month changed
      expect(monthSelect).toHaveValue("0");
    });

    it("name prop renders hidden input", () => {
      const { container } = render(
        <DatePicker name="dob" value={new Date(2025, 0, 15)} />,
      );
      const hidden = container.querySelector('input[type="hidden"][name="dob"]');
      expect(hidden).not.toBeNull();
    });

    it("defaultValue sets initial displayed date without consumer wiring value", () => {
      render(<DatePicker defaultValue={new Date(2024, 0, 15)} placeholder="Pick date" label="Date" />);
      const trigger = screen.getByRole("button", { name: "Date" });
      expect(trigger).toHaveTextContent("Jan 15, 2024");
    });

    it("uncontrolled: selecting a date in the popover updates the trigger text and fires onChange", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DatePicker defaultValue={new Date(2024, 0, 15)} onChange={onChange} label="Date" />,
      );
      const trigger = screen.getByRole("button", { name: "Date" });
      expect(trigger).toHaveTextContent("Jan 15, 2024");
      await user.click(trigger);
      const dialog = screen.getByRole("dialog");
      const day20 = within(dialog).getByText("20", { selector: ".wui-calendar__day-btn" });
      await user.click(day20);
      // Internal state advanced without consumer holding `value`.
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0]![0]).toBeInstanceOf(Date);
      const triggerAfter = screen.getByRole("button", { name: "Date" });
      expect(triggerAfter).toHaveTextContent("Jan 20, 2024");
    });
  });
});
