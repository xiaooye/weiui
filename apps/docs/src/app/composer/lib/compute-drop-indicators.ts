import type { ComponentNode } from "./tree";

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

// Re-export existing drop-action helpers so callers can import both from here.
export { computeDropAction, locateNode, type DropContext } from "./drop-logic";
