import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Slider } from "../Slider";

describe("Slider", () => {
  it("renders with role=slider", () => {
    render(<Slider />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("sets aria-valuenow from defaultValue", () => {
    render(<Slider defaultValue={50} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "50");
  });

  it("sets aria-valuemin and aria-valuemax", () => {
    render(<Slider min={10} max={90} />);
    const thumb = screen.getByRole("slider");
    expect(thumb).toHaveAttribute("aria-valuemin", "10");
    expect(thumb).toHaveAttribute("aria-valuemax", "90");
  });

  it("increments value on ArrowRight", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={50} onChange={onChange} />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(51);
  });

  it("decrements value on ArrowLeft", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={50} onChange={onChange} />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith(49);
  });

  it("jumps to min on Home key", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={50} min={0} onChange={onChange} />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("jumps to max on End key", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={50} max={100} onChange={onChange} />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it("has data-disabled on root when disabled", () => {
    render(<Slider disabled />);
    const root = screen.getByRole("slider").closest(".wui-slider");
    expect(root).toHaveAttribute("data-disabled", "true");
  });

  it("fires onChange callback on keyboard interaction", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={0} onChange={onChange} />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("defaultValue sets initial position", () => {
    render(<Slider defaultValue={75} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "75");
  });

  it("respects step when using keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={50} step={10} onChange={onChange} />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(60);
  });

  it("does not exceed max on ArrowRight", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={100} max={100} onChange={onChange} />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it("does not go below min on ArrowLeft", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider defaultValue={0} min={0} onChange={onChange} />);
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith(0);
  });
});
