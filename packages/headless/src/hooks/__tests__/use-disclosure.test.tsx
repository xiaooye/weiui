import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDisclosure } from "../use-disclosure";

describe("useDisclosure", () => {
  it("starts closed by default", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
  });

  it("starts open when defaultOpen is true", () => {
    const { result } = renderHook(() => useDisclosure({ defaultOpen: true }));
    expect(result.current.isOpen).toBe(true);
  });

  it("opens and closes", () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.onOpen());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.onClose());
    expect(result.current.isOpen).toBe(false);
  });

  it("toggles", () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.onToggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.onToggle());
    expect(result.current.isOpen).toBe(false);
  });

  it("returns aria-expanded in getDisclosureProps", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.getDisclosureProps()["aria-expanded"]).toBe(false);
    act(() => result.current.onOpen());
    expect(result.current.getDisclosureProps()["aria-expanded"]).toBe(true);
  });

  it("returns hidden in getContentProps", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.getContentProps().hidden).toBe(true);
    act(() => result.current.onOpen());
    expect(result.current.getContentProps().hidden).toBe(false);
  });

  it("works in controlled mode", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useDisclosure({ open: false, onOpenChange }),
    );
    act(() => result.current.onOpen());
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
