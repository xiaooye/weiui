"use client";
import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  Children,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from "react";
import { cn } from "../../utils/cn";

/** Sizes array — one entry per panel (percentage of total, summing to 100).
 *  Generalised to N panels in the multi-panel API; 2-panel callers can still
 *  treat it as `[number, number]`. */
export type SplitterSizes = number[];

export interface SplitterPanelProps {
  /** Panel content. */
  children: ReactNode;
  /** Minimum size as a percentage. @default 10 */
  minSize?: number;
  /** Maximum size as a percentage. @default 90 */
  maxSize?: number;
  /** Initial size as a percentage. If omitted, remaining space is split evenly. */
  defaultSize?: number;
  /** Whether the panel can be collapsed via double-click on an adjacent handle. @default false */
  collapsible?: boolean;
  /** Size when collapsed, as a percentage. @default 0 */
  collapsedSize?: number;
  /** Extra class names merged onto the panel element. */
  className?: string;
}

/** Declarative panel marker. Children of <Splitter> use this to declare per-panel
 * constraints. A Splitter may also be used without SplitterPanel children — in that
 * case each child is treated as a plain panel and top-level `minSize` applies. */
export function SplitterPanel(_props: SplitterPanelProps): ReactElement | null {
  // This component is a data-only marker — <Splitter> reads its props rather than
  // rendering it directly. A harmless render-as-children fallback lets it show up
  // correctly if used outside a <Splitter>.
  return null;
}
SplitterPanel.displayName = "SplitterPanel";

export interface SplitterProps {
  /** Split axis. @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /**
   * Initial pane sizes as percentages totaling 100.
   * @default evenly distributed
   */
  defaultSizes?: number[];
  /** Controlled sizes. Pair with `onSizesChange`. */
  sizes?: number[];
  /** Fires when the user drags or presses arrow keys on a separator. */
  onSizesChange?: (sizes: number[]) => void;
  /** Fallback minimum size per panel when SplitterPanel children don't override it. @default 10 */
  minSize?: number;
  /** Panel content. Accepts raw children (legacy 2-panel) or <SplitterPanel> elements. */
  children: ReactNode;
  /** Additional CSS classes merged onto the root element. */
  className?: string;
}

interface ResolvedPanel {
  node: ReactNode;
  minSize: number;
  maxSize: number;
  defaultSize: number | undefined;
  collapsible: boolean;
  collapsedSize: number;
  className?: string;
}

function isSplitterPanelElement(
  el: ReactNode,
): el is ReactElement<SplitterPanelProps> {
  return (
    isValidElement(el) &&
    typeof el.type !== "string" &&
    (el.type as { displayName?: string }).displayName === "SplitterPanel"
  );
}

/** Extract panel descriptors from children. Supports both <SplitterPanel> children
 * and raw nodes (legacy). Raw-node mode uses the top-level minSize and no max. */
function resolvePanels(children: ReactNode, defaultMinSize: number): ResolvedPanel[] {
  const childArray = Children.toArray(children);
  return childArray.map((child) => {
    if (isSplitterPanelElement(child)) {
      const p = child.props;
      return {
        node: p.children,
        minSize: p.minSize ?? defaultMinSize,
        maxSize: p.maxSize ?? 100 - defaultMinSize,
        defaultSize: p.defaultSize,
        collapsible: p.collapsible ?? false,
        collapsedSize: p.collapsedSize ?? 0,
        className: p.className,
      };
    }
    return {
      node: child,
      minSize: defaultMinSize,
      maxSize: 100 - defaultMinSize,
      defaultSize: undefined,
      collapsible: false,
      collapsedSize: 0,
    };
  });
}

/** Compute initial sizes: use defaultSize where provided, distribute remainder evenly. */
function computeInitialSizes(
  panels: ResolvedPanel[],
  defaultSizes?: number[],
): number[] {
  if (defaultSizes && defaultSizes.length === panels.length) {
    return [...defaultSizes];
  }
  // Use per-panel defaultSize if present; distribute remaining evenly.
  const provided = panels.map((p) => p.defaultSize ?? null);
  const providedTotal = provided.reduce<number>(
    (sum, v) => sum + (v ?? 0),
    0,
  );
  const remaining = Math.max(0, 100 - providedTotal);
  const unspecifiedCount = provided.filter((v) => v === null).length;
  const perUnspecified =
    unspecifiedCount > 0 ? remaining / unspecifiedCount : 0;
  return provided.map((v) => (v === null ? perUnspecified : v));
}

/** Clamp a candidate panel size to [min, max]. */
function clampToBounds(size: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, size));
}

/**
 * Apply a delta (in percentage points) to the boundary between panel i and i+1.
 * Resulting sizes must respect per-panel min/max for both sides. Any surplus/deficit
 * after clamping is returned so the caller can cap the effective drag distance.
 */
function applyBoundaryDelta(
  sizes: number[],
  panels: ResolvedPanel[],
  boundaryIdx: number,
  deltaPct: number,
): number[] {
  const next = [...sizes];
  const leftIdx = boundaryIdx;
  const rightIdx = boundaryIdx + 1;
  const left = sizes[leftIdx] ?? 0;
  const right = sizes[rightIdx] ?? 0;
  const leftPanel = panels[leftIdx];
  const rightPanel = panels[rightIdx];
  if (!leftPanel || !rightPanel) return next;

  let proposedLeft = left + deltaPct;
  let proposedRight = right - deltaPct;

  // Clamp left to its bounds.
  proposedLeft = clampToBounds(proposedLeft, leftPanel.minSize, leftPanel.maxSize);
  // Recompute right from the clamped left.
  proposedRight = left + right - proposedLeft;
  // Clamp right to its bounds and push any excess back to left.
  const clampedRight = clampToBounds(
    proposedRight,
    rightPanel.minSize,
    rightPanel.maxSize,
  );
  const diff = proposedRight - clampedRight;
  proposedRight = clampedRight;
  proposedLeft = proposedLeft + diff;
  // Final safety clamp on left (rare edge: both sides at bounds).
  proposedLeft = clampToBounds(proposedLeft, leftPanel.minSize, leftPanel.maxSize);

  next[leftIdx] = proposedLeft;
  next[rightIdx] = proposedRight;
  return next;
}

export const Splitter = forwardRef<HTMLDivElement, SplitterProps>(
  (
    {
      orientation = "horizontal",
      defaultSizes,
      sizes: controlledSizes,
      onSizesChange,
      minSize = 10,
      children,
      className,
    },
    ref,
  ) => {
    const panels = useMemo(
      () => resolvePanels(children, minSize),
      [children, minSize],
    );

    const [uncontrolled, setUncontrolled] = useState<number[]>(() =>
      computeInitialSizes(panels, defaultSizes),
    );
    const isControlled = controlledSizes !== undefined;
    const sizes = controlledSizes ?? uncontrolled;

    // If the number of panels changes (e.g., dynamic children), resync the
    // uncontrolled state so we keep one entry per panel.
    useEffect(() => {
      if (isControlled) return;
      if (uncontrolled.length !== panels.length) {
        setUncontrolled(computeInitialSizes(panels, defaultSizes));
      }
      // We intentionally exclude `uncontrolled` and `defaultSizes` from deps so
      // user-driven size updates aren't reset. Only a panel-count change resyncs.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panels.length, isControlled]);

    const containerRef = useRef<HTMLDivElement>(null);
    // Per-handle drag state, keyed by boundary index.
    const draggingRef = useRef<{ boundaryIdx: number; startPos: number; startSizes: number[] } | null>(null);
    // Remember pre-collapse size per panel so a second double-click restores it.
    const collapsedMemoryRef = useRef<Map<number, number>>(new Map());

    const updateSizes = useCallback(
      (next: number[]) => {
        if (!isControlled) setUncontrolled(next);
        onSizesChange?.(next);
      },
      [isControlled, onSizesChange],
    );

    const handlePointerDown = useCallback(
      (e: React.PointerEvent, boundaryIdx: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const isVertical = orientation === "vertical";
        const pos = isVertical ? e.clientY - rect.top : e.clientX - rect.left;
        draggingRef.current = {
          boundaryIdx,
          startPos: pos,
          startSizes: [...sizes],
        };
        // JSDOM (test env) doesn't implement setPointerCapture — guard it.
        if (typeof e.currentTarget.setPointerCapture === "function") {
          e.currentTarget.setPointerCapture(e.pointerId);
        }
      },
      [orientation, sizes],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        const drag = draggingRef.current;
        if (!drag || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const isVertical = orientation === "vertical";
        const total = isVertical ? rect.height : rect.width;
        const pos = isVertical ? e.clientY - rect.top : e.clientX - rect.left;
        const deltaPx = pos - drag.startPos;
        const deltaPct = (deltaPx / total) * 100;
        const next = applyBoundaryDelta(
          drag.startSizes,
          panels,
          drag.boundaryIdx,
          deltaPct,
        );
        updateSizes(next);
      },
      [orientation, panels, updateSizes],
    );

    const handlePointerUp = useCallback(() => {
      draggingRef.current = null;
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent, boundaryIdx: number) => {
        const step = 5;
        const leftIdx = boundaryIdx;
        let deltaPct = 0;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          deltaPct = step;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          deltaPct = -step;
        } else {
          return;
        }
        e.preventDefault();
        const next = applyBoundaryDelta(sizes, panels, leftIdx, deltaPct);
        updateSizes(next);
      },
      [panels, sizes, updateSizes],
    );

    // Double-click a handle to collapse/restore the adjacent collapsible panel.
    // Preference: if left is collapsible, collapse it; else right; else ignore.
    const handleDoubleClick = useCallback(
      (boundaryIdx: number) => {
        const leftIdx = boundaryIdx;
        const rightIdx = boundaryIdx + 1;
        const leftPanel = panels[leftIdx];
        const rightPanel = panels[rightIdx];
        if (!leftPanel || !rightPanel) return;
        const targetIdx = leftPanel.collapsible
          ? leftIdx
          : rightPanel.collapsible
            ? rightIdx
            : -1;
        if (targetIdx === -1) return;
        const panel = panels[targetIdx];
        const currentSize = sizes[targetIdx];
        if (!panel || currentSize === undefined) return;
        const isCollapsed = currentSize <= panel.collapsedSize;
        const next = [...sizes];
        const siblingIdx = targetIdx === leftIdx ? rightIdx : leftIdx;
        const siblingSize = sizes[siblingIdx] ?? 0;

        if (isCollapsed) {
          const restored =
            collapsedMemoryRef.current.get(targetIdx) ?? panel.minSize;
          const delta = restored - currentSize;
          next[targetIdx] = restored;
          next[siblingIdx] = siblingSize - delta;
        } else {
          collapsedMemoryRef.current.set(targetIdx, currentSize);
          const delta = panel.collapsedSize - currentSize;
          next[targetIdx] = panel.collapsedSize;
          next[siblingIdx] = siblingSize - delta;
        }
        updateSizes(next);
      },
      [panels, sizes, updateSizes],
    );

    const isVertical = orientation === "vertical";

    const setContainerRef = useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref],
    );

    return (
      <div
        ref={setContainerRef}
        className={cn("wui-splitter", isVertical && "wui-splitter--vertical", className)}
      >
        {panels.flatMap((panel, i) => {
          const size = sizes[i] ?? 0;
          const panelEl = (
            <div
              key={`panel-${i}`}
              className={cn("wui-splitter__panel", panel.className)}
              data-panel-index={i}
              data-collapsible={panel.collapsible || undefined}
              style={isVertical ? { height: `${size}%` } : { width: `${size}%` }}
            >
              {panel.node}
            </div>
          );

          if (i === panels.length - 1) {
            return [panelEl];
          }

          const boundaryIdx = i;
          const leftSize = sizes[boundaryIdx] ?? 0;
          const leftMin = panel.minSize;
          const leftMax = panel.maxSize;

          const handleEl = (
            <div
              key={`handle-${boundaryIdx}`}
              className="wui-splitter__handle"
              role="separator"
              aria-orientation={orientation}
              aria-valuenow={Math.round(leftSize)}
              aria-valuemin={leftMin}
              aria-valuemax={leftMax}
              tabIndex={0}
              data-boundary-index={boundaryIdx}
              onPointerDown={(e) => handlePointerDown(e, boundaryIdx)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onKeyDown={(e) => handleKeyDown(e, boundaryIdx)}
              onDoubleClick={() => handleDoubleClick(boundaryIdx)}
            >
              <div className="wui-splitter__handle-dot" />
            </div>
          );

          return [panelEl, handleEl];
        })}
      </div>
    );
  },
);
Splitter.displayName = "Splitter";
