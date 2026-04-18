import { describe, it, expect } from "vitest";
import { getComponent } from "../tools/get-component.js";
import type { RegistryComponentSchema } from "../registry-loader.js";

const buttonRecord: RegistryComponentSchema = {
  name: "Button",
  category: "form",
  description: "Triggers an action.",
  importPath: "@weiui/react",
  subpathImport: null,
  dependencies: ["@weiui/react"],
  props: [
    { name: "variant", type: "'solid' | 'outline'", description: "Visual treatment." },
  ],
  compound: [],
  examples: [{ label: "Basic", code: "<Button>Go</Button>" }],
  accessibility: ["Minimum 44x44px touch target"],
};

describe("getComponent tool", () => {
  it("returns the full schema for a known component", async () => {
    const loadComponent = async (name: string) => {
      if (name === "Button") return buttonRecord;
      throw new Error(`Unknown component: ${name}`);
    };
    const result = await getComponent({ loadComponent }, { name: "Button" });
    expect(result.name).toBe("Button");
    expect(result.props).toHaveLength(1);
    expect(result.examples[0]?.label).toBe("Basic");
  });

  it("rejects for an unknown component", async () => {
    const loadComponent = async (name: string) => {
      throw new Error(`Unknown component: ${name}`);
    };
    await expect(
      getComponent({ loadComponent }, { name: "Nope" }),
    ).rejects.toThrow(/Unknown component/);
  });
});
