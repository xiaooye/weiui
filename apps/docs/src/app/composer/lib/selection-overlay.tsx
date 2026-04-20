"use client";
import { useLayoutEffect, useState, type RefObject } from "react";
import type { ComponentNode } from "./tree";

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Measures bounding rects of every `[data-composer-id]` element inside a stage,
 * returning them keyed by composer node id and expressed in screen-space
 * pixels relative to the stage's top-left corner.
 *
 * Re-measures when the stage resizes (ResizeObserver), the window resizes
 * (viewport preset toggle), the tree changes identity, or the stage's
 * transform scale changes (zoom toggle — since `transform: scale()` does
 * not fire the ResizeObserver).
 */
export function useComposerRects(
  stageRef: RefObject<HTMLDivElement | null>,
  tree: ComponentNode[],
  scale: number = 1,
): Map<string, Rect> {
  const [rects, setRects] = useState<Map<string, Rect>>(new Map());

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const stageRect = stage.getBoundingClientRect();
      const next = new Map<string, Rect>();
      stage
        .querySelectorAll<HTMLElement>("[data-composer-id]")
        .forEach((el) => {
          // Our wrapper uses `display: contents`, which has no box of its own;
          // the first rendered child carries the real layout rect.
          const target = (el.firstElementChild as HTMLElement | null) ?? el;
          const r = target.getBoundingClientRect();
          const id = el.dataset.composerId;
          if (!id) return;
          next.set(id, {
            top: r.top - stageRect.top,
            left: r.left - stageRect.left,
            width: r.width,
            height: r.height,
          });
        });
      setRects(next);
    };

    measure();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;
    ro?.observe(stage);
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [stageRef, tree, scale]);

  return rects;
}

export interface SelectionOutlineProps {
  rect: Rect;
}

export function SelectionOutline({ rect }: SelectionOutlineProps) {
  return (
    <div
      className="wui-composer__selection-outline"
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
