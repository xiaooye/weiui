import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useControllable } from "../use-controllable";

describe("useControllable", () => {
  it("uses defaultValue in uncontrolled mode", () => {
    const { result } = renderHook(() => useControllable({ defaultValue: "a" }));
    expect(result.current[0]).toBe("a");
  });

  it("updates internal value in uncontrolled mode", () => {
    const { result } = renderHook(() => useControllable({ defaultValue: "a" }));
    act(() => result.current[1]("b"));
    expect(result.current[0]).toBe("b");
  });

  it("uses value in controlled mode", () => {
    const { result } = renderHook(() =>
      useControllable({ value: "controlled", defaultValue: "a", onChange: vi.fn() }),
    );
    expect(result.current[0]).toBe("controlled");
  });

  it("calls onChange in both modes", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllable({ defaultValue: "a", onChange }),
    );
    act(() => result.current[1]("b"));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("does not update internal state in controlled mode", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllable({ value: "controlled", defaultValue: "a", onChange }),
    );
    act(() => result.current[1]("new"));
    expect(result.current[0]).toBe("controlled"); // still controlled value
    expect(onChange).toHaveBeenCalledWith("new");
  });
});
