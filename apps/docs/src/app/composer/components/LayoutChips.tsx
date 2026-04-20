"use client";
import { useEffect, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Slider,
  ToggleGroup,
  ToggleGroupItem,
} from "@weiui/react";
import type { ComponentNode } from "../lib/tree";
import { useInteractionManager } from "../lib/interaction-manager";

/** Component types that receive inline layout chips. */
export const CHIP_CONTAINERS = new Set(["Stack", "Grid", "Container"]);

export interface LayoutChipsProps {
  node: ComponentNode;
  onUpdate: (props: Record<string, unknown>) => void;
}

/**
 * Floating toolbar of direct-manipulation controls for the currently-selected
 * container node. A `<Popover>` from @weiui/react does the heavy lifting —
 * floating-ui handles flip / shift / collision so chips stay on-screen.
 *
 * The popover is anchored to an invisible element that tracks the live bounding
 * rect of the node's DOM projection (via `[data-composer-id]` lookup +
 * ResizeObserver). This decouples chip positioning from the parent component's
 * rect cache and lets floating-ui reason about real viewport geometry.
 */
export function LayoutChips({ node, onUpdate }: LayoutChipsProps) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const im = useInteractionManager();
  const isDragging = im.state.drag != null;

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const el = document.querySelector<HTMLElement>(
      `[data-composer-id="${node.id}"]`,
    );
    if (!el) return;

    // Prefer the first styled child — `[data-composer-id]` wraps the element
    // in a wrapper div in render-preview; the wrapper is zero-padding, so its
    // rect matches, but the child rect is what the user actually sees.
    const target = (el.firstElementChild as HTMLElement | null) ?? el;

    const syncRect = () => {
      const r = target.getBoundingClientRect();
      anchor.style.top = `${r.top}px`;
      anchor.style.left = `${r.left}px`;
      anchor.style.width = `${r.width}px`;
      anchor.style.height = `${r.height}px`;
    };
    syncRect();

    const RO = typeof ResizeObserver !== "undefined" ? ResizeObserver : null;
    const ro = RO ? new RO(syncRect) : null;
    ro?.observe(target);
    window.addEventListener("resize", syncRect);
    window.addEventListener("scroll", syncRect, true);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", syncRect);
      window.removeEventListener("scroll", syncRect, true);
    };
  }, [node.id]);

  return (
    <Popover open={!isDragging} side="top" offset={8} align="start" stickyOnScroll>
      <PopoverTrigger
        ref={anchorRef}
        aria-hidden="true"
        tabIndex={-1}
        style={{
          position: "fixed",
          pointerEvents: "none",
          padding: 0,
          border: 0,
          background: "transparent",
          opacity: 0,
        }}
      >
        {""}
      </PopoverTrigger>
      <PopoverContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {node.type === "Stack" ? (
          <StackChips node={node} onUpdate={onUpdate} />
        ) : null}
        {node.type === "Grid" ? (
          <GridChips node={node} onUpdate={onUpdate} />
        ) : null}
        {node.type === "Container" ? (
          <ContainerChips node={node} onUpdate={onUpdate} />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

interface ChipsProps {
  node: ComponentNode;
  onUpdate: (props: Record<string, unknown>) => void;
}

function StackChips({ node, onUpdate }: ChipsProps) {
  const direction =
    typeof node.props.direction === "string" ? node.props.direction : "column";
  const gapRaw =
    typeof node.props.gap === "number"
      ? node.props.gap
      : Number(node.props.gap ?? 2);
  const gap = Number.isFinite(gapRaw) ? gapRaw : 2;

  const onDirectionChange = (v: string | string[]) => {
    const next = Array.isArray(v) ? v[0] : v;
    if (next === "row" || next === "column") {
      onUpdate({ ...node.props, direction: next });
    }
  };

  return (
    <div
      className="wui-composer__chips"
      role="toolbar"
      aria-label="Stack layout"
    >
      <ToggleGroup
        type="single"
        size="sm"
        value={direction}
        onChange={onDirectionChange}
        label="Direction"
      >
        <ToggleGroupItem value="row" aria-label="Horizontal">
          {"\u2194"}
        </ToggleGroupItem>
        <ToggleGroupItem value="column" aria-label="Vertical">
          {"\u2195"}
        </ToggleGroupItem>
      </ToggleGroup>
      <div className="wui-composer__chip-slider">
        <span className="wui-composer__chip-slider-label" aria-hidden="true">
          gap
        </span>
        <Slider
          min={0}
          max={12}
          step={1}
          value={gap}
          onChange={(next) => onUpdate({ ...node.props, gap: next })}
          label="Gap"
          showTooltip
          className="wui-composer__chip-slider-track"
        />
        <span className="wui-composer__chip-slider-value" aria-hidden="true">
          {gap}
        </span>
      </div>
    </div>
  );
}

function GridChips({ node, onUpdate }: ChipsProps) {
  const columnsRaw = node.props.columns;
  const columns =
    typeof columnsRaw === "number" ? columnsRaw : Number(columnsRaw ?? 3);
  const gapRaw =
    typeof node.props.gap === "number"
      ? node.props.gap
      : Number(node.props.gap ?? 2);
  const safeCols = Number.isFinite(columns) ? columns : 3;
  const gap = Number.isFinite(gapRaw) ? gapRaw : 2;

  return (
    <div
      className="wui-composer__chips"
      role="toolbar"
      aria-label="Grid layout"
    >
      <div className="wui-composer__chip-slider">
        <span className="wui-composer__chip-slider-label" aria-hidden="true">
          cols
        </span>
        <Slider
          min={1}
          max={12}
          step={1}
          value={safeCols}
          onChange={(next) => onUpdate({ ...node.props, columns: next })}
          label="Columns"
          showTooltip
          className="wui-composer__chip-slider-track"
        />
        <span className="wui-composer__chip-slider-value" aria-hidden="true">
          {safeCols}
        </span>
      </div>
      <div className="wui-composer__chip-slider">
        <span className="wui-composer__chip-slider-label" aria-hidden="true">
          gap
        </span>
        <Slider
          min={0}
          max={12}
          step={1}
          value={gap}
          onChange={(next) => onUpdate({ ...node.props, gap: next })}
          label="Gap"
          showTooltip
          className="wui-composer__chip-slider-track"
        />
        <span className="wui-composer__chip-slider-value" aria-hidden="true">
          {gap}
        </span>
      </div>
    </div>
  );
}

function ContainerChips({ node, onUpdate }: ChipsProps) {
  const maxWidth =
    typeof node.props.maxWidth === "string" ? node.props.maxWidth : "100%";

  return (
    <div
      className="wui-composer__chips"
      role="toolbar"
      aria-label="Container layout"
    >
      <label className="wui-composer__chip-input">
        <span>max</span>
        <select
          value={maxWidth}
          onChange={(e) =>
            onUpdate({ ...node.props, maxWidth: e.currentTarget.value })
          }
          className="wui-composer__chip-select"
          aria-label="Max width"
        >
          <option value="20rem">sm</option>
          <option value="40rem">md</option>
          <option value="60rem">lg</option>
          <option value="80rem">xl</option>
          <option value="100%">full</option>
        </select>
      </label>
    </div>
  );
}
