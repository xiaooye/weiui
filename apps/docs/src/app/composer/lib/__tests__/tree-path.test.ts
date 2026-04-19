import { describe, it, expect } from "vitest";
import { findNode, findAncestors, findPath, findSiblings } from "../tree-path";
import { makeNode } from "../tree";

const root = makeNode("Card");
const child1 = makeNode("Heading", {}, "Hi");
const child2 = makeNode("Button", {}, "Click");
root.children = [child1, child2];

describe("tree-path", () => {
  it("findNode returns matching node or null", () => {
    expect(findNode([root], child1.id)).toBe(child1);
    expect(findNode([root], "nope")).toBeNull();
  });

  it("findAncestors returns root-to-node path", () => {
    const path = findAncestors([root], child2.id);
    expect(path.map((n) => n.type)).toEqual(["Card", "Button"]);
  });

  it("findPath returns parentId + index", () => {
    const p = findPath([root], child2.id);
    expect(p).toEqual({ parentId: root.id, index: 1 });
  });

  it("findSiblings returns the list that contains the node", () => {
    expect(findSiblings([root], child1.id)).toEqual([child1, child2]);
    expect(findSiblings([root], root.id)).toEqual([root]);
  });
});
