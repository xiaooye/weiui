import { readFileSync } from "node:fs";
import { checkUsage } from "@weiui/mcp/tools/check-usage";

export async function checkUsageCommand(filePath: string): Promise<string> {
  const code = readFileSync(filePath, "utf-8");
  const result = await checkUsage({}, { code });
  if (result.warnings.length === 0) return "✓ No issues found";
  return result.warnings
    .map(
      (w) =>
        `${filePath}:${w.line} — ${w.message}${w.suggestion ? `\n  → ${w.suggestion}` : ""}`,
    )
    .join("\n");
}
