// packages/a11y/src/__tests__/contrast.test.ts
import { describe, it, expect } from "vitest";
import { getContrastRatio, validateContrastAAA } from "../contrast";

describe("getContrastRatio", () => {
  it("returns 21:1 for black on white", () => {
    const ratio = getContrastRatio("oklch(0 0 0)", "oklch(1 0 0)");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("returns 1:1 for same color", () => {
    const ratio = getContrastRatio("oklch(0.5 0.1 250)", "oklch(0.5 0.1 250)");
    expect(ratio).toBeCloseTo(1, 0);
  });
});

describe("validateContrastAAA", () => {
  it("passes for black text on white background (21:1)", () => {
    const result = validateContrastAAA("oklch(0 0 0)", "oklch(1 0 0)");
    expect(result.passes).toBe(true);
    expect(result.required).toBe(7);
  });

  it("fails for low-contrast pair", () => {
    // neutral.400 on white — roughly 4:1
    const result = validateContrastAAA("oklch(0.707 0.015 240)", "oklch(1 0 0)");
    expect(result.passes).toBe(false);
  });

  it("uses 4.5:1 threshold for large text", () => {
    const result = validateContrastAAA("oklch(0.707 0.015 240)", "oklch(1 0 0)", true);
    expect(result.required).toBe(4.5);
  });

  it("passes for neutral.600 on white (AAA for normal text)", () => {
    // This is our muted-foreground — must pass 7:1
    const result = validateContrastAAA("oklch(0.446 0.018 240)", "oklch(1 0 0)");
    expect(result.passes).toBe(true);
    expect(result.ratio).toBeGreaterThanOrEqual(7);
  });
});
