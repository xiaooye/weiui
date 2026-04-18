import { describe, it, expect } from "vitest";
import { getExample } from "../tools/get-example.js";
import type { RegistryComponentSchema } from "../registry-loader.js";

const buttonRecord: RegistryComponentSchema = {
  name: "Button",
  category: "form",
  description: "Triggers an action.",
  importPath: "@weiui/react",
  subpathImport: null,
  dependencies: ["@weiui/react"],
  props: [],
  compound: [],
  examples: [
    { label: "Basic", code: "<Button>Go</Button>" },
    { label: "Loading", code: "<Button loading>Saving…</Button>" },
  ],
  accessibility: [],
};

const emptyRecord: RegistryComponentSchema = {
  ...buttonRecord,
  name: "Empty",
  examples: [],
};

describe("getExample tool", () => {
  it("returns the first example when no variant is passed", async () => {
    const loadComponent = async () => buttonRecord;
    const result = await getExample({ loadComponent }, { name: "Button" });
    expect(result.example?.label).toBe("Basic");
  });

  it("returns the matching example when variant is passed", async () => {
    const loadComponent = async () => buttonRecord;
    const result = await getExample(
      { loadComponent },
      { name: "Button", variant: "Loading" },
    );
    expect(result.example?.label).toBe("Loading");
  });

  it("returns null when the variant label does not match", async () => {
    const loadComponent = async () => buttonRecord;
    const result = await getExample(
      { loadComponent },
      { name: "Button", variant: "Nope" },
    );
    expect(result.example).toBeNull();
  });

  it("returns null when the component has no examples", async () => {
    const loadComponent = async () => emptyRecord;
    const result = await getExample({ loadComponent }, { name: "Empty" });
    expect(result.example).toBeNull();
  });
});
