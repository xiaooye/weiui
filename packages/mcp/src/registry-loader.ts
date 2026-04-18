/**
 * Registry loader for the @weiui/mcp server.
 *
 * Types are declared locally (rather than imported from `@weiui/docs`) so
 * the package stands alone when published. They mirror the schema emitted
 * by `apps/docs/scripts/build-registry.ts`.
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** One row in a component's props table. */
export interface RegistryPropSchema {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}

/** One code sample pulled from the component's MDX page. */
export interface RegistryExampleSchema {
  label: string;
  code: string;
}

/** Full per-component record. */
export interface RegistryComponentSchema {
  name: string;
  category: string;
  description: string;
  importPath: string;
  subpathImport: string | null;
  dependencies: string[];
  props: RegistryPropSchema[];
  compound: string[];
  examples: RegistryExampleSchema[];
  accessibility: string[];
}

/** Summary record emitted as `index.json`. */
export interface RegistryIndex {
  components: Array<{
    name: string;
    category: string;
    description: string;
    url: string;
  }>;
  generatedAt: string;
  version: string;
}

const REMOTE_BASE = "https://weiui.dev/registry";

function defaultRegistryDir(): string {
  // Explicit override for tests/dev environments where no local registry
  // has been bundled into `node_modules/@weiui/mcp/registry/`.
  if (process.env.WEIUI_MCP_REGISTRY_DIR) {
    return process.env.WEIUI_MCP_REGISTRY_DIR;
  }
  // `dist/registry-loader.js` → `dist/../registry` == `packages/mcp/registry`
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "..", "registry");
}

async function readLocalJson<T>(path: string): Promise<T | null> {
  if (!existsSync(path)) return null;
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as T;
}

async function fetchRemoteJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`[@weiui/mcp] failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/**
 * Returns a function that loads the registry index, trying a local registry
 * dir first and falling back to the remote docs site.
 */
export function defaultLoadIndex(registryDir?: string): () => Promise<RegistryIndex> {
  const dir = registryDir ?? defaultRegistryDir();
  return async () => {
    const local = await readLocalJson<RegistryIndex>(join(dir, "index.json"));
    if (local) return local;
    return fetchRemoteJson<RegistryIndex>(`${REMOTE_BASE}/index.json`);
  };
}

/**
 * Returns a function that loads a single component's full schema. Local
 * registry dir is tried first, with a network fallback.
 */
export function defaultLoadComponent(
  registryDir?: string,
): (name: string) => Promise<RegistryComponentSchema> {
  const dir = registryDir ?? defaultRegistryDir();
  return async (name: string) => {
    const local = await readLocalJson<RegistryComponentSchema>(join(dir, `${name}.json`));
    if (local) return local;
    return fetchRemoteJson<RegistryComponentSchema>(`${REMOTE_BASE}/${name}.json`);
  };
}
