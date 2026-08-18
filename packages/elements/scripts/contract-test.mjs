import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../src/index.js", import.meta.url), "utf8");
const required = ["defineButton", "defineAccordion", "defineDialog", "defineMenu", "definePopover", "defineSelect", "defineTabs", "defineTooltip", "defineCombobox", "defineCheckbox", "defineSwitch", "defineAll"];
for (const name of required) if (!source.includes(`export const ${name}`) && !source.includes(`export function ${name}`)) throw new Error(`missing Elements API: ${name}`);
if (!source.includes('from "@weiui/core"')) throw new Error("Elements runtime must consume WeiUI Core");
for (const banned of ["react", "react-dom", 'from "vue"', "solid-js", 'from "svelte"']) if (source.includes(banned)) throw new Error(`Elements runtime crosses framework boundary: ${banned}`);
if (source.includes("Date.now") || source.includes("Math.random")) throw new Error("Elements runtime contains non-deterministic IDs");
