import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFloatingMenu } from "../use-floating-menu";

describe("useFloatingMenu", () => {
  it("returns refs and style objects", () => {
    const { result } = renderHook(() => useFloatingMenu({ open: false }));
    expect(result.current.refs.setReference).toBeTypeOf("function");
    expect(result.current.refs.setFloating).toBeTypeOf("function");
    expect(result.current.floatingStyles).toBeDefined();
  });
});
