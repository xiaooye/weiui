import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import postcss from "postcss";
import postcssImport from "postcss-import";
import postcssNesting from "postcss-nesting";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const INDEX = path.join(SRC, "index.css");
const MANIFEST_SCHEMA = "weiui_css_bundle_manifest_v1";

const indexSource = await readFile(INDEX, "utf8");
const layerMatch = indexSource.match(/@layer\s+([^;]+);/);
if (!layerMatch) throw new Error("src/index.css must declare canonical @layer order");
const layerOrder = layerMatch[1].split(",").map((value) => value.trim());
const layerDeclaration = `@layer ${layerOrder.join(", ")};`;
const imports = [...indexSource.matchAll(/@import\s+["']\.\/([^"']+)["'];/g)].map((match) => match[1]);
if (imports.length === 0) throw new Error("src/index.css must import at least one CSS fragment");

const elementIds = imports
  .filter((relative) => relative.startsWith("elements/") && relative.endsWith(".css"))
  .map((relative) => path.basename(relative, ".css"))
  .sort((a, b) => b.length - a.length || a.localeCompare(b));

function classify(relative) {
  if (relative === "reset.css" || relative === "base.css") return "foundation";
  if (relative.startsWith("a11y/")) return "a11y";
  if (relative.startsWith("elements/")) return "elements";
  if (relative.startsWith("utilities/")) return "utilities";
  throw new Error(`unclassified CSS fragment in src/index.css: ${relative}`);
}

function inferElementDependencies(source, ownId) {
  const refs = new Set();
  for (const match of source.matchAll(/\.wui-([a-z0-9-]+)/g)) {
    const className = match[1];
    const target = elementIds.find((id) => className === id || className.startsWith(`${id}-`));
    if (target && target !== ownId) refs.add(target);
  }
  return [...refs].sort((a, b) => a.localeCompare(b));
}

async function compile(sourcePath, outputPath) {
  const source = await readFile(sourcePath, "utf8");
  const result = await postcss([postcssImport(), postcssNesting()]).process(source, {
    from: sourcePath,
    to: outputPath,
    map: false,
  });
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, result.css, "utf8");
  return source;
}

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await compile(INDEX, path.join(DIST, "weiui.css"));

const fragments = [];
for (let order = 0; order < imports.length; order += 1) {
  const relative = imports[order];
  const sourcePath = path.join(SRC, relative);
  const outputPath = path.join(DIST, relative);
  const source = await compile(sourcePath, outputPath);
  const category = classify(relative);
  const id = path.basename(relative, ".css");
  fragments.push({
    id,
    category,
    path: relative,
    order,
    requires: category === "elements" ? inferElementDependencies(source, id) : [],
  });
}

const manifest = {
  schema: MANIFEST_SCHEMA,
  layer_order: layerOrder,
  layer_declaration: layerDeclaration,
  full_bundle: "weiui.css",
  fragments,
};
await writeFile(path.join(DIST, "bundle-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

await writeFile(path.join(DIST, "config.mjs"), await readFile(path.join(HERE, "config.mjs"), "utf8"), "utf8");
await writeFile(path.join(DIST, "config-cli.mjs"), await readFile(path.join(HERE, "config-cli.mjs"), "utf8"), "utf8");

const lightning = process.platform === "win32" ? "lightningcss.cmd" : "lightningcss";
const minify = spawnSync(lightning, ["--minify", path.join(DIST, "weiui.css"), "-o", path.join(DIST, "weiui.min.css")], {
  stdio: "inherit",
});
if (minify.status !== 0) {
  throw new Error(`lightningcss failed with status ${minify.status ?? "unknown"}`);
}

console.log(JSON.stringify({ schema: MANIFEST_SCHEMA, fragments: fragments.length, elements: elementIds.length }));
