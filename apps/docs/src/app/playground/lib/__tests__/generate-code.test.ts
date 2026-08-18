import { describe, it, expect } from "vitest";
import { generateCode } from "../generate-code";

describe("generateCode", () => {
  it("emits import and JSX for a main-barrel component", () => {
    const out = generateCode(
      {
        component: "Button",
        props: { variant: "solid", children: "Save" },
        importPath: "civaria",
        subpathImport: null,
      },
      { target: "jsx", includeImports: true },
    );
    expect(out).toMatch(/import \{ Button \} from "civaria";/);
    expect(out).toMatch(/<Button variant="solid">Save<\/Button>/);
  });

  it("uses subpath import for heavy components", () => {
    const out = generateCode(
      {
        component: "Editor",
        props: {},
        importPath: "civaria/editor",
        subpathImport: "civaria/editor",
      },
      { target: "jsx", includeImports: true },
    );
    expect(out).toMatch(/import \{ Editor \} from "civaria\/editor";/);
  });

  it("serializes booleans and numbers correctly", () => {
    const out = generateCode(
      {
        component: "Slider",
        props: { value: 50, disabled: true },
        importPath: "civaria",
        subpathImport: null,
      },
      { target: "jsx", includeImports: false },
    );
    expect(out).toMatch(/value=\{50\}/);
    expect(out).toMatch(/disabled=\{true\}/);
  });

  it("wraps in componentWrap mode", () => {
    const out = generateCode(
      {
        component: "Button",
        props: { children: "Hi" },
        importPath: "civaria",
        subpathImport: null,
      },
      { target: "tsx", includeImports: true, componentWrap: true },
    );
    expect(out).toMatch(/export default function/);
    expect(out).toMatch(/<Button>Hi<\/Button>/);
  });
});
