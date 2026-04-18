import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Build `llms.txt` (short index) and `llms-full.txt` (inlined docs) per
 * https://llmstxt.org. Runs at docs build time; regenerated from the MDX
 * source, so it cannot drift from the docs site.
 */
export interface BuildLlmsTxtOptions {
  /** Directory to emit the two files into (will be created). */
  outDir: string;
  /** Absolute URL root for generated links (e.g. "https://weiui.dev"). */
  siteUrl: string;
}

interface DocPage {
  title: string;
  description: string;
  body: string;
  /** Docs-relative URL path, e.g. "/docs/components/button". */
  href: string;
  kind: "component" | "foundation" | "guide";
}

const DOCS_ROOT = join(process.cwd(), "src", "app", "docs");

/** Foundation-style guide slugs we want to surface explicitly. */
const FOUNDATION_SLUGS = new Set([
  "colors",
  "typography",
  "tokens",
  "accessibility",
  "installation",
  "getting-started",
  "migration",
  "cli",
  "changelog",
  "ai-guide",
]);

function walk(dir: string): string[] {
  const results: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) results.push(...walk(full));
    else if (entry === "page.mdx") results.push(full);
  }
  return results;
}

function extractTitle(raw: string): string {
  const match = raw.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? "Untitled";
}

/** First prose paragraph after the H1 — used as the short description. */
function extractDescription(raw: string): string {
  const withoutFrontmatter = raw.replace(/^---[\s\S]*?---\n/, "");
  const withoutImports = withoutFrontmatter.replace(/^import\s+[^\n]*$/gm, "");
  const lines = withoutImports.split(/\r?\n/);
  let sawH1 = false;
  const buffer: string[] = [];
  for (const line of lines) {
    if (!sawH1) {
      if (/^#\s+/.test(line)) sawH1 = true;
      continue;
    }
    const trimmed = line.trim();
    if (trimmed === "") {
      if (buffer.length > 0) break;
      continue;
    }
    if (trimmed.startsWith("#")) break;
    if (/^<[A-Z]/.test(trimmed)) continue; // skip JSX component lines
    if (/^```/.test(trimmed)) break;
    buffer.push(trimmed);
  }
  return buffer
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

/** Strip MDX-specific JSX + imports so the body is plain markdown. */
function stripMdxJsx(raw: string): string {
  return (
    raw
      // Drop `import ... from "...";` lines.
      .replace(/^import\s+[^\n]*$/gm, "")
      // Drop multi-line `<Preview ...>...</Preview>` blocks (including
      // attributes that span multiple lines).
      .replace(/<Preview\b[\s\S]*?<\/Preview>/g, "")
      .replace(/<ComponentPreview\b[\s\S]*?<\/ComponentPreview>/g, "")
      // Drop any remaining self-closing JSX tags (`<Foo ... />`).
      .replace(/<[A-Z][A-Za-z0-9]*(?:\s[^<>]*?)?\/>/g, "")
      // Drop single-line `<Component ...>` / `</Component>` bracket noise for
      // capitalized tags the MDX compiler would render as React components.
      .replace(/<\/?[A-Z][A-Za-z0-9]*(?:\s[^<>]*)?>/g, "")
      // Collapse runs of blank lines.
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function readDocs(): DocPage[] {
  const files = walk(DOCS_ROOT);
  const pages: DocPage[] = [];
  for (const file of files) {
    const raw = readFileSync(file, "utf-8");
    const rel = relative(DOCS_ROOT, file).replace(/\\/g, "/").replace(/\/page\.mdx$/, "");
    const href = rel === "" ? "/docs" : "/docs/" + rel;
    const title = extractTitle(raw);
    const description = extractDescription(raw);
    const body = stripMdxJsx(raw);
    const segments = rel === "" ? [] : rel.split("/");
    const isComponent = segments[0] === "components" && segments.length === 2;
    const isFoundation = segments.length === 1 && FOUNDATION_SLUGS.has(segments[0] ?? "");
    const kind: DocPage["kind"] = isComponent
      ? "component"
      : isFoundation
        ? "foundation"
        : "guide";
    pages.push({ title, description, body, href, kind });
  }
  return pages.sort((a, b) => a.href.localeCompare(b.href));
}

function renderSmall(pages: DocPage[], siteUrl: string): string {
  const components = pages.filter((p) => p.kind === "component");
  const foundations = pages.filter((p) => p.kind === "foundation");
  const out: string[] = [];

  out.push("# WeiUI");
  out.push("");
  out.push(
    "> Accessibility-first React component library with three consumption tiers (CSS-only, headless, styled). WCAG AAA enforced. OKLCH tokens. MIT license.",
  );
  out.push("");
  out.push("## Getting started");
  out.push("");
  out.push(`- [Installation](${siteUrl}/docs/installation)`);
  out.push(`- [Quick start](${siteUrl}/docs/getting-started)`);
  out.push(`- [Component overview](${siteUrl}/docs/components)`);
  out.push("");
  out.push("## Import rules");
  out.push("");
  out.push('- Default: `import { Button } from "@weiui/react"`');
  out.push("- Heavy components use subpaths:");
  out.push('  - `import { Editor } from "@weiui/react/editor"`');
  out.push('  - `import { DataTable } from "@weiui/react/data-table"`');
  out.push(
    '  - `import { BarChart, LineChart, AreaChart, PieChart, DonutChart, RadarChart } from "@weiui/react/chart"`',
  );
  out.push(
    "- Style with `wui-*` class names or component variants. Never emit Tailwind utilities in consumer code.",
  );
  out.push("");
  out.push(`## Components (${components.length})`);
  out.push("");
  for (const page of components) {
    const desc = page.description ? ` — ${page.description}` : "";
    out.push(`- [${page.title}](${siteUrl}${page.href})${desc}`);
  }
  out.push("");
  out.push("## Foundations");
  out.push("");
  for (const page of foundations) {
    const desc = page.description ? ` — ${page.description}` : "";
    out.push(`- [${page.title}](${siteUrl}${page.href})${desc}`);
  }
  out.push("");
  return out.join("\n");
}

function renderFull(pages: DocPage[], siteUrl: string): string {
  const out: string[] = [];
  out.push("# WeiUI — Full Documentation");
  out.push("");
  out.push(`> Source: ${siteUrl}/llms-full.txt`);
  out.push("");
  out.push(
    "This file inlines every WeiUI documentation page (components + foundations) as plain markdown, with MDX JSX stripped. Use it as deep context when `llms.txt` is not enough.",
  );
  out.push("");
  out.push("---");
  out.push("");

  const ordered = [
    ...pages.filter((p) => p.kind === "foundation"),
    ...pages.filter((p) => p.kind === "guide"),
    ...pages.filter((p) => p.kind === "component"),
  ];

  for (const page of ordered) {
    out.push(`## ${page.title}`);
    out.push("");
    out.push(`Source: ${siteUrl}${page.href}`);
    out.push("");
    // Body already starts with its own `# Title`; strip that to avoid
    // duplicating the heading we just emitted.
    const body = page.body.replace(/^#\s+[^\n]*\n+/, "");
    out.push(body);
    out.push("");
    out.push("---");
    out.push("");
  }

  return out.join("\n");
}

export function buildLlmsTxt(opts: BuildLlmsTxtOptions): void {
  const { outDir, siteUrl } = opts;
  mkdirSync(outDir, { recursive: true });
  const pages = readDocs();
  writeFileSync(join(outDir, "llms.txt"), renderSmall(pages, siteUrl), "utf-8");
  writeFileSync(join(outDir, "llms-full.txt"), renderFull(pages, siteUrl), "utf-8");
}

// CLI entry point — invoked by the docs build pipeline.
const isMain =
  typeof process !== "undefined" &&
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("scripts/build-llms-txt.ts");

if (isMain) {
  const siteUrl = process.env.SITE_URL ?? "https://weiui.dev";
  const outDir = join(process.cwd(), "public");
  buildLlmsTxt({ outDir, siteUrl });
  console.log(`Wrote llms.txt + llms-full.txt to ${outDir}`);
}
