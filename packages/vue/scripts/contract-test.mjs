import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../src/index.js", import.meta.url), "utf8");
const required = ["Button", "Accordion", "Dialog", "Menu", "Popover", "Select", "Tabs", "Tooltip", "Combobox", "Checkbox", "Switch"];
for (const name of required) if (!source.includes(`export const ${name}`) && !source.includes(`export function ${name}`)) throw new Error(`missing Vue export: ${name}`);
if (!source.includes('from "vue"') || !source.includes('from "@civaria/core"')) throw new Error("Vue runtime must use Vue and Civaria Core directly");
for (const banned of ["react", "react-dom", "solid-js", 'from "svelte"']) if (source.includes(banned)) throw new Error(`Vue runtime crosses framework boundary: ${banned}`);
