import type { ComponentNode, TreeAction } from "./tree";

export const BETWEEN_GAP_PX = 8;

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}
export type Edge = "top" | "right" | "bottom" | "left" | "center";

export interface DropIndicator {
  targetId: string;
  edge?: Edge;
  betweenIndex?: number;
}

export interface ComputeArgs {
  tree: ComponentNode[];
  rects: Map<string, Rect>;
  pointer: { x: number; y: number };
  containers: Set<string>;
}

function pointInRect(p: { x: number; y: number }, r: Rect): boolean {
  return p.x >= r.left && p.x <= r.left + r.width && p.y >= r.top && p.y <= r.top + r.height;
}

function edgeFor(p: { x: number; y: number }, r: Rect, isContainer: boolean): Edge {
  const slice = 0.3;
  const relX = (p.x - r.left) / r.width;
  const relY = (p.y - r.top) / r.height;
  if (relY < slice) return "top";
  if (relY > 1 - slice) return "bottom";
  if (relX < slice) return "left";
  if (relX > 1 - slice) return "right";
  return isContainer ? "center" : "top";
}

interface Hit {
  node: ComponentNode;
  rect: Rect;
  parent: ComponentNode | null;
}

function hitTest(args: ComputeArgs): Hit | null {
  const walk = (
    list: ComponentNode[],
    parent: ComponentNode | null,
  ): Hit | null => {
    for (const n of list) {
      const deeper = walk(n.children, n);
      if (deeper) return deeper;
      const r = args.rects.get(n.id);
      if (r && pointInRect(args.pointer, r)) return { node: n, rect: r, parent };
    }
    return null;
  };
  return walk(args.tree, null);
}

function computeBetween(
  target: ComponentNode,
  rects: Map<string, Rect>,
  pointer: { x: number; y: number },
  isRow: boolean,
): number | null {
  if (target.children.length < 2) return null;
  for (let i = 1; i < target.children.length; i++) {
    const prev = target.children[i - 1]!;
    const curr = target.children[i]!;
    const rPrev = rects.get(prev.id);
    const rCurr = rects.get(curr.id);
    if (!rPrev || !rCurr) continue;
    const gapCenter = isRow
      ? (rPrev.left + rPrev.width + rCurr.left) / 2
      : (rPrev.top + rPrev.height + rCurr.top) / 2;
    const dist = isRow ? Math.abs(pointer.x - gapCenter) : Math.abs(pointer.y - gapCenter);
    if (dist < BETWEEN_GAP_PX) return i;
  }
  return null;
}

export function computeDropIndicator(args: ComputeArgs): DropIndicator | null {
  const hit = hitTest(args);
  if (!hit) return null;
  const { node, rect, parent } = hit;
  const isContainer = args.containers.has(node.type);

  // If the hit is inside a container parent, check between-sibling gaps there first.
  if (parent && args.containers.has(parent.type)) {
    const parentIsRow =
      (parent.props.direction as string) === "row" || parent.type === "Grid";
    const idx = computeBetween(parent, args.rects, args.pointer, parentIsRow);
    if (idx != null) return { targetId: parent.id, betweenIndex: idx };
  }

  if (isContainer) {
    const isRow = (node.props.direction as string) === "row" || node.type === "Grid";
    const idx = computeBetween(node, args.rects, args.pointer, isRow);
    if (idx != null) return { targetId: node.id, betweenIndex: idx };
  }

  const edge = edgeFor(args.pointer, rect, isContainer);
  return { targetId: node.id, edge };
}

/**
 * Types that accept arbitrary children. A center-drop on one of these inserts
 * the new node as a last child rather than a sibling.
 */
const CONTAINERS = new Set([
  "Card",
  "Stack",
  "Grid",
  "Container",
  "Dialog",
  "Drawer",
  "Accordion",
  "Tabs",
]);

export interface DropContext {
  /** Id of the node the pointer was over when the drop happened. */
  targetId: string;
  /** Parent of the target, or null if the target is at the root. */
  targetParent: ComponentNode | null;
  /** The sibling list the target lives in (either root list or parent.children). */
  targetParentList: ComponentNode[];
  /** Index of the target within `targetParentList`. */
  targetIndex: number;
}

function stackDirection(node: ComponentNode | null): "row" | "column" | null {
  if (!node || node.type !== "Stack") return null;
  const dir = node.props.direction;
  return dir === "row" ? "row" : "column";
}

/**
 * Pure: given a drop edge and context, returns the actions that realize the drop.
 *
 * Rules:
 * - Center on a container → INSERT as last child of the target.
 * - Edge drop where parent is a Stack and its direction matches the edge axis →
 *   INSERT as sibling at index+0 (left/top) or index+1 (right/bottom).
 * - Otherwise → WRAP_WITH: wrap the target + new node in a new Stack whose
 *   direction is inferred from the edge axis (row for left/right, column for top/bottom).
 *   `center` on a non-container falls into the wrap path as well (column by default).
 */
export function computeDropAction(
  ctx: DropContext,
  edge: Edge,
  newNode: ComponentNode,
  targetNode: ComponentNode,
): TreeAction[] {
  // Center on a container → insert as last child.
  if (edge === "center" && CONTAINERS.has(targetNode.type)) {
    return [
      {
        type: "INSERT",
        parentId: targetNode.id,
        index: targetNode.children.length,
        node: newNode,
      },
    ];
  }

  const wantedDir: "row" | "column" =
    edge === "left" || edge === "right" ? "row" : "column";
  const insertAfter = edge === "right" || edge === "bottom";

  // Parent is a Stack matching direction → simple sibling insert.
  const parentDir = stackDirection(ctx.targetParent);
  if (ctx.targetParent && parentDir === wantedDir) {
    return [
      {
        type: "INSERT",
        parentId: ctx.targetParent.id,
        index: ctx.targetIndex + (insertAfter ? 1 : 0),
        node: newNode,
      },
    ];
  }

  // Root or non-matching container → wrap target + new node in a Stack.
  return [
    {
      type: "WRAP_WITH",
      nodeId: targetNode.id,
      wrapperType: "Stack",
      wrapperProps: { direction: wantedDir, gap: 3 },
      siblingNode: newNode,
      siblingBefore: !insertAfter,
    },
  ];
}

/** Walks the tree to find the drop context (parent + index) for a given node id. */
export function locateNode(
  tree: ComponentNode[],
  id: string,
): DropContext | null {
  const walk = (
    list: ComponentNode[],
    parent: ComponentNode | null,
  ): DropContext | null => {
    for (let i = 0; i < list.length; i++) {
      const n = list[i]!;
      if (n.id === id) {
        return {
          targetId: id,
          targetParent: parent,
          targetParentList: list,
          targetIndex: i,
        };
      }
      const inner = walk(n.children, n);
      if (inner) return inner;
    }
    return null;
  };
  return walk(tree, null);
}

/** True if `maybeDescendant` is `ancestor` or appears anywhere in its subtree. */
export function isSelfOrDescendant(
  ancestor: ComponentNode,
  maybeDescendant: string,
): boolean {
  if (ancestor.id === maybeDescendant) return true;
  for (const child of ancestor.children) {
    if (isSelfOrDescendant(child, maybeDescendant)) return true;
  }
  return false;
}

/** True if the node with id `targetId` sits inside the subtree rooted at `rootId`. */
export function isInSubtree(
  tree: ComponentNode[],
  rootId: string,
  targetId: string,
): boolean {
  const find = (list: ComponentNode[]): ComponentNode | null => {
    for (const n of list) {
      if (n.id === rootId) return n;
      const inner = find(n.children);
      if (inner) return inner;
    }
    return null;
  };
  const root = find(tree);
  if (!root) return false;
  return isSelfOrDescendant(root, targetId);
}
