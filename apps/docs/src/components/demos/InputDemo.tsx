"use client";

import { useState } from "react";
import { Input } from "@weiui/react";

export function InputDemo() {
  const [value, setValue] = useState("");
  return (
    <Input
      placeholder="Enter your email..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      style={{ maxWidth: "320px" }}
    />
  );
}
