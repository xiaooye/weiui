import { getComponentMetadata, type WeiFramework } from "@civaria/core/registry";
import type { ComponentNode } from "./tree";

export type WeiTarget = WeiFramework;
export type WeiNode =
  | { type: "component"; component: string; props: Record<string, unknown>; children: WeiNode[] }
  | { type: "text"; value: string };

export function toWeiAst(nodes: readonly ComponentNode[]): WeiNode[] {
  return nodes.map((node) => ({
    type: "component" as const,
    component: node.type,
    props: { ...node.props },
    children: [...(node.text ? [{ type: "text" as const, value: node.text }] : []), ...toWeiAst(node.children)],
  }));
}
function esc(value: string): string { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;"); }
function kebab(value: string): string { return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase(); }
function supported(name: string, target: WeiTarget): boolean { return getComponentMetadata(name)?.frameworks[target] ?? false; }
function propsJsx(props: Record<string, unknown>): string { return Object.entries(props).filter(([,v]) => v !== undefined && v !== null && v !== "").map(([k,v]) => typeof v === "boolean" ? (v ? k : `${k}={false}`) : typeof v === "string" ? `${k}=${JSON.stringify(v)}` : `${k}={${JSON.stringify(v)}}`).join(" "); }
function propsVue(props: Record<string, unknown>): string { return Object.entries(props).filter(([,v]) => v !== undefined && v !== null && v !== "").map(([k,v]) => typeof v === "string" ? `${kebab(k)}=${JSON.stringify(v)}` : `:${kebab(k)}='${JSON.stringify(v)}'`).join(" "); }
function propsSvelte(props: Record<string, unknown>): string { return Object.entries(props).filter(([,v]) => v !== undefined && v !== null && v !== "").map(([k,v]) => typeof v === "string" ? `${k}=${JSON.stringify(v)}` : `${k}={${JSON.stringify(v)}}`).join(" "); }
function renderJsx(node: WeiNode, depth: number, target: "react"|"solid"): string { const i="  ".repeat(depth); if(node.type==="text")return i+node.value;if(!supported(node.component,target))return `${i}{/* ${node.component} is not available in @civaria/${target}. */}`;const a=propsJsx(node.props),o=`<${node.component}${a?` ${a}`:""}`;if(!node.children.length)return `${i}${o} />`;return `${i}${o}>\n${node.children.map(c=>renderJsx(c,depth+1,target)).join("\n")}\n${i}</${node.component}>`; }
function renderVue(node: WeiNode, depth: number): string { const i="  ".repeat(depth);if(node.type==="text")return i+node.value;if(!supported(node.component,"vue"))return `${i}<!-- ${node.component} is not available in @civaria/vue. -->`;const a=propsVue(node.props),o=`<${node.component}${a?` ${a}`:""}`;if(!node.children.length)return `${i}${o} />`;return `${i}${o}>\n${node.children.map(c=>renderVue(c,depth+1)).join("\n")}\n${i}</${node.component}>`; }
function renderSvelte(node: WeiNode, depth: number): string { const i="  ".repeat(depth);if(node.type==="text")return i+node.value;if(!supported(node.component,"svelte"))return `${i}<!-- ${node.component} is not available in @civaria/svelte. -->`;const a=propsSvelte(node.props),o=`<${node.component}${a?` ${a}`:""}`;if(!node.children.length)return `${i}${o} />`;return `${i}${o}>\n${node.children.map(c=>renderSvelte(c,depth+1)).join("\n")}\n${i}</${node.component}>`; }
function renderElements(node: WeiNode, depth: number): string { const i="  ".repeat(depth);if(node.type==="text")return i+esc(node.value);if(!supported(node.component,"elements"))return `${i}<!-- ${node.component}: no Civaria Custom Element distribution. -->`;const tag=`civ-${kebab(node.component)}`;const a=Object.entries(node.props).filter(([,v])=>["string","number","boolean"].includes(typeof v)&&v!==false&&v!=="").map(([k,v])=>typeof v==="boolean"?kebab(k):`${kebab(k)}=${JSON.stringify(String(v))}`).join(" ");return `${i}<${tag}${a?` ${a}`:""}>${node.children.length?`\n${node.children.map(c=>renderElements(c,depth+1)).join("\n")}\n${i}`:""}</${tag}>`; }
function collect(nodes: readonly WeiNode[], target: WeiTarget, out=new Set<string>()): Set<string>{for(const node of nodes)if(node.type==="component"){if(supported(node.component,target))out.add(node.component);collect(node.children,target,out)}return out}
export function generateWeiRuntimeCode(nodes: readonly ComponentNode[], target: WeiTarget): string { const ast=toWeiAst(nodes),names=[...collect(ast,target)].sort();if(target==="elements"){return `<!-- Civaria Elements: explicit registration, no import side effects. -->\n<script type="module">\n  import { defineAll } from "@civaria/elements";\n  import "@civaria/css";\n  defineAll();\n</script>\n${ast.map(n=>renderElements(n,1)).join("\n")}`;}const pkg=`@civaria/${target}`;if(target==="vue")return `<script setup lang="ts">\nimport { ${names.join(", ")} } from "${pkg}";\nimport "@civaria/css";\n</script>\n\n<template>\n${ast.map(n=>renderVue(n,1)).join("\n")}\n</template>`;if(target==="svelte")return `<script lang="ts">\n  import { ${names.join(", ")} } from "${pkg}";\n  import "@civaria/css";\n</script>\n\n${ast.map(n=>renderSvelte(n,0)).join("\n")}`;const body=ast.map(n=>renderJsx(n,2,target)).join("\n");return `import { ${names.join(", ")} } from "${pkg}";\nimport "@civaria/css";\n\nexport default function Composition() {\n  return (\n    <>\n${body}\n    </>\n  );\n}`; }
