"use client";

import { useState } from "react";
import { InputOTP } from "civaria";

export function InputOTPDemo() {
  const [value, setValue] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--civ-spacing-3)" }}>
      <InputOTP value={value} onChange={setValue} />
      <p style={{ fontSize: "var(--civ-font-size-xs)", color: "var(--civ-color-muted-foreground)" }}>
        Current value: <strong>{value || "(empty)"}</strong>
      </p>
    </div>
  );
}
