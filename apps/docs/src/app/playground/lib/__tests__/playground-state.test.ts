import { describe, it, expect } from "vitest";
import { encodeState, decodeState } from "../playground-state";

describe("playground-state", () => {
  it("round-trips a simple state through URL", () => {
    const s = {
      component: "Button",
      props: { variant: "solid" },
      theme: "auto" as const,
      viewport: "full" as const,
    };
    const enc = encodeState(s);
    expect(enc).toMatch(/c=Button/);
    const dec = decodeState(enc);
    expect(dec.component).toBe("Button");
    expect(dec.props).toEqual({ variant: "solid" });
  });

  it("handles missing params with defaults", () => {
    const dec = decodeState("");
    expect(dec.component).toBe("Button");
    expect(dec.props).toEqual({});
    expect(dec.theme).toBe("auto");
    expect(dec.viewport).toBe("full");
  });

  it("clamps oversized prop payloads", () => {
    const huge = { big: "x".repeat(10_000) };
    const enc = encodeState({
      component: "Button",
      props: huge,
      theme: "auto",
      viewport: "full",
    });
    expect(enc.length).toBeLessThanOrEqual(4096);
  });
});
