import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { optimize } from "svgo";

const ROOT = dirname(import.meta.dirname);
const SVG_DIR = join(ROOT, "svg");
const OUT_DIR = join(ROOT, "src", "icons");

mkdirSync(OUT_DIR, { recursive: true });

const files = readdirSync(SVG_DIR).filter((f) => f.endsWith(".svg"));
const exports: string[] = ['export { Icon, type IconProps } from "./Icon";'];

for (const file of files) {
  const name = basename(file, ".svg");
  const componentName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  const raw = readFileSync(join(SVG_DIR, file), "utf-8");
  const result = optimize(raw, {
    plugins: [
      "removeDoctype",
      "removeXMLProcInst",
      "removeComments",
      "removeMetadata",
      "removeEditorsNSData",
      "cleanupAttrs",
      "mergeStyles",
      "minifyStyles",
      "removeUselessDefs",
      "removeEmptyAttrs",
      "removeHiddenElems",
      "collapseGroups",
      "sortAttrs",
      "removeDimensions",
    ],
  });

  // Extract inner content (everything between the svg tags)
  const inner = result.data
    .replace(/<svg[^>]*>/, "")
    .replace(/<\/svg>/, "")
    .trim()
    // Convert SVG attributes to React JSX
    .replace(/stroke-width/g, "strokeWidth")
    .replace(/stroke-linecap/g, "strokeLinecap")
    .replace(/stroke-linejoin/g, "strokeLinejoin")
    .replace(/fill-rule/g, "fillRule")
    .replace(/clip-rule/g, "clipRule");

  const component = `import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const ${componentName} = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      ${inner}
    </Icon>
  ),
);
${componentName}.displayName = "${componentName}";
`;

  writeFileSync(join(OUT_DIR, `${componentName}.tsx`), component);
  exports.push(`export { ${componentName} } from "./icons/${componentName}";`);
}

// Write index
writeFileSync(join(ROOT, "src", "index.ts"), exports.join("\n") + "\n");
console.log(`Generated ${files.length} icon components`);
