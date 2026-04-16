import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Textarea } from "../Textarea";

describe("Textarea", () => {
  it("renders correctly", () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLTextAreaElement>;
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("applies aria-invalid when invalid", () => {
    render(<Textarea invalid aria-label="test textarea" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("applies data-invalid when invalid", () => {
    render(<Textarea invalid aria-label="test textarea" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-invalid", "true");
  });

  it("does not set aria-invalid when not invalid", () => {
    render(<Textarea aria-label="test textarea" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("merges custom className", () => {
    render(<Textarea className="custom-class" aria-label="test textarea" />);
    expect(screen.getByRole("textbox").className).toContain("custom-class");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Textarea disabled aria-label="test textarea" />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
