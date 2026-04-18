/**
 * Line-based lint for TSX snippets that use WeiUI components.
 *
 * Intentionally lightweight — no AST parsing. Catches the three most common
 * mistakes AI agents make on first attempt:
 *   1. Leaking Tailwind utility classes into `className` on a WeiUI component
 *      (users should rely on variants or `wui-*` classes instead).
 *   2. Importing a heavy component from the main `@weiui/react` barrel
 *      instead of its required subpath (bundle-size regression).
 *   3. Rendering `<Button iconOnly>` without an `aria-label` (a11y failure).
 */

export interface LintWarning {
  line: number;
  message: string;
  suggestion?: string;
}

/** Components that must be imported from a subpath to avoid bundle bloat. */
const HEAVY_SUBPATHS: Record<string, string> = {
  Editor: "@weiui/react/editor",
  DataTable: "@weiui/react/data-table",
  BarChart: "@weiui/react/chart",
  LineChart: "@weiui/react/chart",
  AreaChart: "@weiui/react/chart",
  PieChart: "@weiui/react/chart",
  DonutChart: "@weiui/react/chart",
  RadarChart: "@weiui/react/chart",
};

// Tailwind-ish utility patterns commonly emitted by LLMs.
const TAILWIND_PATTERNS: RegExp[] = [
  /\binline-flex\b/,
  /\bitems-(center|start|end|baseline|stretch)\b/,
  /\bjustify-(center|start|end|between|around|evenly)\b/,
  /\bh-(\d+|\[\w)/,
  /\bw-(\d+|\[\w|full|screen)/,
  /\bpx-\d+/,
  /\bpy-\d+/,
  /\bpt-\d+/,
  /\bpr-\d+/,
  /\bpb-\d+/,
  /\bpl-\d+/,
  /\bmx-\d+/,
  /\bmy-\d+/,
  /\bgap-\d+/,
  /\bbg-\[var\(/,
  /\btext-(sm|base|lg|xl|\d+xl)\b/,
  /\brounded-\[/,
  /\brounded-(sm|md|lg|xl|full)\b/,
];

function detectTailwind(line: string): boolean {
  if (!/className\s*=/.test(line)) return false;
  return TAILWIND_PATTERNS.some((re) => re.test(line));
}

function detectHeavyImport(line: string): { name: string; subpath: string } | null {
  const match = line.match(/import\s*\{([^}]+)\}\s*from\s*["']@weiui\/react["']/);
  if (!match) return null;
  const names = match[1]!.split(",").map((s) => s.trim().split(/\s+as\s+/)[0]!.trim());
  for (const name of names) {
    if (name in HEAVY_SUBPATHS) {
      return { name, subpath: HEAVY_SUBPATHS[name]! };
    }
  }
  return null;
}

function detectIconOnlyMissingLabel(line: string): boolean {
  if (!/<Button[^>]*\biconOnly\b/.test(line)) return false;
  return !/\baria-label\s*=/.test(line);
}

/**
 * Lint a TSX snippet line by line. Returns a warning list; an empty array
 * means "no issues found."
 */
export function lintCode(code: string): LintWarning[] {
  const warnings: LintWarning[] = [];
  const lines = code.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const lineNumber = i + 1;

    if (detectTailwind(line)) {
      warnings.push({
        line: lineNumber,
        message:
          "Tailwind utility classes in consumer code. Use wui-* classes or component variants.",
        suggestion:
          "Replace className utilities with component props (e.g. `size`, `variant`, `fullWidth`).",
      });
    }

    const heavy = detectHeavyImport(line);
    if (heavy) {
      warnings.push({
        line: lineNumber,
        message: `Heavy component "${heavy.name}" must be imported from its subpath.`,
        suggestion: `import { ${heavy.name} } from "${heavy.subpath}";`,
      });
    }

    if (detectIconOnlyMissingLabel(line)) {
      warnings.push({
        line: lineNumber,
        message: "<Button iconOnly> requires an aria-label for accessibility.",
        suggestion: 'Add aria-label="<action>" to describe the button\'s purpose.',
      });
    }
  }
  return warnings;
}
