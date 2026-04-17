"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@weiui/react";

export function RadioGroupDemo() {
  const [value, setValue] = useState("apple");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
      }}
    >
      <RadioGroup
        aria-label="Favorite fruit"
        value={value}
        onValueChange={setValue}
      >
        <RadioGroupItem value="apple" label="Apple" />
        <RadioGroupItem value="banana" label="Banana" />
        <RadioGroupItem value="cherry" label="Cherry" />
      </RadioGroup>
      <p
        style={{
          margin: 0,
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
        }}
      >
        Selected: <strong>{value}</strong>
      </p>
    </div>
  );
}
