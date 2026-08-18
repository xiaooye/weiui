"use client";

import { useState } from "react";
import { InputNumber } from "civaria";

export function InputNumberDemo() {
  const [value, setValue] = useState(5);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--civ-spacing-3)" }}>
      <InputNumber value={value} onChange={setValue} min={0} max={100} />
      <p style={{ fontSize: "var(--civ-font-size-xs)", color: "var(--civ-color-muted-foreground)" }}>
        Current value: <strong>{value}</strong>
      </p>
    </div>
  );
}
