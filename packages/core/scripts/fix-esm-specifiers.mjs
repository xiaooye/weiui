import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "..", "dist");
const replacements = [
  ["./anatomy\"", "./anatomy.js\""],
  ["./collection\"", "./collection.js\""],
  ["./controllers\"", "./controllers.js\""],
  ["./dom\"", "./dom.js\""],
  ["./ids\"", "./ids.js\""],
  ["./registry\"", "./registry.js\""],
  ["./store\"", "./store.js\""],
  ["./anatomy'", "./anatomy.js'"],
  ["./collection'", "./collection.js'"],
  ["./controllers'", "./controllers.js'"],
  ["./dom'", "./dom.js'"],
  ["./ids'", "./ids.js'"],
  ["./registry'", "./registry.js'"],
  ["./store'", "./store.js'"],
];

for (const file of ["index.js", "controllers.js", "index.d.ts", "controllers.d.ts"]) {
  const path = join(dist, file);
  let source = await readFile(path, "utf8");
  for (const [from, to] of replacements) source = source.split(from).join(to);
  await writeFile(path, source, "utf8");
}
