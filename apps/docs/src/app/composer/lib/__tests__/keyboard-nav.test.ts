import { describe, it, expect } from "vitest";
import { nextSelection } from "../keyboard-nav";
import { makeNode } from "../tree";

const btn1 = makeNode("Button", {}, "A");
const btn2 = makeNode("Button", {}, "B");
const btn3 = makeNode("Button", {}, "C");
const stack = makeNode("Stack");
stack.children = [btn1, btn2, btn3];
const tree = [stack];

describe("nextSelection", () => {
  it("ArrowDown moves to next sibling", () => {
    expect(nextSelection(tree, btn1.id, "ArrowDown")).toBe(btn2.id);
    expect(nextSelection(tree, btn2.id, "ArrowDown")).toBe(btn3.id);
  });

  it("ArrowUp moves to prev sibling", () => {
    expect(nextSelection(tree, btn2.id, "ArrowUp")).toBe(btn1.id);
  });

  it("ArrowDown at last sibling stays", () => {
    expect(nextSelection(tree, btn3.id, "ArrowDown")).toBe(btn3.id);
  });

  it("ArrowLeft selects parent", () => {
    expect(nextSelection(tree, btn2.id, "ArrowLeft")).toBe(stack.id);
  });

  it("ArrowRight selects first child", () => {
    expect(nextSelection(tree, stack.id, "ArrowRight")).toBe(btn1.id);
  });

  it("Tab walks depth-first forward", () => {
    expect(nextSelection(tree, stack.id, "Tab")).toBe(btn1.id);
    expect(nextSelection(tree, btn3.id, "Tab")).toBe(btn3.id);
  });

  it("Shift+Tab walks depth-first back", () => {
    expect(nextSelection(tree, btn1.id, "Shift+Tab")).toBe(stack.id);
  });

  it("returns null for unknown key", () => {
    expect(nextSelection(tree, btn1.id, "Foo")).toBeNull();
  });
});
