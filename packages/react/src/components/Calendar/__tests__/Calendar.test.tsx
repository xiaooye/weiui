import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "../Calendar";

describe("Calendar", () => {
  it("renders month title and day buttons", () => {
    render(<Calendar defaultValue={new Date(2025, 0, 15)} />);
    expect(screen.getByText("January 2025")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("clicking a day calls onChange with a Date", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Calendar defaultValue={new Date(2025, 0, 1)} onChange={onChange} />);
    // Use aria-label to target a specific day unambiguously
    await user.click(screen.getByLabelText(/Friday, January 10, 2025/));
    expect(onChange).toHaveBeenCalledTimes(1);
    const calledDate = onChange.mock.calls[0][0] as Date;
    expect(calledDate.getDate()).toBe(10);
    expect(calledDate.getMonth()).toBe(0);
    expect(calledDate.getFullYear()).toBe(2025);
  });

  it("Previous month button navigates to prior month", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={new Date(2025, 2, 1)} />);
    expect(screen.getByText("March 2025")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Previous month"));
    expect(screen.getByText("February 2025")).toBeInTheDocument();
  });

  it("Next month button navigates to next month", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={new Date(2025, 2, 1)} />);
    expect(screen.getByText("March 2025")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Next month"));
    expect(screen.getByText("April 2025")).toBeInTheDocument();
  });

  it("marks today with data-today", () => {
    const today = new Date();
    render(<Calendar defaultValue={today} />);
    const todayButton = screen.getByText(String(today.getDate()), {
      selector: "button[data-today]",
    });
    expect(todayButton).toHaveAttribute("data-today", "true");
  });

  it("marks selected day with data-selected", () => {
    const selected = new Date(2025, 5, 20);
    render(<Calendar value={selected} />);
    const selectedButton = screen.getByText("20", {
      selector: "button[data-selected]",
    });
    expect(selectedButton).toHaveAttribute("data-selected", "true");
  });

  it("disabled days are not clickable", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const minDate = new Date(2025, 0, 10);
    render(
      <Calendar
        defaultValue={new Date(2025, 0, 15)}
        onChange={onChange}
        minDate={minDate}
      />,
    );
    // Use aria-label to target January 5 specifically (before minDate)
    const day5 = screen.getByLabelText(/Sunday, January 5, 2025/);
    expect(day5).toBeDisabled();
    expect(day5).toHaveAttribute("data-disabled", "true");
    await user.click(day5);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("has role=grid on the table element", () => {
    render(<Calendar />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("wraps from December to January on next month", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={new Date(2025, 11, 1)} />);
    expect(screen.getByText("December 2025")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Next month"));
    expect(screen.getByText("January 2026")).toBeInTheDocument();
  });

  it("wraps from January to December on previous month", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={new Date(2025, 0, 1)} />);
    expect(screen.getByText("January 2025")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Previous month"));
    expect(screen.getByText("December 2024")).toBeInTheDocument();
  });
});
