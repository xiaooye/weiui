"use client";

import { Textarea } from "civaria";

export function TextareaSizesDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--civ-spacing-3)",
      }}
    >
      <Textarea size="sm" aria-label="Small textarea" placeholder="Small" rows={2} style={{ maxWidth: "400px" }} />
      <Textarea size="md" aria-label="Medium textarea" placeholder="Medium (default)" rows={2} style={{ maxWidth: "400px" }} />
      <Textarea size="lg" aria-label="Large textarea" placeholder="Large" rows={2} style={{ maxWidth: "400px" }} />
    </div>
  );
}
