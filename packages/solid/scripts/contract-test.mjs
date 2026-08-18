import { readFile } from "node:fs/promises";
const source = await readFile(new URL("../src/index.jsx", import.meta.url), "utf8");
const required = ["Button", "Accordion", "Dialog", "Menu", "Popover", "Select", "Tabs", "Tooltip", "Combobox", "Checkbox", "Switch"];
for (const name of required) if (!source.includes(`export const ${name}`) && !source.includes(`export function ${name}`)) throw new Error(`missing Solid export: ${name}`);
if (!source.includes('from "solid-js"') || !source.includes('from "@weiui/core"')) throw new Error("Solid runtime must use Solid and WeiUI Core directly");
for (const banned of ["react", "react-dom", 'from "vue"', 'from "svelte"']) if (source.includes(banned)) throw new Error(`Solid runtime crosses framework boundary: ${banned}`);
