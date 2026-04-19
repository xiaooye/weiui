import { describe, it, expect } from "vitest";
import { computeDropAction, locateNode } from "../drop-logic";
import { makeNode } from "../tree";

describe("computeDropAction", () => {
  it("center drop on Card inserts as child", () => {
    const card = makeNode("Card");
    const newNode = makeNode("Button", { children: "Hi" });
    const actions = computeDropAction(
      { targetId: card.id, targetParent: null, targetParentList: [card], targetIndex: 0 },
      "center",
      newNode,
      card,
    );
    expect(actions[0]).toMatchObject({ type: "INSERT", parentId: card.id });
  });

  it("center drop on non-container falls through to sibling insert", () => {
    const btn = makeNode("Button");
    const newNode = makeNode("Badge");
    const actions = computeDropAction(
      { targetId: btn.id, targetParent: null, targetParentList: [btn], targetIndex: 0 },
      "center",
      newNode,
      btn,
    );
    // Center on a non-container at root wraps in a Stack (default column when not a row/column edge).
    expect(actions[0].type).toBe("WRAP_WITH");
  });

  it("right-edge drop on node in row-Stack inserts as sibling in Stack", () => {
    const child = makeNode("Button");
    const stack = makeNode("Stack", { direction: "row" });
    stack.children = [child];
    const newNode = makeNode("Button", { children: "Other" });
    const actions = computeDropAction(
      { targetId: child.id, targetParent: stack, targetParentList: stack.children, targetIndex: 0 },
      "right",
      newNode,
      child,
    );
    expect(actions[0]).toMatchObject({ type: "INSERT", parentId: stack.id, index: 1 });
  });

  it("left-edge drop on node in row-Stack inserts as sibling before", () => {
    const child = makeNode("Button");
    const stack = makeNode("Stack", { direction: "row" });
    stack.children = [child];
    const newNode = makeNode("Badge");
    const actions = computeDropAction(
      { targetId: child.id, targetParent: stack, targetParentList: stack.children, targetIndex: 0 },
      "left",
      newNode,
      child,
    );
    expect(actions[0]).toMatchObject({ type: "INSERT", parentId: stack.id, index: 0 });
  });

  it("right-edge drop on root node wraps in Stack(row)", () => {
    const target = makeNode("Button");
    const newNode = makeNode("Badge");
    const actions = computeDropAction(
      { targetId: target.id, targetParent: null, targetParentList: [target], targetIndex: 0 },
      "right",
      newNode,
      target,
    );
    expect(actions[0]).toMatchObject({ type: "WRAP_WITH", wrapperType: "Stack" });
    expect((actions[0] as { wrapperProps: { direction: string } }).wrapperProps).toMatchObject({
      direction: "row",
    });
  });

  it("left-edge drop on root node wraps in Stack(row) with sibling before", () => {
    const target = makeNode("Button");
    const newNode = makeNode("Badge");
    const actions = computeDropAction(
      { targetId: target.id, targetParent: null, targetParentList: [target], targetIndex: 0 },
      "left",
      newNode,
      target,
    );
    expect(actions[0]).toMatchObject({
      type: "WRAP_WITH",
      wrapperType: "Stack",
      siblingBefore: true,
    });
  });

  it("bottom-edge drop on root node wraps in Stack(column)", () => {
    const target = makeNode("Button");
    const newNode = makeNode("Badge");
    const actions = computeDropAction(
      { targetId: target.id, targetParent: null, targetParentList: [target], targetIndex: 0 },
      "bottom",
      newNode,
      target,
    );
    expect(actions[0]).toMatchObject({ type: "WRAP_WITH" });
    expect((actions[0] as { wrapperProps: { direction: string } }).wrapperProps).toMatchObject({
      direction: "column",
    });
  });

  it("top-edge drop on node in column-Stack inserts as sibling before", () => {
    const child = makeNode("Heading");
    const stack = makeNode("Stack", { direction: "column" });
    stack.children = [child];
    const newNode = makeNode("Text");
    const actions = computeDropAction(
      { targetId: child.id, targetParent: stack, targetParentList: stack.children, targetIndex: 0 },
      "top",
      newNode,
      child,
    );
    expect(actions[0]).toMatchObject({ type: "INSERT", parentId: stack.id, index: 0 });
  });

  it("top-edge drop on node in row-Stack wraps (direction mismatch)", () => {
    const child = makeNode("Button");
    const stack = makeNode("Stack", { direction: "row" });
    stack.children = [child];
    const newNode = makeNode("Badge");
    const actions = computeDropAction(
      { targetId: child.id, targetParent: stack, targetParentList: stack.children, targetIndex: 0 },
      "top",
      newNode,
      child,
    );
    expect(actions[0]).toMatchObject({ type: "WRAP_WITH" });
    expect((actions[0] as { wrapperProps: { direction: string } }).wrapperProps).toMatchObject({
      direction: "column",
    });
  });

  it("Stack with no explicit direction defaults to column", () => {
    const child = makeNode("Button");
    const stack = makeNode("Stack");
    stack.children = [child];
    const newNode = makeNode("Badge");
    // Bottom edge + column-stack (default) → simple sibling insert.
    const actions = computeDropAction(
      { targetId: child.id, targetParent: stack, targetParentList: stack.children, targetIndex: 0 },
      "bottom",
      newNode,
      child,
    );
    expect(actions[0]).toMatchObject({ type: "INSERT", parentId: stack.id, index: 1 });
  });
});

describe("locateNode", () => {
  it("finds a root node", () => {
    const a = makeNode("Button");
    const b = makeNode("Badge");
    const ctx = locateNode([a, b], b.id);
    expect(ctx).not.toBeNull();
    expect(ctx!.targetParent).toBeNull();
    expect(ctx!.targetIndex).toBe(1);
    expect(ctx!.targetParentList).toHaveLength(2);
  });

  it("finds a nested node", () => {
    const card = makeNode("Card");
    const btn = makeNode("Button");
    card.children = [btn];
    const ctx = locateNode([card], btn.id);
    expect(ctx).not.toBeNull();
    expect(ctx!.targetParent!.id).toBe(card.id);
    expect(ctx!.targetIndex).toBe(0);
  });

  it("returns null for an unknown id", () => {
    const a = makeNode("Button");
    const ctx = locateNode([a], "missing");
    expect(ctx).toBeNull();
  });
});
