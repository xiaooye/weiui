import type { ComponentNode } from "./tree";
import { depthFirstIds, findPath, findSiblings, findNode } from "./tree-path";

export type NavKey =
  | "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight"
  | "Tab" | "Shift+Tab";

export function nextSelection(
  tree: ComponentNode[],
  currentId: string | null,
  key: NavKey | string,
): string | null {
  if (!currentId) {
    if (["ArrowDown", "ArrowRight", "Tab"].includes(key)) {
      const first = tree[0];
      return first ? first.id : null;
    }
    return null;
  }

  const path = findPath(tree, currentId);
  if (!path) return null;

  switch (key) {
    case "ArrowUp":
    case "ArrowDown": {
      const siblings = findSiblings(tree, currentId);
      const idx = siblings.findIndex((n) => n.id === currentId);
      const next = key === "ArrowUp" ? idx - 1 : idx + 1;
      if (next < 0 || next >= siblings.length) return currentId;
      return siblings[next]!.id;
    }
    case "ArrowLeft":
      return path.parentId ?? currentId;
    case "ArrowRight": {
      const node = findNode(tree, currentId);
      return node?.children[0]?.id ?? currentId;
    }
    case "Tab":
    case "Shift+Tab": {
      const ids = depthFirstIds(tree);
      const pos = ids.indexOf(currentId);
      if (pos < 0) return null;
      const target = key === "Tab" ? pos + 1 : pos - 1;
      if (target < 0 || target >= ids.length) return currentId;
      return ids[target]!;
    }
    default:
      return null;
  }
}

export function keyToNavKey(e: KeyboardEvent): NavKey | null {
  if (e.key === "ArrowUp") return "ArrowUp";
  if (e.key === "ArrowDown") return "ArrowDown";
  if (e.key === "ArrowLeft") return "ArrowLeft";
  if (e.key === "ArrowRight") return "ArrowRight";
  if (e.key === "Tab") return e.shiftKey ? "Shift+Tab" : "Tab";
  return null;
}
