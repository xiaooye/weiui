import { describe, it, expect } from "vitest";
import { buildCommands } from "../commands";
import { makeNode } from "../tree";
import { PALETTE_ITEMS } from "../component-tree";

const dispatch = {
  insertAtRoot: () => {},
  deleteSelected: () => {},
  duplicate: () => {},
  wrap: () => {},
  loadTemplate: () => {},
  selectParent: () => {},
  setPreview: () => {},
  copy: () => {},
  paste: () => {},
};
const tree = [makeNode("Card")];

describe("buildCommands", () => {
  it("produces one Add command per PALETTE_ITEM", () => {
    const cmds = buildCommands({ tree, selection: { primary: null, all: new Set() }, dispatch });
    const adds = cmds.filter((c) => c.group === "Add");
    expect(adds).toHaveLength(PALETTE_ITEMS.length);
    expect(adds.some((c) => c.label === "Add Button")).toBe(true);
  });

  it("omits Edit commands when nothing is selected", () => {
    const cmds = buildCommands({ tree, selection: { primary: null, all: new Set() }, dispatch });
    expect(cmds.some((c) => c.group === "Edit")).toBe(false);
  });

  it("includes Edit commands when a node is selected", () => {
    const cmds = buildCommands({
      tree,
      selection: { primary: tree[0]!.id, all: new Set([tree[0]!.id]) },
      dispatch,
    });
    const edit = cmds.filter((c) => c.group === "Edit");
    expect(edit.some((c) => c.label === "Delete selection")).toBe(true);
    expect(edit.some((c) => c.label === "Duplicate selection")).toBe(true);
  });

  it("View commands include preview toggle", () => {
    const cmds = buildCommands({ tree, selection: { primary: null, all: new Set() }, dispatch });
    expect(cmds.some((c) => c.group === "View" && c.label.includes("preview"))).toBe(true);
  });
});
