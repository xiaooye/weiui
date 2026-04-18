import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "../Checkbox";

describe("Checkbox", () => {
  it("renders a checkbox input", () => {
    render(<Checkbox aria-label="accept" />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText("Accept terms")).toBeInTheDocument();
  });

  it("associates label with input via htmlFor", () => {
    render(<Checkbox label="Accept terms" />);
    const checkbox = screen.getByRole("checkbox");
    const label = screen.getByText("Accept terms");
    expect(label).toHaveAttribute("for", checkbox.id);
  });

  it("uses provided id", () => {
    render(<Checkbox id="my-checkbox" label="My check" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("id", "my-checkbox");
    expect(screen.getByText("My check")).toHaveAttribute("for", "my-checkbox");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} aria-label="test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("can be checked and unchecked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox aria-label="toggle" onChange={onChange} />);
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("renders in checked state when defaultChecked is set", () => {
    render(<Checkbox defaultChecked aria-label="checked" />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Checkbox disabled aria-label="disabled" />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("uses styled visual wrapper (wui-checkbox class)", () => {
    render(<Checkbox aria-label="visual" data-testid="cb" />);
    // Root wrapper should carry the design-system class, replacing browser-default look.
    const input = screen.getByRole("checkbox");
    expect(input).toHaveClass("wui-checkbox__input");
  });

  it("applies indeterminate state to DOM via ref.indeterminate", () => {
    render(<Checkbox indeterminate aria-label="indet" />);
    const cb = screen.getByRole("checkbox") as HTMLInputElement;
    expect(cb.indeterminate).toBe(true);
    expect(cb).toHaveAttribute("aria-checked", "mixed");
  });

  it("indeterminate false restores normal checked semantics", () => {
    render(<Checkbox indeterminate={false} defaultChecked aria-label="normal" />);
    const cb = screen.getByRole("checkbox") as HTMLInputElement;
    expect(cb.indeterminate).toBe(false);
  });

  it("renders a description below the label when provided", () => {
    render(<Checkbox label="Subscribe" description="We'll email you weekly digests." />);
    const desc = screen.getByText("We'll email you weekly digests.");
    expect(desc).toBeInTheDocument();
    const cb = screen.getByRole("checkbox");
    expect(cb).toHaveAttribute("aria-describedby", desc.id);
  });

  it("renders an error message and marks the input invalid when `error` is a string", () => {
    render(<Checkbox label="Accept" error="You must accept" />);
    const err = screen.getByText("You must accept");
    expect(err).toBeInTheDocument();
    const cb = screen.getByRole("checkbox");
    expect(cb).toHaveAttribute("aria-invalid", "true");
    expect(cb).toHaveAttribute("aria-describedby", expect.stringContaining(err.id));
  });

  it("error={true} still marks invalid without rendering an error message", () => {
    render(<Checkbox label="Accept" error />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("applies color modifier class when `color` is set", () => {
    const { container, rerender } = render(<Checkbox aria-label="c" color="success" />);
    expect(container.querySelector(".wui-checkbox")).toHaveClass("wui-checkbox--color-success");
    rerender(<Checkbox aria-label="c" color="warning" />);
    expect(container.querySelector(".wui-checkbox")).toHaveClass("wui-checkbox--color-warning");
    rerender(<Checkbox aria-label="c" color="destructive" />);
    expect(container.querySelector(".wui-checkbox")).toHaveClass("wui-checkbox--color-destructive");
  });

  it("defaults to primary color with no extra modifier class", () => {
    const { container } = render(<Checkbox aria-label="c" />);
    const root = container.querySelector(".wui-checkbox")!;
    expect(root.className).not.toMatch(/wui-checkbox--color-/);
  });
});
