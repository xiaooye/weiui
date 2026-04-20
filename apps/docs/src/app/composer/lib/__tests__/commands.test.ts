import { beforeEach, describe, it, expect, vi } from "vitest";
import { buildCommands, noteCommandUsed } from "../commands";
import { makeNode } from "../tree";
import { PALETTE_ITEMS } from "../component-tree";

// Node 25's built-in stub localStorage lacks methods — install a real in-memory shim
function installLocalStorage() {
  const store = new Map<string, string>();
  const shim = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
  vi.stubGlobal("localStorage", shim);
  Object.defineProperty(window, "localStorage", {
    value: shim,
    configurable: true,
    writable: true,
  });
}

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

describe("buildCommands recents", () => {
  beforeEach(() => {
    installLocalStorage();
    localStorage.clear();
  });

  it("promotes notedCommand ids to a Recent group", () => {
    const dispatch = {
      insertAtRoot: () => {}, deleteSelected: () => {}, duplicate: () => {},
      wrap: () => {}, loadTemplate: () => {}, selectParent: () => {},
      setPreview: () => {}, copy: () => {}, paste: () => {},
    };
    const tree = [makeNode("Card")];
    // No recents yet — groups don't include Recent
    let cmds = buildCommands({ tree, selection: { primary: null, all: new Set() }, dispatch });
    expect(cmds.some((c) => c.group === "Recent")).toBe(false);
    // Note an Add command
    noteCommandUsed("add-Button");
    cmds = buildCommands({ tree, selection: { primary: null, all: new Set() }, dispatch });
    const recents = cmds.filter((c) => c.group === "Recent");
    expect(recents).toHaveLength(1);
    expect(recents[0]!.id).toBe("add-Button");
    // Recent should be FIRST in the list
    expect(cmds[0]!.id).toBe("add-Button");
  });
});
