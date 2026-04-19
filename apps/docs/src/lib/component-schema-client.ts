export type { PropSchema, ComponentSchema } from "./component-schema-loader";

import type { ComponentSchema } from "./component-schema-loader";

export async function fetchAllSchemas(): Promise<ComponentSchema[]> {
  const index = await fetch("/registry/index.json").then((r) => r.json());
  const names = (index.components as Array<{ name: string }>).map((c) => c.name);
  const schemas = await Promise.all(
    names.map((n) => fetch(`/registry/${n}.json`).then((r) => r.json())),
  );
  return schemas;
}

export async function fetchSchema(name: string): Promise<ComponentSchema> {
  return fetch(`/registry/${name}.json`).then((r) => r.json());
}
