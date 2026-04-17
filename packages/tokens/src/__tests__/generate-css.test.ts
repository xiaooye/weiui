import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

describe("shadow scale", () => {
  const shadowJson = JSON.parse(
    readFileSync(
      join(import.meta.dirname, "..", "primitives", "shadow.json"),
      "utf-8",
    ),
  );

  it("shadow.json declares 8 levels in order", () => {
    const keys = Object.keys(shadowJson.shadow);
    expect(keys).toEqual(["xs", "sm", "base", "md", "lg", "xl", "2xl", "inset"]);
  });

  it("every entry declares $type: shadow", () => {
    for (const [, token] of Object.entries(shadowJson.shadow)) {
      expect((token as { $type: string }).$type).toBe("shadow");
    }
  });

  it("every entry uses OKLCH color and no hex/rgb/hsl", () => {
    for (const [, token] of Object.entries(shadowJson.shadow)) {
      const value = (token as { $value: string }).$value;
      expect(value).toMatch(/oklch\(/);
      expect(value).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(value).not.toMatch(/\b(rgb|rgba|hsl|hsla)\(/);
    }
  });
});

describe("motion scale", () => {
  const motionJson = JSON.parse(
    readFileSync(
      join(import.meta.dirname, "..", "primitives", "motion.json"),
      "utf-8",
    ),
  );

  it("declares full duration set including base and slower", () => {
    const durations = Object.keys(motionJson.motion.duration);
    for (const key of ["instant", "fast", "base", "normal", "slow", "slower"]) {
      expect(durations).toContain(key);
    }
  });

  it("declares Material 3 easing aliases", () => {
    const easings = Object.keys(motionJson.motion.easing);
    for (const key of ["standard", "emphasized", "decelerated", "accelerated"]) {
      expect(easings).toContain(key);
    }
  });
});
