"use client";

import { Button } from "@weiui/react";

export function ButtonStatesDemo() {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--wui-spacing-3)",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}
