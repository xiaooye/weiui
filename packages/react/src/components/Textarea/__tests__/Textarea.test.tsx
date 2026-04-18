import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "../Textarea";

describe("Textarea", () => {
  it("renders correctly", () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLTextAreaElement>();
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

  it("renders sm size class", () => {
    const { container } = render(<Textarea size="sm" />);
    expect(container.querySelector(".wui-input--sm")).not.toBeNull();
  });

  describe("P1 features", () => {
    it("autosize sets height on input", () => {
      const { container } = render(<Textarea autosize defaultValue="" aria-label="notes" />);
      const ta = container.querySelector("textarea")!;
      Object.defineProperty(ta, "scrollHeight", { configurable: true, value: 120 });
      fireEvent.input(ta, { target: { value: "line1\nline2\nline3" } });
      expect(ta.style.height).not.toBe("");
    });

    it("showCount renders counter", () => {
      render(<Textarea showCount maxLength={140} defaultValue="hello" aria-label="t" />);
      expect(screen.getByText("5 / 140")).toBeInTheDocument();
    });

    it("showCount updates when typing", async () => {
      const user = userEvent.setup();
      render(<Textarea showCount maxLength={140} defaultValue="" aria-label="t" />);
      const ta = screen.getByRole("textbox");
      await user.type(ta, "abc");
      expect(screen.getByText("3 / 140")).toBeInTheDocument();
    });
  });
});
