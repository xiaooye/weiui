import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface PropSchema {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}

export interface ComponentSchema {
  name: string;
  category: string;
  description: string;
  importPath: string;
  subpathImport: string | null;
  dependencies: string[];
  props: PropSchema[];
  compound: string[];
  examples: Array<{ label: string; code: string }>;
  accessibility: string[];
}

function registryDir(): string {
  const candidates = [
    join(process.cwd(), "public/registry"),
    join(process.cwd(), "apps/docs/public/registry"),
    join(process.cwd(), "..", "public/registry"),
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  throw new Error("component registry not found; run `pnpm --filter @weiui/docs build` first");
}

export function loadAllSchemas(): ComponentSchema[] {
  const dir = registryDir();
  const files = readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "index.json");
  return files.map((f) => JSON.parse(readFileSync(join(dir, f), "utf-8")) as ComponentSchema);
}

export function loadSchemaByName(name: string): ComponentSchema | null {
  const dir = registryDir();
  const file = join(dir, `${name}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf-8")) as ComponentSchema;
}
