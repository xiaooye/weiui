"use client";

import { Textarea } from "@weiui/react";

export function TextareaSizesDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
      }}
    >
      <Textarea size="sm" placeholder="Small" rows={2} style={{ maxWidth: "400px" }} />
      <Textarea size="md" placeholder="Medium (default)" rows={2} style={{ maxWidth: "400px" }} />
      <Textarea size="lg" placeholder="Large" rows={2} style={{ maxWidth: "400px" }} />
    </div>
  );
}
