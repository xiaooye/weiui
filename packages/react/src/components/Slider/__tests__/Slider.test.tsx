import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Slider } from "../Slider";

describe("Slider", () => {
  it("renders with role=slider", () => {
    render(<Slider />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("sets aria-valuenow to defaultValue", () => {
    render(<Slider defaultValue={40} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "40");
  });

  it("sets aria-valuemin and aria-valuemax", () => {
    render(<Slider min={10} max={90} />);
    const thumb = screen.getByRole("slider");
    expect(thumb).toHaveAttribute("aria-valuemin", "10");
    expect(thumb).toHaveAttribute("aria-valuemax", "90");
  });

  it("increments value on ArrowRight keydown", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={50} step={5} onChange={onChange} />);
    const thumb = screen.getByRole("slider");
    await user.click(thumb);
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(55);
  });

  it("decrements value on ArrowLeft keydown", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={50} step={5} onChange={onChange} />);
    const thumb = screen.getByRole("slider");
    await user.click(thumb);
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith(45);
  });

  it("jumps to min on Home key", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={50} min={0} onChange={onChange} />);
    const thumb = screen.getByRole("slider");
    await user.click(thumb);
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("jumps to max on End key", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={50} max={100} onChange={onChange} />);
    const thumb = screen.getByRole("slider");
    await user.click(thumb);
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it("shows disabled state", () => {
    render(<Slider disabled />);
    const root = screen.getByRole("slider").closest(".wui-slider");
    expect(root).toHaveAttribute("data-disabled", "true");
  });

  it("thumb has tabIndex=-1 when disabled", () => {
    render(<Slider disabled />);
    expect(screen.getByRole("slider")).toHaveAttribute("tabindex", "-1");
  });

  it("uses controlled value", () => {
    render(<Slider value={75} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "75");
  });

  it("forwards ref to root div", () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<Slider ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
