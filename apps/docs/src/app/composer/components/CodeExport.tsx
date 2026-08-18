"use client";
import { useMemo } from "react";
import { Button, Card, CardContent, CardHeader, Stack, toast, ToggleGroup, ToggleGroupItem } from "civaria";
import { generateWeiRuntimeCode, type WeiTarget } from "../lib/wei-ast";
import type { ComponentNode } from "../lib/tree";
import type { ComponentSchema } from "../../../lib/component-schema-loader";
export type CodeMode = "jsx" | Exclude<WeiTarget, "react">;
interface Props { tree: ComponentNode[]; schemas: ComponentSchema[]; codeMode: CodeMode; onCodeModeChange: (mode: CodeMode) => void; }
const FILE_EXT: Record<CodeMode,string> = { jsx:"tsx",vue:"vue",solid:"tsx",svelte:"svelte",elements:"html" };
const LABEL: Record<CodeMode,string> = { jsx:"React",vue:"Vue",solid:"Solid",svelte:"Svelte",elements:"HTML / Elements" };
export function CodeExport({ tree, codeMode, onCodeModeChange }: Props) {
  const target: WeiTarget = codeMode === "jsx" ? "react" : codeMode;
  const code=useMemo(()=>tree.length?generateWeiRuntimeCode(tree,target):"",[tree,target]);
  const copy=async()=>{try{await navigator.clipboard.writeText(code);toast.success("Copied to clipboard")}catch{toast.error("Copy failed")}};
  const download=()=>{const blob=new Blob([code],{type:codeMode==="elements"?"text/html":"text/plain"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`composition.${FILE_EXT[codeMode]}`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url)};
  return <Card><CardHeader><Stack direction="row" gap={3} className="civ-tool-code__header"><ToggleGroup type="single" value={codeMode} onChange={(v)=>{const next=Array.isArray(v)?v[0]:v;if(next)onCodeModeChange(next as CodeMode)}} label="Integration runtime">{(Object.keys(LABEL) as CodeMode[]).map(mode=><ToggleGroupItem key={mode} value={mode}>{LABEL[mode]}</ToggleGroupItem>)}</ToggleGroup><Button variant="ghost" size="sm" onClick={copy} disabled={!code}>Copy</Button><Button variant="ghost" size="sm" onClick={download} disabled={!code}>Download</Button></Stack></CardHeader><CardContent><pre className="civ-tool-code__pre"><code>{code||"// Add components to see generated code"}</code></pre></CardContent></Card>;
}
