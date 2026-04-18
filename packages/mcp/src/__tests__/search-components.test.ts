import { describe, it, expect } from "vitest";
import { searchComponents } from "../tools/search-components.js";
import type { RegistryIndex } from "../registry-loader.js";

const mockIndex: RegistryIndex = {
  components: [
    {
      name: "Button",
      category: "form",
      description: "Triggers an action.",
      url: "url",
    },
    {
      name: "ButtonGroup",
      category: "form",
      description: "Groups related buttons together.",
      url: "url",
    },
    {
      name: "Dialog",
      category: "overlay",
      description: "Modal dialog with actions.",
      url: "url",
    },
    {
      name: "Input",
      category: "form",
      description: "Text input field for capturing user action input.",
      url: "url",
    },
    {
      name: "Card",
      category: "display",
      description: "Surface primitive.",
      url: "url",
    },
  ],
  generatedAt: "2026-04-18",
  version: "0.0.1",
};

const deps = { loadIndex: async () => mockIndex };

describe("searchComponents tool", () => {
  it("returns exact-name match first", async () => {
    const result = await searchComponents(deps, { query: "Button" });
    expect(result.results[0]?.name).toBe("Button");
    // ButtonGroup has substring match, but lower score
    expect(result.results[0]!.score).toBeGreaterThan(result.results[1]!.score);
  });

  it("matches by description keyword", async () => {
    const result = await searchComponents(deps, { query: "modal" });
    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.name).toBe("Dialog");
  });

  it("matches by category", async () => {
    const result = await searchComponents(deps, { query: "form" });
    const names = result.results.map((r) => r.name);
    expect(names).toContain("Button");
    expect(names).toContain("ButtonGroup");
    expect(names).toContain("Input");
    expect(names).not.toContain("Dialog");
  });

  it("sorts by score descending", async () => {
    const result = await searchComponents(deps, { query: "button" });
    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i - 1]!.score).toBeGreaterThanOrEqual(
        result.results[i]!.score,
      );
    }
  });

  it("honours the limit", async () => {
    const result = await searchComponents(deps, { query: "form", limit: 2 });
    expect(result.results).toHaveLength(2);
  });

  it("returns empty for no match", async () => {
    const result = await searchComponents(deps, { query: "xyzzy" });
    expect(result.results).toHaveLength(0);
  });
});
