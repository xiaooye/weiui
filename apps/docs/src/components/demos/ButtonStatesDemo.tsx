"use client";

import { Button } from "civaria";

export function ButtonStatesDemo() {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--civ-spacing-3)",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}
