import type { PropSchema } from "../../lib/component-schema-loader";

export type ControlKind =
  | "string"
  | "number"
  | "bool"
  | "enum"
  | "color"
  | "object"
  | "reactnode";

const ENUM_REGEX = /^("[^"]+"(\s*\|\s*"[^"]+")+)$/;
const COLOR_PATTERNS = [/^Color$/i, /ColorToken/i, /HexColor/i];

export function inferControl(prop: PropSchema): ControlKind {
  const t = prop.type.trim();
  if (ENUM_REGEX.test(t.replace(/\s/g, ""))) return "enum";
  if (t === "boolean") return "bool";
  if (t === "number") return "number";
  if (/ReactNode|React\.ReactNode/.test(t)) return "reactnode";
  if (/Record<|\{\s*\[/.test(t)) return "object";
  if (COLOR_PATTERNS.some((r) => r.test(prop.name))) return "color";
  return "string";
}

export function extractEnumOptions(type: string): string[] {
  const matches = type.match(/"[^"]+"/g) ?? [];
  return matches.map((m) => m.slice(1, -1));
}
