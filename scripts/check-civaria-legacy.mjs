import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
const root=process.cwd();
const skipDirs=new Set([".git","node_modules",".next",".turbo","dist"]);
const skipFiles=new Set(["apps/docs/wrangler.jsonc","scripts/civaria-rename.mjs","scripts/check-civaria-legacy.mjs"]);
const textExts=new Set([".ts",".tsx",".js",".jsx",".mjs",".cjs",".json",".jsonc",".md",".mdx",".css",".scss",".html",".yml",".yaml",".txt",".svg",".toml",".sh",".ps1"]);
const pieces={brand:"wei"+"ui",cap:"Wei"+"UI",upper:"WEI"+"UI",short:"w"+"ui",shortCap:"W"+"ui",shortUpper:"W"+"UI"};
const forbidden=["@"+pieces.brand+"/",pieces.cap,pieces.upper,"--"+pieces.short+"-","data-"+pieces.short+"-",pieces.short+"-",pieces.brand+"_",pieces.brand+"-",pieces.brand];
function walk(dir=root){const out=[];for(const e of readdirSync(dir,{withFileTypes:true})){if(e.isDirectory()&&skipDirs.has(e.name))continue;const p=join(dir,e.name);if(e.isDirectory())out.push(...walk(p));else out.push(p)}return out}
function rel(p){return relative(root,p).replaceAll("\\","/")}
const errors=[];
for(const file of walk()){const r=rel(file);if(skipFiles.has(r)||r==="pnpm-lock.yaml")continue;const base=r.split("/").at(-1)||"";if(!textExts.has(extname(base).toLowerCase())&&!base.startsWith("README")&&!["AGENTS.md","CLAUDE.md","CONTRIBUTING.md"].includes(base))continue;let s=readFileSync(file,"utf8");s=s.replaceAll("https://github.com/xiaooye/"+pieces.brand+".git","").replaceAll("https://github.com/xiaooye/"+pieces.brand+"/issues","").replaceAll("https://github.com/xiaooye/"+pieces.brand,"").replaceAll("xiaooye/"+pieces.brand,"");for(const token of forbidden)if(s.includes(token))errors.push(r+": "+token);for(const token of forbidden)if(base.includes(token))errors.push(r+" [filename]: "+token)}
if(errors.length){console.error("Legacy current-surface brand identifiers remain:\n"+errors.join("\n"));process.exit(1)}
console.log("Civaria current-surface brand audit: OK (GitHub repo slug and Cloudflare worker identity explicitly exempted)");
