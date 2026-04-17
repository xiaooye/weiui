import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Input } from "../Input";

describe("Input", () => {
  it("renders correctly", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLInputElement>();
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

  it("renders sm size class", () => {
    const { container } = render(<Input size="sm" />);
    expect(container.querySelector(".wui-input--sm")).not.toBeNull();
  });

  it("renders lg size class", () => {
    const { container } = render(<Input size="lg" />);
    expect(container.querySelector(".wui-input--lg")).not.toBeNull();
  });

  it("renders startAddon and endAddon", () => {
    render(
      <Input
        startAddon={<span data-testid="start">$</span>}
        endAddon={<span data-testid="end">.00</span>}
      />,
    );
    expect(screen.getByTestId("start")).toBeInTheDocument();
    expect(screen.getByTestId("end")).toBeInTheDocument();
  });
});
