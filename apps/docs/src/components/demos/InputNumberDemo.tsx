"use client";

import { useState } from "react";
import { InputNumber } from "@weiui/react";

export function InputNumberDemo() {
  const [value, setValue] = useState(5);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-3)" }}>
      <InputNumber value={value} onChange={setValue} min={0} max={100} />
      <p style={{ fontSize: "var(--wui-font-size-xs)", color: "var(--wui-color-muted-foreground)" }}>
        Current value: <strong>{value}</strong>
      </p>
    </div>
  );
}
