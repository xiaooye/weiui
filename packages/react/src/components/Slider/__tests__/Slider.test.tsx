import { describe, it, expect, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
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

  describe("range mode", () => {
    it("renders two thumbs when mode=range", () => {
      render(<Slider mode="range" defaultValue={[20, 80]} />);
      expect(screen.getAllByRole("slider")).toHaveLength(2);
    });

    it("uses [min, max] as the default range when no defaultValue given", () => {
      render(<Slider mode="range" min={10} max={90} />);
      const thumbs = screen.getAllByRole("slider");
      expect(thumbs[0]).toHaveAttribute("aria-valuenow", "10");
      expect(thumbs[1]).toHaveAttribute("aria-valuenow", "90");
    });

    it("keyboard moves only the focused thumb and reports pair", async () => {
      const user = userEvent.setup();
      const onRangeChange = vi.fn();
      render(
        <Slider
          mode="range"
          defaultValue={[20, 80]}
          onRangeChange={onRangeChange}
        />,
      );
      const [low, high] = screen.getAllByRole("slider");
      low.focus();
      await user.keyboard("{ArrowRight}");
      expect(onRangeChange).toHaveBeenLastCalledWith([21, 80]);
      high.focus();
      await user.keyboard("{ArrowLeft}");
      expect(onRangeChange).toHaveBeenLastCalledWith([21, 79]);
    });

    it("thumbs use min/max labels when label is provided", () => {
      render(
        <Slider mode="range" defaultValue={[10, 90]} label="Price" />,
      );
      const thumbs = screen.getAllByRole("slider");
      expect(thumbs[0]).toHaveAttribute("aria-label", "Price minimum");
      expect(thumbs[1]).toHaveAttribute("aria-label", "Price maximum");
    });
  });

  describe("tooltip", () => {
    it("does not render tooltip by default", () => {
      render(<Slider defaultValue={42} />);
      expect(document.querySelector(".wui-slider__tooltip")).toBeNull();
    });

    it("renders tooltip on focus when showTooltip is true", async () => {
      render(<Slider defaultValue={42} showTooltip />);
      const thumb = screen.getByRole("slider");
      await act(async () => {
        thumb.focus();
      });
      const tip = document.querySelector(".wui-slider__tooltip");
      expect(tip).not.toBeNull();
      expect(tip?.textContent).toBe("42");
    });

    it("uses formatTooltip to format the displayed value", async () => {
      render(
        <Slider
          defaultValue={42}
          showTooltip
          formatTooltip={(v) => `${v}%`}
        />,
      );
      const thumb = screen.getByRole("slider");
      await act(async () => {
        thumb.focus();
      });
      const tip = document.querySelector(".wui-slider__tooltip");
      expect(tip?.textContent).toBe("42%");
    });
  });

  describe("P1 features", () => {
    it("orientation=vertical applies modifier class and aria", () => {
      const { container } = render(<Slider orientation="vertical" defaultValue={50} />);
      expect(container.querySelector(".wui-slider--vertical")).not.toBeNull();
      expect(screen.getByRole("slider")).toHaveAttribute("aria-orientation", "vertical");
    });

    it("marks render tick marks with labels", () => {
      const { container } = render(
        <Slider defaultValue={50} marks={[{ value: 0, label: "Low" }, { value: 100, label: "High" }]} />,
      );
      expect(container.querySelectorAll(".wui-slider__mark").length).toBe(2);
      expect(screen.getByText("Low")).toBeInTheDocument();
      expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("PageUp increases by step*10", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider defaultValue={20} step={2} onChange={onChange} />);
      const thumb = screen.getByRole("slider");
      thumb.focus();
      await user.keyboard("{PageUp}");
      expect(onChange).toHaveBeenCalledWith(40);
    });

    it("PageDown decreases by step*10", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider defaultValue={50} step={2} onChange={onChange} />);
      const thumb = screen.getByRole("slider");
      thumb.focus();
      await user.keyboard("{PageDown}");
      expect(onChange).toHaveBeenCalledWith(30);
    });

    it("aria-valuetext uses formatTooltip when provided", () => {
      render(<Slider defaultValue={42} formatTooltip={(v) => `${v}%`} />);
      expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "42%");
    });

    it("name prop renders hidden input for form submit", () => {
      const { container } = render(<Slider defaultValue={10} name="volume" />);
      const hidden = container.querySelector('input[type="hidden"][name="volume"]');
      expect(hidden).not.toBeNull();
      expect(hidden).toHaveAttribute("value", "10");
    });
  });
});
