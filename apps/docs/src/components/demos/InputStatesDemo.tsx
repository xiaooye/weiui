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
      <Input placeholder="Default" style={{ maxWidth: "240px" }} />
      <Input invalid placeholder="Invalid" style={{ maxWidth: "240px" }} />
      <Input disabled placeholder="Disabled" style={{ maxWidth: "240px" }} />
      <Input readOnly defaultValue="Read only" style={{ maxWidth: "240px" }} />
    </div>
  );
}
