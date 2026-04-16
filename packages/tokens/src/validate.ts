import type { FlatToken } from "./types";
import { getContrastRatio } from "@weiui/a11y";

export interface ContrastPair {
  fg: FlatToken;
  bg: FlatToken;
}

export interface ContrastResult {
  fg: string;
  bg: string;
  ratio: number;
  required: number;
  passes: boolean;
}

export function findContrastPairs(tokens: FlatToken[]): ContrastPair[] {
  const pairs: ContrastPair[] = [];
  const lookup = new Map(tokens.map((t) => [t.path.join("."), t]));

  for (const token of tokens) {
    const key = token.path.join(".");
    if (key.endsWith("-foreground")) {
      const bgKey = key.replace(/-foreground$/, "");
      const bg = lookup.get(bgKey);
      if (bg) {
        pairs.push({ fg: token, bg });
      }
    }
  }

  return pairs;
}

export function validateTokenContrast(tokens: FlatToken[]): ContrastResult[] {
  const pairs = findContrastPairs(tokens);

  return pairs.map(({ fg, bg }) => {
    const fgValue = String(fg.token.$value);
    const bgValue = String(bg.token.$value);
    const ratio = getContrastRatio(fgValue, bgValue);
    const required = 7.0;
    return {
      fg: fg.path.join("."),
      bg: bg.path.join("."),
      ratio,
      required,
      passes: ratio >= required,
    };
  });
}
