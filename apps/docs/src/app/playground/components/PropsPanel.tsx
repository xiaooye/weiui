"use client";
import type { ComponentDef, PropDef } from "../lib/component-registry";

interface Props {
  component: ComponentDef;
  propValues: Record<string, string | boolean>;
  onPropChange: (name: string, value: string | boolean) => void;
  children: string;
  onChildrenChange: (value: string) => void;
}

export function PropsPanel({ component, propValues, onPropChange, children, onChildrenChange }: Props) {
  return (
    <div className="wui-card">
      <div className="wui-card__header">
        <span style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-medium)" }}>Props</span>
      </div>
      <div className="wui-card__content" style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-3)" }}>
        {component.defaultChildren !== "" && (
          <div>
            <label style={{ fontSize: "var(--wui-font-size-xs)", fontWeight: "var(--wui-font-weight-medium)", display: "block", marginBottom: "var(--wui-spacing-1)" }}>children</label>
            <input
              className="wui-input wui-input--sm"
              value={children}
              onChange={(e) => onChildrenChange(e.target.value)}
            />
          </div>
        )}

        {component.props.map((prop) => (
          <PropControl key={prop.name} prop={prop} value={propValues[prop.name]!} onChange={(v) => onPropChange(prop.name, v)} />
        ))}
      </div>
    </div>
  );
}

function PropControl({ prop, value, onChange }: { prop: PropDef; value: string | boolean; onChange: (v: string | boolean) => void }) {
  switch (prop.type) {
    case "select":
      return (
        <div>
          <label style={{ fontSize: "var(--wui-font-size-xs)", fontWeight: "var(--wui-font-weight-medium)", display: "block", marginBottom: "var(--wui-spacing-1)" }}>{prop.name}</label>
          <select className="wui-input wui-input--sm" value={String(value)} onChange={(e) => onChange(e.target.value)}>
            {prop.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      );
    case "boolean":
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--wui-spacing-2)" }}>
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} id={`prop-${prop.name}`} />
          <label htmlFor={`prop-${prop.name}`} style={{ fontSize: "var(--wui-font-size-xs)", fontWeight: "var(--wui-font-weight-medium)" }}>{prop.name}</label>
        </div>
      );
    case "text":
      return (
        <div>
          <label style={{ fontSize: "var(--wui-font-size-xs)", fontWeight: "var(--wui-font-weight-medium)", display: "block", marginBottom: "var(--wui-spacing-1)" }}>{prop.name}</label>
          <input className="wui-input wui-input--sm" value={String(value)} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
  }
}
