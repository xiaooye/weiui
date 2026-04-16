import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { flatten } from "../src/flatten";
import { resolveReferences } from "../src/resolve";
import { generateCss } from "../src/generate-css";
import { generateTs } from "../src/generate-ts";
import type { TokenGroup } from "../src/types";

const ROOT = dirname(import.meta.dirname);
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");

const primitiveFiles = [
  "primitives/color.json",
  "primitives/spacing.json",
  "primitives/typography.json",
  "primitives/shape.json",
  "primitives/motion.json",
  "primitives/z-index.json",
  "primitives/breakpoint.json",
];

const merged: TokenGroup = {};
for (const file of primitiveFiles) {
  const content = JSON.parse(readFileSync(join(SRC, file), "utf-8"));
  deepMerge(merged, content);
}
const semantic = JSON.parse(readFileSync(join(SRC, "semantic.json"), "utf-8"));
deepMerge(merged, semantic);

const flat = flatten(merged);
const resolved = resolveReferences(flat);

mkdirSync(DIST, { recursive: true });
writeFileSync(join(DIST, "tokens.css"), generateCss(resolved));
writeFileSync(join(DIST, "index.ts"), generateTs(resolved));
writeFileSync(
  join(DIST, "tokens.json"),
  JSON.stringify(
    Object.fromEntries(resolved.map((t) => [t.path.join("."), t.token.$value])),
    null, 2,
  ),
);

console.log(`Done — ${resolved.length} tokens generated`);
console.log(`  dist/tokens.css`);
console.log(`  dist/index.ts`);
console.log(`  dist/tokens.json`);

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
