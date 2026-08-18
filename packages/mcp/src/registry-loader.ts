import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getComponentMetadata, type PortabilityClass, type WeiFramework } from "@weiui/core/registry";
export interface RegistryPropSchema { name: string; type: string; default?: string; required?: boolean; description: string; }
export interface RegistryExampleSchema { label: string; code: string; }
export interface RegistryRuntimeMetadata { portability: PortabilityClass; parts: readonly string[]; frameworks: Readonly<Record<WeiFramework, boolean>>; status: "stable"|"preview"|"ecosystem"; }
export interface RegistryComponentSchema { name: string; category: string; description: string; importPath: string; subpathImport: string|null; dependencies: string[]; props: RegistryPropSchema[]; compound: string[]; examples: RegistryExampleSchema[]; accessibility: string[]; runtime?: RegistryRuntimeMetadata; }
export interface RegistryIndex { components: Array<{ name:string; category:string; description:string; url:string; runtime?:RegistryRuntimeMetadata }>; generatedAt:string; version:string; }
const REMOTE_BASE="https://weiui.dev/registry";
function runtime(name:string):RegistryRuntimeMetadata|undefined{const m=getComponentMetadata(name);return m?{portability:m.portability,parts:m.parts,frameworks:m.frameworks,status:m.status}:undefined}
function defaultRegistryDir():string{if(process.env.WEIUI_MCP_REGISTRY_DIR)return process.env.WEIUI_MCP_REGISTRY_DIR;const here=dirname(fileURLToPath(import.meta.url));return resolve(here,"..","registry")}
async function readLocalJson<T>(path:string):Promise<T|null>{if(!existsSync(path))return null;return JSON.parse(await readFile(path,"utf-8")) as T}
async function fetchRemoteJson<T>(url:string):Promise<T>{const res=await fetch(url);if(!res.ok)throw new Error(`[@weiui/mcp] failed to fetch ${url}: ${res.status} ${res.statusText}`);return await res.json() as T}
export function defaultLoadIndex(registryDir?:string):()=>Promise<RegistryIndex>{const dir=registryDir??defaultRegistryDir();return async()=>{const base=await readLocalJson<RegistryIndex>(join(dir,"index.json"))??await fetchRemoteJson<RegistryIndex>(`${REMOTE_BASE}/index.json`);return{...base,components:base.components.map(item=>({...item,runtime:runtime(item.name)}))}}}
export function defaultLoadComponent(registryDir?:string):(name:string)=>Promise<RegistryComponentSchema>{const dir=registryDir??defaultRegistryDir();return async(name)=>{const base=await readLocalJson<RegistryComponentSchema>(join(dir,`${name}.json`))??await fetchRemoteJson<RegistryComponentSchema>(`${REMOTE_BASE}/${name}.json`);return{...base,runtime:runtime(base.name)}}}
