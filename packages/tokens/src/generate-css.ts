import type { FlatToken } from "./types";

export function pathToCssVar(path: string[]): string {
  const name = path.join("-").replace(/\./g, "\\.");
  return `--wui-${name}`;
}

export function generateCss(tokens: FlatToken[]): string {
  const lines: string[] = ["@layer wui-tokens {", "  :root {"];
  for (const { path, token } of tokens) {
    lines.push(`    ${pathToCssVar(path)}: ${token.$value};`);
  }
  lines.push("  }");
  lines.push("}");
  lines.push("");
  return lines.join("\n");
}

export function generateDarkCss(tokens: FlatToken[]): string {
  const lines: string[] = ["@layer wui-tokens {", "  .dark {"];
  for (const { path, token } of tokens) {
    lines.push(`    ${pathToCssVar(path)}: ${token.$value};`);
  }
  lines.push("  }");
  lines.push("}");
  lines.push("");
  return lines.join("\n");
}
