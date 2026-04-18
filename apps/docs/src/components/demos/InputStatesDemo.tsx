"use client";

import { Input } from "@weiui/react";

export function InputStatesDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
      }}
    >
      <Input aria-label="Default input" placeholder="Default" style={{ maxWidth: "240px" }} />
      <Input invalid aria-label="Invalid input" placeholder="Invalid" style={{ maxWidth: "240px" }} />
      <Input disabled aria-label="Disabled input" placeholder="Disabled" style={{ maxWidth: "240px" }} />
      <Input readOnly aria-label="Read-only input" defaultValue="Read only" style={{ maxWidth: "240px" }} />
    </div>
  );
}
