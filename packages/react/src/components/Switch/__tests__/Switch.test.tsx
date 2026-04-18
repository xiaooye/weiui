import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "../Switch";

describe("Switch", () => {
  it("has role='switch'", () => {
    render(<Switch aria-label="dark mode" />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Switch label="Dark mode" />);
    expect(screen.getByText("Dark mode")).toBeInTheDocument();
  });

  it("associates label with input via htmlFor", () => {
    render(<Switch label="Dark mode" />);
    const input = screen.getByRole("switch");
    const label = screen.getByText("Dark mode");
    expect(label).toHaveAttribute("for", input.id);
  });

  it("uses provided id", () => {
    render(<Switch id="dark-mode" label="Dark mode" />);
    expect(screen.getByRole("switch")).toHaveAttribute("id", "dark-mode");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch ref={ref} aria-label="test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("calls onChange when toggled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch aria-label="toggle" onChange={onChange} />);
    await user.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("renders checked when defaultChecked is set", () => {
    render(<Switch defaultChecked aria-label="on" />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Switch disabled aria-label="disabled" />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("applies styled track + thumb class (wui-switch__input)", () => {
    render(<Switch aria-label="styled" />);
    expect(screen.getByRole("switch")).toHaveClass("wui-switch__input");
  });

  it("wrapper carries wui-switch class", () => {
    const { container } = render(<Switch label="Dark" />);
    expect(container.querySelector(".wui-switch")).toBeTruthy();
  });

  it("renders on/off label slots", () => {
    render(<Switch onLabel="On" offLabel="Off" aria-label="toggle" />);
    expect(screen.getByText("On")).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument();
  });

  it("on/off labels are marked aria-hidden (decorative)", () => {
    render(<Switch onLabel="On" offLabel="Off" aria-label="toggle" />);
    expect(screen.getByText("On")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Off")).toHaveAttribute("aria-hidden", "true");
  });
});
