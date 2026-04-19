import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  InteractionProvider,
  useInteractionManager,
} from "../interaction-manager";
import { makeNode } from "../tree";

describe("useInteractionManager", () => {
  it("starts idle with empty selection", () => {
    const { result } = renderHook(() => useInteractionManager(), {
      wrapper: InteractionProvider,
    });
    expect(result.current.state.selection.primary).toBeNull();
    expect(result.current.state.selection.all.size).toBe(0);
    expect(result.current.state.drag).toBeNull();
    expect(result.current.state.previewMode).toBe(false);
  });

  it("select replace sets primary + all", () => {
    const { result } = renderHook(() => useInteractionManager(), {
      wrapper: InteractionProvider,
    });
    act(() => result.current.select("n1", "replace"));
    expect(result.current.state.selection.primary).toBe("n1");
    expect([...result.current.state.selection.all]).toEqual(["n1"]);
  });

  it("select add extends selection", () => {
    const { result } = renderHook(() => useInteractionManager(), {
      wrapper: InteractionProvider,
    });
    act(() => result.current.select("n1", "replace"));
    act(() => result.current.select("n2", "add"));
    expect(result.current.state.selection.primary).toBe("n2");
    expect(result.current.state.selection.all.size).toBe(2);
  });

  it("select toggle removes an id if present", () => {
    const { result } = renderHook(() => useInteractionManager(), {
      wrapper: InteractionProvider,
    });
    act(() => result.current.select("n1", "replace"));
    act(() => result.current.select("n2", "add"));
    act(() => result.current.select("n1", "toggle"));
    expect([...result.current.state.selection.all]).toEqual(["n2"]);
  });

  it("startDrag / endDrag", () => {
    const { result } = renderHook(() => useInteractionManager(), {
      wrapper: InteractionProvider,
    });
    const node = makeNode("Button");
    act(() => result.current.startDrag({ kind: "palette", payload: node, pointer: { x: 0, y: 0 } }));
    expect(result.current.state.drag?.kind).toBe("palette");
    act(() => result.current.endDrag());
    expect(result.current.state.drag).toBeNull();
  });

  it("setPreviewMode toggles", () => {
    const { result } = renderHook(() => useInteractionManager(), {
      wrapper: InteractionProvider,
    });
    act(() => result.current.setPreviewMode(true));
    expect(result.current.state.previewMode).toBe(true);
  });
});
