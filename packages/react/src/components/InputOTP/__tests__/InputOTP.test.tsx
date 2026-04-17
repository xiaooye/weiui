import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputOTP } from "../InputOTP";

describe("InputOTP", () => {
  it("renders the correct number of slots (default 6)", () => {
    render(<InputOTP />);
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
  });

  it("renders the correct number of slots when length is set", () => {
    render(<InputOTP length={4} />);
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
  });

  it("renders slot aria-labels", () => {
    render(<InputOTP length={3} />);
    expect(screen.getByLabelText("Digit 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Digit 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Digit 3")).toBeInTheDocument();
  });

  it("typing a character auto-focuses the next slot", async () => {
    const user = userEvent.setup();
    render(<InputOTP length={4} />);
    const slots = screen.getAllByRole("textbox");
    slots[0]!.focus();
    await user.keyboard("1");
    expect(document.activeElement).toBe(slots[1]);
  });

  it("backspace clears current slot and moves focus back", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputOTP length={4} defaultValue="12" onChange={onChange} />);
    const slots = screen.getAllByRole("textbox");
    // slot index 1 has "2", focus it and backspace
    slots[1]!.focus();
    await user.keyboard("{Backspace}");
    // Should have cleared slot 1
    expect(onChange).toHaveBeenLastCalledWith("1");
  });

  it("paste distributes characters across slots", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputOTP length={6} onChange={onChange} />);
    const firstSlot = screen.getAllByRole("textbox")[0]!;
    firstSlot.focus();
    await user.paste("123456");
    expect(onChange).toHaveBeenCalledWith("123456");
  });

  it("paste truncates to length", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputOTP length={4} onChange={onChange} />);
    const firstSlot = screen.getAllByRole("textbox")[0]!;
    firstSlot.focus();
    await user.paste("123456");
    expect(onChange).toHaveBeenCalledWith("1234");
  });

  it("is disabled when disabled prop is set", () => {
    render(<InputOTP disabled />);
    screen.getAllByRole("textbox").forEach((slot) => {
      expect(slot).toBeDisabled();
    });
  });

  it("calls onChange with combined value on input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputOTP length={4} onChange={onChange} />);
    const slots = screen.getAllByRole("textbox");
    slots[0]!.focus();
    await user.keyboard("5");
    expect(onChange).toHaveBeenCalledWith("5");
  });

  it("forwards ref to root div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<InputOTP ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("ArrowLeft moves focus to previous slot", async () => {
    const user = userEvent.setup();
    render(<InputOTP length={4} />);
    const inputs = screen.getAllByRole("textbox");
    await user.click(inputs[2]!);
    await user.keyboard("{ArrowLeft}");
    expect(inputs[1]).toHaveFocus();
  });

  it("ArrowRight moves focus to next slot", async () => {
    const user = userEvent.setup();
    render(<InputOTP length={4} />);
    const inputs = screen.getAllByRole("textbox");
    await user.click(inputs[1]!);
    await user.keyboard("{ArrowRight}");
    expect(inputs[2]).toHaveFocus();
  });

  it("first input has autoComplete=one-time-code", () => {
    render(<InputOTP length={6} />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toHaveAttribute("autocomplete", "one-time-code");
  });
});
