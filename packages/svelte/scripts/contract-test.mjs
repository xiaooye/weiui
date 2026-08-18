import { readFile } from "node:fs/promises";
const index = await readFile(new URL("../src/index.js", import.meta.url), "utf8");
const required = ["Button", "Accordion", "Dialog", "Menu", "Popover", "Select", "Tabs", "Tooltip", "Combobox", "Checkbox", "Switch"];
for (const name of required) if (!index.includes(`default as ${name}`)) throw new Error(`missing Svelte export: ${name}`);
const interactive = await Promise.all(required.slice(1).map(name => readFile(new URL(`../src/${name}.svelte`, import.meta.url), "utf8")));
for (const source of interactive) {
  if (!source.includes('from "@weiui/core"')) throw new Error("Svelte interactive runtime must consume WeiUI Core");
  for (const banned of ["react", "react-dom", 'from "vue"', "solid-js"]) if (source.includes(banned)) throw new Error(`Svelte runtime crosses framework boundary: ${banned}`);
}
