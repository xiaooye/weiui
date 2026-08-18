import type { RegistryIndex } from "../registry-loader.js";
import type { WeiFramework } from "@weiui/core/registry";
export interface ListComponentsDeps { loadIndex:()=>Promise<RegistryIndex>; }
export interface ListComponentsInput { category?:string; framework?:WeiFramework; }
export interface ListComponentsOutput { components:RegistryIndex["components"]; }
export async function listComponents(deps:ListComponentsDeps,input:ListComponentsInput):Promise<ListComponentsOutput>{const index=await deps.loadIndex();return{components:index.components.filter(component=>(!input.category||component.category===input.category)&&(!input.framework||component.runtime?.frameworks[input.framework]===true))}}
