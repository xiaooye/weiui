import type { FlatToken } from "./types";

const DARK_OVERRIDES: Record<string, string> = {
  "color.background":         "oklch(0.145 0.010 240)",
  "color.foreground":         "oklch(0.985 0.002 240)",
  "color.card":               "oklch(0.208 0.012 240)",
  "color.card-foreground":    "oklch(0.985 0.002 240)",
  "color.muted":              "oklch(0.279 0.015 240)",
  "color.muted-foreground":   "oklch(0.707 0.015 240)",
  "color.border":             "oklch(0.372 0.017 240)",
  "color.primary":            "oklch(0.623 0.214 262)",
  "color.primary-foreground": "oklch(0.145 0.010 240)",
  "color.ring":               "oklch(0.623 0.214 262)",
  "surface.raised":           "oklch(0.208 0.012 240)",
  "surface.overlay":          "oklch(0.208 0.012 240)",
  "surface.sunken":           "oklch(0.145 0.010 240)",
};

export function generateDarkTokens(tokens: FlatToken[]): FlatToken[] {
  return tokens
    .filter((t) => DARK_OVERRIDES[t.path.join(".")])
    .map((t) => ({
      path: t.path,
      token: { ...t.token, $value: DARK_OVERRIDES[t.path.join(".")]! },
    }));
}
