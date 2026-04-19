import { describe, it, expect } from "vitest";
import { generateCode, makeSchemaResolver, type ImportResolver } from "../generate-code";
import { makeNode, type ComponentNode } from "../tree";

const mainBarrel: ImportResolver = {
  resolveImport: () => "@weiui/react",
};

describe("generateCode — jsx", () => {
  it("walks a simple tree and emits correct imports", () => {
    const tree: ComponentNode[] = [
      { ...makeNode("Card"), children: [
        { ...makeNode("Button"), text: "Click" },
      ] },
    ];
    const out = generateCode(tree, mainBarrel, { target: "jsx" });
    expect(out).toContain('import { Button, Card } from "@weiui/react";');
    expect(out).toContain("<Card>");
    expect(out).toContain("<Button>Click</Button>");
    expect(out).toContain("</Card>");
  });

  it("uses subpath import when resolver returns a subpath", () => {
    const resolver = makeSchemaResolver([
      { name: "Editor", importPath: "@weiui/react/editor", subpathImport: "@weiui/react/editor" },
      { name: "Card", importPath: "@weiui/react", subpathImport: null },
    ]);
    const tree: ComponentNode[] = [
      { ...makeNode("Card"), children: [
        makeNode("Editor"),
      ] },
    ];
    const out = generateCode(tree, resolver, { target: "jsx" });
    expect(out).toContain('import { Card } from "@weiui/react";');
    expect(out).toContain('import { Editor } from "@weiui/react/editor";');
    // Main barrel import must come first.
    const mainIdx = out.indexOf("@weiui/react\"");
    const subIdx = out.indexOf("@weiui/react/editor");
    expect(mainIdx).toBeLessThan(subIdx);
  });

  it("serializes string props quoted and number/boolean wrapped in braces", () => {
    const tree: ComponentNode[] = [
      makeNode("Button", { variant: "solid", disabled: true, level: 2 }, "Go"),
    ];
    const out = generateCode(tree, mainBarrel, { target: "jsx", includeImports: false });
    expect(out).toContain('variant="solid"');
    expect(out).toContain("disabled={true}");
    expect(out).toContain("level={2}");
  });

  it("omits undefined / null / empty-string props", () => {
    const tree: ComponentNode[] = [
      makeNode("Input", { placeholder: "", label: undefined, ariaLabel: null as unknown as string }),
    ];
    const out = generateCode(tree, mainBarrel, { target: "jsx", includeImports: false });
    expect(out).not.toContain("placeholder");
    expect(out).not.toContain("label=");
    expect(out).not.toContain("ariaLabel");
  });

  it("filters out the `children` prop (derived from node.children/text)", () => {
    const tree: ComponentNode[] = [
      makeNode("Button", { children: "Should not appear" }, "Real text"),
    ];
    const out = generateCode(tree, mainBarrel, { target: "jsx", includeImports: false });
    expect(out).not.toContain('children="Should not appear"');
    expect(out).toContain("Real text");
  });

  it("self-closes nodes with no children and no text", () => {
    const tree: ComponentNode[] = [makeNode("Divider")];
    const out = generateCode(tree, mainBarrel, { target: "jsx", includeImports: false });
    expect(out).toContain("<Divider />");
  });

  it("componentWrap emits `export default function Composition`", () => {
    const tree: ComponentNode[] = [makeNode("Button", {}, "Ok")];
    const out = generateCode(tree, mainBarrel, { target: "tsx", componentWrap: true });
    expect(out).toContain('import { Button } from "@weiui/react";');
    expect(out).toContain("export default function Composition()");
    expect(out).toContain("return (");
    expect(out).toContain("<Button>Ok</Button>");
  });

  it("honours includeImports=false", () => {
    const tree: ComponentNode[] = [makeNode("Button", {}, "Go")];
    const out = generateCode(tree, mainBarrel, { target: "jsx", includeImports: false });
    expect(out).not.toContain("import");
    expect(out).toContain("<Button>Go</Button>");
  });

  it("indents nested children with 2 spaces per depth", () => {
    const tree: ComponentNode[] = [
      { ...makeNode("Card"), children: [
        { ...makeNode("Stack"), children: [
          { ...makeNode("Button"), text: "Inner" },
        ] },
      ] },
    ];
    const out = generateCode(tree, mainBarrel, { target: "jsx", includeImports: false });
    expect(out).toMatch(/\n {2}<Stack>/);
    expect(out).toMatch(/\n {4}<Button>Inner<\/Button>/);
  });
});

describe("generateCode — html", () => {
  it("outputs a full <!DOCTYPE html> with stylesheet link", () => {
    const tree: ComponentNode[] = [makeNode("Button", { variant: "solid" }, "Go")];
    const out = generateCode(tree, mainBarrel, { target: "html" });
    expect(out).toContain("<!DOCTYPE html>");
    expect(out).toContain('<link rel="stylesheet" href="https://weiui.dev/weiui.min.css"');
    expect(out).toContain('<button class="wui-button wui-button--solid">Go</button>');
  });

  it("adds Stack direction modifier class", () => {
    const tree: ComponentNode[] = [
      makeNode("Stack", { direction: "row" }),
    ];
    const out = generateCode(tree, mainBarrel, { target: "html" });
    expect(out).toContain("wui-stack--row");
  });

  it("emits comment placeholder for components without HTML equivalent", () => {
    const tree: ComponentNode[] = [makeNode("Editor")];
    const out = generateCode(tree, mainBarrel, { target: "html" });
    expect(out).toContain("<!-- Editor: no plain-HTML equivalent");
  });

  it("renders <hr /> void tag for Divider", () => {
    const tree: ComponentNode[] = [makeNode("Divider")];
    const out = generateCode(tree, mainBarrel, { target: "html" });
    expect(out).toContain("<hr");
  });
});

describe("makeSchemaResolver", () => {
  it("returns subpathImport when present, else importPath, else main barrel", () => {
    const r = makeSchemaResolver([
      { name: "DataTable", importPath: "@weiui/react/data-table", subpathImport: "@weiui/react/data-table" },
      { name: "Button", importPath: "@weiui/react", subpathImport: null },
    ]);
    expect(r.resolveImport("DataTable")).toBe("@weiui/react/data-table");
    expect(r.resolveImport("Button")).toBe("@weiui/react");
    expect(r.resolveImport("Unknown")).toBe("@weiui/react");
  });
});
