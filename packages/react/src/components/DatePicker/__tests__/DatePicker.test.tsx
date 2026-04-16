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
    expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date);
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
});
