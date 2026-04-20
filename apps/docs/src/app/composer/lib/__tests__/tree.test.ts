import { describe, it, expect } from "vitest";
import {
  INITIAL_TREE,
  makeNode,
  treeReducer,
  type ComponentNode,
  type TreeState,
} from "../tree";

function insert(state: TreeState, parentId: string | null, index: number, node: ComponentNode) {
  return treeReducer(state, { type: "INSERT", parentId, index, node });
}

describe("treeReducer", () => {
  it("INSERT adds a node at the root", () => {
    const a = makeNode("Button");
    const s1 = insert(INITIAL_TREE, null, 0, a);
    expect(s1.tree).toHaveLength(1);
    expect(s1.tree[0]!.id).toBe(a.id);
    expect(s1.tree[0]!.type).toBe("Button");
  });

  it("INSERT respects the target index", () => {
    const a = makeNode("Button");
    const b = makeNode("Input");
    const c = makeNode("Badge");
    let s = insert(INITIAL_TREE, null, 0, a);
    s = insert(s, null, 1, b);
    s = insert(s, null, 1, c);
    expect(s.tree.map((n) => n.type)).toEqual(["Button", "Badge", "Input"]);
  });

  it("INSERT into a nested parent", () => {
    const card = makeNode("Card");
    const btn = makeNode("Button");
    let s = insert(INITIAL_TREE, null, 0, card);
    s = insert(s, card.id, 0, btn);
    expect(s.tree[0]!.children).toHaveLength(1);
    expect(s.tree[0]!.children[0]!.id).toBe(btn.id);
  });

  it("DELETE removes a node at the root", () => {
    const a = makeNode("Button");
    const b = makeNode("Input");
    let s = insert(INITIAL_TREE, null, 0, a);
    s = insert(s, null, 1, b);
    s = treeReducer(s, { type: "DELETE", nodeId: a.id });
    expect(s.tree).toHaveLength(1);
    expect(s.tree[0]!.id).toBe(b.id);
  });

  it("DELETE removes a nested node", () => {
    const card = makeNode("Card");
    const btn = makeNode("Button");
    let s = insert(INITIAL_TREE, null, 0, card);
    s = insert(s, card.id, 0, btn);
    s = treeReducer(s, { type: "DELETE", nodeId: btn.id });
    expect(s.tree[0]!.children).toHaveLength(0);
  });

  it("MOVE relocates a node from root to nested parent", () => {
    const card = makeNode("Card");
    const btn = makeNode("Button");
    let s = insert(INITIAL_TREE, null, 0, card);
    s = insert(s, null, 1, btn);
    s = treeReducer(s, {
      type: "MOVE",
      nodeId: btn.id,
      newParentId: card.id,
      newIndex: 0,
    });
    expect(s.tree).toHaveLength(1);
    expect(s.tree[0]!.children).toHaveLength(1);
    expect(s.tree[0]!.children[0]!.id).toBe(btn.id);
  });

  it("MOVE between two parents", () => {
    const p1 = makeNode("Card");
    const p2 = makeNode("Stack");
    const btn = makeNode("Button");
    let s = insert(INITIAL_TREE, null, 0, p1);
    s = insert(s, null, 1, p2);
    s = insert(s, p1.id, 0, btn);
    s = treeReducer(s, {
      type: "MOVE",
      nodeId: btn.id,
      newParentId: p2.id,
      newIndex: 0,
    });
    expect(s.tree[0]!.children).toHaveLength(0);
    expect(s.tree[1]!.children).toHaveLength(1);
    expect(s.tree[1]!.children[0]!.id).toBe(btn.id);
  });

  it("MOVE is a no-op when node id is unknown", () => {
    const a = makeNode("Button");
    const s = insert(INITIAL_TREE, null, 0, a);
    const next = treeReducer(s, {
      type: "MOVE",
      nodeId: "missing",
      newParentId: null,
      newIndex: 0,
    });
    expect(next).toBe(s);
  });

  it("DUPLICATE produces a clone with a new id inserted after the original", () => {
    const card = makeNode("Card");
    const btn = makeNode("Button");
    let s = insert(INITIAL_TREE, null, 0, card);
    s = insert(s, card.id, 0, btn);
    s = treeReducer(s, { type: "DUPLICATE", nodeId: card.id });
    expect(s.tree).toHaveLength(2);
    const [orig, clone] = s.tree;
    expect(orig!.id).toBe(card.id);
    expect(clone!.id).not.toBe(card.id);
    // nested children should also get new ids
    expect(clone!.children).toHaveLength(1);
    expect(clone!.children[0]!.id).not.toBe(btn.id);
    expect(clone!.children[0]!.type).toBe("Button");
  });

  it("UPDATE_PROPS replaces props on the target node", () => {
    const btn = makeNode("Button", { variant: "solid" });
    let s = insert(INITIAL_TREE, null, 0, btn);
    s = treeReducer(s, {
      type: "UPDATE_PROPS",
      nodeId: btn.id,
      props: { variant: "outline", size: "sm" },
    });
    expect(s.tree[0]!.props).toEqual({ variant: "outline", size: "sm" });
  });

  it("UPDATE_TEXT updates the text on the target node", () => {
    const btn = makeNode("Button", {}, "Hello");
    let s = insert(INITIAL_TREE, null, 0, btn);
    s = treeReducer(s, { type: "UPDATE_TEXT", nodeId: btn.id, text: "World" });
    expect(s.tree[0]!.text).toBe("World");
  });

  it("UNDO/REDO round-trips INSERT", () => {
    const a = makeNode("Button");
    const s1 = insert(INITIAL_TREE, null, 0, a);
    const s2 = treeReducer(s1, { type: "UNDO" });
    expect(s2.tree).toEqual([]);
    const s3 = treeReducer(s2, { type: "REDO" });
    expect(s3.tree).toHaveLength(1);
    expect(s3.tree[0]!.id).toBe(a.id);
  });

  it("UNDO is a no-op with empty past", () => {
    const next = treeReducer(INITIAL_TREE, { type: "UNDO" });
    expect(next).toBe(INITIAL_TREE);
  });

  it("REDO is a no-op with empty future", () => {
    const a = makeNode("Button");
    const s1 = insert(INITIAL_TREE, null, 0, a);
    const next = treeReducer(s1, { type: "REDO" });
    expect(next).toBe(s1);
  });

  it("a new action clears the redo future", () => {
    const a = makeNode("Button");
    const b = makeNode("Input");
    let s = insert(INITIAL_TREE, null, 0, a);
    s = treeReducer(s, { type: "UNDO" });
    expect(s.future).toHaveLength(1);
    s = insert(s, null, 0, b);
    expect(s.future).toHaveLength(0);
  });

  it("LOAD replaces the tree and keeps undoable history", () => {
    const a = makeNode("Button");
    const loaded = [a];
    const s = treeReducer(INITIAL_TREE, { type: "LOAD", tree: loaded });
    expect(s.tree).toBe(loaded);
    const undone = treeReducer(s, { type: "UNDO" });
    expect(undone.tree).toEqual([]);
  });

  it("makeNode assigns unique ids", () => {
    const a = makeNode("Button");
    const b = makeNode("Button");
    expect(a.id).not.toBe(b.id);
  });

  it("WRAP_WITH wraps target at root with sibling after", () => {
    const target = makeNode("Button");
    const sibling = makeNode("Badge");
    const s = insert(INITIAL_TREE, null, 0, target);
    const next = treeReducer(s, {
      type: "WRAP_WITH",
      nodeId: target.id,
      wrapperType: "Stack",
      wrapperProps: { direction: "row", gap: 3 },
      siblingNode: sibling,
      siblingBefore: false,
    });
    expect(next.tree).toHaveLength(1);
    const wrapper = next.tree[0]!;
    expect(wrapper.type).toBe("Stack");
    expect(wrapper.props).toEqual({ direction: "row", gap: 3 });
    expect(wrapper.children).toHaveLength(2);
    expect(wrapper.children[0]!.id).toBe(target.id);
    expect(wrapper.children[1]!.id).toBe(sibling.id);
  });

  it("WRAP_WITH places sibling before when siblingBefore=true", () => {
    const target = makeNode("Heading");
    const sibling = makeNode("Text");
    const s = insert(INITIAL_TREE, null, 0, target);
    const next = treeReducer(s, {
      type: "WRAP_WITH",
      nodeId: target.id,
      wrapperType: "Stack",
      wrapperProps: { direction: "column" },
      siblingNode: sibling,
      siblingBefore: true,
    });
    const wrapper = next.tree[0]!;
    expect(wrapper.children[0]!.id).toBe(sibling.id);
    expect(wrapper.children[1]!.id).toBe(target.id);
  });

  it("WRAP_WITH preserves position in a nested parent", () => {
    const card = makeNode("Card");
    const a = makeNode("Button");
    const b = makeNode("Input");
    const c = makeNode("Badge");
    let s = insert(INITIAL_TREE, null, 0, card);
    s = insert(s, card.id, 0, a);
    s = insert(s, card.id, 1, b);
    s = insert(s, card.id, 2, c);
    const sibling = makeNode("Divider");
    const next = treeReducer(s, {
      type: "WRAP_WITH",
      nodeId: b.id,
      wrapperType: "Stack",
      wrapperProps: { direction: "row" },
      siblingNode: sibling,
      siblingBefore: false,
    });
    const children = next.tree[0]!.children;
    expect(children).toHaveLength(3);
    expect(children[0]!.id).toBe(a.id);
    expect(children[1]!.type).toBe("Stack");
    expect(children[1]!.children[0]!.id).toBe(b.id);
    expect(children[1]!.children[1]!.id).toBe(sibling.id);
    expect(children[2]!.id).toBe(c.id);
  });

  it("WRAP_SINGLE wraps target in a new parent without adding a sibling", () => {
    const btn = makeNode("Button");
    const inserted = treeReducer(INITIAL_TREE, {
      type: "INSERT",
      parentId: null,
      index: 0,
      node: btn,
    });
    const wrapped = treeReducer(inserted, {
      type: "WRAP_SINGLE",
      nodeId: btn.id,
      wrapperType: "Card",
      wrapperProps: { padding: 4 },
    });
    expect(wrapped.tree).toHaveLength(1);
    expect(wrapped.tree[0]!.type).toBe("Card");
    expect(wrapped.tree[0]!.props).toEqual({ padding: 4 });
    expect(wrapped.tree[0]!.children).toHaveLength(1);
    expect(wrapped.tree[0]!.children[0]!.id).toBe(btn.id);
  });

  it("WRAP_SINGLE preserves position when wrapping a nested node", () => {
    const btn1 = makeNode("Button");
    const btn2 = makeNode("Button");
    const stack = makeNode("Stack");
    stack.children = [btn1, btn2];
    const s = treeReducer(INITIAL_TREE, { type: "INSERT", parentId: null, index: 0, node: stack });
    const wrapped = treeReducer(s, {
      type: "WRAP_SINGLE",
      nodeId: btn2.id,
      wrapperType: "Card",
      wrapperProps: {},
    });
    const stackInTree = wrapped.tree[0]!;
    expect(stackInTree.children).toHaveLength(2);
    expect(stackInTree.children[0]!.id).toBe(btn1.id);
    expect(stackInTree.children[1]!.type).toBe("Card");
    expect(stackInTree.children[1]!.children[0]!.id).toBe(btn2.id);
  });

  it("WRAP_WITH is a no-op when target id is unknown", () => {
    const a = makeNode("Button");
    const s = insert(INITIAL_TREE, null, 0, a);
    const sibling = makeNode("Badge");
    const next = treeReducer(s, {
      type: "WRAP_WITH",
      nodeId: "missing",
      wrapperType: "Stack",
      wrapperProps: {},
      siblingNode: sibling,
      siblingBefore: false,
    });
    expect(next).toBe(s);
  });
});
