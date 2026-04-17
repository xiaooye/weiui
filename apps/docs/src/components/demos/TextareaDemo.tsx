"use client";

import { useState } from "react";
import { Textarea } from "@weiui/react";

export function TextareaDemo() {
  const [value, setValue] = useState("");
  return (
    <Textarea
      placeholder="Enter a longer message..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      style={{ maxWidth: "400px" }}
      rows={3}
    />
  );
}
