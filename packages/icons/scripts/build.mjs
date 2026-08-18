import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const svgDir = join(root, "svg");
const out = join(root, "dist");
const dataDir = join(out, "data");
const svelteDir = join(out, "svelte");
await rm(out, { recursive: true, force: true });
await mkdir(dataDir, { recursive: true });
await mkdir(svelteDir, { recursive: true });

const files = (await readdir(svgDir)).filter(file => file.endsWith(".svg")).sort();
const records = [];
const camel = value => value.split("-").map((part, index) => index === 0 ? part : part[0].toUpperCase() + part.slice(1)).join("");
const pascal = value => value.split("-").map(part => part[0].toUpperCase() + part.slice(1)).join("");
function parseAttrs(source) {
  const attrs = {}; const pattern = /([:\w-]+)="([^"]*)"/g; let match;
  while ((match = pattern.exec(source))) attrs[match[1]] = match[2];
  return attrs;
}
for (const file of files) {
  const name = basename(file, ".svg"); const component = pascal(name); const variable = `${camel(name)}Icon`;
  const raw = await readFile(join(svgDir, file), "utf8");
  const open = raw.match(/<svg\b([^>]*)>/i); const viewBox = open ? parseAttrs(open[1]).viewBox ?? "0 0 24 24" : "0 0 24 24";
  const inner = raw.replace(/[\s\S]*?<svg\b[^>]*>/i, "").replace(/<\/svg>[\s\S]*$/i, "").trim();
  const nodes = []; const tagPattern = /<(path|circle|ellipse|line|polyline|polygon|rect)\b([^>]*)\/?\s*>/gi; let tag;
  while ((tag = tagPattern.exec(inner))) nodes.push({ tag: tag[1].toLowerCase(), attrs: parseAttrs(tag[2]) });
  const data = { name, viewBox, nodes };
  await writeFile(join(dataDir, `${name}.js`), `export const ${variable} = Object.freeze(${JSON.stringify(data)});\nexport default ${variable};\n`);
  await writeFile(join(svelteDir, `${component}.svelte`), `<script>let { size = 24, width, height, ...rest } = $props();</script>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width={width ?? size} height={height ?? size} {...rest}>${inner}</svg>\n`);
  records.push({ name, component, variable });
}
const imports = records.map(record => `import { ${record.variable} as ${record.component}IconData } from "./data/${record.name}.js";`).join("\n");
await writeFile(join(out, "index.js"), records.map(record => `export { ${record.variable} as ${record.component}IconData } from "./data/${record.name}.js";`).join("\n") + "\n");
const react = `${imports}\nimport { createElement, forwardRef } from "react";\nconst reactAttrs = attrs => Object.fromEntries(Object.entries(attrs).map(([key,value]) => [({"stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","fill-rule":"fillRule","clip-rule":"clipRule"}[key] ?? key), value]));\nexport function createReactIcon(data){const Icon=forwardRef(function WeiIcon({size=24,width,height,...props},ref){return createElement("svg",{ref,xmlns:"http://www.w3.org/2000/svg",viewBox:data.viewBox,fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round",width:width??size,height:height??size,...props},data.nodes.map((node,index)=>createElement(node.tag,{key:index,...reactAttrs(node.attrs)})))});Icon.displayName=data.name;return Icon;}\n${records.map(record => `export const ${record.component} = createReactIcon(${record.component}IconData);`).join("\n")}\n`;
await writeFile(join(out, "react.js"), react);
const vue = `${imports}\nimport { defineComponent, h } from "vue";\nexport function createVueIcon(data){return defineComponent({name:${JSON.stringify("WeiIcon")},inheritAttrs:false,props:{size:{type:[Number,String],default:24}},setup(props,{attrs}){return()=>h("svg",{...attrs,xmlns:"http://www.w3.org/2000/svg",viewBox:data.viewBox,fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round",width:attrs.width??props.size,height:attrs.height??props.size},data.nodes.map(node=>h(node.tag,node.attrs)))}})}\n${records.map(record => `export const ${record.component} = createVueIcon(${record.component}IconData);`).join("\n")}\n`;
await writeFile(join(out, "vue.js"), vue);
const solid = `${imports}\nimport h from "solid-js/h";\nexport function createSolidIcon(data){return function WeiIcon(props={}){const {size=24,width,height,...rest}=props;return h("svg",{...rest,xmlns:"http://www.w3.org/2000/svg",viewBox:data.viewBox,fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round",width:width??size,height:height??size},data.nodes.map(node=>h(node.tag,node.attrs)))}}\n${records.map(record => `export const ${record.component} = createSolidIcon(${record.component}IconData);`).join("\n")}\n`;
await writeFile(join(out, "solid.js"), solid);
await writeFile(join(out, "svelte.js"), records.map(record => `export { default as ${record.component} } from "./svelte/${record.component}.svelte";`).join("\n") + "\n");
const svg = `const escape=value=>String(value).replace(/[&<>\"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\\\"":"&quot;"}[char]));export function toSvg(data,{size=24,width=size,height=size,...attrs}={}){const extra=Object.entries(attrs).map(([key,value])=>\` ${'${'}key}="${'${'}escape(value)}"\`).join("");const body=data.nodes.map(node=>\`<${'${'}node.tag}${'${'}Object.entries(node.attrs).map(([key,value])=>\` ${'${'}key}="${'${'}escape(value)}"\`).join("")}/>\`).join("");return \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${'${'}escape(data.viewBox)}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="${'${'}escape(width)}" height="${'${'}escape(height)}"${'${'}extra}>${'${'}body}</svg>\`;}\n`;
await writeFile(join(out, "svg.js"), svg);
const dataNames = records.map(record => `export const ${record.component}IconData: IconData;`).join("\n");
await writeFile(join(out, "index.d.ts"), `export interface IconNode { readonly tag: string; readonly attrs: Readonly<Record<string,string>> }\nexport interface IconData { readonly name: string; readonly viewBox: string; readonly nodes: readonly IconNode[] }\n${dataNames}\n`);
const componentNames = records.map(record => `export const ${record.component}: IconComponent;`).join("\n");
await writeFile(join(out, "react.d.ts"), `import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react"; import type { IconData } from "./index.js"; export type IconComponent=ForwardRefExoticComponent<SVGProps<SVGSVGElement>&{size?:number|string}&RefAttributes<SVGSVGElement>>; export function createReactIcon(data:IconData):IconComponent; ${componentNames}`);
await writeFile(join(out, "vue.d.ts"), `import type { DefineComponent } from "vue"; import type { IconData } from "./index.js"; export type IconComponent=DefineComponent<{size?:number|string}>; export function createVueIcon(data:IconData):IconComponent; ${componentNames}`);
await writeFile(join(out, "solid.d.ts"), `import type { IconData } from "./index.js"; export type IconComponent=(props:{size?:number|string;width?:number|string;height?:number|string;[key:string]:unknown})=>unknown; export function createSolidIcon(data:IconData):IconComponent; ${componentNames}`);
await writeFile(join(out, "svelte.d.ts"), `import type { Component } from "svelte"; export type IconComponent=Component<{size?:number|string;width?:number|string;height?:number|string}>; ${componentNames}`);
await writeFile(join(out, "svg.d.ts"), `import type { IconData } from "./index.js"; export function toSvg(data:IconData,attrs?:Record<string,string|number>):string;`);
console.log(`Generated ${records.length} framework-neutral WeiUI icons`);
