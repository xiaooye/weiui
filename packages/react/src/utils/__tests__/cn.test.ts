import { describe, it, expect } from "vitest";
import { cn } from "../cn";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("filters falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("deduplicates tailwind classes", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
  });
});
