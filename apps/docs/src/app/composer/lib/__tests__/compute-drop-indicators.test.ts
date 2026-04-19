import { describe, it, expect } from "vitest";
import {
  computeDropIndicator,
  BETWEEN_GAP_PX,
} from "../compute-drop-indicators";
import { makeNode } from "../tree";

const rect = (t: number, l: number, w: number, h: number) => ({
  top: t, left: l, width: w, height: h,
});

describe("computeDropIndicator", () => {
  it("returns null when no node at pointer", () => {
    const result = computeDropIndicator({
      tree: [],
      rects: new Map(),
      pointer: { x: 0, y: 0 },
      containers: new Set(["Card", "Stack"]),
    });
    expect(result).toBeNull();
  });

  it("center of a container returns edge=center", () => {
    const card = makeNode("Card");
    const result = computeDropIndicator({
      tree: [card],
      rects: new Map([[card.id, rect(0, 0, 100, 100)]]),
      pointer: { x: 50, y: 50 },
      containers: new Set(["Card"]),
    });
    expect(result).toEqual({ targetId: card.id, edge: "center" });
  });

  it("top 30% of a leaf returns edge=top", () => {
    const btn = makeNode("Button");
    const result = computeDropIndicator({
      tree: [btn],
      rects: new Map([[btn.id, rect(0, 0, 100, 100)]]),
      pointer: { x: 50, y: 10 },
      containers: new Set(),
    });
    expect(result).toEqual({ targetId: btn.id, edge: "top" });
  });

  it("pointer within BETWEEN_GAP_PX of sibling boundary returns betweenIndex", () => {
    const a = makeNode("Button");
    const b = makeNode("Button");
    const stack = makeNode("Stack", { direction: "column" });
    stack.children = [a, b];
    const rects = new Map([
      [stack.id, rect(0, 0, 100, 100)],
      [a.id, rect(0, 0, 100, 50)],
      [b.id, rect(50, 0, 100, 50)],
    ]);
    const result = computeDropIndicator({
      tree: [stack],
      rects,
      pointer: { x: 50, y: 50 + BETWEEN_GAP_PX - 1 },
      containers: new Set(["Stack"]),
    });
    expect(result).toMatchObject({
      targetId: stack.id,
      betweenIndex: 1,
    });
    expect(result?.edge).toBeUndefined();
  });
});
