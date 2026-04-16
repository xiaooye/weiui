import { type TokenGroup, type FlatToken, isDesignToken } from "./types";

export function flatten(group: TokenGroup, prefix: string[] = []): FlatToken[] {
  const result: FlatToken[] = [];
  for (const [key, value] of Object.entries(group)) {
    if (key.startsWith("$")) continue;
    const currentPath = [...prefix, key];
    if (isDesignToken(value)) {
      result.push({ path: currentPath, token: value });
    } else if (typeof value === "object" && value !== null) {
      result.push(...flatten(value as TokenGroup, currentPath));
    }
  }
  return result;
}
