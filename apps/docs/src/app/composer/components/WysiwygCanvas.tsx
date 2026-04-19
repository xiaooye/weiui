"use client";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { renderTree } from "../lib/render-preview";
import {
  SelectionOutline,
  useComposerRects,
  type Rect,
} from "../lib/selection-overlay";
import {
  computeDropAction,
  locateNode,
  type Edge,
} from "../lib/drop-logic";
import { computeDropIndicator } from "../lib/compute-drop-indicators";
import { DropZones } from "../lib/drop-zones";
import type { ComponentNode, TreeAction } from "../lib/tree";
import { useInteractionManager } from "../lib/interaction-manager";
import { CHIP_CONTAINERS, LayoutChips } from "./LayoutChips";

export type { ViewportPreset } from "../lib/interaction-manager";

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
  onDropActions?: (actions: TreeAction[]) => void;
  onUpdateProps?: (id: string, props: Record<string, unknown>) => void;
}

export function WysiwygCanvas({
  tree,
  onDropActions,
  onUpdateProps,
}: WysiwygCanvasProps) {
  const im = useInteractionManager();
  const selectedId = im.state.selection.primary;
  const viewport = im.state.viewport;
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
  const [mouseHoverId, setMouseHoverId] = useState<string | null>(null);

  const drag = im.state.drag;
  const isDragging = drag != null;

  const hoverNode = hoverNodeId ? findNode(tree, hoverNodeId) : null;
  const hoverRect = hoverNodeId ? rects.get(hoverNodeId) ?? null : null;
  const mouseHoverRect: Rect | null =
    mouseHoverId && mouseHoverId !== selectedId
      ? rects.get(mouseHoverId) ?? null
      : null;

  const onStageClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-composer-id]",
    );
    if (target && target.dataset.composerId) {
      im.select(target.dataset.composerId, "replace");
    } else {
      im.clearSelection();
    }
  };

  // Double-click walks up to the selected node's parent so users can escape
  // out of a deeply-nested leaf and reach a Stack / Card / Grid container.
  const onStageDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-composer-id]",
    );
    const clickedId = target?.dataset.composerId ?? null;
    if (!clickedId) return;
    // Walk up to the first ancestor [data-composer-id]
    const parent =
      target?.parentElement?.closest<HTMLElement>("[data-composer-id]");
    if (parent?.dataset.composerId) {
      e.preventDefault();
      im.select(parent.dataset.composerId, "replace");
    }
  };

  const onStageMouseOver = (e: MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-composer-id]",
    );
    setMouseHoverId(el?.dataset.composerId ?? null);
  };

  const onStageMouseLeave = () => {
    setMouseHoverId(null);
  };

  // While a drag session is active, track pointer moves/up globally. On pointerup
  // we run the drop-indicator + drop-action pipeline and dispatch tree actions.
  useEffect(() => {
    if (!drag) return;

    const commitDrop = (pointer: { x: number; y: number }) => {
      if (drag.kind !== "palette") return;
      const newNode = drag.payload as ComponentNode;
      const indicator = computeDropIndicator({
        tree,
        rects,
        pointer,
        containers: CONTAINERS,
      });
      if (!indicator) {
        onDropActions?.([
          {
            type: "INSERT",
            parentId: null,
            index: tree.length,
            node: newNode,
          },
        ]);
        return;
      }
      if (indicator.betweenIndex != null) {
        onDropActions?.([
          {
            type: "INSERT",
            parentId: indicator.targetId,
            index: indicator.betweenIndex,
            node: newNode,
          },
        ]);
        return;
      }
      const ctx = locateNode(tree, indicator.targetId);
      const targetNode = findNode(tree, indicator.targetId);
      if (!ctx || !targetNode || !indicator.edge) return;
      const actions = computeDropAction(
        ctx,
        indicator.edge,
        newNode,
        targetNode,
      );
      if (actions.length > 0) onDropActions?.(actions);
    };

    const onMove = (e: PointerEvent) => {
      const pointer = { x: e.clientX, y: e.clientY };
      im.updateDragPointer(pointer);
      const el = document
        .elementFromPoint(pointer.x, pointer.y)
        ?.closest<HTMLElement>("[data-composer-id]");
      const id = el?.dataset.composerId ?? null;
      setHoverNodeId(id);
      if (id && rects.get(id)) {
        const indicator = computeDropIndicator({
          tree,
          rects,
          pointer,
          containers: CONTAINERS,
        });
        setActiveEdge(indicator?.edge ?? null);
      } else {
        setActiveEdge(null);
      }
    };

    const onUp = (e: PointerEvent) => {
      const pointer = { x: e.clientX, y: e.clientY };
      commitDrop(pointer);
      im.endDrag();
      setHoverNodeId(null);
      setActiveEdge(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // drag is a stable reference object — listening on its identity is fine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag]);

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
        onDoubleClick={onStageDoubleClick}
        onMouseOver={onStageMouseOver}
        onMouseLeave={onStageMouseLeave}
      >
        {tree.length === 0 && !isDragging ? <EmptyCanvas /> : null}
        {renderTree(tree)}
        <div
          className="wui-composer__overlay"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {mouseHoverRect ? <HoverOutline rect={mouseHoverRect} /> : null}
          {selectedRect && <SelectionOutline rect={selectedRect} />}
          {isDragging && hoverRect ? (
            <DropZones
              rect={hoverRect}
              isContainer={isContainer}
              onDrop={() => {}}
              activeEdge={activeEdge}
              onEdgeEnter={() => {}}
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

function HoverOutline({ rect }: { rect: Rect }) {
  return (
    <div
      className="wui-composer__hover-outline"
      style={{
        position: "absolute",
        insetBlockStart: rect.top,
        insetInlineStart: rect.left,
        inlineSize: rect.width,
        blockSize: rect.height,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}

function EmptyCanvas() {
  return (
    <div className="wui-composer__empty" role="note">
      <svg
        className="wui-composer__empty-icon"
        viewBox="0 0 80 80"
        width="80"
        height="80"
        aria-hidden="true"
      >
        <rect
          x="12"
          y="12"
          width="56"
          height="56"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <path
          d="M28 40h24M40 28v24"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <strong className="wui-composer__empty-title">
        Your canvas is empty
      </strong>
      <span className="wui-composer__empty-sub">
        Build anything — 65 components ready to drop.
      </span>
      <ol className="wui-composer__empty-steps" aria-label="Getting started">
        <li className="wui-composer__empty-step">
          <span className="wui-composer__empty-step-num" aria-hidden="true">
            1
          </span>
          <span className="wui-composer__empty-step-text">
            Pick a component from the palette
          </span>
        </li>
        <li className="wui-composer__empty-step">
          <span className="wui-composer__empty-step-num" aria-hidden="true">
            2
          </span>
          <span className="wui-composer__empty-step-text">
            Drop it on the canvas
          </span>
        </li>
        <li className="wui-composer__empty-step">
          <span className="wui-composer__empty-step-num" aria-hidden="true">
            3
          </span>
          <span className="wui-composer__empty-step-text">
            Edit props on the right
          </span>
        </li>
      </ol>
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
