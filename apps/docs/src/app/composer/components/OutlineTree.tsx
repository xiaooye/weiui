"use client";
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
  const nodes = toTreeNodes(tree);
  const ids = [...im.state.selection.all];

  return (
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
  );
}
