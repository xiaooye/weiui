"use client";
import { forwardRef, useState, useRef, useCallback, useMemo, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface TreeNode {
  id: string;
  label: string;
  icon?: ReactNode;
  children?: TreeNode[];
  /** When true, this node is a branch whose children may be loaded lazily. */
  hasChildren?: boolean;
  disabled?: boolean;
}

export type TreeSelectionMode = "single" | "multiple";

export interface TreeViewProps {
  /** Root tree data. Each node may contain nested `children`. */
  nodes: TreeNode[];
  /** Ids of nodes initially expanded (uncontrolled). */
  defaultExpanded?: string[];
  /** Controlled expanded ids. When provided, `defaultExpanded` is ignored. */
  expanded?: string[];
  /** Called when a node is expanded or collapsed (with the new expanded list). */
  onExpandedChange?: (expandedIds: string[]) => void;
  /** Single-select callback. */
  onSelect?: (id: string) => void;
  /** Single-selected id. Ignored when `selectionMode="multiple"`. */
  selected?: string;
  /** Selection mode. Default `single`. */
  selectionMode?: TreeSelectionMode;
  /** Controlled list of selected ids (multi-select). */
  selectedIds?: string[];
  /** Default selected ids (multi-select, uncontrolled). */
  defaultSelectedIds?: string[];
  /** Called when multi-select changes. */
  onSelectedIdsChange?: (ids: string[]) => void;
  /** When true, render a checkbox for each node (multi-select tri-state). */
  checkboxes?: boolean;
  /** Lazy-load children. Called when a branch with `hasChildren: true` and no `children` is expanded. */
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
  /** Additional CSS classes merged onto the tree root. */
  className?: string;
  /** Accessible name for the tree (`aria-label`). */
  label?: string;
}

interface FlatNode {
  id: string;
  label: string;
  hasChildren: boolean;
  parentId?: string;
  depth: number;
  disabled?: boolean;
}

function flattenTree(
  nodes: TreeNode[],
  expanded: Set<string>,
  parentId: string | undefined,
  depth: number,
): FlatNode[] {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    const hasChildren = !!node.children?.length || !!node.hasChildren;
    result.push({
      id: node.id,
      label: node.label,
      hasChildren,
      parentId,
      depth,
      disabled: node.disabled,
    });
    if (hasChildren && expanded.has(node.id) && node.children?.length) {
      result.push(...flattenTree(node.children, expanded, node.id, depth + 1));
    }
  }
  return result;
}

function getDescendantIds(node: TreeNode): string[] {
  const ids: string[] = [];
  if (node.children) {
    for (const c of node.children) {
      ids.push(c.id);
      ids.push(...getDescendantIds(c));
    }
  }
  return ids;
}

function findNode(nodes: TreeNode[], id: string): TreeNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNode(n.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(
  (
    {
      nodes: externalNodes,
      defaultExpanded = [],
      expanded: controlledExpanded,
      onExpandedChange,
      onSelect,
      selected,
      selectionMode = "single",
      selectedIds,
      defaultSelectedIds = [],
      onSelectedIdsChange,
      checkboxes = false,
      loadChildren,
      className,
      label,
    },
    ref,
  ) => {
    // Nodes state: starts with externalNodes; mutates when lazy-loading children.
    const [internalNodes, setInternalNodes] = useState<TreeNode[]>(externalNodes);
    // Re-sync when external prop changes (shallow identity).
    const lastExternalRef = useRef(externalNodes);
    if (lastExternalRef.current !== externalNodes) {
      lastExternalRef.current = externalNodes;
      setInternalNodes(externalNodes);
    }
    const nodes = internalNodes;

    const [uncontrolledExpanded, setUncontrolledExpanded] = useState<Set<string>>(
      new Set(defaultExpanded),
    );
    const isExpandedControlled = controlledExpanded !== undefined;
    const expanded = useMemo(
      () => (isExpandedControlled ? new Set(controlledExpanded) : uncontrolledExpanded),
      [isExpandedControlled, controlledExpanded, uncontrolledExpanded],
    );

    const [uncontrolledSelected, setUncontrolledSelected] = useState<Set<string>>(
      new Set(defaultSelectedIds),
    );
    const isMultiControlled = selectedIds !== undefined;
    const multiSelected = useMemo(
      () => (isMultiControlled ? new Set(selectedIds) : uncontrolledSelected),
      [isMultiControlled, selectedIds, uncontrolledSelected],
    );

    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
    const nodeRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const typeaheadRef = useRef<{ buf: string; last: number }>({ buf: "", last: 0 });

    const flat = useMemo(() => flattenTree(nodes, expanded, undefined, 0), [nodes, expanded]);

    const updateExpanded = useCallback(
      (next: Set<string>) => {
        if (!isExpandedControlled) setUncontrolledExpanded(next);
        onExpandedChange?.(Array.from(next));
      },
      [isExpandedControlled, onExpandedChange],
    );

    const toggleExpand = useCallback(
      async (id: string) => {
        const node = findNode(nodes, id);
        if (!node) return;
        const isOpen = expanded.has(id);
        const next = new Set(expanded);

        if (isOpen) {
          next.delete(id);
          updateExpanded(next);
          return;
        }

        next.add(id);
        updateExpanded(next);

        // Lazy-load if marked as hasChildren but no children loaded.
        if (loadChildren && node.hasChildren && !node.children?.length && !loadingIds.has(id)) {
          setLoadingIds((s) => new Set(s).add(id));
          try {
            const children = await loadChildren(node);
            setInternalNodes((current) => {
              const clone = JSON.parse(JSON.stringify(current)) as TreeNode[];
              const target = findNode(clone, id);
              if (target) {
                target.children = children;
              }
              return clone;
            });
          } finally {
            setLoadingIds((s) => {
              const copy = new Set(s);
              copy.delete(id);
              return copy;
            });
          }
        }
      },
      [expanded, nodes, updateExpanded, loadChildren, loadingIds],
    );

    const setMultiSelected = useCallback(
      (next: Set<string>) => {
        if (!isMultiControlled) setUncontrolledSelected(next);
        onSelectedIdsChange?.(Array.from(next));
      },
      [isMultiControlled, onSelectedIdsChange],
    );

    // Checkbox tri-state logic: selecting a parent selects all descendants.
    const toggleCheckbox = useCallback(
      (id: string) => {
        const node = findNode(nodes, id);
        if (!node) return;
        const ids = [id, ...getDescendantIds(node)];
        const next = new Set(multiSelected);
        const allSelected = ids.every((i) => next.has(i));
        if (allSelected) {
          for (const i of ids) next.delete(i);
        } else {
          for (const i of ids) next.add(i);
        }
        setMultiSelected(next);
      },
      [nodes, multiSelected, setMultiSelected],
    );

    const handleSelect = useCallback(
      (id: string) => {
        if (selectionMode === "multiple") {
          const next = new Set(multiSelected);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          setMultiSelected(next);
        }
        onSelect?.(id);
      },
      [selectionMode, multiSelected, setMultiSelected, onSelect],
    );

    const focusId = useCallback((id: string) => {
      nodeRefs.current.get(id)?.focus();
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent, nodeId: string) => {
        const idx = flat.findIndex((n) => n.id === nodeId);
        if (idx === -1) return;
        const current = flat[idx]!;

        // Typeahead: single printable character advances to next node whose label starts with it.
        if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          const now = Date.now();
          const ta = typeaheadRef.current;
          if (now - ta.last > 500) ta.buf = "";
          ta.buf += e.key.toLowerCase();
          ta.last = now;
          // Find next node (starting after idx, wrapping) whose label starts with buffer.
          for (let i = 1; i <= flat.length; i++) {
            const candidate = flat[(idx + i) % flat.length]!;
            if (candidate.label.toLowerCase().startsWith(ta.buf)) {
              focusId(candidate.id);
              break;
            }
          }
          return;
        }

        switch (e.key) {
          case "ArrowDown": {
            e.preventDefault();
            const next = flat[idx + 1];
            if (next) focusId(next.id);
            break;
          }
          case "ArrowUp": {
            e.preventDefault();
            const prev = flat[idx - 1];
            if (prev) focusId(prev.id);
            break;
          }
          case "ArrowRight": {
            e.preventDefault();
            if (current.hasChildren && !expanded.has(nodeId)) {
              toggleExpand(nodeId);
            } else if (current.hasChildren) {
              const next = flat[idx + 1];
              if (next) focusId(next.id);
            }
            break;
          }
          case "ArrowLeft": {
            e.preventDefault();
            if (current.hasChildren && expanded.has(nodeId)) {
              toggleExpand(nodeId);
            } else if (current.parentId) {
              focusId(current.parentId);
            }
            break;
          }
          case "Home": {
            e.preventDefault();
            const first = flat[0];
            if (first) focusId(first.id);
            break;
          }
          case "End": {
            e.preventDefault();
            const last = flat[flat.length - 1];
            if (last) focusId(last.id);
            break;
          }
          case "Enter":
          case " ": {
            e.preventDefault();
            if (checkboxes) toggleCheckbox(nodeId);
            else handleSelect(nodeId);
            break;
          }
        }
      },
      [flat, expanded, toggleExpand, focusId, handleSelect, checkboxes, toggleCheckbox],
    );

    const isNodeSelected = useCallback(
      (id: string) => {
        if (selectionMode === "multiple") return multiSelected.has(id);
        return selected === id;
      },
      [selectionMode, multiSelected, selected],
    );

    const getCheckState = useCallback(
      (node: TreeNode): "checked" | "unchecked" | "indeterminate" => {
        if (!node.children?.length) {
          return multiSelected.has(node.id) ? "checked" : "unchecked";
        }
        const descendants = [node.id, ...getDescendantIds(node)];
        const selectedCount = descendants.filter((i) => multiSelected.has(i)).length;
        if (selectedCount === 0) return "unchecked";
        if (selectedCount === descendants.length) return "checked";
        return "indeterminate";
      },
      [multiSelected],
    );

    const renderNode = (node: TreeNode, depth: number): React.ReactNode => {
      const isExpanded = expanded.has(node.id);
      const hasChildren = !!node.children?.length || !!node.hasChildren;
      const isSelected = isNodeSelected(node.id);
      const isLoading = loadingIds.has(node.id);
      const checkState = checkboxes ? getCheckState(node) : undefined;

      return (
        <li
          key={node.id}
          className="wui-tree__item"
          role="treeitem"
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-selected={isSelected}
          aria-disabled={node.disabled || undefined}
        >
          <button
            ref={(el) => {
              if (el) nodeRefs.current.set(node.id, el);
              else nodeRefs.current.delete(node.id);
            }}
            type="button"
            className="wui-tree__node"
            data-selected={isSelected || undefined}
            data-depth={depth}
            disabled={node.disabled}
            style={{ ["--wui-tree-depth" as string]: String(depth) }}
            tabIndex={
              isSelected ||
              (!selected && selectionMode === "single" && depth === 0 && node === nodes[0])
                ? 0
                : -1
            }
            onClick={() => {
              if (hasChildren) toggleExpand(node.id);
              if (checkboxes) toggleCheckbox(node.id);
              else handleSelect(node.id);
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
            {checkboxes && (
              <input
                type="checkbox"
                className="wui-tree__checkbox"
                checked={checkState === "checked"}
                ref={(el) => {
                  if (el) el.indeterminate = checkState === "indeterminate";
                }}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleCheckbox(node.id);
                }}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Check ${node.label}`}
                tabIndex={-1}
              />
            )}
            {node.icon && (
              <span className="wui-tree__icon" aria-hidden="true">
                {node.icon}
              </span>
            )}
            <span className="wui-tree__label">{node.label}</span>
            {isLoading && (
              <span className="wui-tree__loading" aria-hidden="true">
                {"\u2026"}
              </span>
            )}
          </button>
          {hasChildren && isExpanded && node.children?.length && (
            <ul className="wui-tree__group" role="group">
              {node.children.map((child) => renderNode(child, depth + 1))}
            </ul>
          )}
        </li>
      );
    };

    return (
      <ul
        ref={ref}
        className={cn("wui-tree", className)}
        role="tree"
        aria-label={label || "Tree view"}
        aria-multiselectable={selectionMode === "multiple" ? true : undefined}
      >
        {nodes.map((node) => renderNode(node, 0))}
      </ul>
    );
  },
);
TreeView.displayName = "TreeView";
