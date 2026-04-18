import type { RegistryIndex } from "../registry-loader.js";

export interface ListComponentsDeps {
  loadIndex: () => Promise<RegistryIndex>;
}

export interface ListComponentsInput {
  /** Optional category filter (e.g. "form", "overlay"). */
  category?: string;
}

export interface ListComponentsOutput {
  components: RegistryIndex["components"];
}

/**
 * List all known WeiUI components, optionally filtered by category.
 */
export async function listComponents(
  deps: ListComponentsDeps,
  input: ListComponentsInput,
): Promise<ListComponentsOutput> {
  const index = await deps.loadIndex();
  const components = input.category
    ? index.components.filter((c) => c.category === input.category)
    : index.components;
  return { components };
}
