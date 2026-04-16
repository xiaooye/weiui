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
let aaaCount = 0;
let aaCount = 0;

for (const r of results) {
  const level = r.ratio >= 7.0 ? "AAA" : r.ratio >= 4.5 ? "AA" : "FAIL";
  const icon = r.passes ? "PASS" : "FAIL";
  const req = r.required >= 7.0 ? "AAA" : "AA";
  console.log(`[${icon}] ${r.fg} on ${r.bg}: ${r.ratio.toFixed(2)}:1 (${level}, need ${req} ${r.required}:1)`);
  if (!r.passes) failed = true;
  if (r.ratio >= 7.0) aaaCount++;
  else if (r.ratio >= 4.5) aaCount++;
}

if (failed) {
  console.error("\nContrast validation FAILED — pairs below minimum threshold");
  process.exit(1);
} else {
  console.log(`\nAll ${results.length} pairs pass: ${aaaCount} at AAA (7:1), ${aaCount} at AA (4.5:1)`);
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
