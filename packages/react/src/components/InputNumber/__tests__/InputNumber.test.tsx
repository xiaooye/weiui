import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputNumber } from "../InputNumber";

describe("InputNumber", () => {
  it("renders increment and decrement buttons", () => {
    render(<InputNumber />);
    expect(screen.getByLabelText("Increment")).toBeInTheDocument();
    expect(screen.getByLabelText("Decrement")).toBeInTheDocument();
  });

  it("renders with defaultValue", () => {
    render(<InputNumber defaultValue={10} />);
    expect(screen.getByRole("spinbutton")).toHaveValue(10);
  });

  it("increments value on button click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputNumber defaultValue={5} step={1} onChange={onChange} />);
    await user.click(screen.getByLabelText("Increment"));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it("decrements value on button click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputNumber defaultValue={5} step={1} onChange={onChange} />);
    await user.click(screen.getByLabelText("Decrement"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("increments on ArrowUp key", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputNumber defaultValue={5} step={2} onChange={onChange} />);
    await user.click(screen.getByRole("spinbutton"));
    await user.keyboard("{ArrowUp}");
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it("decrements on ArrowDown key", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputNumber defaultValue={5} step={2} onChange={onChange} />);
    await user.click(screen.getByRole("spinbutton"));
    await user.keyboard("{ArrowDown}");
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("clamps to max on increment", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputNumber defaultValue={9} max={10} step={5} onChange={onChange} />);
    await user.click(screen.getByLabelText("Increment"));
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("clamps to min on decrement", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputNumber defaultValue={1} min={0} step={5} onChange={onChange} />);
    await user.click(screen.getByLabelText("Decrement"));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("disables increment button when at max", () => {
    render(<InputNumber value={10} max={10} />);
    expect(screen.getByLabelText("Increment")).toBeDisabled();
  });

  it("disables decrement button when at min", () => {
    render(<InputNumber value={0} min={0} />);
    expect(screen.getByLabelText("Decrement")).toBeDisabled();
  });

  it("is disabled when disabled prop is set", () => {
    render(<InputNumber disabled />);
    expect(screen.getByRole("spinbutton")).toBeDisabled();
  });

  it("forwards ref to root div", () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<InputNumber ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
