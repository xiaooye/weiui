"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "civaria";

export function RadioGroupDemo() {
  const [value, setValue] = useState("apple");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--civ-spacing-3)",
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
          fontSize: "var(--civ-font-size-sm)",
          color: "var(--civ-color-muted-foreground)",
        }}
      >
        Selected: <strong>{value}</strong>
      </p>
    </div>
  );
}
