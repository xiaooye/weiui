"use client";

import { Input } from "@weiui/react";

export function InputSizesDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
      }}
    >
      <Input size="sm" placeholder="Small" style={{ maxWidth: "240px" }} />
      <Input size="md" placeholder="Medium (default)" style={{ maxWidth: "240px" }} />
      <Input size="lg" placeholder="Large" style={{ maxWidth: "240px" }} />
    </div>
  );
}
