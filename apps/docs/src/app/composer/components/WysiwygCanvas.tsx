"use client";
import { useRef, useState, type DragEvent, type MouseEvent } from "react";
import { renderTree } from "../lib/render-preview";
import {
  SelectionOutline,
  useComposerRects,
} from "../lib/selection-overlay";
import {
  computeDropAction,
  locateNode,
  type Edge,
} from "../lib/drop-logic";
import { DropZones } from "../lib/drop-zones";
import type { ComponentNode, TreeAction } from "../lib/tree";
import { CHIP_CONTAINERS, LayoutChips } from "./LayoutChips";

export type ViewportPreset = "375" | "768" | "1024" | "1280" | "full";

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

export interface WysiwygCanvasProps {
  tree: ComponentNode[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  viewport: ViewportPreset;
  onDropActions?: (actions: TreeAction[]) => void;
  onUpdateProps?: (id: string, props: Record<string, unknown>) => void;
}

function parseDraggedNode(e: DragEvent): ComponentNode | null {
  const raw = e.dataTransfer.getData("application/x-weiui-node");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ComponentNode;
    if (parsed && typeof parsed === "object" && typeof parsed.id === "string") {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function WysiwygCanvas({
  tree,
  selectedId,
  onSelect,
  viewport,
  onDropActions,
  onUpdateProps,
}: WysiwygCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const rects = useComposerRects(stageRef, tree);
  const maxInlineSize = viewport === "full" ? "100%" : `${viewport}px`;
  const selectedRect = selectedId ? rects.get(selectedId) ?? null : null;
  const selectedNode = selectedId ? findNode(tree, selectedId) : null;
  const showChips =
    selectedNode != null &&
    selectedRect != null &&
    onUpdateProps != null &&
    CHIP_CONTAINERS.has(selectedNode.type);

  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const [activeEdge, setActiveEdge] = useState<Edge | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const hoverNode = hoverNodeId
    ? findNode(tree, hoverNodeId)
    : null;
  const hoverRect = hoverNodeId ? rects.get(hoverNodeId) ?? null : null;

  const onStageClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-composer-id]",
    );
    if (target && target.dataset.composerId) {
      onSelect(target.dataset.composerId);
    } else {
      onSelect(null);
    }
  };

  const onStageDragEnter = (e: DragEvent<HTMLDivElement>) => {
    // Only react to our own drag types.
    const types = e.dataTransfer.types;
    if (
      !types.includes("application/x-weiui-node") &&
      !types.includes("application/x-weiui-move")
    ) {
      return;
    }
    dragCounter.current += 1;
    setIsDragging(true);
    // Update hover target based on the element under the cursor.
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      "[data-composer-id]",
    );
    if (el?.dataset.composerId) {
      setHoverNodeId(el.dataset.composerId);
    }
  };

  const onStageDragOver = (e: DragEvent<HTMLDivElement>) => {
    const types = e.dataTransfer.types;
    if (
      !types.includes("application/x-weiui-node") &&
      !types.includes("application/x-weiui-move")
    ) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      "[data-composer-id]",
    );
    if (el?.dataset.composerId && el.dataset.composerId !== hoverNodeId) {
      setHoverNodeId(el.dataset.composerId);
      setActiveEdge(null);
    }
  };

  const onStageDragLeave = () => {
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) {
      setIsDragging(false);
      setHoverNodeId(null);
      setActiveEdge(null);
    }
  };

  const resetDragState = () => {
    dragCounter.current = 0;
    setIsDragging(false);
    setHoverNodeId(null);
    setActiveEdge(null);
  };

  const dispatchDrop = (actions: TreeAction[]) => {
    if (actions.length === 0) return;
    onDropActions?.(actions);
  };

  const onStageDrop = (e: DragEvent<HTMLDivElement>) => {
    // Drop anywhere on the stage that wasn't caught by a DropZone:
    // append to the root.
    e.preventDefault();
    const newNode = parseDraggedNode(e);
    if (newNode) {
      dispatchDrop([
        {
          type: "INSERT",
          parentId: null,
          index: tree.length,
          node: newNode,
        },
      ]);
    }
    resetDragState();
  };

  const onZoneDrop = (edge: Edge, e: DragEvent) => {
    const newNode = parseDraggedNode(e);
    if (!newNode || !hoverNodeId) {
      resetDragState();
      return;
    }
    const ctx = locateNode(tree, hoverNodeId);
    const targetNode = findNode(tree, hoverNodeId);
    if (!ctx || !targetNode) {
      resetDragState();
      return;
    }
    const actions = computeDropAction(ctx, edge, newNode, targetNode);
    dispatchDrop(actions);
    resetDragState();
  };

  const isContainer = hoverNode ? CONTAINERS.has(hoverNode.type) : false;

  return (
    <div
      className="wui-composer__canvas"
      data-dragging={isDragging ? "true" : undefined}
    >
      <div
        className="wui-composer__stage"
        ref={stageRef}
        style={{ maxInlineSize, position: "relative" }}
        onClick={onStageClick}
        onDragEnter={onStageDragEnter}
        onDragOver={onStageDragOver}
        onDragLeave={onStageDragLeave}
        onDrop={onStageDrop}
      >
        {tree.length === 0 && !isDragging ? (
          <EmptyCanvas />
        ) : null}
        {renderTree(tree)}
        <div
          className="wui-composer__overlay"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {selectedRect && <SelectionOutline rect={selectedRect} />}
          {isDragging && hoverRect ? (
            <DropZones
              rect={hoverRect}
              isContainer={isContainer}
              onDrop={onZoneDrop}
              activeEdge={activeEdge}
              onEdgeEnter={setActiveEdge}
            />
          ) : null}
          {showChips && selectedNode && selectedRect && onUpdateProps ? (
            <LayoutChips
              node={selectedNode}
              rect={selectedRect}
              onUpdate={(props) => onUpdateProps(selectedNode.id, props)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EmptyCanvas() {
  return (
    <div className="wui-composer__empty" aria-hidden="true">
      Drag a component from the palette to start building.
    </div>
  );
}

function findNode(tree: ComponentNode[], id: string): ComponentNode | null {
  for (const n of tree) {
    if (n.id === id) return n;
    const inner = findNode(n.children, id);
    if (inner) return inner;
  }
  return null;
}
