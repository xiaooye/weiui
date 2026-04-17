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

  // Wave 5d P0: locale support
  it("uses locale-aware month title when locale is provided", () => {
    render(<Calendar defaultValue={new Date(2025, 0, 15)} locale="fr-FR" />);
    // January in French is "janvier"
    const heading = screen.getByText(/janvier/i);
    expect(heading).toBeInTheDocument();
  });

  it("renders locale-aware weekday short names when locale is provided", () => {
    const { container } = render(
      <Calendar defaultValue={new Date(2025, 0, 15)} locale="fr-FR" />,
    );
    const weekdayCells = container.querySelectorAll(".wui-calendar__weekday");
    // French Monday is "lun." or similar - should not equal "Mo" (English hardcoded)
    const texts = Array.from(weekdayCells).map((el) => el.textContent?.toLowerCase());
    expect(texts.some((t) => t?.startsWith("lun"))).toBe(true);
  });

  // Wave 5d P0: firstDayOfWeek config
  it("firstDayOfWeek=1 starts the week on Monday", () => {
    const { container } = render(
      <Calendar defaultValue={new Date(2025, 0, 15)} firstDayOfWeek={1} />,
    );
    const weekdayCells = container.querySelectorAll(".wui-calendar__weekday");
    // First header cell should correspond to Monday
    expect(weekdayCells[0]?.textContent?.toLowerCase()).toMatch(/^mon?$/);
    expect(weekdayCells[6]?.textContent?.toLowerCase()).toMatch(/^sun?$/);
  });

  // Wave 5d P0: grid keyboard navigation
  it("ArrowRight moves focus to next day", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={new Date(2025, 0, 15)} />);
    const day15 = screen.getByLabelText(/January 15, 2025/);
    day15.focus();
    await user.keyboard("{ArrowRight}");
    const day16 = screen.getByLabelText(/January 16, 2025/);
    expect(document.activeElement).toBe(day16);
  });

  it("ArrowLeft moves focus to previous day", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={new Date(2025, 0, 15)} />);
    const day15 = screen.getByLabelText(/January 15, 2025/);
    day15.focus();
    await user.keyboard("{ArrowLeft}");
    const day14 = screen.getByLabelText(/January 14, 2025/);
    expect(document.activeElement).toBe(day14);
  });

  it("ArrowDown moves focus by one week", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={new Date(2025, 0, 15)} />);
    const day15 = screen.getByLabelText(/January 15, 2025/);
    day15.focus();
    await user.keyboard("{ArrowDown}");
    const day22 = screen.getByLabelText(/January 22, 2025/);
    expect(document.activeElement).toBe(day22);
  });

  it("ArrowUp moves focus by one week", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={new Date(2025, 0, 15)} />);
    const day15 = screen.getByLabelText(/January 15, 2025/);
    day15.focus();
    await user.keyboard("{ArrowUp}");
    const day8 = screen.getByLabelText(/January 8, 2025/);
    expect(document.activeElement).toBe(day8);
  });

  it("Home moves focus to start of week (Sunday by default)", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={new Date(2025, 0, 15)} />);
    const day15 = screen.getByLabelText(/January 15, 2025/);
    day15.focus();
    await user.keyboard("{Home}");
    // Jan 15 2025 is a Wednesday; Sunday that week is Jan 12
    const day12 = screen.getByLabelText(/January 12, 2025/);
    expect(document.activeElement).toBe(day12);
  });

  it("End moves focus to end of week", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={new Date(2025, 0, 15)} />);
    const day15 = screen.getByLabelText(/January 15, 2025/);
    day15.focus();
    await user.keyboard("{End}");
    // Saturday that week is Jan 18
    const day18 = screen.getByLabelText(/January 18, 2025/);
    expect(document.activeElement).toBe(day18);
  });

  it("PageUp moves focus back one month", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={new Date(2025, 1, 15)} />);
    const day15 = screen.getByLabelText(/February 15, 2025/);
    day15.focus();
    await user.keyboard("{PageUp}");
    // Should navigate to January and focus the corresponding day
    expect(screen.getByText("January 2025")).toBeInTheDocument();
  });

  it("PageDown moves focus forward one month", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultValue={new Date(2025, 0, 15)} />);
    const day15 = screen.getByLabelText(/January 15, 2025/);
    day15.focus();
    await user.keyboard("{PageDown}");
    expect(screen.getByText("February 2025")).toBeInTheDocument();
  });
});
