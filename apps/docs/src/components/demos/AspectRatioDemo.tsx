"use client";

import { AspectRatio } from "@weiui/react";

const boxStyle: React.CSSProperties = {
  inlineSize: "100%",
  blockSize: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "linear-gradient(135deg, color-mix(in oklch, var(--wui-color-primary) 18%, transparent), color-mix(in oklch, var(--wui-color-primary) 4%, transparent))",
  border: "1px solid var(--wui-color-border)",
  borderRadius: "var(--wui-shape-radius-md)",
  color: "var(--wui-color-foreground)",
  fontSize: "var(--wui-font-size-sm)",
  fontWeight: "var(--wui-font-weight-medium)",
};

export function AspectRatioDemo() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "var(--wui-spacing-4)",
        inlineSize: "100%",
      }}
    >
      <div>
        <AspectRatio ratio={16 / 9}>
          <div style={boxStyle}>16 : 9</div>
        </AspectRatio>
      </div>
      <div>
        <AspectRatio ratio={4 / 3}>
          <div style={boxStyle}>4 : 3</div>
        </AspectRatio>
      </div>
      <div>
        <AspectRatio ratio={1}>
          <div style={boxStyle}>1 : 1</div>
        </AspectRatio>
      </div>
    </div>
  );
}
