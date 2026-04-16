import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToggle } from "../use-toggle";

describe("useToggle", () => {
  it("starts unpressed by default", () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current.isPressed).toBe(false);
  });

  it("toggles pressed state", () => {
    const { result } = renderHook(() => useToggle());
    act(() => result.current.onToggle());
    expect(result.current.isPressed).toBe(true);
  });

  it("returns aria-pressed and role in getToggleProps", () => {
    const { result } = renderHook(() => useToggle());
    const props = result.current.getToggleProps();
    expect(props["aria-pressed"]).toBe(false);
    expect(props.role).toBe("switch");
  });

  it("calls onPressedChange", () => {
    const onPressedChange = vi.fn();
    const { result } = renderHook(() => useToggle({ onPressedChange }));
    act(() => result.current.onToggle());
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });
});
