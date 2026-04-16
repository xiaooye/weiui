import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "../Input";

describe("Input", () => {
  it("renders correctly", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLInputElement>;
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("applies aria-invalid when invalid", () => {
    render(<Input invalid aria-label="test input" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("applies data-invalid when invalid", () => {
    render(<Input invalid aria-label="test input" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-invalid", "true");
  });

  it("does not set aria-invalid when not invalid", () => {
    render(<Input aria-label="test input" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("merges custom className", () => {
    render(<Input className="custom-class" aria-label="test input" />);
    expect(screen.getByRole("textbox").className).toContain("custom-class");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Input disabled aria-label="test input" />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("applies disabled class when disabled", () => {
    render(<Input disabled aria-label="test input" />);
    expect(screen.getByRole("textbox").className).toContain("wui-input--disabled");
  });
});
