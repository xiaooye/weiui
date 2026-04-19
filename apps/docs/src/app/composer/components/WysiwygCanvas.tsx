"use client";
import { useRef, type MouseEvent } from "react";
import { renderTree } from "../lib/render-preview";
import {
  SelectionOutline,
  useComposerRects,
} from "../lib/selection-overlay";
import type { ComponentNode } from "../lib/tree";

export type ViewportPreset = "375" | "768" | "1024" | "1280" | "full";

export interface WysiwygCanvasProps {
  tree: ComponentNode[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  viewport: ViewportPreset;
}

export function WysiwygCanvas({
  tree,
  selectedId,
  onSelect,
  viewport,
}: WysiwygCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const rects = useComposerRects(stageRef, tree);
  const maxInlineSize = viewport === "full" ? "100%" : `${viewport}px`;
  const selectedRect = selectedId ? rects.get(selectedId) ?? null : null;

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

  return (
    <div className="wui-composer__canvas">
      <div
        className="wui-composer__stage"
        ref={stageRef}
        style={{ maxInlineSize, position: "relative" }}
        onClick={onStageClick}
      >
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
        </div>
      </div>
    </div>
  );
}
