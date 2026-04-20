"use client";
import { useEffect, useRef } from "react";
import { TreeView, type TreeNode } from "@weiui/react";
import { useInteractionManager } from "../lib/interaction-manager";
import type { ComponentNode } from "../lib/tree";

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "\u2026" : s;
}

function toTreeNodes(list: ComponentNode[]): TreeNode[] {
  return list.map((n) => ({
    id: n.id,
    label: n.text ? `${n.type}  ${truncate(n.text, 24)}` : n.type,
    children: n.children.length ? toTreeNodes(n.children) : undefined,
  }));
}

export interface OutlineTreeProps {
  tree: ComponentNode[];
}

export function OutlineTree({ tree }: OutlineTreeProps) {
  const im = useInteractionManager();
  const rootRef = useRef<HTMLDivElement>(null);
  const nodes = toTreeNodes(tree);
  const ids = [...im.state.selection.all];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let dragId: string | null = null;
    let startX = 0;
    let startY = 0;
    let started = false;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const row = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-tree-node-id]",
      );
      const id = row?.dataset.treeNodeId;
      if (!id) return;
      dragId = id;
      startX = e.clientX;
      startY = e.clientY;
      started = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragId) return;
      if (!started && Math.hypot(e.clientX - startX, e.clientY - startY) > 4) {
        started = true;
        im.startDrag({
          kind: "reorder",
          payload: [dragId],
          pointer: { x: e.clientX, y: e.clientY },
        });
      }
      if (started && im.state.drag) {
        im.updateDragPointer({ x: e.clientX, y: e.clientY });
      }
    };
    const onUp = (e: PointerEvent) => {
      if (started && im.state.drag) {
        im.commitRef.current?.({ x: e.clientX, y: e.clientY });
        im.endDrag();
      }
      dragId = null;
      started = false;
    };

    root.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      root.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [im]);

  return (
    <div ref={rootRef}>
      <TreeView
        nodes={nodes}
        selectionMode="multiple"
        selectedIds={ids}
        onSelectedIdsChange={(next) => {
          if (next.length === 0) {
            im.clearSelection();
            return;
          }
          im.select(next[next.length - 1]!, "replace");
          for (let i = 0; i < next.length - 1; i++) {
            im.select(next[i]!, "add");
          }
        }}
        label="Composition outline"
      />
    </div>
  );
}
