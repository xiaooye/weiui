"use client";
import { forwardRef, useState, useRef, useCallback, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface SplitterProps {
  orientation?: "horizontal" | "vertical";
  defaultSizes?: [number, number];
  minSize?: number;
  children: [ReactNode, ReactNode];
  className?: string;
}

export const Splitter = forwardRef<HTMLDivElement, SplitterProps>(
  ({ orientation = "horizontal", defaultSizes = [50, 50], minSize = 10, children, className }, ref) => {
    const [sizes, setSizes] = useState(defaultSizes);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      },
      [],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!dragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const isVertical = orientation === "vertical";
        const total = isVertical ? rect.height : rect.width;
        const pos = isVertical ? e.clientY - rect.top : e.clientX - rect.left;
        let pct = (pos / total) * 100;
        pct = Math.max(minSize, Math.min(100 - minSize, pct));
        setSizes([pct, 100 - pct]);
      },
      [orientation, minSize],
    );

    const handlePointerUp = useCallback(() => {
      dragging.current = false;
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const step = 5;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          setSizes(([a, b]) => {
            const next = Math.min(a + step, 100 - minSize);
            return [next, 100 - next];
          });
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          setSizes(([a, b]) => {
            const next = Math.max(a - step, minSize);
            return [next, 100 - next];
          });
        }
      },
      [minSize],
    );

    const isVertical = orientation === "vertical";

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn("wui-splitter", isVertical && "wui-splitter--vertical", className)}
      >
        <div className="wui-splitter__panel" style={isVertical ? { height: `${sizes[0]}%` } : { width: `${sizes[0]}%` }}>
          {children[0]}
        </div>
        <div
          className="wui-splitter__handle"
          role="separator"
          aria-orientation={orientation}
          aria-valuenow={Math.round(sizes[0])}
          aria-valuemin={minSize}
          aria-valuemax={100 - minSize}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
        >
          <div className="wui-splitter__handle-dot" />
        </div>
        <div className="wui-splitter__panel" style={isVertical ? { height: `${sizes[1]}%` } : { width: `${sizes[1]}%` }}>
          {children[1]}
        </div>
      </div>
    );
  },
);
Splitter.displayName = "Splitter";
