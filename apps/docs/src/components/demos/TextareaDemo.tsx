"use client";

import { useId, useState } from "react";
import { Textarea, Label } from "civaria";

export function TextareaDemo() {
  const [value, setValue] = useState("");
  const id = useId();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--civ-spacing-1\\.5)",
        maxWidth: "400px",
      }}
    >
      <Label htmlFor={id}>Message</Label>
      <Textarea
        id={id}
        placeholder="Enter a longer message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
      />
    </div>
  );
}
