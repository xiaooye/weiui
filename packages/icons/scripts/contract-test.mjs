import { readdir, readFile } from "node:fs/promises";
const files = await readdir(new URL("../dist/data", import.meta.url));
if (files.length < 1) throw new Error("icon data was not generated");
const root = await readFile(new URL("../dist/index.js", import.meta.url), "utf8");
if (/from ["']react["']/.test(root)) throw new Error("canonical @civaria/icons entry cannot require React");
for (const adapter of ["react.js","vue.js","solid.js","svelte.js","svg.js"]) await readFile(new URL(`../dist/${adapter}`, import.meta.url), "utf8");
