"use client";
import { forwardRef, useState, useRef, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export interface TreeViewProps {
  nodes: TreeNode[];
  defaultExpanded?: string[];
  onSelect?: (id: string) => void;
  selected?: string;
  className?: string;
  label?: string;
}

export const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(
  ({ nodes, defaultExpanded = [], onSelect, selected, className, label }, ref) => {
    const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpanded));
    const nodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    const toggleExpand = useCallback((id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    const allNodes = flattenTree(nodes, expanded);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent, nodeId: string) => {
        const idx = allNodes.findIndex((n) => n.id === nodeId);
        if (idx === -1) return;
        const currentNode = allNodes[idx];
        if (!currentNode) return;

        switch (e.key) {
          case "ArrowDown": {
            e.preventDefault();
            const next = allNodes[idx + 1];
            if (next) nodeRefs.current.get(next.id)?.focus();
            break;
          }
          case "ArrowUp": {
            e.preventDefault();
            const prev = allNodes[idx - 1];
            if (prev) nodeRefs.current.get(prev.id)?.focus();
            break;
          }
          case "ArrowRight": {
            e.preventDefault();
            if (currentNode.hasChildren && !expanded.has(nodeId)) {
              toggleExpand(nodeId);
            } else if (currentNode.hasChildren) {
              const next = allNodes[idx + 1];
              if (next) nodeRefs.current.get(next.id)?.focus();
            }
            break;
          }
          case "ArrowLeft": {
            e.preventDefault();
            if (currentNode.hasChildren && expanded.has(nodeId)) {
              toggleExpand(nodeId);
            } else if (currentNode.parentId) {
              nodeRefs.current.get(currentNode.parentId)?.focus();
            }
            break;
          }
          case "Home": {
            e.preventDefault();
            const first = allNodes[0];
            if (first) nodeRefs.current.get(first.id)?.focus();
            break;
          }
          case "End": {
            e.preventDefault();
            const last = allNodes[allNodes.length - 1];
            if (last) nodeRefs.current.get(last.id)?.focus();
            break;
          }
          case "Enter":
          case " ":
            e.preventDefault();
            onSelect?.(nodeId);
            break;
        }
      },
      [allNodes, expanded, toggleExpand, onSelect],
    );

    const renderNode = (node: TreeNode, depth: number, _parentId?: string): React.ReactNode => {
      const isExpanded = expanded.has(node.id);
      const hasChildren = !!node.children?.length;
      const isSelected = selected === node.id;

      return (
        <li key={node.id} className="wui-tree__item" role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected}>
          <button
            ref={(el) => {
              if (el) nodeRefs.current.set(node.id, el);
              else nodeRefs.current.delete(node.id);
            }}
            type="button"
            className="wui-tree__node"
            data-selected={isSelected || undefined}
            tabIndex={isSelected || (!selected && depth === 0 && node === nodes[0]) ? 0 : -1}
            onClick={() => {
              if (hasChildren) toggleExpand(node.id);
              onSelect?.(node.id);
            }}
            onKeyDown={(e) => handleKeyDown(e, node.id)}
          >
            <span
              className="wui-tree__toggle"
              data-expanded={isExpanded || undefined}
              data-leaf={!hasChildren || undefined}
              aria-hidden="true"
            >
              {hasChildren ? "\u25B6" : ""}
            </span>
            <span className="wui-tree__label">{node.label}</span>
          </button>
          {hasChildren && isExpanded && (
            <ul className="wui-tree__group" role="group">
              {node.children!.map((child) => renderNode(child, depth + 1, node.id))}
            </ul>
          )}
        </li>
      );
    };

    return (
      <ul ref={ref} className={cn("wui-tree", className)} role="tree" aria-label={label || "Tree view"}>
        {nodes.map((node) => renderNode(node, 0))}
      </ul>
    );
  },
);
TreeView.displayName = "TreeView";

interface FlatNode {
  id: string;
  hasChildren: boolean;
  parentId?: string;
}

function flattenTree(nodes: TreeNode[], expanded: Set<string>, parentId?: string): FlatNode[] {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    const hasChildren = !!node.children?.length;
    result.push({ id: node.id, hasChildren, parentId });
    if (hasChildren && expanded.has(node.id)) {
      result.push(...flattenTree(node.children!, expanded, node.id));
    }
  }
  return result;
}
