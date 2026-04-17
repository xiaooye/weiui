"use client";
import { forwardRef, useState, useRef, useCallback, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type SplitterSizes = [number, number];

export interface SplitterProps {
  orientation?: "horizontal" | "vertical";
  defaultSizes?: SplitterSizes;
  /** Controlled sizes. Pair with `onSizesChange`. */
  sizes?: SplitterSizes;
  /** Fires when the user drags or presses arrow keys on the separator. */
  onSizesChange?: (sizes: SplitterSizes) => void;
  minSize?: number;
  children: [ReactNode, ReactNode];
  className?: string;
}

export const Splitter = forwardRef<HTMLDivElement, SplitterProps>(
  (
    {
      orientation = "horizontal",
      defaultSizes = [50, 50],
      sizes: controlledSizes,
      onSizesChange,
      minSize = 10,
      children,
      className,
    },
    ref,
  ) => {
    const [uncontrolled, setUncontrolled] = useState<SplitterSizes>(defaultSizes);
    const isControlled = controlledSizes !== undefined;
    const sizes = controlledSizes ?? uncontrolled;
    const containerRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);

    const updateSizes = useCallback(
      (next: SplitterSizes) => {
        if (!isControlled) setUncontrolled(next);
        onSizesChange?.(next);
      },
      [isControlled, onSizesChange],
    );

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }, []);

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!dragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const isVertical = orientation === "vertical";
        const total = isVertical ? rect.height : rect.width;
        const pos = isVertical ? e.clientY - rect.top : e.clientX - rect.left;
        let pct = (pos / total) * 100;
        pct = Math.max(minSize, Math.min(100 - minSize, pct));
        updateSizes([pct, 100 - pct]);
      },
      [orientation, minSize, updateSizes],
    );

    const handlePointerUp = useCallback(() => {
      dragging.current = false;
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const step = 5;
        const a = sizes[0];
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          const next = Math.min(a + step, 100 - minSize);
          updateSizes([next, 100 - next]);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          const next = Math.max(a - step, minSize);
          updateSizes([next, 100 - next]);
        }
      },
      [minSize, sizes, updateSizes],
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
        <div
          className="wui-splitter__panel"
          style={isVertical ? { height: `${sizes[0]}%` } : { width: `${sizes[0]}%` }}
        >
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
        <div
          className="wui-splitter__panel"
          style={isVertical ? { height: `${sizes[1]}%` } : { width: `${sizes[1]}%` }}
        >
          {children[1]}
        </div>
      </div>
    );
  },
);
Splitter.displayName = "Splitter";
