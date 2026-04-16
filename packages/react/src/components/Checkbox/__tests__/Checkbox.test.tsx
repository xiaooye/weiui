import { describe, it, expect, vi } from "vitest";
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
    const ref = { current: null } as React.RefObject<HTMLInputElement>;
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
});
