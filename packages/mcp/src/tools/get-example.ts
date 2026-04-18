import type {
  RegistryComponentSchema,
  RegistryExampleSchema,
} from "../registry-loader.js";

export interface GetExampleDeps {
  loadComponent: (name: string) => Promise<RegistryComponentSchema>;
}

export interface GetExampleInput {
  /** PascalCase component name. */
  name: string;
  /** Example label to match (case-insensitive). First example when omitted. */
  variant?: string;
}

export interface GetExampleOutput {
  example: RegistryExampleSchema | null;
}

/**
 * Return a single canonical example for a component. With no `variant`,
 * the first example is returned; otherwise the first example whose label
 * matches (case-insensitive) is chosen.
 */
export async function getExample(
  deps: GetExampleDeps,
  input: GetExampleInput,
): Promise<GetExampleOutput> {
  const component = await deps.loadComponent(input.name);
  const examples = component.examples ?? [];
  if (examples.length === 0) return { example: null };

  if (!input.variant) {
    return { example: examples[0] ?? null };
  }

  const needle = input.variant.toLowerCase();
  const match = examples.find((e) => e.label.toLowerCase() === needle);
  return { example: match ?? null };
}
