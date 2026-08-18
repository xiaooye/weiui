"use client";

import { Button, VisuallyHidden } from "civaria";

export function VisuallyHiddenDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--civ-spacing-3)",
      }}
    >
      <Button
        variant="outline"
        style={{ inlineSize: "fit-content" }}
      >
        <span aria-hidden="true" style={{ fontSize: "1.2em" }}>
          🗑
        </span>
        <VisuallyHidden>Delete item</VisuallyHidden>
      </Button>
      <p
        style={{
          fontSize: "var(--civ-font-size-sm)",
          color: "var(--civ-color-muted-foreground)",
          margin: 0,
        }}
      >
        The button shows only an icon. Screen readers announce &quot;Delete item&quot;.
      </p>
    </div>
  );
}
