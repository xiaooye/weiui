import { describe, it, expect } from "vitest";
import { Keys } from "../keyboard";

describe("Keys", () => {
  it("has correct key values", () => {
    expect(Keys.Enter).toBe("Enter");
    expect(Keys.Space).toBe(" ");
    expect(Keys.Escape).toBe("Escape");
    expect(Keys.ArrowDown).toBe("ArrowDown");
  });
});
