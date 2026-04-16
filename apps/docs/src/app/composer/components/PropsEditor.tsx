"use client";
import type { ComponentNode } from "../lib/component-tree";

interface Props {
  node: ComponentNode | null;
  onUpdate: (updates: Partial<ComponentNode>) => void;
}

export function PropsEditor({ node, onUpdate }: Props) {
  if (!node) {
    return (
      <div className="wui-card" style={{ height: "fit-content" }}>
        <div className="wui-card__content" style={{ color: "var(--wui-color-muted-foreground)", fontSize: "var(--wui-font-size-sm)" }}>
          Select a component to edit its props
        </div>
      </div>
    );
  }

  return (
    <div className="wui-card" style={{ height: "fit-content" }}>
      <div className="wui-card__header">
        <span style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-semibold)" }}>{node.type} Props</span>
      </div>
      <div className="wui-card__content" style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-3)" }}>
        <div>
          <label style={{ fontSize: "var(--wui-font-size-xs)", fontWeight: "var(--wui-font-weight-medium)", display: "block", marginBottom: "var(--wui-spacing-1)" }}>children</label>
          <input
            className="wui-input wui-input--sm"
            value={node.children}
            onChange={(e) => onUpdate({ children: e.target.value })}
          />
        </div>
        {Object.entries(node.props).map(([key, value]) => (
          <div key={key}>
            <label style={{ fontSize: "var(--wui-font-size-xs)", fontWeight: "var(--wui-font-weight-medium)", display: "block", marginBottom: "var(--wui-spacing-1)" }}>{key}</label>
            {typeof value === "boolean" ? (
              <input type="checkbox" checked={value} onChange={(e) => onUpdate({ props: { ...node.props, [key]: e.target.checked } })} />
            ) : (
              <input
                className="wui-input wui-input--sm"
                value={String(value)}
                onChange={(e) => onUpdate({ props: { ...node.props, [key]: e.target.value } })}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
