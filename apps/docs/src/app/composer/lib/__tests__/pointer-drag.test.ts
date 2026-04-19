import { describe, it, expect } from "vitest";
import { computeDragState, DRAG_THRESHOLD } from "../pointer-drag";

describe("pointer-drag state machine", () => {
  it("idle + pointerdown → pressed", () => {
    const next = computeDragState(
      { phase: "idle", startX: 0, startY: 0 },
      { type: "down", x: 10, y: 20 },
    );
    expect(next.phase).toBe("pressed");
    expect(next.startX).toBe(10);
    expect(next.startY).toBe(20);
  });

  it("pressed + small move → still pressed", () => {
    const next = computeDragState(
      { phase: "pressed", startX: 10, startY: 20 },
      { type: "move", x: 11, y: 21 },
    );
    expect(next.phase).toBe("pressed");
  });

  it("pressed + move beyond threshold → dragging", () => {
    const next = computeDragState(
      { phase: "pressed", startX: 10, startY: 20 },
      { type: "move", x: 10 + DRAG_THRESHOLD + 1, y: 20 },
    );
    expect(next.phase).toBe("dragging");
  });

  it("pressed + pointerup → click (idle)", () => {
    const next = computeDragState(
      { phase: "pressed", startX: 10, startY: 20 },
      { type: "up", x: 11, y: 21 },
    );
    expect(next.phase).toBe("idle");
    expect(next.wasClick).toBe(true);
  });

  it("dragging + pointerup → committed (idle, wasClick false)", () => {
    const next = computeDragState(
      { phase: "dragging", startX: 10, startY: 20 },
      { type: "up", x: 100, y: 100 },
    );
    expect(next.phase).toBe("idle");
    expect(next.wasClick).toBe(false);
  });
});
