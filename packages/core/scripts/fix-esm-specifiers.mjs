import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "..", "dist");
const modules = [
  "anatomy",
  "collection",
  "controllers",
  "dom",
  "focus",
  "form",
  "ids",
  "positioning",
  "registry",
  "store",
];
const replacements = modules.flatMap((name) => [
  [`./${name}\"`, `./${name}.js\"`],
  [`./${name}'`, `./${name}.js'`],
]);

for (const file of ["index.js", "controllers.js", "form.js", "index.d.ts", "controllers.d.ts", "form.d.ts"]) {
  const path = join(dist, file);
  let source = await readFile(path, "utf8");
  for (const [from, to] of replacements) source = source.split(from).join(to);
  await writeFile(path, source, "utf8");
}
