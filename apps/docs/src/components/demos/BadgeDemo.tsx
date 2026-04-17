"use client";

import { Badge } from "@weiui/react";

export function BadgeDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
      }}
    >
      <div style={{ display: "flex", gap: "var(--wui-spacing-2)", flexWrap: "wrap" }}>
        <Badge variant="solid">Solid</Badge>
        <Badge variant="soft">Soft</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
      <div style={{ display: "flex", gap: "var(--wui-spacing-2)", flexWrap: "wrap" }}>
        <Badge color="primary">Primary</Badge>
        <Badge color="success">Success</Badge>
        <Badge color="warning">Warning</Badge>
        <Badge color="destructive">Error</Badge>
      </div>
    </div>
  );
}
