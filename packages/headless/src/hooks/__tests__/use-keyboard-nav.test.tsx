import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardNav } from "../use-keyboard-nav";

describe("useKeyboardNav", () => {
  it("starts at index 0", () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 3 }));
    expect(result.current.activeIndex).toBe(0);
  });

  it("sets tabIndex 0 for active item and -1 for others", () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 3 }));
    expect(result.current.getItemProps(0).tabIndex).toBe(0);
    expect(result.current.getItemProps(1).tabIndex).toBe(-1);
  });

  it("loops from last to first by default", () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 3 }));
    act(() => result.current.setActiveIndex(2));
    // Simulate ArrowDown on last item
    act(() => {
      result.current.getItemProps(2).onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.activeIndex).toBe(0);
  });

  it("does not loop when loop is false", () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 3, loop: false }));
    act(() => result.current.setActiveIndex(2));
    act(() => {
      result.current.getItemProps(2).onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.activeIndex).toBe(2);
  });

  it("uses horizontal arrows when orientation is horizontal", () => {
    const { result } = renderHook(() =>
      useKeyboardNav({ itemCount: 3, orientation: "horizontal" }),
    );
    act(() => {
      result.current.getItemProps(0).onKeyDown({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.activeIndex).toBe(1);
  });

  it("Home goes to first, End goes to last", () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 5 }));
    act(() => result.current.setActiveIndex(3));
    act(() => {
      result.current.getItemProps(3).onKeyDown({
        key: "Home",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.activeIndex).toBe(0);

    act(() => {
      result.current.getItemProps(0).onKeyDown({
        key: "End",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.activeIndex).toBe(4);
  });
});
