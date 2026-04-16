import { describe, it, expect } from "vitest";
import { resolveReferences } from "../resolve";
import type { FlatToken } from "../types";

describe("resolveReferences", () => {
  it("resolves a simple reference", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "blue", "600"], token: { $value: "oklch(0.546 0.245 263)" } },
      { path: ["color", "primary"], token: { $value: "{color.blue.600}" } },
    ];
    const resolved = resolveReferences(tokens);
    const primary = resolved.find((t) => t.path.join(".") === "color.primary");
    expect(primary?.token.$value).toBe("oklch(0.546 0.245 263)");
  });

  it("resolves chained references", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "blue", "600"], token: { $value: "oklch(0.546 0.245 263)" } },
      { path: ["color", "primary"], token: { $value: "{color.blue.600}" } },
      { path: ["color", "ring"], token: { $value: "{color.primary}" } },
    ];
    const resolved = resolveReferences(tokens);
    const ring = resolved.find((t) => t.path.join(".") === "color.ring");
    expect(ring?.token.$value).toBe("oklch(0.546 0.245 263)");
  });

  it("throws on unresolved reference", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "primary"], token: { $value: "{color.nonexistent}" } },
    ];
    expect(() => resolveReferences(tokens)).toThrow("Unresolved reference");
  });

  it("leaves non-reference values unchanged", () => {
    const tokens: FlatToken[] = [
      { path: ["spacing", "4"], token: { $value: "16px" } },
    ];
    const resolved = resolveReferences(tokens);
    expect(resolved[0].token.$value).toBe("16px");
  });
});
