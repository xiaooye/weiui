"use client";

import { Button } from "@weiui/react";

export function ButtonSizesDemo() {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--wui-spacing-3)",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Button size="sm">Small</Button>
      <Button size="md">Medium (default)</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  );
}
