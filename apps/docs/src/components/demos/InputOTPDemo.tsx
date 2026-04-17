"use client";

import { useState } from "react";
import { InputOTP } from "@weiui/react";

export function InputOTPDemo() {
  const [value, setValue] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-3)" }}>
      <InputOTP value={value} onChange={setValue} />
      <p style={{ fontSize: "var(--wui-font-size-xs)", color: "var(--wui-color-muted-foreground)" }}>
        Current value: <strong>{value || "(empty)"}</strong>
      </p>
    </div>
  );
}
