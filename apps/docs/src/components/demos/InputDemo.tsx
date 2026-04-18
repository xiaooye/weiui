"use client";

import { useId, useState } from "react";
import { Input, Label } from "@weiui/react";

export function InputDemo() {
  const [value, setValue] = useState("");
  const id = useId();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-1\\.5)",
        maxWidth: "320px",
      }}
    >
      <Label htmlFor={id}>Email</Label>
      <Input
        id={id}
        type="email"
        placeholder="you@example.com"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
