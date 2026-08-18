"use client";

import { useState } from "react";
import { Splitter, type SplitterSizes } from "civaria";

const panelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--civ-spacing-4)",
  fontSize: "var(--civ-font-size-sm)",
  color: "var(--civ-color-muted-foreground)",
  background: "var(--civ-color-muted)",
};

export function SplitterDemo() {
  const [sizes, setSizes] = useState<SplitterSizes>([35, 65]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--civ-spacing-3)", width: "100%" }}>
      <div style={{ height: "220px", width: "100%" }}>
        <Splitter sizes={sizes} onSizesChange={setSizes}>
          <div style={panelStyle}>Nav ({Math.round(sizes[0] ?? 0)}%)</div>
          <div style={panelStyle}>Editor ({Math.round(sizes[1] ?? 0)}%)</div>
        </Splitter>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "var(--civ-font-size-sm)",
          color: "var(--civ-color-muted-foreground)",
        }}
      >
        Drag the handle or focus it and use arrow keys to resize.
      </p>
    </div>
  );
}
