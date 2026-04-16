"use client";
import { useState } from "react";
import { COMPONENTS, type ComponentDef } from "./lib/component-registry";
import { PlaygroundPreview } from "./components/PlaygroundPreview";
import { PropsPanel } from "./components/PropsPanel";
import { CodeOutput } from "./components/CodeOutput";

export default function PlaygroundPage() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentDef>(COMPONENTS[0]!);
  const [propValues, setPropValues] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(selectedComponent.props.map((p) => [p.name, p.defaultValue])),
  );
  const [children, setChildren] = useState(selectedComponent.defaultChildren);

  const handleComponentChange = (comp: ComponentDef) => {
    setSelectedComponent(comp);
    setPropValues(Object.fromEntries(comp.props.map((p) => [p.name, p.defaultValue])));
    setChildren(comp.defaultChildren);
  };

  return (
    <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "var(--wui-spacing-6)" }}>
      <h1 style={{ fontSize: "var(--wui-font-size-3xl)", fontWeight: "var(--wui-font-weight-bold)", marginBottom: "var(--wui-spacing-6)" }}>
        Component Playground
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 280px", gap: "var(--wui-spacing-6)" }}>
        {/* Component selector */}
        <div>
          <h3 style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-semibold)", marginBottom: "var(--wui-spacing-3)", color: "var(--wui-color-muted-foreground)" }}>Components</h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-1)" }}>
            {COMPONENTS.map((comp) => (
              <li key={comp.name}>
                <button
                  className={`wui-button wui-button--${selectedComponent.name === comp.name ? "soft" : "ghost"}`}
                  style={{ width: "100%", justifyContent: "flex-start", minHeight: "36px" }}
                  onClick={() => handleComponentChange(comp)}
                >
                  {comp.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Preview + Code */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-4)" }}>
          <PlaygroundPreview component={selectedComponent} propValues={propValues} children={children} />
          <CodeOutput component={selectedComponent} propValues={propValues} children={children} />
        </div>

        {/* Props panel */}
        <PropsPanel
          component={selectedComponent}
          propValues={propValues}
          onPropChange={(name, value) => setPropValues((prev) => ({ ...prev, [name]: value }))}
          children={children}
          onChildrenChange={setChildren}
        />
      </div>
    </div>
  );
}
