import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
const root = new URL("..", import.meta.url).pathname;
const runtimes = ["react", "vue", "solid", "svelte", "elements"];
const bannedCore = ["react", "react-dom", "vue", "solid-js", "svelte", "@weiui/react", "@weiui/vue", "@weiui/solid", "@weiui/svelte", "@weiui/elements"];
async function files(dir) { const out=[]; for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())out.push(...await files(path));else if(/\.(?:[cm]?[jt]sx?|svelte)$/.test(entry.name))out.push(path)} return out; }
function imports(source){return [...source.matchAll(/(?:from\s*|import\s*\()?["']([^"']+)["']/g)].map(match=>match[1]);}
const errors=[];
for(const file of await files(join(root,"packages/core/src"))){const source=await readFile(file,"utf8");for(const specifier of imports(source))if(bannedCore.some(name=>specifier===name||specifier.startsWith(`${name}/`)))errors.push(`core imports banned runtime ${specifier}: ${file}`)}
for(const runtime of runtimes){const pkg=JSON.parse(await readFile(join(root,`packages/${runtime}/package.json`),"utf8"));const deps={...pkg.dependencies,...pkg.optionalDependencies};for(const other of runtimes)if(other!==runtime&&deps[`@weiui/${other}`])errors.push(`@weiui/${runtime} depends on peer runtime @weiui/${other}`);for(const file of await files(join(root,`packages/${runtime}/src`))){const source=await readFile(file,"utf8");for(const other of runtimes)if(other!==runtime&&source.includes(`@weiui/${other}`))errors.push(`${runtime} source imports @weiui/${other}: ${file}`)}}
if(errors.length){console.error(errors.join("\n"));process.exit(1)}console.log("WeiUI package boundaries: OK");
