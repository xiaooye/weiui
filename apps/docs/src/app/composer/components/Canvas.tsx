"use client";
import type { ComponentNode } from "../lib/component-tree";

interface Props {
  nodes: ComponentNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}

export function Canvas({ nodes, selectedId, onSelect, onRemove, onMove }: Props) {
  return (
    <div className="wui-card" style={{ flex: 1 }}>
      <div className="wui-card__header">
        <span style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-semibold)" }}>Canvas</span>
      </div>
      <div className="wui-card__content" style={{ minHeight: "300px" }}>
        {nodes.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--wui-color-muted-foreground)", fontSize: "var(--wui-font-size-sm)" }}>
            Click components on the left to add them here
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-2)" }}>
            {nodes.map((node, i) => (
              <div
                key={node.id}
                onClick={() => onSelect(node.id)}
                style={{
                  padding: "var(--wui-spacing-2)",
                  border: `2px solid ${selectedId === node.id ? "var(--wui-color-primary)" : "var(--wui-color-border)"}`,
                  borderRadius: "var(--wui-shape-radius-md)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--wui-spacing-2)" }}>
                  {renderPreview(node)}
                </div>
                <div style={{ display: "flex", gap: "var(--wui-spacing-1)" }}>
                  <button type="button" aria-label="Move up" className="wui-button wui-button--ghost wui-button--sm" style={{ minHeight: "28px", minWidth: "28px", padding: 0 }} onClick={(e) => { e.stopPropagation(); onMove(node.id, "up"); }} disabled={i === 0}>^</button>
                  <button type="button" aria-label="Move down" className="wui-button wui-button--ghost wui-button--sm" style={{ minHeight: "28px", minWidth: "28px", padding: 0 }} onClick={(e) => { e.stopPropagation(); onMove(node.id, "down"); }} disabled={i === nodes.length - 1}>v</button>
                  <button type="button" aria-label="Remove" className="wui-button wui-button--ghost wui-button--sm" style={{ minHeight: "28px", minWidth: "28px", padding: 0, color: "var(--wui-color-destructive)" }} onClick={(e) => { e.stopPropagation(); onRemove(node.id); }}>x</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function renderPreview(node: ComponentNode) {
  switch (node.type) {
    case "Button": return <button type="button" className={`wui-button wui-button--${node.props.variant || "solid"} wui-button--sm`}>{node.children}</button>;
    case "Input": return <input className="wui-input wui-input--sm" placeholder={String(node.props.placeholder || "")} readOnly style={{ maxWidth: "150px" }} />;
    case "Badge": return <span className={`wui-badge wui-badge--${node.props.variant || "solid"}`}>{node.children}</span>;
    case "Card": return <span style={{ fontSize: "var(--wui-font-size-sm)" }}>Card: {node.children}</span>;
    case "Avatar": return <span className="wui-avatar wui-avatar--sm"><span className="wui-avatar__fallback">{node.children}</span></span>;
    case "Alert": return <span style={{ fontSize: "var(--wui-font-size-sm)" }}>Alert: {node.children}</span>;
    case "Divider": return <hr className="wui-divider" style={{ width: "100px" }} />;
    case "Heading": return <strong style={{ fontSize: "var(--wui-font-size-sm)" }}>{node.children}</strong>;
    case "Text": return <span style={{ fontSize: "var(--wui-font-size-sm)", color: "var(--wui-color-muted-foreground)" }}>{node.children}</span>;
    default: return <span>{node.type}</span>;
  }
}
