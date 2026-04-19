"use client";
import type { CSSProperties } from "react";
import { Slider, ToggleGroup, ToggleGroupItem } from "@weiui/react";
import type { ComponentNode } from "../lib/tree";
import type { Rect } from "../lib/selection-overlay";

/** Height budget assumed by the "chips above the selection" placement. */
const CHIP_BAR_HEIGHT = 40;
const CHIP_GAP = 8;

/** Component types that receive inline layout chips. */
export const CHIP_CONTAINERS = new Set(["Stack", "Grid", "Container"]);

export interface LayoutChipsProps {
  node: ComponentNode;
  rect: Rect;
  onUpdate: (props: Record<string, unknown>) => void;
}

/**
 * Floating toolbar of direct-manipulation controls for the currently-selected
 * container node. Positioned above the selection outline; falls back to below
 * when the selection is flush with the top of the stage.
 */
export function LayoutChips({ node, rect, onUpdate }: LayoutChipsProps) {
  const placeAbove = rect.top >= CHIP_BAR_HEIGHT + CHIP_GAP;
  const top = placeAbove
    ? rect.top - CHIP_BAR_HEIGHT - CHIP_GAP
    : rect.top + rect.height + CHIP_GAP;

  const style: CSSProperties = {
    position: "absolute",
    insetInlineStart: rect.left,
    insetBlockStart: Math.max(0, top),
    pointerEvents: "auto",
  };

  if (node.type === "Stack") return <StackChips node={node} style={style} onUpdate={onUpdate} />;
  if (node.type === "Grid") return <GridChips node={node} style={style} onUpdate={onUpdate} />;
  if (node.type === "Container") return <ContainerChips node={node} style={style} onUpdate={onUpdate} />;
  return null;
}

interface ChipsProps {
  node: ComponentNode;
  style: CSSProperties;
  onUpdate: (props: Record<string, unknown>) => void;
}

function StackChips({ node, style, onUpdate }: ChipsProps) {
  const direction = typeof node.props.direction === "string" ? node.props.direction : "column";
  const gapRaw = typeof node.props.gap === "number" ? node.props.gap : Number(node.props.gap ?? 2);
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
      style={style}
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

function GridChips({ node, style, onUpdate }: ChipsProps) {
  const columnsRaw = node.props.columns;
  const columns = typeof columnsRaw === "number"
    ? columnsRaw
    : Number(columnsRaw ?? 3);
  const gapRaw = typeof node.props.gap === "number" ? node.props.gap : Number(node.props.gap ?? 2);
  const safeCols = Number.isFinite(columns) ? columns : 3;
  const gap = Number.isFinite(gapRaw) ? gapRaw : 2;

  return (
    <div
      className="wui-composer__chips"
      style={style}
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

function ContainerChips({ node, style, onUpdate }: ChipsProps) {
  const maxWidth = typeof node.props.maxWidth === "string" ? node.props.maxWidth : "100%";

  return (
    <div
      className="wui-composer__chips"
      style={style}
      role="toolbar"
      aria-label="Container layout"
    >
      <label className="wui-composer__chip-input">
        <span>max</span>
        <select
          value={maxWidth}
          onChange={(e) => onUpdate({ ...node.props, maxWidth: e.currentTarget.value })}
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
