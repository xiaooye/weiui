import type { FlatToken } from "./types";

const REF_PATTERN = /^\{(.+)\}$/;

export function resolveReferences(tokens: FlatToken[]): FlatToken[] {
  const lookup = new Map<string, FlatToken>();
  for (const t of tokens) {
    lookup.set(t.path.join("."), t);
  }
  return tokens.map((t) => ({
    path: t.path,
    token: { ...t.token, $value: resolveValue(t.token.$value, lookup, new Set()) },
  }));
}

function resolveValue(
  value: string | number,
  lookup: Map<string, FlatToken>,
  seen: Set<string>,
): string | number {
  if (typeof value !== "string") return value;
  const match = value.match(REF_PATTERN);
  if (!match) return value;
  const refPath = match[1];
  if (seen.has(refPath)) throw new Error(`Circular reference detected: ${refPath}`);
  const target = lookup.get(refPath);
  if (!target) throw new Error(`Unresolved reference: ${value}`);
  seen.add(refPath);
  return resolveValue(target.token.$value, lookup, seen);
}
