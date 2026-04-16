"use client";
import type { ComponentDef } from "../lib/component-registry";

interface Props {
  component: ComponentDef;
  propValues: Record<string, string | boolean>;
  children: string;
}

export function PlaygroundPreview({ component, propValues, children }: Props) {
  const cssClasses = buildCssClasses(component.name, propValues);

  return (
    <div className="wui-card">
      <div className="wui-card__header">
        <span style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-medium)" }}>Preview</span>
      </div>
      <div className="wui-card__content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "120px" }}>
        {renderComponent(component.name, cssClasses, propValues, children)}
      </div>
    </div>
  );
}

function buildCssClasses(name: string, props: Record<string, string | boolean>): string {
  const base = `wui-${name.toLowerCase()}`;
  const classes = [base];

  if (props.variant && typeof props.variant === "string") {
    classes.push(`${base}--${props.variant}`);
  }
  if (props.size && typeof props.size === "string" && props.size !== "md") {
    classes.push(`${base}--${props.size}`);
  }
  if (props.color && typeof props.color === "string" && props.color !== "primary") {
    classes.push(`${base}--${props.color}`);
  }

  return classes.join(" ");
}

function renderComponent(name: string, cssClasses: string, props: Record<string, string | boolean>, children: string) {
  switch (name) {
    case "Button":
      return (
        <button
          className={cssClasses}
          disabled={!!props.disabled || !!props.loading}
          data-disabled={props.disabled || undefined}
          data-loading={props.loading || undefined}
        >
          {children}
        </button>
      );
    case "Input":
      return (
        <input
          className={cssClasses}
          placeholder={typeof props.placeholder === "string" ? props.placeholder : ""}
          disabled={!!props.disabled}
          data-invalid={props.invalid || undefined}
        />
      );
    case "Badge":
      return <span className={cssClasses}>{children}</span>;
    case "Alert":
      return <div className={`${cssClasses}`} role="alert">{children}</div>;
    case "Spinner":
      return (
        <div
          role="status"
          className="inline-block animate-spin rounded-full border-2 border-current border-r-transparent"
          style={{ width: props.size === "sm" ? "16px" : props.size === "lg" ? "32px" : "24px", height: props.size === "sm" ? "16px" : props.size === "lg" ? "32px" : "24px" }}
        >
          <span className="wui-sr-only">{typeof props.label === "string" ? props.label : "Loading"}</span>
        </div>
      );
    default:
      return <div>{children}</div>;
  }
}
