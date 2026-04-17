import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Rating } from "../Rating";

describe("Rating", () => {
  it("renders stars with role=radio inside role=radiogroup", () => {
    render(<Rating />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("clicking a star calls onChange with its value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating onChange={onChange} />);
    await user.click(screen.getByLabelText("3 stars"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("aria-checked reflects the selected star", () => {
    render(<Rating value={4} />);
    expect(screen.getByLabelText("4 stars")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByLabelText("3 stars")).toHaveAttribute("aria-checked", "false");
    expect(screen.getByLabelText("5 stars")).toHaveAttribute("aria-checked", "false");
  });

  it("ArrowRight moves to next star", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating defaultValue={3} onChange={onChange} />);
    const star3 = screen.getByLabelText("3 stars");
    star3.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("ArrowLeft moves to previous star", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating defaultValue={3} onChange={onChange} />);
    const star3 = screen.getByLabelText("3 stars");
    star3.focus();
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("all stars are disabled when disabled prop is set", () => {
    render(<Rating disabled />);
    const stars = screen.getAllByRole("radio");
    stars.forEach((star) => {
      expect(star).toBeDisabled();
    });
  });

  it("clicks do not change value when readOnly", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating readOnly defaultValue={2} onChange={onChange} />);
    await user.click(screen.getByLabelText("4 stars"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("defaultValue sets initial stars", () => {
    render(<Rating defaultValue={3} />);
    expect(screen.getByLabelText("3 stars")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByLabelText("1 star")).toHaveAttribute("aria-checked", "false");
  });

  it("renders correct number of stars with custom max", () => {
    render(<Rating max={10} />);
    expect(screen.getAllByRole("radio")).toHaveLength(10);
  });

  it("has data-disabled on radiogroup when disabled", () => {
    render(<Rating disabled />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-disabled", "true");
  });

  it("has data-readonly on radiogroup when readOnly", () => {
    render(<Rating readOnly />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-readonly", "true");
  });

  it("allowHalf: clicking the left half of a star sets value to N - 0.5", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating allowHalf onChange={onChange} />);
    const star3 = screen.getByLabelText("3 stars");
    // Stub bounding box so hit-testing is deterministic in jsdom.
    vi.spyOn(star3, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 44,
      bottom: 44,
      width: 44,
      height: 44,
      toJSON: () => ({}),
    } as DOMRect);
    await user.pointer({ keys: "[MouseLeft]", target: star3, coords: { clientX: 10, clientY: 10 } });
    expect(onChange).toHaveBeenCalledWith(2.5);
  });

  it("allowHalf: clicking the right half of a star sets value to N", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating allowHalf onChange={onChange} />);
    const star3 = screen.getByLabelText("3 stars");
    vi.spyOn(star3, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 44,
      bottom: 44,
      width: 44,
      height: 44,
      toJSON: () => ({}),
    } as DOMRect);
    await user.pointer({ keys: "[MouseLeft]", target: star3, coords: { clientX: 40, clientY: 10 } });
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("allowHalf: ArrowRight increments by 0.5", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating allowHalf defaultValue={3} onChange={onChange} />);
    screen.getByLabelText("3 stars").focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(3.5);
  });

  it("allowHalf: star with half value renders with data-half attribute", () => {
    render(<Rating allowHalf value={2.5} />);
    const stars = screen.getAllByRole("radio");
    expect(stars[2]).toHaveAttribute("data-half", "true");
    expect(stars[0]).toHaveAttribute("data-filled", "true");
    expect(stars[1]).toHaveAttribute("data-filled", "true");
  });
});
