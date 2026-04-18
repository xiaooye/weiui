import { describe, it, expect } from "vitest";
import { listComponents } from "../tools/list-components.js";
import type { RegistryIndex } from "../registry-loader.js";

const mockIndex: RegistryIndex = {
  components: [
    { name: "Button", category: "form", description: "Buttons", url: "url" },
    { name: "Dialog", category: "overlay", description: "Dialogs", url: "url" },
    { name: "Input", category: "form", description: "Inputs", url: "url" },
  ],
  generatedAt: "2026-04-18",
  version: "0.0.1",
};

describe("listComponents tool", () => {
  it("returns all components when no category filter", async () => {
    const result = await listComponents({ loadIndex: async () => mockIndex }, {});
    expect(result.components).toHaveLength(3);
  });

  it("filters by category", async () => {
    const result = await listComponents(
      { loadIndex: async () => mockIndex },
      { category: "form" },
    );
    expect(result.components).toHaveLength(2);
    expect(result.components.every((c) => c.category === "form")).toBe(true);
  });
});
