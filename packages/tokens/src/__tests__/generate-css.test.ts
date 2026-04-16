import { describe, it, expect } from "vitest";
import { generateCss, pathToCssVar } from "../generate-css";
import type { FlatToken } from "../types";

describe("pathToCssVar", () => {
  it("converts token path to CSS custom property name", () => {
    expect(pathToCssVar(["color", "primary"])).toBe("--wui-color-primary");
    expect(pathToCssVar(["font", "size", "base"])).toBe("--wui-font-size-base");
    expect(pathToCssVar(["spacing", "2.5"])).toBe("--wui-spacing-2\\.5");
  });
});

describe("generateCss", () => {
  it("generates CSS with @layer and :root", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "primary"], token: { $value: "oklch(0.546 0.245 263)" } },
      { path: ["spacing", "4"], token: { $value: "16px" } },
    ];
    const css = generateCss(tokens);
    expect(css).toContain("@layer wui-tokens");
    expect(css).toContain(":root");
    expect(css).toContain("--wui-color-primary: oklch(0.546 0.245 263)");
    expect(css).toContain("--wui-spacing-4: 16px");
  });
});
