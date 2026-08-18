import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { defaultLoadIndex, defaultLoadComponent } from "./registry-loader.js";
import { listComponents } from "./tools/list-components.js";import { getComponent } from "./tools/get-component.js";import { searchComponents } from "./tools/search-components.js";import { getExample } from "./tools/get-example.js";import { checkUsage } from "./tools/check-usage.js";
const framework=z.enum(["react","vue","solid","svelte","elements"]);
const listComponentsInputSchema=z.object({category:z.string().optional(),framework:framework.optional()});
const getComponentInputSchema=z.object({name:z.string()});
const searchComponentsInputSchema=z.object({query:z.string(),limit:z.number().int().positive().optional()});
const getExampleInputSchema=z.object({name:z.string(),variant:z.string().optional(),framework:framework.optional()});
const checkUsageInputSchema=z.object({code:z.string()});
export interface CreateServerOptions{registryDir?:string}
export function createServer(options:CreateServerOptions={}):Server{const loadIndex=defaultLoadIndex(options.registryDir),loadComponent=defaultLoadComponent(options.registryDir);const server=new Server({name:"@civaria/mcp",version:"0.1.0"},{capabilities:{tools:{}}});server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:[
{name:"list_components",description:"List Civaria components with framework-neutral portability/anatomy metadata. Filter by category or native runtime.",inputSchema:{type:"object",properties:{category:{type:"string"},framework:{type:"string",enum:["react","vue","solid","svelte","elements"]}}}},
{name:"get_component",description:"Return docs schema plus canonical Civaria portability, anatomy and supported runtimes.",inputSchema:{type:"object",required:["name"],properties:{name:{type:"string"}}}},
{name:"search_components",description:"Ranked component search.",inputSchema:{type:"object",required:["query"],properties:{query:{type:"string"},limit:{type:"integer",minimum:1}}}},
{name:"get_example",description:"Return a native Civaria example for React, Vue, Solid, Svelte or Elements when supported.",inputSchema:{type:"object",required:["name"],properties:{name:{type:"string"},variant:{type:"string"},framework:{type:"string",enum:["react","vue","solid","svelte","elements"]}}}},
{name:"check_usage",description:"Lint a TSX snippet for common Civaria mistakes.",inputSchema:{type:"object",required:["code"],properties:{code:{type:"string"}}}}
]}));server.setRequestHandler(CallToolRequestSchema,async(request)=>{const{name,arguments:args}=request.params;if(name==="list_components"){const input=listComponentsInputSchema.parse(args??{});return{content:[{type:"text",text:JSON.stringify(await listComponents({loadIndex},input),null,2)}]}}if(name==="get_component"){const input=getComponentInputSchema.parse(args??{});return{content:[{type:"text",text:JSON.stringify(await getComponent({loadComponent},input),null,2)}]}}if(name==="search_components"){const input=searchComponentsInputSchema.parse(args??{});return{content:[{type:"text",text:JSON.stringify(await searchComponents({loadIndex},input),null,2)}]}}if(name==="get_example"){const input=getExampleInputSchema.parse(args??{});return{content:[{type:"text",text:JSON.stringify(await getExample({loadComponent},input),null,2)}]}}if(name==="check_usage"){const input=checkUsageInputSchema.parse(args??{});return{content:[{type:"text",text:JSON.stringify(await checkUsage({},input),null,2)}]}}throw new Error(`Unknown tool: ${name}`)});return server}
export async function run():Promise<void>{const server=createServer(),transport=new StdioServerTransport();await server.connect(transport);console.error("[@civaria/mcp] ready — awaiting stdio messages")}
