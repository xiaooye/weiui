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
      <Input size="sm" aria-label="Small input" placeholder="Small" style={{ maxWidth: "240px" }} />
      <Input size="md" aria-label="Medium input" placeholder="Medium (default)" style={{ maxWidth: "240px" }} />
      <Input size="lg" aria-label="Large input" placeholder="Large" style={{ maxWidth: "240px" }} />
    </div>
  );
}
