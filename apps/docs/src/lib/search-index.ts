import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";

export interface SearchEntry {
  title: string;
  href: string;
  content: string;
  group: "Component" | "Guide" | "Page";
}

const MDX_ROOT = join(process.cwd(), "src", "app");

function walk(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) results.push(...walk(full));
    else if (entry === "page.mdx" || entry === "page.tsx") results.push(full);
  }
  return results;
}

function extractTitleAndText(raw: string): { title: string; content: string } {
  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1] ? titleMatch[1].trim() : "Untitled";
  const content = raw
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 800);
  return { title, content };
}

export function buildSearchIndex(): SearchEntry[] {
  const files = walk(MDX_ROOT);
  const entries: SearchEntry[] = [];
  for (const file of files) {
    if (!file.endsWith("page.mdx")) continue;
    const raw = readFileSync(file, "utf-8");
    const rel = relative(MDX_ROOT, file).replace(/\\/g, "/").replace(/\/page\.mdx$/, "");
    const href = "/" + rel;
    const { title, content } = extractTitleAndText(raw);
    const group: SearchEntry["group"] = href.startsWith("/docs/components/")
      ? "Component"
      : href.startsWith("/docs/")
        ? "Guide"
        : "Page";
    entries.push({ title, href, content, group });
  }
  return entries;
}

export function writeSearchIndex(outPath: string): void {
  const entries = buildSearchIndex();
  mkdirSync(join(outPath, ".."), { recursive: true });
  writeFileSync(outPath, JSON.stringify(entries, null, 2));
}
