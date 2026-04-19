"use client";
import type { DragEvent, CSSProperties } from "react";
import type { Rect } from "./selection-overlay";
import type { Edge } from "./drop-logic";

export interface DropZonesProps {
  rect: Rect;
  isContainer: boolean;
  onDrop: (edge: Edge, e: DragEvent) => void;
  activeEdge: Edge | null;
  onEdgeEnter: (edge: Edge | null) => void;
}

function zoneStyle(rect: Rect, edge: Edge): CSSProperties {
  const { top, left, width, height } = rect;
  const slice = 0.3;
  const base: CSSProperties = { position: "absolute" };
  switch (edge) {
    case "top":
      return { ...base, top, left, width, height: height * slice };
    case "bottom":
      return {
        ...base,
        top: top + height * (1 - slice),
        left,
        width,
        height: height * slice,
      };
    case "left":
      return { ...base, top, left, width: width * slice, height };
    case "right":
      return {
        ...base,
        top,
        left: left + width * (1 - slice),
        width: width * slice,
        height,
      };
    case "center":
      return {
        ...base,
        top: top + height * slice,
        left: left + width * slice,
        width: width * (1 - 2 * slice),
        height: height * (1 - 2 * slice),
      };
  }
}

export function DropZones({
  rect,
  isContainer,
  onDrop,
  activeEdge,
  onEdgeEnter,
}: DropZonesProps) {
  const zones: Edge[] = [
    "top",
    "right",
    "bottom",
    "left",
    ...(isContainer ? (["center"] as const) : []),
  ];
  return (
    <>
      {zones.map((edge) => {
        const className =
          `wui-composer__drop wui-composer__drop--${edge}` +
          (activeEdge === edge ? " wui-composer__drop--active" : "");
        return (
          <div
            key={edge}
            className={className}
            style={{ ...zoneStyle(rect, edge), pointerEvents: "auto" }}
            onDragOver={(e) => {
              e.preventDefault();
              if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
              onEdgeEnter(edge);
            }}
            onDragLeave={() => onEdgeEnter(null)}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDrop(edge, e);
              onEdgeEnter(null);
            }}
            aria-hidden="true"
          />
        );
      })}
    </>
  );
}
