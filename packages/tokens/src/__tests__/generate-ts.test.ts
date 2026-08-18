import { describe, expect, it } from "vitest";
import { generateDts, generateJs, generateTs } from "../generate-ts";
import type { FlatToken } from "../types";

const tokens: FlatToken[] = [
  {
    path: ["color", "brand", "primary"],
    token: { $value: "oklch(60% 0.2 250)" },
  },
];

describe("token module generation", () => {
  it("emits TypeScript source, runtime JavaScript, and declarations", () => {
    expect(generateTs(tokens)).toContain(
      'export const COLOR_BRAND_PRIMARY = "var(--wui-color-brand-primary)" as const;',
    );
    expect(generateJs(tokens)).toContain(
      'export const COLOR_BRAND_PRIMARY = "var(--wui-color-brand-primary)";',
    );
    expect(generateDts(tokens)).toContain(
      'export declare const COLOR_BRAND_PRIMARY: "var(--wui-color-brand-primary)";',
    );
  });
});
