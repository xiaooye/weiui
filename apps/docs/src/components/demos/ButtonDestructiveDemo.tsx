"use client";

import { Button } from "civaria";

export function ButtonDestructiveDemo() {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--civ-spacing-3)",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Button variant="solid" color="destructive">
        Delete
      </Button>
      <Button variant="outline" color="destructive">
        Cancel
      </Button>
    </div>
  );
}
