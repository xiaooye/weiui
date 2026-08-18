import { describe, expect, it } from "vitest";
import { generateWeiRuntimeCode, toWeiAst } from "../wei-ast";
const tree = [{ id: "1", type: "Button", props: { variant: "solid" }, children: [], text: "Save" }];
describe("framework-neutral Composer AST", () => {
  it("does not encode JSX in the canonical tree", () => { expect(toWeiAst(tree)).toEqual([{ type: "component", component: "Button", props: { variant: "solid" }, children: [{ type: "text", value: "Save" }] }]); });
  it.each(["react", "vue", "solid", "svelte", "elements"] as const)("generates %s from the same semantic node", (target) => { const code = generateWeiRuntimeCode(tree, target); expect(code).toContain(target === "elements" ? "wui-button" : "Button"); });
  it("marks unsupported runtime targets", () => { expect(generateWeiRuntimeCode([{ id: "2", type: "Editor", props: {}, children: [], text: "" }], "vue")).toContain("not available"); });
});
