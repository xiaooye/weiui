import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { flatten } from "../src/flatten";
import { resolveReferences } from "../src/resolve";
import { validateTokenContrast } from "../src/validate";
import type { TokenGroup } from "../src/types";

const ROOT = dirname(import.meta.dirname);
const SRC = join(ROOT, "src");

// Load and merge tokens — same file list as build.ts
const primitiveFiles = [
  "primitives/color.json", "primitives/spacing.json", "primitives/typography.json",
  "primitives/shape.json", "primitives/motion.json", "primitives/z-index.json",
  "primitives/breakpoint.json",
];

const merged: TokenGroup = {};
for (const f of primitiveFiles) {
  deepMerge(merged, JSON.parse(readFileSync(join(SRC, f), "utf-8")));
}
deepMerge(merged, JSON.parse(readFileSync(join(SRC, "semantic.json"), "utf-8")));

const flat = flatten(merged);
const resolved = resolveReferences(flat);
const results = validateTokenContrast(resolved);

let failed = false;
for (const r of results) {
  const icon = r.passes ? "PASS" : "FAIL";
  console.log(`[${icon}] ${r.fg} on ${r.bg}: ${r.ratio.toFixed(2)}:1 (need ${r.required}:1)`);
  if (!r.passes) failed = true;
}

if (failed) {
  console.error("\nWCAG AAA contrast validation FAILED");
  process.exit(1);
} else {
  console.log(`\nAll ${results.length} contrast pairs pass WCAG AAA (7:1)`);
}

function deepMerge(target: TokenGroup, source: TokenGroup): void {
  for (const [key, value] of Object.entries(source)) {
    if (
      typeof value === "object" && value !== null && !("$value" in value) &&
      typeof target[key] === "object" && target[key] !== null && !("$value" in (target[key] as object))
    ) {
      deepMerge(target[key] as TokenGroup, value as TokenGroup);
    } else {
      target[key] = value;
    }
  }
}
