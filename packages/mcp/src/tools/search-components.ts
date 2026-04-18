import type { RegistryIndex } from "../registry-loader.js";

export interface SearchComponentsDeps {
  loadIndex: () => Promise<RegistryIndex>;
}

export interface SearchComponentsInput {
  /** Query string matched against name, description, category. */
  query: string;
  /** Maximum results to return. @default 10 */
  limit?: number;
}

export interface SearchResultEntry {
  name: string;
  category: string;
  description: string;
  url: string;
  score: number;
}

export interface SearchComponentsOutput {
  results: SearchResultEntry[];
}

/**
 * Score-based search over the registry index.
 *
 * Weights: name-exact = 10, name-substring = 5, category-exact = 3,
 * description-substring = 2. Higher wins; entries with score 0 are dropped.
 */
export async function searchComponents(
  deps: SearchComponentsDeps,
  input: SearchComponentsInput,
): Promise<SearchComponentsOutput> {
  const { query, limit = 10 } = input;
  const needle = query.trim().toLowerCase();
  if (!needle) return { results: [] };

  const index = await deps.loadIndex();
  const scored: SearchResultEntry[] = [];

  for (const entry of index.components) {
    const name = entry.name.toLowerCase();
    const description = entry.description.toLowerCase();
    const category = entry.category.toLowerCase();

    let score = 0;
    if (name === needle) score += 10;
    else if (name.includes(needle)) score += 5;
    if (category === needle) score += 3;
    if (description.includes(needle)) score += 2;

    if (score > 0) {
      scored.push({ ...entry, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return { results: scored.slice(0, limit) };
}
