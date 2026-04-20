import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = dirname(import.meta.dirname);
const SVG_DIR = join(ROOT, "svg");
const TARGET = "2";

function normalize(content: string): string {
  // Replace any stroke-width="X" with stroke-width="2"
  return content.replace(/stroke-width="[0-9.]+"/g, `stroke-width="${TARGET}"`);
}

const files = readdirSync(SVG_DIR).filter((f) => f.endsWith(".svg"));
let changed = 0;
for (const f of files) {
  const p = join(SVG_DIR, f);
  const before = readFileSync(p, "utf-8");
  const after = normalize(before);
  if (before !== after) {
    writeFileSync(p, after);
    changed++;
  }
}
console.log(`Normalized ${changed} / ${files.length} SVGs to stroke-width="${TARGET}"`);
