import type { ComponentNode } from "./tree";

export function findNode(tree: ComponentNode[], id: string): ComponentNode | null {
  for (const n of tree) {
    if (n.id === id) return n;
    const inner = findNode(n.children, id);
    if (inner) return inner;
  }
  return null;
}

export function findAncestors(tree: ComponentNode[], id: string): ComponentNode[] {
  const walk = (list: ComponentNode[], trail: ComponentNode[]): ComponentNode[] | null => {
    for (const n of list) {
      const next = [...trail, n];
      if (n.id === id) return next;
      const inner = walk(n.children, next);
      if (inner) return inner;
    }
    return null;
  };
  return walk(tree, []) ?? [];
}

export function findPath(
  tree: ComponentNode[],
  id: string,
  parentId: string | null = null,
): { parentId: string | null; index: number } | null {
  for (let i = 0; i < tree.length; i++) {
    const n = tree[i]!;
    if (n.id === id) return { parentId, index: i };
    const inner = findPath(n.children, id, n.id);
    if (inner) return inner;
  }
  return null;
}

export function findSiblings(tree: ComponentNode[], id: string): ComponentNode[] {
  for (const n of tree) {
    if (n.id === id) return tree;
    if (n.children.length) {
      const inner = findSiblings(n.children, id);
      if (inner.length) return inner;
    }
  }
  return [];
}

/** Depth-first flatten into ids — used by keyboard-nav Tab/Shift+Tab. */
export function depthFirstIds(tree: ComponentNode[]): string[] {
  const out: string[] = [];
  const walk = (list: ComponentNode[]) => {
    for (const n of list) {
      out.push(n.id);
      walk(n.children);
    }
  };
  walk(tree);
  return out;
}
