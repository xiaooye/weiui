import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useId } from "../use-id";

describe("useId", () => {
  it("returns a string starting with wui-", () => {
    const { result } = renderHook(() => useId());
    expect(result.current).toMatch(/^wui-/);
  });

  it("uses custom prefix", () => {
    const { result } = renderHook(() => useId("dialog"));
    expect(result.current).toMatch(/^dialog-/);
  });

  it("returns stable ID across renders", () => {
    const { result, rerender } = renderHook(() => useId());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
