import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Rating } from "../Rating";

describe("Rating", () => {
  it("renders with role=radiogroup", () => {
    render(<Rating />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("renders correct number of stars (default 5)", () => {
    render(<Rating />);
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("renders correct number of stars when max is set", () => {
    render(<Rating max={3} />);
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("clicking a star calls onChange with correct value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating onChange={onChange} />);
    await user.click(screen.getByLabelText("3 stars"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("sets aria-checked on selected star", () => {
    render(<Rating value={3} />);
    expect(screen.getByLabelText("3 stars")).toHaveAttribute("aria-checked", "true");
  });

  it("unselected stars have aria-checked=false", () => {
    render(<Rating value={3} />);
    expect(screen.getByLabelText("2 stars")).toHaveAttribute("aria-checked", "false");
  });

  it("does not call onChange when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating onChange={onChange} disabled />);
    const stars = screen.getAllByRole("radio");
    // disabled buttons can't be clicked via userEvent
    expect(stars[0]).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not call onChange when readOnly", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating onChange={onChange} readOnly defaultValue={2} />);
    // readOnly buttons are not disabled but clicking should be a no-op
    await user.click(screen.getByLabelText("4 stars"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("applies data-disabled when disabled", () => {
    render(<Rating disabled />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-disabled", "true");
  });

  it("applies data-readonly when readOnly", () => {
    render(<Rating readOnly />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-readonly", "true");
  });

  it("forwards ref to root div", () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<Rating ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
