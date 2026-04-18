"use client";
import { PALETTE_ITEMS, PALETTE_CATEGORIES } from "../lib/component-tree";

interface Props {
  onAdd: (type: string) => void;
}

export function ComponentPalette({ onAdd }: Props) {
  return (
    <div className="wui-card" style={{ height: "fit-content", maxHeight: "calc(100vh - 10rem)", overflowY: "auto" }}>
      <div className="wui-card__header">
        <span
          style={{
            fontSize: "var(--wui-font-size-sm)",
            fontWeight: "var(--wui-font-weight-semibold)",
          }}
        >
          Components · {PALETTE_ITEMS.length}
        </span>
      </div>
      <div
        className="wui-card__content"
        style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-3)" }}
      >
        {PALETTE_CATEGORIES.map((category) => {
          const items = PALETTE_ITEMS.filter((i) => i.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category} style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-1)" }}>
              <div
                style={{
                  fontSize: "var(--wui-font-size-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--wui-color-muted-foreground)",
                  fontWeight: "var(--wui-font-weight-semibold)",
                  paddingInline: "var(--wui-spacing-1)",
                }}
              >
                {category}
              </div>
              {items.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  className="wui-button wui-button--ghost wui-button--sm"
                  style={{ justifyContent: "flex-start", minHeight: "32px" }}
                  onClick={() => onAdd(item.type)}
                >
                  + {item.label}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
