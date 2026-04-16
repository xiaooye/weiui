import { describe, it, expect } from "vitest";
import { generateDarkTokens } from "../dark-mode";
import type { FlatToken } from "../types";

describe("generateDarkTokens", () => {
  it("produces dark overrides for semantic color tokens", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "background"], token: { $value: "oklch(1 0 0)" } },
      { path: ["color", "foreground"], token: { $value: "oklch(0.145 0.010 240)" } },
    ];
    const dark = generateDarkTokens(tokens);
    const bg = dark.find((t) => t.path.join(".") === "color.background");
    expect(bg).toBeDefined();
    expect(bg!.token.$value).not.toBe("oklch(1 0 0)"); // dark should differ from light
  });

  it("only includes tokens that have dark overrides", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "background"], token: { $value: "oklch(1 0 0)" } },
      { path: ["spacing", "4"], token: { $value: "16px" } },
    ];
    const dark = generateDarkTokens(tokens);
    expect(dark.find((t) => t.path.join(".") === "spacing.4")).toBeUndefined();
  });
});
