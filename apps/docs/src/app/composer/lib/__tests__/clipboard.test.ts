import { describe, it, expect } from "vitest";
import { serialiseNodes, deserialiseNodes, remapIds } from "../clipboard";
import { makeNode } from "../tree";

describe("clipboard", () => {
  it("serialise + deserialise round-trips the shape", () => {
    const card = makeNode("Card");
    const btn = makeNode("Button", { variant: "solid" }, "Save");
    card.children = [btn];
    const json = serialiseNodes([card]);
    const restored = deserialiseNodes(json);
    expect(restored).toHaveLength(1);
    expect(restored[0]!.type).toBe("Card");
    expect(restored[0]!.children[0]!.type).toBe("Button");
    expect(restored[0]!.children[0]!.props).toEqual({ variant: "solid" });
  });

  it("remapIds assigns fresh ids recursively", () => {
    const card = makeNode("Card");
    const btn = makeNode("Button");
    card.children = [btn];
    const clone = remapIds([card])[0]!;
    expect(clone.id).not.toBe(card.id);
    expect(clone.children[0]!.id).not.toBe(btn.id);
  });

  it("deserialise rejects malformed JSON", () => {
    expect(deserialiseNodes("not json")).toEqual([]);
    expect(deserialiseNodes('{"foo":1}')).toEqual([]);
  });
});
