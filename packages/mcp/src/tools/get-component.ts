import type { RegistryComponentSchema } from "../registry-loader.js";

export interface GetComponentDeps {
  loadComponent: (name: string) => Promise<RegistryComponentSchema>;
}

export interface GetComponentInput {
  /** PascalCase component name. */
  name: string;
}

export type GetComponentOutput = RegistryComponentSchema;

/**
 * Fetch the full registry record for a single component.
 */
export async function getComponent(
  deps: GetComponentDeps,
  input: GetComponentInput,
): Promise<GetComponentOutput> {
  return deps.loadComponent(input.name);
}
