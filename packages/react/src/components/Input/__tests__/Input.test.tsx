import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  describe("P1 features", () => {
    it("clearable renders clear button when value is non-empty", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Input clearable defaultValue="hello" onChange={onChange} aria-label="name" />);
      const clear = screen.getByLabelText("Clear input");
      await user.click(clear);
      expect(onChange).toHaveBeenCalled();
    });

    it("clearable does not render clear button when value is empty", () => {
      render(<Input clearable defaultValue="" aria-label="name" />);
      expect(screen.queryByLabelText("Clear input")).not.toBeInTheDocument();
    });

    it("prefix and suffix text slots render", () => {
      render(<Input prefix="$" suffix=".00" aria-label="amount" />);
      expect(screen.getByText("$")).toBeInTheDocument();
      expect(screen.getByText(".00")).toBeInTheDocument();
    });

    it("showCount shows character counter against maxLength", () => {
      render(<Input showCount maxLength={10} defaultValue="hi" aria-label="bio" />);
      expect(screen.getByText("2 / 10")).toBeInTheDocument();
    });

    it("showCount updates when value changes", async () => {
      const user = userEvent.setup();
      render(<Input showCount maxLength={10} defaultValue="" aria-label="bio" />);
      const input = screen.getByRole("textbox");
      await user.type(input, "hi");
      expect(screen.getByText("2 / 10")).toBeInTheDocument();
    });
  });
});
