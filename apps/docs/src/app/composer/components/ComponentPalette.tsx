"use client";
import { PALETTE_ITEMS } from "../lib/component-tree";

interface Props {
  onAdd: (type: string) => void;
}

export function ComponentPalette({ onAdd }: Props) {
  return (
    <div className="wui-card" style={{ height: "fit-content" }}>
      <div className="wui-card__header">
        <span style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-semibold)" }}>Components</span>
      </div>
      <div className="wui-card__content" style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-1)" }}>
        {PALETTE_ITEMS.map((item) => (
          <button
            key={item.type}
            className="wui-button wui-button--ghost wui-button--sm"
            style={{ justifyContent: "flex-start", minHeight: "32px" }}
            onClick={() => onAdd(item.type)}
          >
            + {item.type}
          </button>
        ))}
      </div>
    </div>
  );
}
