import { describe, it, expect } from "vitest";
import { findContrastPairs, validateTokenContrast } from "../validate";
import type { FlatToken } from "../types";

describe("findContrastPairs", () => {
  it("pairs foreground tokens with their background", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "primary"], token: { $value: "oklch(0.546 0.245 263)" } },
      { path: ["color", "primary-foreground"], token: { $value: "oklch(1 0 0)" } },
    ];
    const pairs = findContrastPairs(tokens);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].fg.path).toEqual(["color", "primary-foreground"]);
    expect(pairs[0].bg.path).toEqual(["color", "primary"]);
  });
});

describe("validateTokenContrast", () => {
  it("passes for high-contrast pairs", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "primary"], token: { $value: "oklch(0.3 0.245 263)" } },
      { path: ["color", "primary-foreground"], token: { $value: "oklch(1 0 0)" } },
    ];
    const results = validateTokenContrast(tokens);
    expect(results.every((r) => r.passes)).toBe(true);
  });

  it("fails for low-contrast pairs", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "bad"], token: { $value: "oklch(0.7 0.01 240)" } },
      { path: ["color", "bad-foreground"], token: { $value: "oklch(0.8 0.01 240)" } },
    ];
    const results = validateTokenContrast(tokens);
    expect(results.some((r) => !r.passes)).toBe(true);
  });
});
