"use client";
import type { ComponentDef } from "../lib/component-registry";

interface Props {
  component: ComponentDef;
  propValues: Record<string, string | boolean>;
  children: string;
}

export function CodeOutput({ component, propValues, children }: Props) {
  const code = generateCode(component, propValues, children);

  return (
    <div className="wui-card">
      <div className="wui-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-medium)" }}>Code</span>
        <button
          className="wui-button wui-button--ghost wui-button--sm"
          onClick={() => navigator.clipboard.writeText(code)}
          style={{ minHeight: "32px", minWidth: "auto" }}
        >
          Copy
        </button>
      </div>
      <div className="wui-card__content">
        <pre style={{ fontFamily: "var(--wui-font-family-mono)", fontSize: "var(--wui-font-size-sm)", overflow: "auto" }}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function generateCode(component: ComponentDef, propValues: Record<string, string | boolean>, children: string): string {
  const props = component.props
    .filter((p) => propValues[p.name] !== p.defaultValue)
    .map((p) => {
      const val = propValues[p.name];
      if (typeof val === "boolean") return val ? p.name : "";
      return `${p.name}="${val}"`;
    })
    .filter(Boolean)
    .join(" ");

  const propsStr = props ? ` ${props}` : "";

  if (!children) {
    return `<${component.name}${propsStr} />`;
  }
  return `<${component.name}${propsStr}>${children}</${component.name}>`;
}
