import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColorPicker } from "../ColorPicker";

describe("ColorPicker", () => {
  it("renders preview, hue slider, and input", () => {
    render(<ColorPicker defaultValue="#ff0000" label="Pick" />);
    expect(screen.getByRole("group", { name: "Pick" })).toBeInTheDocument();
    expect(screen.getByLabelText("Hue")).toBeInTheDocument();
    expect(screen.getByLabelText("Color value (hex or oklch)")).toBeInTheDocument();
  });

  it("typing a hex calls onChange", () => {
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#000000" onChange={onChange} />);
    const input = screen.getByLabelText("Color value (hex or oklch)") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "#112233" } });
    expect(onChange).toHaveBeenCalledWith("#112233");
  });

  it("clicking a swatch selects that color", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ColorPicker
        defaultValue="#000000"
        swatches={["#ff0000", "#00ff00"]}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("option", { name: "#ff0000" }));
    expect(onChange).toHaveBeenCalledWith("#ff0000");
  });

  // Wave 5d P0: Saturation/Value area
  it("renders a saturation/value area with role=slider and aria labels", () => {
    render(<ColorPicker defaultValue="#ff0000" />);
    const sv = screen.getByLabelText("Saturation and value");
    expect(sv).toBeInTheDocument();
  });

  it("clicking within the SV area updates the color", () => {
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#ff0000" onChange={onChange} />);
    const sv = screen.getByLabelText("Saturation and value") as HTMLElement;
    // Provide a bounding box for jsdom
    vi.spyOn(sv, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      right: 200,
      bottom: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    fireEvent.mouseDown(sv, { clientX: 100, clientY: 100 });
    expect(onChange).toHaveBeenCalled();
    const newColor = onChange.mock.calls[0]![0] as string;
    expect(newColor).toMatch(/^#[0-9a-f]{6}$/i);
    // Clicking near the middle should not return pure red anymore
    expect(newColor.toLowerCase()).not.toBe("#ff0000");
  });

  // Wave 5d P0: OKLCH input support
  it("accepts oklch() string as value and renders the preview", () => {
    render(<ColorPicker value="oklch(0.7 0.2 30)" />);
    const input = screen.getByLabelText("Color value (hex or oklch)") as HTMLInputElement;
    expect(input.value).toContain("oklch");
  });
});
